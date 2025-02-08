// app/api/teams/complete/route.ts
import { TokenPayload, verifyToken } from "@/lib/jwt";
import { TeamAffidavitSchema, teamDatabaseSchemaType } from "@/models/team";
import { databasePost } from "@/utils/databaseAPI";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
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

    const url = new URL(request.url); // Create a URL object from the request
    const jwt = url.searchParams.get("auth") || "";
    const decodedJWT: TokenPayload | null = verifyToken(jwt);

    if (!jwt || !decodedJWT || decodedJWT.role != "leader")
      return NextResponse.json(
        {
          success: false,
          message: "JWT is missing or incorrect",
        },
        { status: 403 },
      );

    const teamPayload = {
      _id: decodedJWT.teamID,
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
        {
          status: 500,
        },
      );
    }

    let teamData = await teamResponse.json();

    if (!teamData.data) {
      return NextResponse.json(
        {
          message: "Team does not exist!",
        },
        {
          status: 400,
        },
      );
    }

    // Checking if all members have already completed verification
    if (!teamData.data[0].all_email_verified)
      return NextResponse.json(
      {
        success: false,
        message: "所有成員與老師都必須先完成信箱驗證才能註冊隊伍",
      },
      {
        status: 400
      }
    );

    // Parse and validate request body
    const requestBody = await request.json();
    const validationResult = TeamAffidavitSchema.safeParse(requestBody);

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

    // WARN: not sure if this works
    teamData.data[0].status = "資料確認中"
    const editedTeam: teamDatabaseSchemaType = {
      ...teamData,
      ...validationResult.data
    }

    // Send to database API
    const databaseResponse = await databasePost(`/etc/edit/team`, editedTeam);

    if (!databaseResponse.ok) {
      const errorData = await databaseResponse.json();

      throw new Error(errorData.message || "Database API request failed");
    }

    return NextResponse.json(
      {
        success: true,
        data: editedTeam,
      },
      {
        status: 200,
      },
    );
  } catch (error: unknown) {
    console.error("Error while uploading affidavit:", error);

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
