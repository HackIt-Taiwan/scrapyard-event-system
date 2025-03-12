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

    // Get all teams data first
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

    // Filter for teams with status "已接受" (Accepted)
    const acceptedTeams = teamsData.data.filter((team: any) => team.status === "已接受");
    
    // Create a map to store team information
    const teamMap = new Map();
    acceptedTeams.forEach((team: any) => {
      teamMap.set(team._id, {
        team_name: team.team_name,
        team_size: team.team_size,
        status: team.status,
        _id: team._id,
        leader_id: team.leader_id,
        members_id: team.members_id
      });
    });

    // Array to store the final result
    const teamsWithMembers: any[] = [];

    // Process each accepted team
    for (const team of acceptedTeams) {
      const memberIds = [...team.members_id]; // Get member IDs from team model
      const leaderId = team.leader_id; // Get leader ID from team model
      
      // Collect all member IDs including leader
      const allMemberIds = [leaderId, ...memberIds];
      
      // Create a map to store member data we'll fetch
      const memberMap = new Map();
      
      // Fetch each member's data including the leader
      for (const memberId of allMemberIds) {
        const memberResponse = await databasePost(
          "/etc/get/member",
          {
            _id: memberId,
            ignore_encryption: defaultIgnoreEncryption,
          },
        );
        
        if (memberResponse.ok) {
          const memberData = await memberResponse.json();
          if (memberData.data && memberData.data.length > 0) {
            const member = memberData.data[0];
            memberMap.set(memberId, {
              _id: member._id,
              name_zh: member.name_zh,
              name_en: member.name_en,
              email: member.email,
              checked_in: member.checked_in || false,
              is_leader: memberId === leaderId, // Set is_leader based on ID match
              team_id: team._id
            });
          }
        }
      }
      
      // Convert member map to array
      const membersArray = Array.from(memberMap.values());
      
      // Add to final result
      teamsWithMembers.push({
        _id: team._id,
        team_name: team.team_name,
        team_size: team.team_size,
        status: team.status,
        members: membersArray
      });
    }

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