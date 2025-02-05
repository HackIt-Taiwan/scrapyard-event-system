import { baseSchema, ignoreEncryptionSchema } from "@/models/common";
import taiwanIdValidator from "taiwan-id-validator";
import { z } from "zod";

const memberSchema = baseSchema.extend({
  name_en: z.string().max(36, "英文名字超過 36 個字元"),
  grade: z.enum(["高中一年級", "高中二年級", "高中三年級"]),

  student_id: z.object({
    card_front: z.string().url("Invalid card front URL"), // assuming S3 URLs
    card_back: z.string().url("Invalid card back URL"),
  }),

  personal_affidavit: z.string().url("學生證網址無效，請嘗試重新上傳"),

  emergency_contact_name: z.string().trim().max(6, "中文名字超過 6 個字元"),
  emergency_contact_telephone: z.string().trim().max(10, "電話號碼過長"),
  emergency_contact_national_id: z
    .string()
    .refine((id) => taiwanIdValidator.isNationalIdentificationNumberValid(id), {
      message: "無效的身分證字號",
    }),

  signature: z.string(),
  parent_signature: z.string(),
});

const memberDatabaseSchema = memberSchema.extend({
  _id: z.string(),
  team_id: z.string(),
  is_leader: z.boolean(),
  email_verified: z.boolean(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  ignore_encryption: ignoreEncryptionSchema,
});

type memberSchemaType = z.infer<typeof memberSchema>;
type memberDatabaseSchemaType = z.infer<typeof memberDatabaseSchema>;

export { memberDatabaseSchema, memberSchema };
export type { memberDatabaseSchemaType, memberSchemaType };
