import taiwanIdValidator from "taiwan-id-validator";
import { z } from "zod";

const baseSchema = z.object({
  name_zh: z.string().max(6, "中文名字超過 6 個字元"),
  name_en: z.string().max(36, "英文名字超過 36 個字元"),
  telephone: z.string().trim().max(10, "電話號碼過長"),
  email: z.string().trim().email({ message: "錯誤的電子郵件格式" }),
  diet: z.string().max(100, "最多只能填寫100字!").optional(),
});
type BaseSchemaType = z.infer<typeof baseSchema>;

const ignoreEncryptionSchema = z.object({
  _id: z.boolean(),
  is_leader: z.boolean(),
  email_verified: z.boolean(),
  createdAt: z.boolean(),
  updatedAt: z.boolean(),
  completeAt: z.boolean(),
});
type IgnoreEncryption = z.infer<typeof ignoreEncryptionSchema>;

const defaultIgnoreEncryption: IgnoreEncryption = {
  _id: true,
  is_leader: true,
  email_verified: true,
  createdAt: true,
  updatedAt: true,
  completeAt: true,
};

export { baseSchema, defaultIgnoreEncryption, ignoreEncryptionSchema };
export type { BaseSchemaType, IgnoreEncryption };
