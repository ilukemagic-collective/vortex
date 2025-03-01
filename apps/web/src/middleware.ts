import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // 刷新会话（如果存在）
  await supabase.auth.getSession();

  // 检查用户是否已登录
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isLoggedIn = !!session;
  const isAuthPage =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register") ||
    req.nextUrl.pathname.startsWith("/forgot-password") ||
    req.nextUrl.pathname.startsWith("/reset-password");

  // 如果用户已登录且尝试访问认证页面，重定向到首页
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 如果用户未登录且尝试访问受保护的页面，重定向到登录页面
  const protectedRoutes = ["/channels", "/settings"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

// 指定哪些路径应该触发此中间件
export const config = {
  matcher: [
    /*
     * 匹配所有需要认证的路径:
     * - /dashboard 开头的路径
     * - /api 开头的路径 (可选，如果你有 API 路由)
     * - /_supabase/session (处理 Supabase session)
     */
    '/dashboard/:path*',
    '/api/:path*',
    '/_supabase/session'
  ],
}; 