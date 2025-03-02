"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

// 动画变量
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
          设置新密码
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          请输入您的新密码
        </p>
      </motion.div>

      <motion.form
        className="mt-8 space-y-6"
        onSubmit={handleResetPassword}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="-space-y-px rounded-md shadow-sm"
          variants={itemVariants}
        >
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
        </motion.div>

        {message && (
          <motion.div
            className="text-sm text-green-600 text-center"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            {message}
          </motion.div>
        )}

        {error && (
          <motion.div
            className="text-sm text-destructive text-center"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            {error}
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <motion.button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? "重置中..." : "重置密码"}
          </motion.button>
        </motion.div>

        <motion.div className="text-center" variants={itemVariants}>
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary/90"
          >
            返回登录
          </Link>
        </motion.div>
      </motion.form>
    </div>
  );
}
