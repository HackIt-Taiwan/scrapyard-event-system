import taiwanIdValidator from "taiwan-id-validator";
import { NextResponse } from "next/server";
import {
  defaultIgnoreEncryption as memberIgnoreEncryption,
  Member,
} from "@/models/member";
import {
  defaultIgnoreEncryption as teacherIgnoreEncryption,
  Teacher,
} from "@/models/teacher";
import { z } from "zod";
import { TokenPayload, verifyToken } from "@/lib/jwt";

// Define Zod schema for request validation
const StudentIDSchema = z.object({
  card_front: z.string().url("Invalid card front URL"), // assuming S3 URLs
  card_back: z.string().url("Invalid card back URL"),
});

const MemberSchema = z
  .object({
    // Personal Information
    name_en: z.string().max(36, "English name's length exceeded"),
    name_zh: z.string().max(6, "Chinese name's length exceeded"),
    grade: z.enum(["高中一年級", "高中二年級", "高中三年級"]),
    school: z.string().max(30, "School's name's length exceeded").trim(),
    birth_date: z.preprocess((val) => {
      if (typeof val === "string" || val instanceof Date) {
        return new Date(val);
      }
    }, z.date()),
    national_id: z
      .string()
      .refine(
        (id) => taiwanIdValidator.isNationalIdentificationNumberValid(id),
        { message: "Invalid Taiwan national ID" }
      ),
    student_id: StudentIDSchema,
    address: z.string(),
    shirt_size: z.enum(["S", "M", "L", "XL"]),

    // Contact Information
    telephone: z
      .string()
      .max(10, "Phone number's length exceeded")
      .min(7, "Phone number's length is too short")
      .trim(),
    email: z.string().email({ message: "Incorrect email format" }).trim(),

    // Special Needs & Additional Information
    special_needs: z.string().optional(),
    diet: z.string().optional(),
    personal_affidavit: z.string().url("Invalid affidavit URL"),

    // Emergency Contact Information
    emergency_contact_name: z
      .string()
      .max(36, "Name's length exceeded")
      .trim(),
    emergency_contact_phone: z
      .string()
      .max(10, "Emergency contact phone number's length exceeded")
      .min(7, "Emergency contact phone number's length is too short")
      .trim(),
    emergency_contact_national_id: z
      .string()
      .refine(
        (id) => taiwanIdValidator.isNationalIdentificationNumberValid(id),
        { message: "Invalid Taiwan national ID" }
      ),
  })
  .strict();

const TeacherSchema = z
  .object({
    name: z.string().max(36, "Name's length exceeded").trim(),
    school: z.string().max(30, "School's name's length exceeded").trim(),
    phone_number: z
      .string()
      .max(10, "Phone number's length exceeded")
      .min(7, "Phone number's length is too short")
      .trim(),
    email: z.string().email({ message: "Incorrect email format" }).trim(),
    special_needs: z.string().optional(),
    diet: z.string().optional(),
    national_id: z
      .string()
      .refine(
        (id) => taiwanIdValidator.isNationalIdentificationNumberValid(id),
        { message: "Invalid Taiwan national ID" },
      ),
    birth_date: z.preprocess((val) => {
      if (typeof val === "string" || val instanceof Date) {
        return new Date(val);
      }
    }, z.date()),
    address: z.string(),
    will_attend: z.boolean(),
    teacher_affidavit: z.string().url("Invalid affidavit URL"),
    shirt_size: z.enum(["S", "M", "L", "XL"]),
  })
  .strict();

