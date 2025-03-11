# Vortex 实时社区平台

Vortex是一个类似Discord的实时社区平台，支持多人在线文字/语音聊天、频道管理、文件共享及跨平台同步，覆盖Web端和移动端。

## 项目概述

Vortex是为游戏社区、兴趣小组、远程团队等需要实时协作的群体设计的现代化通信平台。核心功能包括：

- 用户系统：注册/登录、个人资料管理、好友系统
- 频道管理：创建/删除频道、设置权限、频道分类
- 实时聊天：文字消息(支持Markdown)、表情回复、@提及通知
- 语音/视频：语音通话、屏幕共享、语音消息录制
- 文件管理：图片/文件上传、实时预览
- 通知系统：消息推送、未读标记
- 数据安全：端到端加密、敏感词过滤、权限校验

## 技术栈

### Web端

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui

### App端

- React Native
- Expo SDK
- TypeScript
- NativeWind
- React Navigation

### 后端服务

- Next.js API Routes
- honojs + mysql + redis + prisma
- LiveKit (WebRTC)

## 项目结构

```
vortex/
├── apps/
│ ├── web/ # Next.js 14 Web应用
│ │ ├── src/
│ │ │ ├── app/ # App Router
│ │ │ ├── components/ # UI组件
│ │ │ └── lib/ # 工具函数
│ │ ├── public/ # 静态资源
│ │ └── package.json
│ └── app/ # React Native + Expo应用
│ ├── src/
│ ├── app.json
│ └── package.json
├── packages/
│ ├── ui/ # 共享UI组件
│ ├── config/ # 共享配置
│ └── types/ # 共享类型定义
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

## 开始使用

### 前置要求

- Node.js 18+
- pnpm 8+
- LiveKit账户（用于语音/视频功能）

### 环境设置

1. 克隆仓库

```bash
git clone https://github.com/yourusername/vortex.git
cd vortex
```

2. 安装依赖

```bash
pnpm install
```

3. 配置环境变量

复制`.env.local.example`文件到`.env.local`并填写必要的环境变量：

```bash
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
```

### 开发

启动Web开发服务器：

```bash
pnpm web dev
```

启动App开发服务器：

```bash
pnpm app
```

### 构建

构建所有应用：

```bash
pnpm build
```

## 数据库设计

Vortex使用honojs提供的mysql数据库，主要表结构包括：

- users: 用户信息
- channels: 频道信息
- messages: 聊天消息
- attachments: 附件和上传文件
- channel_members: 频道成员关系
- user_friends: 好友关系

## 贡献指南

1. Fork仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启Pull Request

## 许可证

[MIT](LICENSE)

## 联系方式

项目维护者: <your-email@example.com>
