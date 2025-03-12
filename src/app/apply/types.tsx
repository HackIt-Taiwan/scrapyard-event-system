import {isNationalIdentificationNumberValid, isResidentCertificateNumberValid}  from 'taiwan-id-validator';
import { z } from "zod";

export const grades = ["高中/職/專科一年級", "高中/職/專科二年級", "高中/職/專科三年級"] as const;

export const tShirtSizes = ["不要 T-shirt", "S", "M", "L", "XL"] as const;

export const learnAboutUsOptions = [
  "朋友/同學",
  "老師/學校",
  "Discord社群",
  "社群軟體（Ig/threads/FB)",
  "獎金獵人",
  "其他"
] as const;

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
    .min(3, "團隊不能小於三個人"),
  learnAboutUs: z.enum(learnAboutUsOptions, {
    required_error: "請選擇你是如何得知這個活動的",
  }),
});

export const memberDataSchema = z.object({
  // Personal information
  nameEn: z.string().max(36, "你的英文名字太長了，最多只能 36 個字"),
  nameZh: z.string().max(6, "你的中文名字太長了，最多只能 6 個字"),
  grade: z.enum(grades),
  school: z.string().max(30, "學校名稱太長了，最多只能 30 個字"),
  studentId: StudentIdSchema,
  shirtSize: z.enum(tShirtSizes),
  
  // National ID for insurance
  nationalId: z
    .string()
    .refine((id) => (isNationalIdentificationNumberValid(id) || isResidentCertificateNumberValid(id)), {
      message: "你的身份證字號格式錯誤",
    }),

  // Competition risk agreement
  competitionRiskAgreement: z.string().url("請上傳已簽署的競賽風險承擔同意書").min(1, "請上傳已簽署的競賽風險承擔同意書"),

  // Address for insurance
  address: z.string().min(1, "請填寫地址").max(100, "地址太長了，最多只能 100 個字"),

  // Contact Information
  telephone: z
    .string()
    .trim()
    .length(10, "電話號碼必須是10碼")
    .regex(/^[0-9]+$/, "電話號碼只能包含數字"),
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
    .trim()
    .length(10, "緊急聯絡人電話號碼必須是10碼")
    .regex(/^[0-9]+$/, "電話號碼只能包含數字"),
  emergencyContactRelation: z
    .string()
    .max(10, "緊急聯絡人關係太長了")
    .min(1, "緊急聯絡人關係太短了"),
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
