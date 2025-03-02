"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function RegisterConfirmPage() {
  return (
    <div className="w-full max-w-md space-y-8 text-center">
      <motion.h2
        className="text-3xl font-bold tracking-tight"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        请确认您的电子邮件
      </motion.h2>

      <motion.p
        className="text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        我们已向您的电子邮件地址发送了一封确认邮件。
        <br />
        请点击邮件中的链接完成注册。
      </motion.p>

      <motion.div
        className="pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary/90"
          >
            返回登录
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
