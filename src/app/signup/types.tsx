import { z } from "zod";

export const grades = ["高中一年級", "高中二年級", "高中三年級"] as const;

export const tShirtSizes = ["S", "M", "L", "XL"] as const;

export const signUpDataSchema = z.object({
  name: z.object({
    en: z.string().max(36, "團隊英文名字不能超過 36 個字元"),
    zh: z.string().max(36, "團隊中文名字不能超過 36 個字元"),
  }),
  teamMemberCount: z
    .number()
    .max(5, "團隊不能超過五個人")
    .min(4, "團隊不能小於四個人"),
  teamLeader: z.object({
    name: z.object({
      en: z.string().max(36, "你的名字似乎有點太長了，最多只能 36 個字"),
      zh: z.string().max(4, "你的名字似乎有點太長了，最多只能 4 個字"),
    }),
    grade: z.enum(grades),
    school: z.string().max(30, "這個學校名字太長了"),
    telephone: z
      .string()
      .max(10, "你的電話號碼似乎有點長")
      .min(7, "你的電話號碼似乎有點短"),
    email: z.string().email({ message: "這不是一個正確的電子郵件" }),
    emergencyContact: z.object({
      name: z.string().max(4, "你的名字似乎有點太長了，最多只能 4 個字"),
      telephone: z
        .string()
        .max(10, "你的電話號碼似乎有點長")
        .min(7, "你的電話號碼似乎有點短"),
      ID: z.string().length(10, "身分證字號必為 10 碼"),
    }),
    diet: z.string().optional(),
    specialNeeds: z.string().optional(),
    insurance: z.object({
      ID: z.string().length(10, "身分證字號必為 10 碼"),
      birthday: z.preprocess((k) => {
        if (typeof k === "string" || k instanceof Date) {
          return new Date(k);
        }
      }, z.date()),
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
