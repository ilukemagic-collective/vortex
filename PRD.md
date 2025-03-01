PRD（产品需求文档）
项目名称： vortex 风格实时社区平台（Web + App）
版本： 1.0
日期： 2025-03-01

1. 项目概述
   1.1 项目背景
   构建一个类似 Discord 的实时社区平台，支持多人在线文字/语音聊天、频道管理、文件共享及跨平台同步，覆盖 Web 端（Next.js 14）和移动端（React Native + Expo）。

1.2 目标用户
游戏社区、兴趣小组、远程团队等需要实时协作的群体。
用户规模：初期支持 1,000 人同时在线，可扩展至 10 万级。
1.3 核心目标
功能目标：提供频道管理、实时聊天、语音通话、消息通知、跨平台同步能力。
性能目标：消息延迟 < 500ms，App 启动时间 < 2s，Web 端首屏加载 < 1.5s。
安全目标：敏感数据加密存储，用户权限分级控制。 2. 功能需求
2.1 核心功能模块
模块 子功能 Web 端 App 端
用户系统 注册/登录（OAuth + 邮箱）、个人资料管理、好友系统 ✅ ✅
频道管理 创建/删除频道、设置权限（公开/私密）、频道分类（文字/语音） ✅ ✅
实时聊天 文字消息（Markdown）、表情回复、消息历史、@提及通知 ✅ ✅
语音/视频 语音通话、屏幕共享、语音消息录制 ✅ ✅
文件管理 图片/文件上传（<100MB）、实时预览 ✅ ✅
通知系统 消息推送（Web Push/App 推送）、未读标记 ✅ ✅
数据安全 端到端加密（可选）、敏感词过滤、权限校验 ✅ ✅
2.2 详细功能说明
2.2.1 实时聊天
功能描述：用户在频道内发送文字消息，支持 Markdown、表情回复、消息引用。
技术实现：
Web 端：通过 Supabase Realtime 监听 PostgreSQL 数据库的 INSERT 事件。
App 端：复用相同逻辑，通过 React Native 的 FlatList 优化消息列表渲染。
2.2.2 语音通话
功能描述：用户加入语音频道后，可实时通话或共享屏幕。
技术实现：
Web 端：集成 LiveKit Web SDK（基于 WebRTC）。
App 端：使用 LiveKit React Native SDK，通过 Expo Dev Client 调用原生模块。 3. 技术架构
3.1 技术栈
模块 技术选型
Web 前端 Next.js 14（App Router）、React 18、TypeScript、Tailwind CSS、shadcn/ui
App 前端 React Native、Expo SDK 50、TypeScript、NativeWind、React Navigation 6
后端服务 Next.js API Routes + Supabase（Auth/Database/Storage/Realtime）
实时通信 Supabase Realtime（WebSocket）、LiveKit（WebRTC）
数据库 PostgreSQL（托管于 Supabase）、Redis（缓存在线状态）
文件存储 Supabase Storage（与 S3 兼容）
DevOps Vercel（Web 部署）、EAS Build（App 构建）、GitHub Actions（CI/CD）
3.2 架构图
┌───────────────┐ ┌───────────────┐ ┌───────────────┐  
│ Web 端 │ HTTP │ Next.js │ REST │ Supabase │  
│ (Next.js 14) ├──────►│ API Routes ├──────►│ (BaaS) │  
└───────┬───────┘ └───────┬───────┘ └───────┬───────┘  
 │ │ │  
 │ WebSocket │ PostgreSQL │ S3  
 ▼ ▼ ▼  
┌───────────────┐ ┌───────────────┐ ┌───────────────┐  
│ App 端 │ │ LiveKit │ │ Vercel/EAS │  
│ (React Native)├──────►│ (WebRTC) │ │ (Deployment) │  
└───────────────┘ └───────────────┘ └───────────────┘  
4. 开发计划
4.1 里程碑规划
阶段 时间 交付物
需求确认 2 周 PRD 文档、UI/UX 原型
技术验证 1 周 核心模块 PoC（实时消息、语音通话）
Web 端开发 6 周 用户系统、频道管理、实时聊天、文件上传
App 端开发 8 周 移动端适配、推送通知、语音消息录制
后端开发 4 周 API 接口、数据库设计、安全策略
集成测试 2 周 全链路测试报告、性能优化结果
上线发布 1 周 Web 端部署、App 提交至商店
4.2 详细排期
第 1-2 周：需求与设计
完成 PRD 文档和 Figma 高保真原型。
技术选型验证（Supabase Realtime 压测、WebRTC 延迟测试）。
第 3-8 周：Web 端开发
用户系统（NextAuth.js 集成）。
实时聊天（Supabase 订阅、消息历史分页）。
文件上传（UploadThing + Supabase Storage）。
第 5-12 周：App 端开发
复用 Web 业务逻辑（通过 Monorepo 共享代码）。
实现推送通知（Expo Notifications + FCM/APNs）。
语音消息录制（expo-av 库）。
第 13-14 周：测试与优化
压力测试：模拟 1,000 用户同时发送消息。
性能优化：App 启动时间优化至 < 2s。
第 15 周：上线
Web 端部署至 Vercel。
App 提交至 App Store 和 Google Play。 5. 非功能需求
5.1 性能指标
Web 端：Lighthouse 评分 > 90，首屏加载时间 < 1.5s。
App 端：冷启动时间 < 2s，消息列表滚动帧率 ≥ 60 FPS。
5.2 安全要求
用户敏感数据（密码、Token）加密存储（AES-256）。
API 接口防刷策略（限流 100 次/分钟）。 6. 风险与应对
风险 应对措施
实时消息延迟过高 使用 Supabase Realtime 的负载均衡 + 边缘节点加速。
跨平台 UI 不一致 通过 Monorepo 共享组件逻辑，使用 NativeWind 统一样式。
App 审核被拒 提前与应用商店沟通功能合规性，预留 2 周缓冲期。 7. 预算与资源
项目 成本
开发团队（6 人） 24 人月（约 $240k）
云服务（Supabase） $299/月（Growth 计划）
第三方服务 LiveKit（$99/月） 8. 附录
UI 原型链接：Figma 设计稿（[链接]）。
技术文档：API 接口文档、数据库 Schema。
测试报告：LoadRunner 压测结果、用户测试反馈。
PRD 确认签署：

产品经理：\***\*\_\_\_\*\***
技术负责人：\***\*\_\_\_\*\***
设计负责人：\***\*\_\_\_\*\***
日期：\***\*\_\_\_\*\***
