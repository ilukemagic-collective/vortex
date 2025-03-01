"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("密码重置链接已发送到您的邮箱");
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
          重置您的密码
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          我们将向您发送一封电子邮件，其中包含重置密码的链接
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
        <div>
          <label htmlFor="email" className="sr-only">
            电子邮件
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="relative block w-full rounded-md border-0 py-1.5 px-3 text-foreground bg-background ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            placeholder="电子邮件"
          />
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
            {isLoading ? "发送中..." : "发送重置链接"}
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
