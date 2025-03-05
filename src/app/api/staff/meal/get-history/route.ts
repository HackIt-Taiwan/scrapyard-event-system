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

    // Get member ID from query parameters
    const memberId = request.nextUrl.searchParams.get("memberId");

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

    const memberResponse = await databasePost("/etc/get/member", memberPayload);
    const memberData = await memberResponse.json();

    if (!memberResponse.ok) {
      throw new Error(memberData.message || "Database API request failed");
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

    // Get the member's name and team ID
    const member = memberData.data[0];
    const memberName = member.name_zh || "Unknown Member";
    const teamId = member.team_id;
    const studentId = member.student_id || null;
    const isLeader = member.is_leader || false;

    // Get team info
    const teamPayload = {
      _id: teamId,
      ignore_encryption: defaultIgnoreEncryption,
    };

    const teamResponse = await databasePost("/etc/get/team", teamPayload);
    const teamData = await teamResponse.json();
    const teamName = teamResponse.ok && teamData.data && teamData.data.length > 0
      ? teamData.data[0].team_name
      : "Unknown Team";

    // Get meal pickup history
    const mealPickups = member.meal_pickups || [];

    // Sort meal pickups by pickup time (newest first)
    mealPickups.sort((a: any, b: any) => {
      return new Date(b.pickup_time).getTime() - new Date(a.pickup_time).getTime();
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          member_id: memberId,
          member_name: memberName,
          team_id: teamId,
          team_name: teamName,
          meal_pickups: mealPickups,
          student_id: studentId,
          is_leader: isLeader
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching meal pickup history:", error);

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