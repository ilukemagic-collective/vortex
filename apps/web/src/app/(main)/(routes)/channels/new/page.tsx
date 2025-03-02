"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createChannel } from "@/lib/supabase/channels";
import { useAuth } from "@/lib/auth-context";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
  name: z
    .string()
    .min(3, "频道名称至少需要3个字符")
    .max(50, "频道名称不能超过50个字符"),
  description: z.string().max(500, "描述不能超过500个字符").optional(),
  is_private: z.boolean().default(false),
});

export default function NewChannelPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      is_private: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast.error("请先登录");
      return;
    }

    try {
      setIsSubmitting(true);

      // 添加错误处理和更详细的日志
      try {
        const channel = await createChannel({
          name: values.name,
          description: values.description || null,
          is_private: values.is_private,
          owner_id: user.id,
        });

        toast.success(`频道 "${values.name}" 创建成功！`);
        router.push(`/channels/${channel.id}`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("创建频道详细错误:", error);

        // 检查是否是无限递归错误
        if (error.message && error.message.includes("infinite recursion")) {
          toast.error("创建频道失败: 数据库策略配置问题，请联系管理员");
        } else {
          toast.error(`无法创建频道: ${error.message || "未知错误"}`);
        }
      }
    } catch (error) {
      console.error("创建频道失败:", error);
      toast.error("无法创建频道，请稍后再试");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-10 flex justify-center items-center min-h-[calc(100vh-80px)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">创建新频道</CardTitle>
          <CardDescription>
            创建一个新的频道来与他人交流和分享内容
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>频道名称</FormLabel>
                    <FormControl>
                      <Input placeholder="输入频道名称" {...field} />
                    </FormControl>
                    <FormDescription>一个简短且有描述性的名称</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>频道描述（可选）</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="描述这个频道的用途和内容"
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
                      <FormLabel className="text-base">私有频道</FormLabel>
                      <FormDescription>
                        私有频道仅对受邀用户可见
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

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "创建中..." : "创建频道"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
