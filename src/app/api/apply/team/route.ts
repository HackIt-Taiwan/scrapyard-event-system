// app/api/teams/route.ts
import { NextResponse } from "next/server";
import { TeamSchema, teamDatabaseSchemaType } from "@/models/team";
import { randomUUID } from "crypto";
import { z } from "zod";
import { generateToken, TokenPayload, verifyToken } from "@/lib/jwt";
import { defaultIgnoreEncryption } from "@/models/common";
import { databasePost } from "@/utils/databaseAPI";

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

    const teamID = randomUUID()
    const teacherID = randomUUID()
    const leaderID = randomUUID()

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

      ignore_encryption: defaultIgnoreEncryption
    };

    const teamName = {
      team_name: newTeam.team_name,
      ignore_encryption: defaultIgnoreEncryption,
    };

    // Check if the team_name has already been used
    const teamNameCheckResponse = await databasePost(
      `${process.env.DATABASE_API}/etc/get/team`,
      teamName,
    );

    const teamNameCheckData = await teamNameCheckResponse.json();

    if (!teamNameCheckResponse.ok) {
      throw new Error(
        teamNameCheckData.message || "Database API request failed",
      );
    }

    if (teamNameCheckData.data) {
      return NextResponse.json(
        {
          message: "Team name has been used already",
        },
        {
          status: 400,
        },
      );
    }

    // Send to database API
    const databaseResponse = await databasePost(
      `${process.env.DATABASE_API}/etc/create/team`,
      newTeam,
    );

    if (!databaseResponse.ok) {
      const errorData = await databaseResponse.json();

      throw new Error(errorData.message || "Database API request failed");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Team created successfully",
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

export async function GET(request: Request ) {
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
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };


    if (!jwt || !decodedJWT)
      return NextResponse.json(
        {
          success: false,
          message: "JWT is missing or incorrect",
        },
        { status: 403 },
      );


    // Acquiring team members/teacher's email verification status
    const teamPayload = {
      _id: decodedJWT.teamID,
      ignore_encryption: {
        _id: true,
      },
    };

    const teamResponse = await databasePost(
      `${process.env.DATABASE_API}/etc/get/team`,
      teamPayload
    );

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
    let membersStatus:any = {}

    const membersID = teamData.data[0].members_id;
    const teacherPayload = {
      _id: teamData.data[0].teacher_id,
      ignore_encryption: {
        _id: true
      }
    }

    for (const memberID of membersID) {
      let isVerified = true
      const memberPayload = {
        _id: memberID,
        ignore_encryption: {
          _id: true,
        },
      };

      const memberResponse = await databasePost(
        `${process.env.DATABASE_API}/etc/get/member`,
        memberPayload
      );

      if (!memberResponse.ok) {
        const errorData = await memberResponse.json();
        return NextResponse.json(
          {
            message: errorData.message || "Database API request failed",
          },
          {
            status: 500,
          }
        );
      }

      const memberData = await memberResponse.json()
      if (!memberData.data || !memberData.data[0].email_verified) {
        allEmailVerified = false
        isVerified = false
      }

      membersStatus[memberID] = isVerified
    }

    let isVerified = true
    const teacherResponse = await fetch(
      `${process.env.DATABASE_API}/etc/get/teacher`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(teacherPayload),
      }
    );

    if (!teacherResponse.ok) {
      const errorData = await teacherResponse.json();
      return NextResponse.json(
        {
          message: errorData.message || "Database API request failed",
        },
        {
          status: 500,
        }
      );
    }

    const teacher = await teacherResponse.json()
    if (!teacher.data || !teacher.data[0].email_verified) {
      allEmailVerified = false
      isVerified = false
    }
    membersStatus[teamData.data[0].teacher_id] = isVerified

    // Adding that to returned data
    teamData = teamData.data
    teamData[0].all_email_verified = allEmailVerified
    teamData[0].verified_status = membersStatus

    return NextResponse.json(
      {
        message: "Team acquired successfully",
        data: teamData,
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
