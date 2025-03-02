"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { inviteUserToChannel } from "@/lib/supabase/channels";

// 验证模式
const usernameSchema = z.object({
  username: z.string().min(3, "用户名至少需要3个字符"),
});

type UsernameFormValues = z.infer<typeof usernameSchema>;

interface InviteMemberDialogProps {
  channelId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteMemberDialog({
  channelId,
  isOpen,
  onClose,
  onSuccess,
}: InviteMemberDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 用户名表单
  const form = useForm<UsernameFormValues>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: "",
    },
  });

  const handleSubmit = async (values: UsernameFormValues) => {
    setIsSubmitting(true);

    try {
      await inviteUserToChannel(channelId, { username: values.username });
      toast.success(`已邀请用户 ${values.username} 加入频道`);

      // 重置表单
      form.reset();

      // 调用成功回调
      onSuccess?.();

      // 关闭对话框
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("邀请用户失败:", error);
      toast.error(error.message || "邀请用户失败，请稍后再试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>邀请用户加入频道</DialogTitle>
          <DialogDescription>通过用户名邀请用户加入此频道</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>用户名</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="输入用户名"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "邀请中..." : "发送邀请"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
