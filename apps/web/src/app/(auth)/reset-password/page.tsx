"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 检查用户是否已通过重置链接登录
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        // 如果没有会话，重定向到登录页面
        router.push("/login");
      }
    };

    checkUser();
  }, [router]);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("密码已成功重置");
      // 3秒后重定向到登录页面
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
          设置新密码
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          请输入您的新密码
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
        <div className="-space-y-px rounded-md shadow-sm">
          <div>
            <label htmlFor="password" className="sr-only">
              新密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="relative block w-full rounded-t-md border-0 py-1.5 px-3 text-foreground bg-background ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              placeholder="新密码"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="sr-only">
              确认新密码
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="relative block w-full rounded-b-md border-0 py-1.5 px-3 text-foreground bg-background ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              placeholder="确认新密码"
            />
          </div>
        </div>

        {message && (
          <div className="text-sm text-green-600 text-center">{message}</div>
        )}

        {error && (
          <div className="text-sm text-destructive text-center">{error}</div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
          >
            {isLoading ? "重置中..." : "重置密码"}
          </button>
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary/90"
          >
            返回登录
          </Link>
        </div>
      </form>
    </div>
  );
}
