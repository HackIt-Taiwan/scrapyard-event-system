// app/api/teams/route.ts
import { generateToken, TokenPayload, verifyToken } from "@/lib/jwt";
import { defaultIgnoreEncryption } from "@/models/common";
import { teamDatabaseSchemaType, TeamSchema } from "@/models/team";
import { databasePost } from "@/utils/databaseAPI";
import { randomUUID } from "crypto";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

async function sendDiscordNotification(teamData: teamDatabaseSchemaType) {
  try {
    if (!process.env.DISCORD_WEBHOOK_URL) {
      console.error("Discord webhook URL not configured");
      return;
    }

    const embed = {
      title: "🎉 新團隊註冊",
      color: 0x00ff00, // Green color
      fields: [
        {
          name: "團隊名稱",
          value: teamData.team_name,
          inline: true
        },
        {
          name: "團隊人數",
          value: teamData.team_size.toString(),
          inline: true
        },
        {
          name: "狀態",
          value: teamData.status,
          inline: true
        },
        {
          name: "得知活動管道",
          value: teamData.learn_about_us,
          inline: false
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "Scrapyard Registration System"
      }
    };

    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        embeds: [embed]
      })
    });
  } catch (error) {
    console.error("Error sending Discord notification:", error);
  }
}

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
    const validationResult = TeamSchema.safeParse(requestBody);

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

    const teamID = randomUUID();
    const teacherID = randomUUID();
    const leaderID = randomUUID();

    const membersID: string[] = [];
    for (let i = 0; i < validationResult.data.team_size - 1; i++) {
      membersID.push(randomUUID());
    }

    const teamMembersLink: string[] = [];
    for (let i = 0; i < validationResult.data.team_size - 1; i++) {
      const payload: TokenPayload = {
        teamID: teamID,
        userID: membersID[i],
        role: "member",
      };
      teamMembersLink.push(generateToken(payload));
    }

    // Create validated team object
    const newTeam: teamDatabaseSchemaType = {
      _id: teamID,
      ...validationResult.data,
      status: "填寫資料中",
      leader_id: leaderID,
      teacher_id: teacherID,
      members_id: membersID,
      createdAt: new Date(),

      leader_link: generateToken(<TokenPayload>{
        teamID: teamID,
        userID: leaderID,
        role: "leader",
      }),
      teacher_link: generateToken(<TokenPayload>{
        teamID: teamID,
        userID: teacherID,
        role: "teacher",
      }),
      members_link: teamMembersLink,

      ignore_encryption: defaultIgnoreEncryption,
    };

    const teamName = {
      team_name: newTeam.team_name,
      ignore_encryption: defaultIgnoreEncryption,
    };

    // Check if the team_name has already been used
    const teamNameCheckResponse = await databasePost(`/etc/get/team`, teamName);
    const teamNameCheckData = await teamNameCheckResponse.json();

    if (!teamNameCheckResponse.ok) {
      throw new Error(
        teamNameCheckData.message || "Database API request failed",
      );
    }

    if (teamNameCheckData.data) {
      return NextResponse.json(
        {
          message: "團隊名稱已被使用！",
        },
        {
          status: 400,
        },
      );
    }

    // Send to database API
    const databaseResponse = await databasePost(`/etc/create/team`, newTeam);

    if (!databaseResponse.ok) {
      const errorData = await databaseResponse.json();
      throw new Error(errorData.message || "Database API request failed");
    }

    // Send Discord notification
    await sendDiscordNotification(newTeam);

    return NextResponse.json(
      {
        data: newTeam,
      },
      {
        status: 201,
      },
    );
  } catch (error: unknown) {
    console.error("Error while creating a team:", error);

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

export async function GET(request: NextRequest) {
  try {
    // Verify required environment variables
    if (!process.env.DATABASE_API || !process.env.DATABASE_AUTH_KEY) {
      return NextResponse.json(
        {
          message: "Missing required environment variables",
        },
        {
          status: 500,
        },
      );
    }

    const url = new URL(request.url); // Create a URL object from the request
    const jwt = url.searchParams.get("auth") || "";
    let allEmailVerified = true;

    const decodedJWT: TokenPayload | null = verifyToken(jwt);

    if (!jwt || !decodedJWT)
      return NextResponse.json(
        {
          success: false,
          message: "JWT is missing or incorrect",
        },
        { status: 403 },
      );

    if (decodedJWT.role != "leader") 
      return NextResponse.json(
        {
          success: false,
          message: "Only leader can check out this page",
        },
        { status: 403 },
      );

    // Acquiring team members/teacher's email verification status / get names
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

    let membersStatus: any = {};
    let memberName: any = {};

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

    const membersID = teamData.data[0].members_id;
    const teacherPayload = {
      _id: teamData.data[0].teacher_id,
      ignore_encryption: {
        _id: true,
      },
    };

    // Check members verification
    for (const memberID of membersID) {
      const memberPayload = {
        _id: memberID,
        ignore_encryption: {
          _id: true,
        },
      };

      const memberResponse = await databasePost(
        `/etc/get/member`,
        memberPayload,
      );

      if (!memberResponse.ok) {
        const errorData = await memberResponse.json();
        return NextResponse.json(
          {
            message: errorData.message || "Database API request failed",
          },
          {
            status: 500,
          },
        );
      }

      const memberData = await memberResponse.json();
      if (!memberData.data || !memberData.data[0].email_verified) {
        allEmailVerified = false;
      }
      if (memberData.data) {
        memberName[memberID] = memberData.data[0].name_zh;
        membersStatus[memberID] = memberData.data[0].email_verified || false;
      } else {
        membersStatus[memberID] = false;
      }
    }

    // Check teacher verification
    const teacherResponse = await databasePost(
      `/etc/get/teacher`,
      teacherPayload,
    );

    if (!teacherResponse.ok) {
      const errorData = await teacherResponse.json();
      return NextResponse.json(
        {
          message: errorData.message || "Database API request failed",
        },
        {
          status: 500,
        },
      );
    }

    const teacher = await teacherResponse.json();
    if (teacher.data) {
      memberName[teamData.data[0].teacher_id] = teacher.data[0].name_zh;
      membersStatus[teamData.data[0].teacher_id] = true;
    } else {
      membersStatus[teamData.data[0].teacher_id] = false;
    }

    // Check leader verification
    const leaderPayload = {
      _id: teamData.data[0].leader_id,
      ignore_encryption: {
        _id: true,
      },
    };

    const leaderResponse = await databasePost(
      `/etc/get/member`,
      leaderPayload,
    );

    if (!leaderResponse.ok) {
      const errorData = await leaderResponse.json();
      return NextResponse.json(
        {
          message: errorData.message || "Database API request failed",
        },
        {
          status: 500,
        },
      );
    }

    const leader = await leaderResponse.json();
    if (leader.data) {
      memberName[teamData.data[0].leader_id] = leader.data[0].name_zh;
      membersStatus[teamData.data[0].leader_id] = leader.data[0].email_verified || false;
    } else {
      membersStatus[teamData.data[0].leader_id] = false;
    }

    // Adding that to returned data
    teamData = teamData.data;
    teamData[0].all_email_verified = allEmailVerified;
    teamData[0].verified_status = membersStatus;
    teamData[0].member_name = memberName;

    return NextResponse.json(
      {
        message: "Team acquired successfully",
        data: teamData[0],
      },
      {
        status: 200,
      },
    );
  } catch (error: unknown) {
    console.error("Error while acquiring team", error);

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
      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: 500,
        },
      );
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
