import taiwanIdValidator from "taiwan-id-validator";
import { z } from "zod";

export const grades = ["高中/職/專科一年級", "高中/職/專科二年級", "高中/職/專科三年級"] as const;

export const tShirtSizes = ["S", "M", "L", "XL"] as const;

// Define Zod schema for request validation
const StudentIdSchema = z.object({
  cardFront: z.string().url("Invalid card front URL"), // assuming S3 URLs
  cardBack: z.string().url("Invalid card back URL"),
});

export const teamDataSchema = z.object({
  teamName: z.string().max(24, "團隊名字不能超過 24 個字元"),
  teamSize: z
    .number()
    .max(5, "團隊不能超過五個人")
    .min(4, "團隊不能小於四個人"),
});

export const memberDataSchema = z.object({
  // Personal information
  nameEn: z.string().max(36, "你的英文名字太長了，最多只能 36 個字"),
  nameZh: z.string().max(6, "你的中文名字太長了，最多只能 6 個字"),
  grade: z.enum(grades),
  school: z.string().max(30, "學校名稱太長了，最多只能 30 個字"),
  studentId: StudentIdSchema,
  shirtSize: z.enum(tShirtSizes),

  // Contact Information
  telephone: z
    .string()
    .max(10, "你的電話號碼太長了，最多 10 碼")
    .min(7, "你的電話號碼太短了，最少 7 碼"),
  email: z.string().email({ message: "這不是有效的電子郵件格式" }),

  // Special Needs & Additional Information
  diet: z.string().max(100, "最多只能填寫100字!").optional(),
  specialNeeds: z.string().max(100, "最多只能填寫100字!").optional(),

  // Emergency Contact Information
  emergencyContactName: z
    .string()
    .max(6, "緊急聯絡人名字太長了，最多只能 6 個字"),
  emergencyContactTelephone: z
    .string()
    .max(10, "緊急聯絡人電話號碼太長了，最多 10 碼")
    .min(7, "緊急聯絡人電話號碼太短了，最少 7 碼"),
  emergencyContactRelation: z
    .string()
    .max(10, "緊急聯絡人關係太長了")
    .min(1, "緊急聯絡人關係太短了"),
  
  // 保險資料
  // address: z.string(),
  // nationalID: z
  //   .string()
  //   .refine((id) => taiwanIdValidator.isNationalIdentificationNumberValid(id), {
  //     message: "你的身份證字號格式錯誤",
  //   }),
  // birthDate: z.preprocess((k) => {
  //   if (typeof k === "string" || k instanceof Date) {
  //     return new Date(k);
  //   }
  // }, z.date()),
});

  
const TeamAffidavitSchema = z
.object({
  team_affidavit: z.string().url("團隊切結書網址無效，請嘗試重新上傳"),
  parents_affidavit: z.string().url("法定代理人網址無效，請嘗試重新上傳"),
})
.strict();

export const teacherDataSchema = z.object({
  // Personal information
  nameEn: z.string().max(36, "你的英文名字太長了，最多只能 36 個字"),
  nameZh: z.string().max(6, "你的中文名字太長了，最多只能 6 個字"),

  // Contact Information
  telephone: z
    .string()
    .max(10, "你的電話號碼太長了，最多 10 碼")
    .min(7, "你的電話號碼太短了，最少 7 碼"),
  email: z.string().email({ message: "這不是有效的電子郵件格式" }),

  // Check if the teacher attend
  attend: z.boolean(),

  // Special Needs & Additional Information
  diet: z.string().optional(),
});

export type teamData = z.infer<typeof teamDataSchema>;
export type memberData = z.infer<typeof memberDataSchema>;
export type teacherData = z.infer<typeof teacherDataSchema>;
