import { TokenPayload, verifyToken } from "@/lib/jwt";
import { teamDatabaseSchemaType } from "@/models/team";
import { databasePost } from "@/utils/databaseAPI";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    if (!process.env.DATABASE_API || !process.env.DATABASE_AUTH_KEY) {
      return NextResponse.json(
        {
          success: false,
          message: "Internal Server Error, missing DATABASE_API and DATABASE_AUTH_KEY",
        },
        { status: 500 },
      );
    }

    const teamPayload = {
      status: "資料確認中",
      ignore_encryption: {
        _id: true,
      },
    };

    const teamResponse = await databasePost(`/etc/get/team`, teamPayload);
    if (!teamResponse.ok) {
      const errorData = await teamResponse.json();
      return NextResponse.json(
        {
          message: errorData.message || "Database API request failed",
        },
        { status: 500 },
      );
    }

    const teamData = await teamResponse.json();
    if (!teamData.data) {
      return NextResponse.json(
        {
          message: "Team does not exist!",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: teamData.data,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Error while getting all team:", error);

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
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
} 