import { baseSchema, ignoreEncryptionSchema } from "@/models/common";
import { z } from "zod";

const teacherSchema = baseSchema.extend({
  will_attend: z.boolean(),
  teacher_affidavit: z.string().url("Invalid affidavit URL"),
});

const teacherDatabaseSchema = teacherSchema.extend({
  _id: z.string(),
  team_id: z.string(),
  email_verified: z.boolean(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  ignore_encryption: ignoreEncryptionSchema,
});

type teacherSchemaType = z.infer<typeof teacherSchema>;
type teacherDatabaseSchemaType = z.infer<typeof teacherDatabaseSchema>;

export { teacherDatabaseSchema, teacherSchema };
export type { teacherDatabaseSchemaType, teacherSchemaType };