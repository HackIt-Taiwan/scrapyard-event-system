import { defaultIgnoreEncryption } from "@/models/common";
import { databasePost } from "@/utils/databaseAPI";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const memberId = params.id;

    if (!memberId) {
      return NextResponse.json(
        {
          success: false,
          message: "Member ID is required",
        },
        { status: 400 },
      );
    }

    // Get member data
    const memberPayload = {
      _id: memberId,
      ignore_encryption: defaultIgnoreEncryption,
    };

    const memberResponse = await databasePost(
      "/etc/get/member",
      memberPayload,
    );
    const memberData = await memberResponse.json();

    if (!memberResponse.ok) {
      throw new Error(
        memberData.message || "Database API request failed",
      );
    }

    if (!memberData.data || memberData.data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Member not found",
        },
        { status: 404 },
      );
    }

    // Get team info
    const teamId = memberData.data[0].team_id;
    const teamPayload = {
      _id: teamId,
      ignore_encryption: defaultIgnoreEncryption,
    };

    const teamResponse = await databasePost(
      "/etc/get/team",
      teamPayload,
    );
    const teamData = await teamResponse.json();
    
    let teamName = "Unknown Team";
    if (teamResponse.ok && teamData.data && teamData.data.length > 0) {
      teamName = teamData.data[0].team_name;
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...memberData.data[0],
          team_name: teamName,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while getting member data:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false,
          message: error.message 
        }, 
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
} 