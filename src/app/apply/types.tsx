import taiwanIdValidator from "taiwan-id-validator";
import { z } from "zod";

export const grades = ["高中一年級", "高中二年級", "高中三年級"] as const;

export const tShirtSizes = ["S", "M", "L", "XL"] as const;

// Define Zod schema for request validation
const StudentIDSchema = z.object({
  card_front: z.string().url("Invalid card front URL"), // assuming S3 URLs
  card_back: z.string().url("Invalid card back URL"),
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
  nationalID: z
    .string()
    .refine((id) => taiwanIdValidator.isNationalIdentificationNumberValid(id), {
      message: "你的身份證字號格式錯誤",
    }),
  birthDate: z.preprocess((k) => {
    if (typeof k === "string" || k instanceof Date) {
      return new Date(k);
    }
  }, z.date()),
  address: z.string(),
  studentID: StudentIDSchema,
  tShirtSize: z.enum(tShirtSizes),

  // Contact Information
  telephone: z
    .string()
    .max(10, "你的電話號碼太長了，最多 10 碼")
    .min(7, "你的電話號碼太短了，最少 7 碼"),
  email: z.string().email({ message: "這不是有效的電子郵件格式" }),

  // Special Needs & Additional Information
  diet: z.string().optional(),
  specialNeeds: z.string().optional(),
  personalAffidavit: z.string().url("無效的base64 url"),
  parentAffidavit: z.string().url("無效的base64 url"),

  // Emergency Contact Information
  emergencyContactName: z
    .string()
    .max(6, "緊急聯絡人名字太長了，最多只能 6 個字"),
  emergencyContactTelephone: z
    .string()
    .max(10, "緊急聯絡人電話號碼太長了，最多 10 碼")
    .min(7, "緊急聯絡人電話號碼太短了，最少 7 碼"),
  emergencyContactNationalID: z
    .string()
    .refine((id) => taiwanIdValidator.isNationalIdentificationNumberValid(id), {
      message: "緊急聯絡人身份證字號格式錯誤",
    }),
  signature: z.string().base64url("這看起來不太正確"),
  parentSignature: z.string().base64url("這看起來不太正確").optional()
});

export type teamData = z.infer<typeof teamDataSchema>;
export type memberData = z.infer<typeof memberDataSchema>;
