import { z } from "zod";
import { memberSchema } from "./member";
import { teacherSchema } from "./teacher";

// -- login --
const staffEmailSchema = z.object({
  email: z
    .string()
    .min(1, { message: "必須填寫電子郵件！~" })
    .email("電子郵件格式錯誤！~")
    .regex(/^[^@]+@staff\.hackit\.tw$/, {
      message: "電子郵件格式錯誤！~",
    }),
});

const staffVerifySchema = staffEmailSchema.extend({
  otp: z
    .string()
    .length(6, "OTP must be six-digit.")
    .regex(/^\d+$/, { message: "驗證碼有誤" }),
});

const tokenSchema = z.object({
  token: z.string().length(128, "The token must be valid"),
});

// -- review --
const reviewSchema = z.object({
  _id: z.string(),
  review: z.enum(["approve", "rejected"]),
  reason: z.string().optional().refine(
    (data) => {
      // If review is rejected, reason must be present
      return true;
    },
    {
      message: "Reason is required when review is rejected"
    }
  )
}).refine(
  (data) => {
    if (data.review === "rejected") {
      return !!data.reason;
    }
    return true;
  },
  {
    message: "Reason is required when review is rejected",
    path: ["reason"]
  }
);

const teamDataReviewSchema = z.object({
  team_name: z.string(),
  team_size: z.number(),
  team_affidavit: z.string().url().optional(),
  parents_affidavit: z.string().url().optional()
}).transform(data => ({
  隊伍名稱: data.team_name,
  隊伍大小: data.team_size,
  團隊切結書: data.team_affidavit,
  家長切結書: data.parents_affidavit,
}))

const memberDataReviewSchema = memberSchema.extend({}).transform(data => ({
  中文姓名: data.name_zh,
  英文姓名: data.name_en,
  在學學校: data.school,
  在學年級: data.grade,
  飲食習慣: data.diet,
  特殊需求: data.special_needs,
  Tshirt尺寸: data.shirt_size,
  電話號碼: data.telephone,
  電子郵件: data.email,
  學生證正面: data.student_id.card_front,
  學生證背面: data.student_id.card_back,
  緊急聯絡人中文名字: data.emergency_contact_name,
  緊急聯絡人電話: data.emergency_contact_telephone,
  緊急聯絡人關係: data.emergency_contact_relation
}));

const teacherDataReviewSchema = teacherSchema.extend({}).transform(data => ({
  中文姓名: data.name_zh,
  英文姓名: data.name_en,
  飲食習慣: data.diet,
  電話號碼: data.telephone,
  電子郵件: data.email,
  會不會參加: data.attend ? "會" : "不會"
}));

export { staffEmailSchema, staffVerifySchema, tokenSchema, reviewSchema, teamDataReviewSchema, memberDataReviewSchema, teacherDataReviewSchema };
