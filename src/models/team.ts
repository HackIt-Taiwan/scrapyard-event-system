import { ignoreEncryptionSchema } from "@/models/common";
import { z } from "zod";

const TeamSchema = z
  .object({
    team_name: z
      .string()
      .min(1, "隊伍名稱為必要")
      .max(24, "隊伍名稱必須小於24個字")
      .trim(),
    team_size: z.union([z.literal(4), z.literal(5)]),
  })
  .strict();

const TeamDatabaseSchema = TeamSchema.extend({
    _id: z.string(),
    leader_id: z.string(),
    teacher_id: z.string(),
    members_id: z.array(z.string()),
    status: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),

    leader_link: z.string().optional(),
    members_link: z.array(z.string()),
    teacher_link: z.string().optional(),

    team_affidavit: z.string().url("團隊切結書網址無效，請嘗試重新上傳").optional(),
    parents_affidavit: z.string().url("法定代理人網址無效，請嘗試重新上傳").optional(),

    ignore_encryption: ignoreEncryptionSchema,
})

const TeamAffidavitSchema = z
  .object({
    team_affidavit: z.string().url("團隊切結書網址無效，請嘗試重新上傳"),
    parents_affidavit: z.string().url("法定代理人網址無效，請嘗試重新上傳").optional(),
  })
  .strict();

type teamSchemaType = z.infer<typeof TeamSchema>;
type teamAffidavitSchemaType = z.infer<typeof TeamAffidavitSchema>;
type teamDatabaseSchemaType = z.infer<typeof TeamDatabaseSchema>;

export { TeamSchema, TeamDatabaseSchema, TeamAffidavitSchema };
export type { teamSchemaType, teamDatabaseSchemaType, teamAffidavitSchemaType };
