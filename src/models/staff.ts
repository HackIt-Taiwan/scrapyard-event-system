import { z } from "zod";

// -- login --
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

// -- review --
const reviewSchema = z.object({
  _id: z.string(),
  review: z.enum(["approve", "rejected"]),
  reason: z.string().optional().refine(
    (data) => {
      // If review is rejected, reason must be present
      return true;
    },
    {
      message: "Reason is required when review is rejected"
    }
  )
}).refine(
  (data) => {
    if (data.review === "rejected") {
      return !!data.reason;
    }
    return true;
  },
  {
    message: "Reason is required when review is rejected",
    path: ["reason"]
  }
);

export { staffEmailSchema, staffVerifySchema, tokenSchema, reviewSchema };
