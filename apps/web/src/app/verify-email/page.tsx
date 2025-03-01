export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <h2 className="text-2xl font-bold">验证您的邮箱</h2>
        <p className="mt-2 text-muted-foreground">
          我们已经向您的邮箱发送了一封验证邮件。 请点击邮件中的链接完成注册。
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          如果您没有收到邮件，请检查垃圾邮件文件夹。
        </p>
      </div>
    </div>
  );
}
