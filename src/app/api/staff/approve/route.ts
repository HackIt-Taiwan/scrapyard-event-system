import { defaultIgnoreEncryption } from "@/models/common";
import { reviewSchema } from "@/models/staff";
import { databasePost } from "@/utils/databaseAPI";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    // Verify required environment variables
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

    // Parse and validate request body
    const requestBody = await request.json();
    const validationResult = reviewSchema.safeParse(requestBody);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return NextResponse.json(
        {
          success: false,
          message: errorMessages,
        },
        {
          status: 400,
        },
      );
    }

    // Check team status
    const teamStatusPayload = {
      _id: validationResult.data._id,
      ignore_encryption: defaultIgnoreEncryption,
    };
    const teamStatusCheckResponse = await databasePost(
      `/etc/get/team`,
      teamStatusPayload,
    );
    const teamStatusCheckData = await teamStatusCheckResponse.json();

    if (!teamStatusCheckResponse.ok) {
      throw new Error(
        teamStatusCheckData.message || "Database API request failed",
      );
    }

    if (teamStatusCheckData.data[0].status !== "資料確認中") {
      return NextResponse.json(
        {
          message: "Team has not finish filling data yet.",
        },
        {
          status: 400,
        },
      );
    }

    // Update team status
    const teamPayload = {
      _id: validationResult.data._id,
      status:
        validationResult.data.review === "approve" ? "待繳費" : "填寫資料中",
      ignore_encryption: defaultIgnoreEncryption,
    };

    const teamUpdateResponse = await databasePost(
      "/etc/edit/team",
      teamPayload,
    );

    if (!teamUpdateResponse.ok) {
      const errorData = await teamUpdateResponse.json();
      return NextResponse.json(
        {
          message: errorData.message || "Database API request failed",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Successfully reviewed",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while approving team data:", error);

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
