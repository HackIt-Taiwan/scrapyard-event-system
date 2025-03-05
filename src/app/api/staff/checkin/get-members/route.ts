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

    // Get all members data
    const membersResponse = await databasePost(
      "/etc/get/member",
      {
        ignore_encryption: defaultIgnoreEncryption,
      },
    );

    if (!membersResponse.ok) {
      throw new Error("Failed to fetch members data");
    }

    const membersData = await membersResponse.json();
    
    if (!membersData.data || !Array.isArray(membersData.data)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid members data format",
        },
        { status: 500 },
      );
    }

    // Get all teams data for organizing members by team
    const teamsResponse = await databasePost(
      "/etc/get/team",
      {
        ignore_encryption: defaultIgnoreEncryption,
      },
    );

    if (!teamsResponse.ok) {
      throw new Error("Failed to fetch teams data");
    }

    const teamsData = await teamsResponse.json();
    
    if (!teamsData.data || !Array.isArray(teamsData.data)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid teams data format",
        },
        { status: 500 },
      );
    }

    // Create a map of team IDs to team names for efficient lookup
    const teamMap = new Map();
    teamsData.data.forEach((team: any) => {
      teamMap.set(team._id, {
        team_name: team.team_name,
        team_size: team.team_size,
        status: team.status,
        _id: team._id
      });
    });

    // Organize members by team
    const teamsWithMembers: any[] = [];
    const membersByTeam = new Map<string, any[]>();

    // Group members by team_id
    membersData.data.forEach((member: any) => {
      const teamId = member.team_id;
      if (!membersByTeam.has(teamId)) {
        membersByTeam.set(teamId, []);
      }
      membersByTeam.get(teamId)!.push({
        _id: member._id,
        name_zh: member.name_zh,
        name_en: member.name_en,
        email: member.email,
        checked_in: member.checked_in || false,
        is_leader: member.is_leader || false,
        team_id: teamId
      });
    });

    // Create the final teams with members array
    membersByTeam.forEach((members, teamId) => {
      const team = teamMap.get(teamId);
      // Only include teams with status "已接受" (Accepted)
      if (team && team.status === "已接受") {
        teamsWithMembers.push({
          _id: teamId,
          team_name: team.team_name,
          team_size: team.team_size,
          status: team.status,
          members: members
        });
      }
    });

    // Sort teams by name
    teamsWithMembers.sort((a, b) => a.team_name.localeCompare(b.team_name));

    return NextResponse.json(
      {
        success: true,
        data: teamsWithMembers
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching members data:", error);

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