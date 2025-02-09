// app/api/teams/complete/route.ts
import { TokenPayload, verifyToken } from "@/lib/jwt";
import { TeamAffidavitSchema, teamDatabaseSchemaType } from "@/models/team";
import { databasePost } from "@/utils/databaseAPI";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sendApplyCompleteEmail } from "@/lib/email";

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

    // Check verification status for all members
    let allEmailVerified = true;

    // Check members verification
    const membersID = teamData.data[0].members_id;
    for (const memberID of membersID) {
      const memberPayload = {
        _id: memberID,
        ignore_encryption: {
          _id: true,
          email_verified: true,
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
        break;
      }
    }

    // Check teacher verification if members are verified
    if (allEmailVerified) {
      const teacherPayload = {
        _id: teamData.data[0].teacher_id,
        ignore_encryption: {
          _id: true,
          email_verified: true,
        },
      };

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
      if (!teacher.data || !teacher.data[0].email_verified) {
        allEmailVerified = false;
      }
    }

    // If not all verified, return error
    if (!allEmailVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "所有成員（包含指導老師）都必須先完成信箱驗證",
        },
        {
          status: 400
        }
      );
    }

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
    const editedTeam: teamDatabaseSchemaType = {
      ...teamData.data[0],  // Include all existing team data
      status: "資料確認中",
      ...validationResult.data,  // Override with new affidavit data
    }

    // Send to database API
    const databaseResponse = await databasePost(`/etc/edit/team`, editedTeam);

    if (!databaseResponse.ok) {
      const errorData = await databaseResponse.json();
      throw new Error(errorData.message || "Database API request failed");
    }

    // After successful submission, send completion emails
    // Get all member data
    const memberEmails = [];
    for (const memberId of teamData.data[0].members_id) {
      const memberResponse = await databasePost("/etc/get/member", {
        _id: memberId,
        ignore_encryption: {
          _id: true,
          email: true,
          name_zh: true,
        },
      });
      if (memberResponse.ok) {
        const memberData = await memberResponse.json();
        if (memberData.data && memberData.data[0]) {
          memberEmails.push({
            name: memberData.data[0].name_zh,
            email: memberData.data[0].email,
          });
        }
      }
    }

    // Get leader data
    const leaderResponse = await databasePost("/etc/get/member", {
      _id: teamData.data[0].leader_id,
      ignore_encryption: {
        _id: true,
        email: true,
        name_zh: true,
      },
    });
    let leaderData;
    if (leaderResponse.ok) {
      const leaderResponseData = await leaderResponse.json();
      if (leaderResponseData.data && leaderResponseData.data[0]) {
        leaderData = {
          name: leaderResponseData.data[0].name_zh,
          email: leaderResponseData.data[0].email,
        };
        memberEmails.push(leaderData);
      }
    }

    // Get teacher data
    const teacherResponse = await databasePost("/etc/get/teacher", {
      _id: teamData.data[0].teacher_id,
      ignore_encryption: {
        _id: true,
        email: true,
        name_zh: true,
      },
    });
    let teacherData;
    if (teacherResponse.ok) {
      const teacherResponseData = await teacherResponse.json();
      if (teacherResponseData.data && teacherResponseData.data[0]) {
        teacherData = {
          name: teacherResponseData.data[0].name_zh,
          email: teacherResponseData.data[0].email,
        };
      }
    }

    // Send completion email to all team members
    if (leaderData && teacherData) {
      const editUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/apply/steps/${decodedJWT.teamID}/finish-page?auth=${jwt}`;
      
      // Send to all members (including leader)
      for (const member of memberEmails) {
        await sendApplyCompleteEmail(
          member.email,
          member.name,
          teamData.data[0].team_name,
          memberEmails,
          teacherData,
          editUrl
        );
      }

      // Send to teacher
      await sendApplyCompleteEmail(
        teacherData.email,
        teacherData.name,
        teamData.data[0].team_name,
        memberEmails,
        teacherData,
        editUrl
      );
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
