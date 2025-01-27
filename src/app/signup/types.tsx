import { number, z } from "zod";

export const grades = ["高中一年級", "高中二年級", "高中三年級"] as const;

export const tShirtSizes = ["S", "M", "L", "XL"] as const;

export const signUpDataSchema = z.object({
  name: z.object({
    en: z.string().max(36, "團隊英文名字不能超過 36 個字元"),
    zh: z.string().max(36, "團隊中文名字不能超過 36 個字元"),
  }),
  teamMemberCount: z.number().max(5).min(4),
  teamLeader: z.object({
    name: z.object({
      en: z.string().max(36),
      zh: z.string().max(4),
    }),
    grade: z.enum(grades),
    school: z.string(),
    telephone: z.string(),
    email: z.string().email(),
    emergencyContact: z.object({
      name: z.string(),
      telephone: z.string(),
      ID: z.string(),
    }),
    diet: z.string().optional(),
    specialNeeds: z.string().optional(),
    insurance: z.object({
      ID: z.string(),
      birthday: z.date(),
      address: z.string(),
    }),
    tShirtSize: z.enum(tShirtSizes),
  }),
  // TODO: Add files upload schema
});

export type signUpData = z.infer<typeof signUpDataSchema>;

export interface signUpContextProps {
  propertyForm: signUpData | null;
  updatePropertyForm: (property: Partial<signUpData>) => void;
}
