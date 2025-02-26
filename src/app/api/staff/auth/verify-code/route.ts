import { deleteOTP, getOTP, saveSessionToken } from "@/lib/redis";
import { staffVerifySchema } from "@/models/staff";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    // Verify required environment variables
    if (
      !process.env.DATABASE_API ||
      !process.env.DATABASE_AUTH_KEY ||
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
          message: "驗證碼錯誤",
        },
        {
          status: 401,
        },
      );
    }

    // Delete redis entry
    await deleteOTP(email);

    // Generate session access token and set as cookie
    const token = await saveSessionToken(email);
    const response = NextResponse.json(
      {
        message: "Successfully verified",
        token,
      },
      {
        status: 200,
      },
    );

    response.cookies.set({
      name: "session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure in prod
      path: "/",
      maxAge: 12 * 60 * 60,
    });

    return response;
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
