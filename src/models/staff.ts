import { z } from "zod";

const staffEmailSchema = z.object({
  email: z
    .string()
    .min(1, { message: "必須填寫電子郵件！~" })
    .email("電子郵件格式錯誤！~")
    .regex(/^[^@]+@staff\.hackit\.tw$/, {
      message: "電子郵件格式錯誤！~",
    }),
});

const staffVerifySchema = staffEmailSchema.extend({
  otp: z
    .string()
    .length(6, "OTP must be six-digit.")
    .regex(/^\d+$/, { message: "驗證碼有誤" }),
});

const tokenSchema = z.object({
  token: z.string().length(128, "The token must be valid"),
});

export { staffEmailSchema, staffVerifySchema, tokenSchema };
