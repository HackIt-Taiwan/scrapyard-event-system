import { generateOTP, storeOTP } from "@/lib/redis";
import { staffDatabasePost } from "@/utils/databaseAPI";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const staffEmailSchema = z.object({
  email: z
    .string()
    .email()
    .regex(/^[^@]+@staff\.hackit\.tw$/, {
      message: "Email must be a valid staff.hackit.tw address",
    }),
});

export async function POST(request: NextRequest) {
  try {
    // Verify required environment variables
    if (
      !process.env.STAFF_DATABASE_API ||
      !process.env.STAFF_DATABASE_AUTH_KEY ||
      !process.env.REDIS_URI
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Internal Server Error, missing DATABASE_API and DATABASE_AUTH_KEY or REDIS_URI",
        },
        { status: 500 },
      );
    }

    // Parse and validate request body
    const { email } = await request.json();
    staffEmailSchema.parse({ email });

    // Check if email is in hackit database
    const emailPayload = {
      official_email: email,
    };
    const databaseResponse = await staffDatabasePost(
      "/staff/getstaffs",
      emailPayload,
    );

    if (!databaseResponse.ok) {
      const errorData = await databaseResponse.json();
      throw new Error(errorData.message || "Database API request failed");
    }

    const staffData = await databaseResponse.json();

    if (!staffData || staffData.data === null) {
      return NextResponse.json(
        {
          message: "Invalid email",
        },
        {
          status: 400,
        },
      );
    }

    // Generate OTP and save to redit & send to email
    const OTP = generateOTP();
    await storeOTP(email, OTP);

    // WARN: for debugging, remove this and uncomment send email
    console.log(OTP)

    //sendStaffOTPEmail(email, OTP);

    return NextResponse.json(
      {
        message: "Code sent successfully",
      },
      {
        status: 200,
      },
    );
  } catch (error: unknown) {
    console.error("Error while logging in", error);

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

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
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
