import Link from "next/link";

export default function RegisterConfirmPage() {
  return (
    <div className="w-full max-w-md space-y-8 text-center">
      <h2 className="text-3xl font-bold tracking-tight">请确认您的电子邮件</h2>
      <p className="text-muted-foreground">
        我们已向您的电子邮件地址发送了一封确认邮件。
        <br />
        请点击邮件中的链接完成注册。
      </p>
      <div className="pt-4">
        <Link
          href="/login"
          className="font-medium text-primary hover:text-primary/90"
        >
          返回登录
        </Link>
      </div>
    </div>
  );
}
