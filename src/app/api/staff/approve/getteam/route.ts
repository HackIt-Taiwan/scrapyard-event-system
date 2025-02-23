import { defaultIgnoreEncryption } from "@/models/common";
import { databasePost } from "@/utils/databaseAPI";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

    // Get complete team's data based on date
    const completedTeamResponse = await databasePost('/etc/getbydateandstatus/team', {})
    const completedTeamData = await completedTeamResponse.json()

    if (!completedTeamResponse.ok) {
      const errorData = await completedTeamResponse.json();
      throw new Error(errorData.message || "Database API request failed");
    }

    const completedTeam = completedTeamData.data.at(-1)

    return NextResponse.json(
      {
        message: completedTeam,
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

