import { TokenPayload, verifyToken } from "@/lib/jwt";
import { teamDatabaseSchemaType } from "@/models/team";
import { databasePost } from "@/utils/databaseAPI";
import { NextResponse } from "next/server";
import { z } from "zod";

const UpdateTeamNameSchema = z.object({
  team_name: z
    .string()
    .min(1, "隊伍名稱為必要")
    .max(24, "隊伍名稱必須小於24個字")
    .trim(),
});

export async function POST(request: Request) {
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

    const url = new URL(request.url);
    const jwt = url.searchParams.get("auth") || "";
    const decodedJWT: TokenPayload | null = verifyToken(jwt);

    if (!jwt || !decodedJWT || decodedJWT.role !== "leader") {
      return NextResponse.json(
        {
          success: false,
          message: "只有隊長可以更改團隊名稱",
        },
        { status: 403 },
      );
    }

    // Get current team data
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

    // Parse and validate request body
    const requestBody = await request.json();
    const validationResult = UpdateTeamNameSchema.safeParse(requestBody);

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
        { status: 400 },
      );
    }

    // Check if the new team name is different from the current one
    if (validationResult.data.team_name === teamData.data[0].team_name) {
      return NextResponse.json(
        {
          success: false,
          message: "新的團隊名稱與目前的相同",
        },
        { status: 400 },
      );
    }

    // Check if the team_name has already been used by other teams
    const teamName = {
      team_name: validationResult.data.team_name,
      ignore_encryption: {
        _id: true,
      },
    };

    const teamNameCheckResponse = await databasePost(`/etc/get/team`, teamName);
    const teamNameCheckData = await teamNameCheckResponse.json();

    if (!teamNameCheckResponse.ok) {
      throw new Error(
        teamNameCheckData.message || "Database API request failed",
      );
    }

    if (teamNameCheckData.data) {
      // Check if the found team is not the current team
      const foundTeam = teamNameCheckData.data[0];
      if (foundTeam._id !== teamData.data[0]._id) {
        return NextResponse.json(
          {
            success: false,
            message: "團隊名稱已被使用！",
          },
          { status: 400 },
        );
      }
    }

    // Update team data
    const editedTeam: teamDatabaseSchemaType = {
      ...teamData.data[0],
      team_name: validationResult.data.team_name,
    };

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
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Error while updating team name:", error);

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