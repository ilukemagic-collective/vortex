"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MessageSquare,
  Users,
  Video,
  FileText,
  Bell,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 移除首页的 overflow: hidden 限制
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";

    // 组件卸载时恢复原来的设置
    return () => {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    };
  }, []);

  // 防止水合不匹配
  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 英雄区域 */}
      <section className="relative w-full py-20 md:py-32">
        {/* Add background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/banner.jpg"
            alt="Vortex Banner"
            fill
            priority
            className="object-cover opacity-40"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/20 z-0" />

        {/* 背景装饰 */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl opacity-50" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-primary/20 rounded-full filter blur-3xl opacity-30" />

        <div className="container relative z-10 mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                Vortex 实时社区平台
              </h1>
              <p className="text-xl md:text-2xl text-foreground font-medium max-w-3xl mx-auto text-shadow-sm">
                连接、交流、分享 - 随时随地
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 mt-8"
            >
              <Button asChild size="lg" className="px-8">
                <Link href="/auth/register">
                  开始使用 <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/about">了解更多</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 特性区域 */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">核心功能</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Vortex 提供全方位的实时通信解决方案，满足各类社区和团队的需求
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border"
              >
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 平台优势 */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">为什么选择 Vortex</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              现代化的技术栈和用户体验，为您的社区提供最佳解决方案
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl font-bold mb-4">技术优势</h3>
              <ul className="space-y-4">
                {techAdvantages.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex items-start"
                  >
                    <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-muted-foreground text-sm">
                        {item.description}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative h-[400px] rounded-lg overflow-hidden shadow-xl border"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-6">
                  <h3 className="text-2xl font-bold mb-4">跨平台体验</h3>
                  <p className="mb-6 max-w-md">
                    无论是在 Web 端还是移动端，Vortex
                    都能提供一致且流畅的用户体验
                  </p>
                  <div className="flex justify-center gap-4">
                    <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                      <p className="font-medium mb-2">Web 端</p>
                      <p className="text-sm text-muted-foreground">
                        Next.js 14 + React 18
                      </p>
                    </div>
                    <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                      <p className="font-medium mb-2">移动端</p>
                      <p className="text-sm text-muted-foreground">
                        React Native + Expo
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 行动召唤 */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-4">
              准备好加入 Vortex 了吗？
            </h2>
            <p className="max-w-2xl mx-auto mb-8 opacity-90">
              立即注册，体验下一代实时社区平台的强大功能
            </p>
            <Button asChild size="lg" variant="secondary" className="px-8">
              <Link href="/auth/register">
                免费注册 <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="py-12 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold">Vortex</h2>
              <p className="text-muted-foreground">实时社区平台</p>
            </div>
            <div className="flex gap-8">
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                关于我们
              </Link>
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                隐私政策
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                服务条款
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Vortex. 保留所有权利。</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "实时聊天",
    description:
      "支持Markdown格式的文字消息、表情回复、@提及通知，让沟通更加丰富多彩。",
    icon: MessageSquare,
  },
  {
    title: "频道管理",
    description:
      "创建和管理公开或私密频道，设置权限，对频道进行分类，满足不同场景需求。",
    icon: Users,
  },
  {
    title: "语音/视频",
    description:
      "高质量的语音通话、屏幕共享和语音消息录制功能，让远程沟通更加便捷。",
    icon: Video,
  },
  {
    title: "文件管理",
    description: "支持图片和文件上传，实时预览，让信息传递不再受限。",
    icon: FileText,
  },
  {
    title: "通知系统",
    description: "消息推送和未读标记功能，确保您不会错过任何重要信息。",
    icon: Bell,
  },
  {
    title: "数据安全",
    description: "端到端加密、敏感词过滤和权限校验，保障您的数据安全。",
    icon: Shield,
  },
];

const techAdvantages = [
  {
    title: "现代化技术栈",
    description:
      "采用Next.js 14、React 18、TypeScript等最新技术，确保性能和可维护性。",
  },
  {
    title: "实时通信",
    description:
      "基于Supabase Realtime和WebRTC技术，提供低延迟的实时通信体验。",
  },
  {
    title: "高性能",
    description: "Web端首屏加载<1.5s，App冷启动<2s，消息延迟<500ms。",
  },
  {
    title: "跨平台同步",
    description: "Web端和移动端数据实时同步，随时随地保持连接。",
  },
  {
    title: "可扩展架构",
    description: "支持初期1,000人同时在线，可扩展至10万级用户规模。",
  },
];
