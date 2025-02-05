import taiwanIdValidator from "taiwan-id-validator";
import { z } from "zod";

const baseSchema = z.object({
  name_zh: z.string().max(6, "中文名字超過 6 個字元"),
  school: z.string().trim().max(30, "學校名字超過 30 個字元"),
  birth_date: z.preprocess(
    (val) => {
      if (typeof val === "string" || val instanceof Date) {
        return new Date(val);
      }
    },
    z.date({ message: "錯誤的生日格式" }),
  ),
  national_id: z
    .string()
    .refine((id) => taiwanIdValidator.isNationalIdentificationNumberValid(id), {
      message: "無效的身分證字號",
    }),
  address: z.string(),
  shirt_size: z.enum(["S", "M", "L", "XL"]),
  telephone: z.string().trim().max(10, "電話號碼過長"),
  email: z.string().trim().email({ message: "錯誤的電子郵件格式" }),
  special_needs: z.string().optional(),
  diet: z.string().optional(),
});
type BaseSchemaType = z.infer<typeof baseSchema>;

const ignoreEncryptionSchema = z.object({
  _id: z.boolean(),
  is_leader: z.boolean(),
  email_verified: z.boolean(),
  createdAt: z.boolean(),
  updatedAt: z.boolean(),
});
type IgnoreEncryption = z.infer<typeof ignoreEncryptionSchema>;

const defaultIgnoreEncryption: IgnoreEncryption = {
  _id: true,
  is_leader: true,
  email_verified: true,
  createdAt: true,
  updatedAt: true,
};

export { baseSchema, defaultIgnoreEncryption, ignoreEncryptionSchema };
export type { BaseSchemaType, IgnoreEncryption };
