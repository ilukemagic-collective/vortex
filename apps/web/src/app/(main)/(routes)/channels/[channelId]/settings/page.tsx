"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/auth-context";
import {
  getChannelById,
  updateChannel,
  getChannelMembers,
  deleteChannel,
  updateMemberRole,
  removeMember,
} from "@/lib/supabase/channels";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Trash2,
  UserX,
  Shield,
  ShieldAlert,
  Search,
  AlertTriangle,
  Crown,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { InviteMemberDialog } from "@/components/channels/invite-member-dialog";
import { TransferOwnershipDialog } from "@/components/channels/transfer-ownership-dialog";

const formSchema = z.object({
  name: z
    .string()
    .min(3, "频道名称至少需要3个字符")
    .max(255, "频道名称不能超过255个字符"),
  description: z.string().max(1000, "描述不能超过1000个字符").optional(),
  is_private: z.boolean().default(false),
});

export default function ChannelSettingsPage() {
  const { channelId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [channel, setChannel] = useState(null);
  const [members, setMembers] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      is_private: false,
    },
  });

  useEffect(() => {
    if (!channelId || !user) {
      router.push(`/channels/${channelId}`);
      return;
    }

    const fetchChannelData = async () => {
      try {
        setIsLoading(true);

        // 获取频道信息
        const channelData = await getChannelById(channelId as string);
        setChannel(channelData);

        // 获取频道成员
        const membersData = await getChannelMembers(channelId as string);
        setMembers(membersData);

        // 检查当前用户是否是管理员或所有者
        const currentMember = membersData.find(
          (member) => member.user_id === user.id
        );
        const isAdmin =
          currentMember &&
          (currentMember.role === "admin" || currentMember.role === "owner");

        if (!isAdmin) {
          toast.error("无权访问", {
            description: "你没有权限编辑此频道",
          });
          router.push(`/channels/${channelId}`);
          return;
        }

        setUserRole(currentMember.role);
        setIsAuthorized(true);

        // 设置表单默认值
        form.reset({
          name: channelData.name,
          description: channelData.description || "",
          is_private: channelData.is_private,
        });
      } catch (error) {
        console.error("获取频道数据失败:", error);
        toast.error("无法加载频道数据，请稍后再试");
        router.push(`/channels/${channelId}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannelData();
  }, [channelId, user, router, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!channelId) return;

    try {
      setIsSaving(true);
      await updateChannel(channelId as string, {
        name: values.name,
        description: values.description || null,
        is_private: values.is_private,
      });

      // 更新本地状态
      setChannel((prev) => ({
        ...prev,
        name: values.name,
        description: values.description || null,
        is_private: values.is_private,
      }));

      toast.success("频道信息已更新");
    } catch (error) {
      console.error("更新频道失败:", error);
      toast.error("无法更新频道信息，请稍后再试");
    } finally {
      setIsSaving(false);
    }
  }

  const handleDeleteChannel = async () => {
    if (!channelId) return;

    try {
      setIsDeleting(true);
      await deleteChannel(channelId as string);

      toast.success("频道已成功删除");

      router.push("/channels");
    } catch (error) {
      console.error("删除频道失败:", error);
      toast.error("无法删除频道，请稍后再试");
      setIsDeleting(false);
    }
  };

  const handleUpdateMemberRole = async (memberId, userId, newRole) => {
    if (!channelId) return;

    try {
      await updateMemberRole(memberId, newRole);

      // 更新本地状态
      setMembers((prev) =>
        prev.map((member) =>
          member.id === memberId ? { ...member, role: newRole } : member
        )
      );

      toast.success(
        `用户角色已更新为 ${newRole === "admin" ? "管理员" : "成员"}`
      );
    } catch (error) {
      console.error("更新角色失败:", error);
      toast.error("无法更新用户角色，请稍后再试");
    }
  };

  const handleRemoveMember = async (memberId, username) => {
    if (!channelId) return;

    try {
      await removeMember(memberId);

      // 更新本地状态
      setMembers((prev) => prev.filter((member) => member.id !== memberId));

      toast.success(`${username} 已从频道中移除`);
    } catch (error) {
      console.error("移除成员失败:", error);
      toast.error("无法移除成员，请稍后再试");
    }
  };

  const filteredMembers = members.filter((member) =>
    member.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isOwner = userRole === "owner";

  if (isLoading || !isAuthorized) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6">
      <div className="flex items-center mb-6">
        <Link href={`/channels/${channelId}`} className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">频道设置</h1>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">基本信息</TabsTrigger>
          <TabsTrigger value="members">成员管理</TabsTrigger>
          <TabsTrigger value="danger">危险操作</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>编辑频道的基本信息</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>频道名称</FormLabel>
                        <FormControl>
                          <Input placeholder="输入频道名称" {...field} />
                        </FormControl>
                        <FormDescription>
                          一个简短且有描述性的名称
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>频道描述 (可选)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="描述这个频道的用途和讨论内容"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          帮助其他用户了解这个频道的主题
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_private"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">私密频道</FormLabel>
                          <FormDescription>
                            私密频道只对被邀请的成员可见
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

                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "保存中..." : "保存更改"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>成员管理</CardTitle>
              <CardDescription>管理频道成员和权限</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索成员..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
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
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {member.user?.username}
                            </p>
                            {member.user_id === user?.id && (
                              <Badge variant="outline" className="text-xs">
                                你
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={
                                member.role === "owner"
                                  ? "default"
                                  : member.role === "admin"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="text-xs"
                            >
                              {member.role === "owner"
                                ? "所有者"
                                : member.role === "admin"
                                  ? "管理员"
                                  : "成员"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              加入于{" "}
                              {new Date(member.joined_at).toLocaleDateString(
                                "zh-CN"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 只有所有者可以管理管理员，管理员可以管理普通成员 */}
                      {((isOwner && member.role !== "owner") ||
                        (userRole === "admin" && member.role === "member")) &&
                        member.user_id !== user?.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                管理
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {isOwner && member.role === "member" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateMemberRole(
                                      member.id,
                                      member.user_id,
                                      "admin"
                                    )
                                  }
                                >
                                  <ShieldAlert className="h-4 w-4 mr-2" />
                                  设为管理员
                                </DropdownMenuItem>
                              )}
                              {isOwner && member.role === "admin" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateMemberRole(
                                      member.id,
                                      member.user_id,
                                      "member"
                                    )
                                  }
                                >
                                  <Shield className="h-4 w-4 mr-2" />
                                  取消管理员
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <Dialog>
                                <DialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="text-destructive"
                                  >
                                    <UserX className="h-4 w-4 mr-2" />
                                    移出频道
                                  </DropdownMenuItem>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>移出成员</DialogTitle>
                                    <DialogDescription>
                                      确定要将 {member.user?.username}{" "}
                                      从频道中移出吗？此操作无法撤销。
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter className="mt-4">
                                    <DialogClose asChild>
                                      <Button variant="outline">取消</Button>
                                    </DialogClose>
                                    <Button
                                      variant="destructive"
                                      onClick={() =>
                                        handleRemoveMember(
                                          member.id,
                                          member.user?.username
                                        )
                                      }
                                    >
                                      确认移出
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">未找到匹配的成员</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <div>
                <p className="text-sm font-medium">
                  总成员数: {members.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {members.filter((m) => m.role === "owner").length} 名所有者,
                  {members.filter((m) => m.role === "admin").length} 名管理员,
                  {members.filter((m) => m.role === "member").length} 名成员
                </p>
              </div>
              <InviteMemberDialog
                channelId={channelId as string}
                channelName={channel?.name || ""}
                onSuccess={() => {
                  // 重新获取成员列表
                  getChannelMembers(channelId as string).then(setMembers);
                }}
              />
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="danger">
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">危险操作</CardTitle>
              <CardDescription>
                这些操作可能会导致数据丢失，请谨慎操作
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {isOwner && (
                  <div className="rounded-lg border p-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900">
                        <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">转让频道所有权</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          将频道所有权转让给另一位成员，你将变成管理员。
                        </p>
                        <TransferOwnershipDialog
                          channelId={channelId as string}
                          channelName={channel?.name || ""}
                          currentOwnerId={user?.id || ""}
                          members={members}
                          onSuccess={() => {
                            // 重新获取频道和成员数据
                            getChannelById(channelId as string).then(
                              setChannel
                            );
                            getChannelMembers(channelId as string).then(
                              (data) => {
                                setMembers(data);
                                const currentMember = data.find(
                                  (m) => m.user_id === user?.id
                                );
                                if (currentMember) {
                                  setUserRole(currentMember.role);
                                }
                              }
                            );
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {isOwner && (
                  <div className="rounded-lg border border-destructive/50 p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-full bg-destructive/10">
                        <Trash2 className="h-5 w-5 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-destructive">
                          删除频道
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          此操作将永久删除频道及其所有消息，无法恢复。
                        </p>
                        <Dialog
                          open={showDeleteDialog}
                          onOpenChange={setShowDeleteDialog}
                        >
                          <DialogTrigger asChild>
                            <Button variant="destructive" className="mt-4">
                              删除频道
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>删除频道</DialogTitle>
                              <DialogDescription>
                                确定要删除频道 "{channel?.name}"
                                吗？此操作无法撤销，所有频道数据将被永久删除。
                              </DialogDescription>
                            </DialogHeader>
                            <div className="bg-destructive/10 p-3 rounded-lg mt-4 flex items-start gap-2">
                              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                              <p className="text-sm">
                                删除后，所有成员将无法访问此频道，所有消息和内容将被永久删除。
                              </p>
                            </div>
                            <div className="mt-4">
                              <p className="text-sm font-medium mb-2">
                                请输入频道名称确认删除:
                              </p>
                              <Input
                                placeholder={channel?.name}
                                className="mb-4"
                                onChange={(e) => {
                                  // 这里可以添加验证逻辑，确保用户输入了正确的频道名称
                                }}
                              />
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">取消</Button>
                              </DialogClose>
                              <Button
                                variant="destructive"
                                onClick={handleDeleteChannel}
                                disabled={isDeleting}
                              >
                                {isDeleting ? "删除中..." : "确认删除"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                )}

                {!isOwner && (
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-full bg-muted">
                        <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          仅频道所有者可执行危险操作
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          你是频道管理员，但只有频道所有者可以删除频道。
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
