import { verifySessionToken } from "@/lib/redis";
import { tokenSchema } from "@/models/staff";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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
    const { token } = await request.json();
    tokenSchema.parse({ token });

    const decryptData = await verifySessionToken(token || "placeholder");

    if (!token || !decryptData) {
      return NextResponse.json(
        {
          message: "Invalid token",
        },
        {
          status: 401,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Successfully verified",
        email: decryptData,
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
