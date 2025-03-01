"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">加载中...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">欢迎回来, {user.email}</h1>
        <p className="mt-2 text-muted-foreground">
          这是您的个人仪表板，您可以在这里管理您的账户和查看活动。
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* 统计卡片 */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">账户信息</h3>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-muted-foreground">邮箱: {user.email}</p>
            <p className="text-sm text-muted-foreground">
              注册时间: {new Date(user.created_at).toLocaleDateString()}
            </p>
            <p className="text-sm text-muted-foreground">
              上次登录:{" "}
              {user.last_sign_in_at
                ? new Date(user.last_sign_in_at).toLocaleDateString()
                : "从未登录"}
            </p>
          </div>
        </div>

        {/* 快速操作卡片 */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">快速操作</h3>
          <div className="mt-4 space-y-3">
            <button
              onClick={() => router.push("/profile")}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              编辑个人资料
            </button>
            <button
              onClick={() => router.push("/settings")}
              className="w-full rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/90"
            >
              账户设置
            </button>
          </div>
        </div>

        {/* 活动卡片 */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">最近活动</h3>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">暂无活动记录</p>
          </div>
        </div>
      </div>
    </div>
  );
}
