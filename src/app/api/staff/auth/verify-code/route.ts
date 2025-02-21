import { deleteOTP, getOTP } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const staffVerifySchema = z.object({
  email: z
    .string()
    .email()
    .regex(/^[^@]+@staff\.hackit\.tw$/, {
      message: "Email must be a valid staff.hackit.tw address",
    }),
  otp: z
    .string()
    .length(6, "OTP must be six-digit.")
    .regex(/^\d+$/, { message: "OTP must be valid." }),
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

    // Check if OTP is correct
    const { email, otp } = await request.json();
    staffVerifySchema.parse({ email, otp });

    const storedOTP = await getOTP(email);

    if (!storedOTP) {
      return NextResponse.json(
        {
          message: "Email doesn't have OTP assigned :/",
        },
        {
          status: 400,
        },
      );
    }

    if (storedOTP !== otp) {
      return NextResponse.json(
        {
          message: "Incorrect OTP.",
        },
        {
          status: 400,
        },
      );
    }

    // Delete redis entry
    await deleteOTP(email);

    // TODO: token generated
    return NextResponse.json(
      {
        message: "tokenhere but it works rn",
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
