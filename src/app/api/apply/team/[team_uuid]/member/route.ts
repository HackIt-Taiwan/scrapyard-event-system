import { sendVerificationEmail } from "@/lib/email";
import { generateEmailVerificationToken, verifyToken } from "@/lib/jwt";
import {
  Member,
  defaultIgnoreEncryption as memberIgnoreEncryption,
} from "@/models/member";
import {
  Teacher,
  defaultIgnoreEncryption as teacherIgnoreEncryption,
} from "@/models/teacher";
import { databasePost } from "@/utils/databaseAPI";
import { type NextRequest, NextResponse } from "next/server";
import taiwanIdValidator from "taiwan-id-validator";
import { z } from "zod";

const baseSchema = z.object({
  name_zh: z.string().max(6, "中文名字超過 6 個字元"),
  school: z.string().trim().max(30, "學校名字超過 30 個字元"),
  birth_date: z.preprocess(
    (val) => {
      if (typeof val === "string" || val instanceof Date) {
        return new Date(val);
      }
    },
    z.date({ message: "錯誤的生日格式" }),
  ),
  national_id: z
    .string()
    .refine((id) => taiwanIdValidator.isNationalIdentificationNumberValid(id), {
      message: "無效的身分證字號",
    }),
  address: z.string(),
  shirt_size: z.enum(["S", "M", "L", "XL"]),
  telephone: z.string().trim().max(10, "電話號碼過長"),
  email: z.string().trim().email({ message: "錯誤的電子郵件格式" }),
  special_needs: z.string().optional(),
  diet: z.string().optional(),
});

const memberSchema = baseSchema
  .extend({
    name_en: z.string().max(36, "英文名字超過 36 個字元"),
    grade: z.enum(["高中一年級", "高中二年級", "高中三年級"]),

    personal_affidavit: z.string().url("學生證網址無效，請嘗試重新上傳"),

    emergency_contact_name: z.string().trim().max(6, "中文名字超過 6 個字元"),
    emergency_contact_telephone: z.string().trim().max(10, "電話號碼過長"),
    emergency_contact_national_id: z
      .string()
      .refine(
        (id) => taiwanIdValidator.isNationalIdentificationNumberValid(id),
        { message: "無效的身分證字號" },
      ),

    signature: z.string(),
    parent_signature: z.string(),
    student_id: z.object({
      card_front: z.string().url("Invalid card front URL"), // assuming S3 URLs
      card_back: z.string().url("Invalid card back URL"),
    }),
  })
  .strict();

const teacherSchema = baseSchema
  .extend({
    will_attend: z.boolean(),
    teacher_affidavit: z.string().url("Invalid affidavit URL"),
  })
  .strict();

