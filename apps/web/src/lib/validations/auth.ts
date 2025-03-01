import * as z from "zod"

export const registerSchema = z.object({
  email: z.string()
    .min(1, { message: "邮箱是必填项" })
    .email({ message: "请输入有效的邮箱地址" }),
  password: z.string()
    .min(8, { message: "密码至少需要8个字符" })
    .max(32, { message: "密码不能超过32个字符" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "密码必须包含至少一个大写字母、一个小写字母和一个数字",
    }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
})

export type RegisterInput = z.infer<typeof registerSchema>

// 添加登录验证 schema
export const loginSchema = z.object({
  email: z.string()
    .min(1, { message: "邮箱是必填项" })
    .email({ message: "请输入有效的邮箱地址" }),
  password: z.string()
    .min(1, { message: "密码是必填项" }),
})

export type LoginInput = z.infer<typeof loginSchema> 