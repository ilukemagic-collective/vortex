"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getChannelById,
  getChannelMessages,
  getChannelMembers,
  subscribeToChannelMessages,
  joinChannel,
  leaveChannel,
  sendChannelMessage,
  updateChannel,
} from "@/lib/supabase/channels";
import type { Channel, ChannelMessage, ChannelMember } from "@/types/channel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  UsersIcon,
  SendIcon,
  InfoIcon,
  SettingsIcon,
  LogOutIcon,
  UserPlusIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InviteMemberDialog } from "@/components/channels/invite-member-dialog";
import { getSupabaseClient } from "@/lib/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import remarkGfm from "remark-gfm";
import { serialize } from "next-mdx-remote/serialize";

type ChannelMemberWithUser = ChannelMember & {
  user?: {
    id: string;
    username?: string;
    avatar_url?: string | null;
  };
};

// Add this schema for form validation
const editChannelSchema = z.object({
  name: z
    .string()
    .min(1, "频道名称不能为空")
    .max(50, "频道名称不能超过50个字符"),
  description: z.string().max(500, "频道描述不能超过500个字符").optional(),
  is_private: z.boolean().default(false),
});

export default function ChannelPage() {
  const { channelId } = useParams();
  const { user } = useAuth();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [members, setMembers] = useState<ChannelMemberWithUser[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [compiledMessages, setCompiledMessages] = useState<{
    [key: string]: MDXRemoteSerializeResult;
  }>({});

  // 添加一个新的状态来跟踪数据是否完全加载
  const [isDataReady, setIsDataReady] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Add form for editing channel
  const editForm = useForm<z.infer<typeof editChannelSchema>>({
    resolver: zodResolver(editChannelSchema),
    defaultValues: {
      name: "",
      description: "",
      is_private: false,
    },
  });

  useEffect(() => {
    if (!channelId || !user) return;

    const fetchChannelData = async () => {
      try {
        setIsLoading(true);
        setIsDataReady(false); // 重置数据准备状态

        // 并行获取所有需要的数据
        const [channelData, membersData] = await Promise.all([
          getChannelById(channelId as string),
          getChannelMembers(channelId as string),
        ]);

        // 如果频道不存在，直接返回
        if (!channelData) {
          setChannel(null);
          setIsDataReady(true);
          return;
        }

        // 设置频道数据
        setChannel(channelData);
        setMembers(membersData);

        // 检查当前用户是否是成员及其角色
        const currentMember = membersData.find(
          (member) => member.user_id === user.id
        );

        if (currentMember) {
          setIsMember(true);
          setUserRole(currentMember.role);
          // 获取消息
          const messagesData = await getChannelMessages(channelId as string);
          setMessages(messagesData);
        } else {
          setIsMember(false);
          setUserRole(null);
          setMessages([]);
        }

        // 所有数据都准备好了
        setIsDataReady(true);
      } catch (error) {
        console.error("获取频道数据失败:", error);
        toast.error("无法加载频道数据，请稍后再试");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannelData();

    // 订阅实时消息更新
    const subscription = subscribeToChannelMessages(
      channelId as string,
      async (newMessage) => {
        // 避免重复消息
        setMessages((prev) => {
          // 检查消息是否已存在
          const messageExists = prev.some((msg) => msg.id === newMessage.id);
          if (messageExists) {
            return prev;
          }

          // 如果是当前用户发送的消息，直接使用用户信息
          if (newMessage.user_id === user.id) {
            const messageWithCurrentUser = {
              ...newMessage,
              user: {
                id: user.id,
                username:
                  user.user_metadata?.username ||
                  user.email?.split("@")[0] ||
                  "未知用户",
                avatar_url: user.user_metadata?.avatar_url || null,
              },
            };
            return [...prev, messageWithCurrentUser];
          }

          // 对于其他用户的消息，先添加占位符，然后异步获取用户信息
          const messageWithPlaceholder = {
            ...newMessage,
            user: {
              id: newMessage.user_id,
              username: "加载中...",
              avatar_url: null,
            },
          };

          // 异步获取用户信息
          getSupabaseClient()
            .from("profiles")
            .select("id, username, avatar_url")
            .eq("id", newMessage.user_id)
            .single()
            .then(({ data, error }) => {
              if (error) {
                console.error("获取用户信息失败:", error);
                return;
              }

              if (data) {
                // 更新消息中的用户信息
                setMessages((currentMessages) =>
                  currentMessages.map((msg) =>
                    msg.id === newMessage.id ? { ...msg, user: data } : msg
                  )
                );
              }
            });

          return [...prev, messageWithPlaceholder];
        });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [channelId, user]);

  // 滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update form values when channel data changes
  useEffect(() => {
    if (channel) {
      editForm.reset({
        name: channel.name,
        description: channel.description || "",
        is_private: channel.is_private,
      });
    }
  }, [channel, editForm]);

  // 在接收到新消息时编译 MDX
  useEffect(() => {
    const compileMessages = async () => {
      const newCompiledMessages: { [key: string]: MDXRemoteSerializeResult } =
        {};
      let hasNewMessages = false;

      for (const message of messages) {
        if (!compiledMessages[message.id]) {
          hasNewMessages = true;
          try {
            const compiled = await serialize(message.content, {
              parseFrontmatter: false,
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                format: "mdx",
              },
            });
            newCompiledMessages[message.id] = compiled;
          } catch (error) {
            console.error("Error compiling message:", error);
            const fallbackContent = await serialize(message.content, {
              parseFrontmatter: false,
              mdxOptions: {
                remarkPlugins: [],
              },
            });
            newCompiledMessages[message.id] = fallbackContent;
          }
        }
      }

      if (hasNewMessages) {
        setCompiledMessages((prev) => ({
          ...prev,
          ...newCompiledMessages,
        }));
      }
    };

    compileMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const handleJoinChannel = async () => {
    if (!user || !channelId) return;

    try {
      setIsJoining(true);
      await joinChannel(channelId as string, user.id);

      // 重新获取频道数据
      const membersData = await getChannelMembers(channelId as string);
      setMembers(membersData);

      // 更新用户状态
      const currentMember = membersData.find(
        (member) => member.user_id === user.id
      );
      if (currentMember) {
        setIsMember(true);
        setUserRole(currentMember.role);
      }

      // 获取消息
      const messagesData = await getChannelMessages(channelId as string);
      setMessages(messagesData);

      toast.success(`你已成功加入频道 "${channel?.name}"`);

      // 聚焦到消息输入框
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error("加入频道失败:", error);
      toast.error("无法加入频道，请稍后再试");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveChannel = async () => {
    if (!user || !channelId) return;

    try {
      setIsLeaving(true);
      await leaveChannel(channelId as string, user.id);

      // 更新状态
      setIsMember(false);
      setUserRole(null);
      setMessages([]);

      // 重新获取成员列表
      const membersData = await getChannelMembers(channelId as string);
      setMembers(membersData);

      toast.success(`你已成功离开频道 "${channel?.name}"`);
    } catch (error) {
      console.error("离开频道失败:", error);
      toast.error("无法离开频道，请稍后再试");
    } finally {
      setIsLeaving(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !user || !channelId || !isMember) return;

    const messageContent = newMessage.trim();
    setNewMessage(""); // 立即清空输入框，提高用户体验

    try {
      setIsSending(true);

      // 调用发送消息API
      await sendChannelMessage(channelId as string, user.id, messageContent);

      // 注意：我们不再手动添加消息到列表
      // 实时订阅会处理这个过程，避免重复消息

      // 如果实时订阅有延迟，可以考虑添加一个临时消息
      // 但通常不需要，因为 Supabase 的实时更新很快
    } catch (error) {
      console.error("发送消息失败:", error);
      toast.error("无法发送消息，请稍后再试");

      // 恢复消息内容到输入框
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  // 修改处理按键事件的函数
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.ctrlKey || e.metaKey) {
        // 按住 Ctrl/Cmd + Enter，插入换行符
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;

        setNewMessage(value.substring(0, start) + "\n" + value.substring(end));

        // 在状态更新后设置光标位置
        requestAnimationFrame(() => {
          textarea.focus();
          textarea.setSelectionRange(start + 1, start + 1);
        });
      } else {
        // 只按 Enter，发送消息
        e.preventDefault();
        handleSendMessage(e as unknown as React.FormEvent);
      }
    }
  };

  // Handle channel update
  const handleUpdateChannel = async (
    values: z.infer<typeof editChannelSchema>
  ) => {
    if (!channelId) return;

    try {
      setIsUpdating(true);
      await updateChannel(channelId as string, {
        name: values.name,
        description: values.description || null,
        is_private: values.is_private,
      });

      // Update local state
      setChannel((prev) =>
        prev
          ? {
              ...prev,
              name: values.name,
              description: values.description || null,
              is_private: values.is_private,
            }
          : null
      );

      setIsEditDialogOpen(false);
      toast.success("频道信息已更新");
    } catch (error) {
      console.error("更新频道失败:", error);
      toast.error("无法更新频道信息，请稍后再试");
    } finally {
      setIsUpdating(false);
    }
  };

  // 显示加载状态
  if (isLoading || !isDataReady) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  // 频道不存在
  if (!channel) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">频道不存在</h2>
          <p className="text-muted-foreground">
            该频道可能已被删除或你没有访问权限
          </p>
        </div>
      </div>
    );
  }

  const isOwner = userRole === "owner";
  const isAdmin = userRole === "admin" || isOwner;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      <div className="border-b p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">{channel.name}</h1>
          {channel.is_private && (
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
              私密
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 频道信息对话框 */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" title="频道信息">
                <InfoIcon className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>频道信息</DialogTitle>
                <DialogDescription>查看频道的详细信息</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <h3 className="font-medium mb-1">频道名称</h3>
                  <p>{channel.name}</p>
                </div>
                {channel.description && (
                  <div>
                    <h3 className="font-medium mb-1">频道描述</h3>
                    <p className="text-sm text-muted-foreground">
                      {channel.description}
                    </p>
                  </div>
                )}
                <div>
                  <h3 className="font-medium mb-1">创建时间</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(channel.created_at).toLocaleString("zh-CN")}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">成员数量</h3>
                  <p className="text-sm">{members.length} 名成员</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">频道类型</h3>
                  <p className="text-sm">
                    {channel.is_private ? "私密频道" : "公开频道"}
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* 成员列表 */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" title="成员列表">
                <UsersIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>频道成员 ({members.length})</SheetTitle>
              </SheetHeader>
              <Separator className="my-4" />

              {isAdmin && (
                <div className="mb-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    size="sm"
                    onClick={() => setIsInviteDialogOpen(true)}
                  >
                    <UserPlusIcon className="h-4 w-4 mr-2" />
                    邀请用户
                  </Button>
                </div>
              )}

              <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={member.user?.avatar_url || undefined}
                        />
                        <AvatarFallback>
                          {member.user?.username?.charAt(0).toUpperCase() ||
                            "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.user?.username}</p>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground capitalize">
                            {member.role}
                          </span>
                          {member.user_id === user?.id && (
                            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                              你
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isAdmin && member.user_id !== user?.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <SettingsIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isOwner && member.role !== "admin" && (
                            <DropdownMenuItem>设为管理员</DropdownMenuItem>
                          )}
                          {isOwner && member.role === "admin" && (
                            <DropdownMenuItem>取消管理员</DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            移出频道
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}

                {members.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    暂无成员
                  </p>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* 频道设置（仅管理员可见） */}
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title="频道设置">
                  <SettingsIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  编辑频道信息
                </DropdownMenuItem>
                <DropdownMenuItem>管理成员</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  删除频道
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* 加入/离开频道按钮 */}
          {isMember ? (
            <Button
              variant="outline"
              onClick={handleLeaveChannel}
              disabled={isLeaving}
              className="gap-2"
            >
              <LogOutIcon className="h-4 w-4" />
              {isLeaving ? "处理中..." : "离开频道"}
            </Button>
          ) : (
            <Button onClick={handleJoinChannel} disabled={isJoining}>
              {isJoining ? "加入中..." : "加入频道"}
            </Button>
          )}
        </div>
      </div>

      {isMember ? (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar min-h-0">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <h3 className="font-medium mb-1">暂无消息</h3>
                  <p className="text-sm text-muted-foreground">
                    成为第一个发言的人吧！
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => {
                const isCurrentUser = message.user_id === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isCurrentUser ? "justify-end" : ""}`}
                  >
                    {!isCurrentUser && (
                      <Avatar>
                        <AvatarImage
                          src={message.user?.avatar_url || undefined}
                        />
                        <AvatarFallback>
                          {message.user?.username?.charAt(0).toUpperCase() ||
                            "?"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] ${isCurrentUser ? "text-right" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        {!isCurrentUser && (
                          <span className="font-medium">
                            {message.user?.username}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(message.created_at), {
                            addSuffix: true,
                            locale: zhCN,
                          })}
                        </span>
                      </div>
                      <div
                        className={`mt-1 p-3 rounded-lg ${
                          isCurrentUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        } prose prose-sm max-w-none`}
                      >
                        {compiledMessages[message.id] ? (
                          <MDXRemote {...compiledMessages[message.id]} />
                        ) : (
                          <p>{message.content}</p>
                        )}
                      </div>
                    </div>
                    {isCurrentUser && (
                      <Avatar>
                        <AvatarImage
                          src={user?.user_metadata?.avatar_url || undefined}
                        />
                        <AvatarFallback>
                          {user?.user_metadata?.username
                            ?.charAt(0)
                            .toUpperCase() ||
                            user?.email?.charAt(0).toUpperCase() ||
                            "?"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="border-t p-4 shrink-0">
            <div className="flex gap-2">
              <Textarea
                ref={messageInputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入消息... (Enter 发送，Ctrl+Enter 换行) 支持 Markdown 格式"
                disabled={isSending}
                className="flex-1 min-h-[2.5rem] max-h-[150px] resize-none"
                rows={1}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isSending || !newMessage.trim()}
              >
                <SendIcon className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              按 Enter 发送消息，Ctrl+Enter 换行 • 支持 Markdown 格式
            </p>
          </form>
        </>
      ) : (
        <div className="flex items-center justify-center flex-1">
          <div className="text-center max-w-md p-6 bg-card rounded-lg border">
            <h2 className="text-xl font-semibold mb-2">加入频道参与讨论</h2>
            <p className="text-muted-foreground mb-6">
              加入此频道后，你可以查看历史消息并参与讨论
            </p>
            <Button
              onClick={handleJoinChannel}
              disabled={isJoining}
              className="w-full"
            >
              {isJoining ? "加入中..." : "加入频道"}
            </Button>
          </div>
        </div>
      )}

      {/* 邀请用户对话框 */}
      {channelId && (
        <InviteMemberDialog
          channelId={channelId as string}
          isOpen={isInviteDialogOpen}
          onClose={() => setIsInviteDialogOpen(false)}
          onSuccess={() => {
            // 邀请成功后刷新成员列表
            getChannelMembers(channelId as string).then(setMembers);
          }}
        />
      )}

      {/* Add the Edit Channel Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑频道信息</DialogTitle>
            <DialogDescription>
              修改频道的名称、描述和隐私设置
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleUpdateChannel)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>频道名称</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="输入频道名称" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>频道描述</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="输入频道描述（可选）"
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      简要描述频道的用途和讨论内容
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="is_private"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">私密频道</FormLabel>
                      <FormDescription>
                        私密频道仅对被邀请的成员可见
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  取消
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "更新中..." : "保存更改"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