export async function POST(
  request: NextRequest,
  { params: { team_uuid } }: { params: { team_uuid: string } },
) {
  if (!process.env.DATABASE_API || !process.env.DATABASE_AUTH_KEY) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Internal Server Error, missing DATABASE_API and DATABASE_AUTH_KEY",
      },
      { status: 500 },
    );
  }

  const jwt = request.nextUrl.searchParams.get("auth");
  const requestBody = await request.json();

  if (!jwt)
    return NextResponse.json(
      {
        success: false,
        message: "JWT is missing",
      },
      { status: 403 },
    );

  const decodedJWT = verifyToken(jwt);

  if (decodedJWT?.teamID !== team_uuid)
    return NextResponse.json(
      {
        success: false,
        message: "JWT and team_uuid mismatch",
      },
      { status: 403 },
    );

  const databaseResponse = await databasePost("/etc/get/team", {
    _id: team_uuid,
    ignore_encryption: {
      _id: true,
    },
  });

  const teamData = await databaseResponse.json();
  const requestedID = decodedJWT.userID;
  let returnedData;

  switch (decodedJWT.role) {
    case "member": {
      const memberIDArray = teamData.data[0].members_id;
      let isMatch = false;
      for (const id of memberIDArray) {
        if (id === requestedID) {
          isMatch = true;
          break;
        }
      }

      if (!isMatch)
        return NextResponse.json(
          {
            success: false,
            message: "ID does not match any member",
          },
          { status: 400 },
        );

      const checkResponse = await databasePost("/etc/get/member", {
        _id: requestedID,
        ignore_encryption: {
          _id: true,
        },
      });

      const checkResponseData = await checkResponse.json();

      // The actual update / create member data in database part
      const validationResult = memberSchema.safeParse(requestBody);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map((err) => ({
          field: err.path.join("、"),
          message: err.message,
        }));

        return NextResponse.json(
          {
            success: false,
            message: errorMessages,
          },
          { status: 400 },
        );
      }

      const memberData: Member = {
        _id: requestedID,
        ...validationResult.data,
        is_leader: false,
        email_verified:
          checkResponseData.data.email === validationResult.data.email,
        team_id: team_uuid,

        ignore_encryption: memberIgnoreEncryption,
      };

      // Send verification email if email updated
      if (checkResponseData.data.email === validationResult.data.email) {
        const url = generateEmailVerificationToken({
          teamID: memberData.team_id,
          userID: memberData._id,
          role: "member",
        });
        const emailSuccess = await sendVerificationEmail(
          memberData.email,
          url,
          memberData.name_zh,
        );
        if (!emailSuccess)
          return NextResponse.json(
            {
              success: false,
              message: "發送驗證信件至此信箱時發生問題",
            },
            { status: 500 },
          );
      }

      const databaseResponse = await databasePost(
        `/etc/${checkResponseData.data ? "edit" : "create"}/member`,
        memberData,
      );

      if (!databaseResponse.ok)
        return NextResponse.json(
          {
            success: false,
            message: (await databaseResponse.json()).errorData,
          },
          { status: 500 },
        );

      returnedData = memberData;
      break;
    }

    case "leader": {
      const roleID = teamData.data[0].leader_id;

      if (requestedID != roleID)
        return NextResponse.json(
          {
            success: false,
            message: "ID does not match team leader",
          },
          { status: 400 },
        );

      const checkResponse = await databasePost("/etc/get/member", {
        _id: roleID,
        ignore_encryption: {
          _id: true,
        },
      });

      const checkResponseData = await checkResponse.json();

      // check if other members have already completed verification
      if (!checkResponseData.data) {
        const allEmailVerifiedResponse = await fetch(
          `${process.env.BASE_URL}/api/apply/team/${team_uuid}?auth=${jwt}`,
        );
        const allEmailVerifiedResponseData =
          await allEmailVerifiedResponse.json();

        if (!allEmailVerifiedResponseData.data[0].all_email_verified)
          return NextResponse.json({
            success: false,
            message: "非團隊領導人以外的成員與老師都必須先完成信箱驗證",
          });
      }

      // The actual update / create member data in database part
      const validationResult = memberSchema.safeParse(requestBody);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map((err) => ({
          field: err.path.join("、"),
          message: err.message,
        }));

        return NextResponse.json(
          {
            success: false,
            message: errorMessages,
          },
          { status: 400 },
        );
      }

      const leaderData: Member = {
        _id: requestedID,
        ...validationResult.data,
        is_leader: true,
        email_verified:
          checkResponseData.data.email === validationResult.data.email,
        team_id: team_uuid,

        ignore_encryption: memberIgnoreEncryption,
      };

      if (checkResponseData.data.email === validationResult.data.email) {
        const url = generateEmailVerificationToken({
          teamID: leaderData.team_id,
          userID: leaderData._id,
          role: "leader",
        });
        const emailSuccess = await sendVerificationEmail(
          leaderData.email,
          url,
          leaderData.name_zh,
        );
        if (!emailSuccess)
          return NextResponse.json(
            {
              success: false,
              message: "發送驗證信件至此信箱時發生問題",
            },
            { status: 500 },
          );
      }

      const databaseResponse = await databasePost(
        `/etc/${checkResponseData.data ? "edit" : "create"}/member`,
        leaderData,
      );

      if (!databaseResponse.ok)
        return NextResponse.json(
          {
            success: false,
            message: (await databaseResponse.json()).errorData,
          },
          { status: 500 },
        );

      returnedData = leaderData;
      break;
    }

    case "teacher": {
      const roleID = teamData.data[0].teacher_id;

      if (requestedID != roleID)
        return NextResponse.json(
          {
            success: false,
            message: "ID does not match team leader",
          },
          { status: 400 },
        );

      const checkResponse = await databasePost("/etc/get/teacher", {
        _id: roleID,
        ignore_encryption: {
          _id: true,
        },
      });

      const checkResponseData = await checkResponse.json();

      // The actual update / create member data in database part
      const validationResult = teacherSchema.safeParse(requestBody);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map((err) => ({
          field: err.path.join("、"),
          message: err.message,
        }));

        return NextResponse.json(
          {
            success: false,
            message: errorMessages,
          },
          { status: 400 },
        );
      }

      const teacherData: Teacher = {
        _id: requestedID,
        ...validationResult.data,
        email_verified:
          checkResponseData.data.email === validationResult.data.email,
        team_id: team_uuid,

        ignore_encryption: teacherIgnoreEncryption,
      };

      if (checkResponseData.data.email === validationResult.data.email) {
        const url = generateEmailVerificationToken({
          teamID: teacherData.team_id,
          userID: teacherData._id,
          role: "member",
        });
        const emailSuccess = await sendVerificationEmail(
          teacherData.email,
          url,
          teacherData.name_zh,
        );
        if (!emailSuccess)
          return NextResponse.json(
            {
              success: false,
              message: "發送驗證信件至此信箱時發生問題",
            },
            { status: 500 },
          );
      }

      const databaseResponse = await databasePost(
        `/etc/${checkResponseData.data ? "edit" : "create"}/member`,
        teacherData,
      );

      if (!databaseResponse.ok)
        return NextResponse.json(
          {
            success: false,
            message: (await databaseResponse.json()).errorData,
          },
          { status: 500 },
        );

      returnedData = teacherData;
      break;
    }

    default:
      return NextResponse.json({
        error: true,
        message: "Unknown role",
      });
  }

  return NextResponse.json(
    {
      success: true,
      message: `${decodedJWT.role[0].toUpperCase() + decodedJWT.role.slice(1)} created successfully`,
      data: returnedData,
    },
    { status: 200 },
  );
}