export async function POST(
  request: Request,
  { params }: { params: { team_uuid: string } },
) {
  try {
    // Verify required environment variables
    if (!process.env.DATABASE_API || !process.env.DATABASE_AUTH_KEY) {
      const error = new Error("Missing required environment variables");
      (error as any).status = 500;
      throw error;
    }

    const { team_uuid } = await params;

    const url = new URL(request.url); // Create a URL object from the request
    const jwt = url.searchParams.get("auth") || "";

    const requestBody = await request.json();

    const decodedJWT: TokenPayload | null = verifyToken(jwt);

    const teamPayload = {
      _id: team_uuid,
      ignore_encryption: {
        _id: true,
      },
    };

    // Include Authorization header only if conditions are met
    if (jwt === "" || !decodedJWT || decodedJWT.teamID != team_uuid) {
      const error = new Error("Authorization Failed");
      (error as any).status = 401;
      throw error;
    }

    const databaseResponse = await fetch(
      `${process.env.DATABASE_API}/etc/get/team`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.DATABASE_AUTH_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teamPayload),
      },
    );

    const teamData = await databaseResponse.json();
    const requestedID = decodedJWT.userID;
    let databaseURL = "";
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
        if (!isMatch) {
          const error = new Error("Authorization Failed");
          (error as any).status = 401;
          throw error;
        }

        const payload = {
          _id: requestedID,
          ignore_encryption: {
            _id: true,
          },
        };

        const checkResponse = await fetch(
          `${process.env.DATABASE_API}/etc/get/member`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.DATABASE_AUTH_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );
        const checkResponseData = await checkResponse.json();

        databaseURL = checkResponseData.data
          ? `${process.env.DATABASE_API}/etc/edit/member`
          : `${process.env.DATABASE_API}/etc/create/member`;

        // The actual upload part
        const validationResult = MemberSchema.safeParse(requestBody);
        if (!validationResult.success) {
          const errorMessages = validationResult.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }));

          return NextResponse.json(
            {
              message: "Validation failed",
              errors: errorMessages,
            },
            {
              status: 400,
            },
          );
        }

        const validatedData = validationResult.data;
        const memberData: Member = {
          _id: requestedID,
          is_leader: false,
          name: validatedData.name,
          grade: validatedData.grade,
          school: validatedData.school,
          phone_number: validatedData.phone_number,
          email: validatedData.email,
          email_verified: false,
          team_id: team_uuid,
          diet: validatedData.diet,
          special_needs: validatedData.special_needs,
          national_id: validatedData.national_id,
          student_id: validatedData.student_id,
          birth_date: validatedData.birth_date,
          address: validatedData.address,
          personal_affidavit: validatedData.personal_affidavit,
          shirt_size: validatedData.shirt_size,

          emergency_contact_name: validatedData.emergency_contact_name,
          emergency_contact_phone: validatedData.emergency_contact_phone,
          emergency_contact_national_id:
            validatedData.emergency_contact_national_id,

          ignore_encryption: memberIgnoreEncryption,
        };

        const databaseResponse = await fetch(databaseURL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.DATABASE_AUTH_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(memberData),
        });

        if (!databaseResponse.ok) {
          const errorData = await databaseResponse.json();

          const error = new Error("Datbase API requested failed");
          (error as any).status = 401;
          (error as any).message = errorData;
          throw error;
        }

        returnedData = memberData;
        break;
      }

      case "leader": {
        const roleID = teamData.data[0].leader_id;

        if (requestedID != roleID) {
          const error = new Error("Authorization Failed");
          (error as any).status = 401;
          throw error;
        }

        const payload = {
          _id: roleID,
          ignore_encryption: {
            _id: true,
          },
        };

        const checkResponse = await fetch(
          `${process.env.DATABASE_API}/etc/get/member`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.DATABASE_AUTH_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );
        const checkResponseData = await checkResponse.json();

        databaseURL = checkResponseData.data
          ? `${process.env.DATABASE_API}/etc/edit/member`
          : `${process.env.DATABASE_API}/etc/create/member`;

        // The actual upload part
        const validationResult = MemberSchema.safeParse(requestBody);
        if (!validationResult.success) {
          const errorMessages = validationResult.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }));

          return NextResponse.json(
            {
              message: "Validation failed",
              errors: errorMessages,
            },
            {
              status: 400,
            },
          );
        }

        const validatedData = validationResult.data;
        const leaderData: Member = {
          _id: requestedID,
          is_leader: true,
          name: validatedData.name,
          grade: validatedData.grade,
          school: validatedData.school,
          phone_number: validatedData.phone_number,
          email: validatedData.email,
          email_verified: false,
          team_id: team_uuid,
          diet: validatedData.diet,
          special_needs: validatedData.special_needs,
          national_id: validatedData.national_id,
          student_id: validatedData.student_id,
          birth_date: validatedData.birth_date,
          address: validatedData.address,
          personal_affidavit: validatedData.personal_affidavit,
          shirt_size: validatedData.shirt_size,

          emergency_contact_name: validatedData.emergency_contact_name,
          emergency_contact_phone: validatedData.emergency_contact_phone,
          emergency_contact_national_id:
            validatedData.emergency_contact_national_id,

          ignore_encryption: memberIgnoreEncryption,
        };

        const databaseResponse = await fetch(databaseURL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.DATABASE_AUTH_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(leaderData),
        });

        if (!databaseResponse.ok) {
          const errorData = await databaseResponse.json();

          const error = new Error("Datbase API requested failed");
          (error as any).status = 401;
          (error as any).message = errorData;
          throw error;
        }

        returnedData = leaderData;
        break;
      }

      case "teacher": {
        const roleID = teamData.data[0].teacher_id;

        if (requestedID != roleID) {
          const error = new Error("Authorization Failed");
          (error as any).status = 401;
          throw error;
        }

        const payload = {
          _id: roleID,
          ignore_encryption: {
            _id: true,
          },
        };

        const checkResponse = await fetch(
          `${process.env.DATABASE_API}/etc/get/teacher`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.DATABASE_AUTH_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );
        const checkResponseData = await checkResponse.json();

        databaseURL = checkResponseData.data
          ? `${process.env.DATABASE_API}/etc/edit/teacher`
          : `${process.env.DATABASE_API}/etc/create/teacher`;

        // The actual upload part
        const validationResult = TeacherSchema.safeParse(requestBody);
        if (!validationResult.success) {
          const errorMessages = validationResult.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }));

          return NextResponse.json(
            {
              message: "Validation failed",
              errors: errorMessages,
            },
            {
              status: 400,
            },
          );
        }

        const validatedData = validationResult.data;
        const teacherData: Teacher = {
          _id: requestedID,
          name: validatedData.name,
          school: validatedData.school,
          phone_number: validatedData.phone_number,
          email: validatedData.email,
          email_verified: false,
          team_id: team_uuid,
          diet: validatedData.diet,
          special_needs: validatedData.special_needs,
          national_id: validatedData.national_id,
          birth_date: validatedData.birth_date,
          address: validatedData.address,
          will_attend: validatedData.will_attend,
          teacher_affidavit: validatedData.teacher_affidavit,

          ignore_encryption: teacherIgnoreEncryption,
        };

        const databaseResponse = await fetch(databaseURL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.DATABASE_AUTH_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(teacherData),
        });

        if (!databaseResponse.ok) {
          const errorData = await databaseResponse.json();

          const error = new Error("Database API requested failed");
          (error as any).status = 401;
          (error as any).message = errorData;
          throw error;
        }

        returnedData = teacherData;
        break;
      }

      default:
        const error = new Error("Incorrect role");
        (error as any).status = 401;
        throw error;
    }

    return NextResponse.json(
      {
        data: returnedData,
        message: `${decodedJWT.role[0].toUpperCase() + decodedJWT.role.slice(1)} created successfully`, // INFO: lol, why is it so complex.
      },
      {
        status: 400,
      },
    );
  } catch (error: unknown) {
    console.error("Error while creating a member:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          message: "Invalid JSON in request body",
        },
        {
          status: 400,
        },
      );
    }

    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return NextResponse.json(
        {
          message: "Validation failed",
          errors: errorMessages,
        },
        {
          status: 400,
        },
      );
    }

    if (error instanceof Error && (error as any).status) {
      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: (error as any).status,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}
