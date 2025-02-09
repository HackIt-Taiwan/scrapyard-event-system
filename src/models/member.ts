import { baseSchema, ignoreEncryptionSchema } from "@/models/common";
import { z } from "zod";

const memberSchema = baseSchema.extend({
  grade: z.enum(["高中一年級", "高中二年級", "高中三年級"]),
  school: z.string().trim().max(30, "學校名字超過 30 個字元"),
  shirt_size: z.enum(["S", "M", "L", "XL"]),
  student_id: z.object({
    card_front: z.string().url("Invalid card front URL"), // assuming S3 URLs
    card_back: z.string().url("Invalid card back URL"),
  }),
  special_needs: z.string().max(100, "特殊需求太多了").optional(),
  emergency_contact_name: z.string().trim().max(6, "中文名字超過 6 個字元"),
  emergency_contact_telephone: z.string().trim().max(10, "電話號碼過長"),
  emergency_contact_relation: z.string().trim().max(10, "緊急連絡人關係過長"),
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
