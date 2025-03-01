export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">关于 Vortex</h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">我们的使命</h2>
          <p className="text-muted-foreground">
            Vortex
            致力于创建一个安全、友好且功能丰富的实时社区平台，让人们可以轻松地进行交流、分享和协作。
            我们相信，通过提供高质量的通信工具，可以帮助人们建立更紧密的联系，无论他们身在何处。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">平台特点</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>实时文字聊天 - 与朋友、同事或社区成员即时交流</li>
            <li>语音通话 - 高质量的语音聊天，让沟通更加便捷</li>
            <li>频道管理 - 创建和管理不同主题的频道，组织您的社区</li>
            <li>文件共享 - 安全地分享文件、图片和其他媒体</li>
            <li>跨平台同步 - 在任何设备上访问您的消息和内容</li>
            <li>自定义主题 - 根据个人喜好定制界面外观</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">我们的团队</h2>
          <p className="text-muted-foreground">
            Vortex
            由一群热爱技术和社区建设的开发者创建。我们致力于不断改进平台，
            提供最佳的用户体验，并确保您的数据安全和隐私得到保护。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">联系我们</h2>
          <p className="text-muted-foreground">
            如果您有任何问题、建议或反馈，请随时联系我们：
            <br />
            <a
              href="mailto:support@vortex.com"
              className="text-primary hover:underline"
            >
              support@vortex.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
