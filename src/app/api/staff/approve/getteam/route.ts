import { defaultIgnoreEncryption } from "@/models/common";
import {
  memberDataReviewSchema,
  teacherDataReviewSchema,
  teamDataReviewSchema,
} from "@/models/staff";
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

    // Get complete team's data based on index
    const index = request.nextUrl.searchParams.get("index");

    if (!index) {
      return NextResponse.json(
        {
          message: "Parameters are missing.",
        },
        {
          status: 400,
        },
      );
    }

    const fullData = [];

    const completedTeamResponse = await databasePost(
      "/etc/getalldata/team",
      {},
    );
    const completedTeamData = await completedTeamResponse.json();

    if (!completedTeamResponse.ok) {
      const errorData = await completedTeamResponse.json();
      throw new Error(errorData.message || "Database API request failed");
    }

    if (!completedTeamData.data) {
      return NextResponse.json(
        {
          message: null,
        },
        { status: 200 },
      );
    }

    const completedTeam = completedTeamData.data.at(-parseInt(index));
    const teamStatus = completedTeam.status;
    const teamID = completedTeam._id;
    const leaderID = completedTeam.leader_id;
    const teacherID = completedTeam.teacher_id;
    const membersID = [];
    for (var i = 0; i < completedTeam.members_id.length; i++) {
      membersID.push(completedTeam.members_id[i]);
    }

    // Parse and save team data to fullData
    const parsedTeamData = teamDataReviewSchema.safeParse(completedTeam);

    if (!parsedTeamData.success) {
      const errorMessages = parsedTeamData.error.errors.map((err) => ({
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

    fullData.push(parsedTeamData.data);

    // Get and save leader dataa to fullData
    const leaderDataResponse = await databasePost("/etc/get/member", {
      _id: leaderID,
      ignore_encryption: defaultIgnoreEncryption,
    });
    const leaderData = await leaderDataResponse.json();

    if (!leaderDataResponse.ok) {
      const errorData = await leaderDataResponse.json();
      throw new Error(errorData.message || "Database API request failed");
    }

    const parsedLeaderData = memberDataReviewSchema.safeParse(
      leaderData.data[0],
    );

    if (!parsedLeaderData.success) {
      const errorMessages = parsedLeaderData.error.errors.map((err) => ({
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

    fullData.push(parsedLeaderData.data);

    // Get and save member data
    for (var i = 0; i < membersID.length; i++) {
      const memberDataResponse = await databasePost("/etc/get/member", {
        _id: membersID[i],
        ignore_encryption: defaultIgnoreEncryption,
      });
      const memberData = await memberDataResponse.json();

      if (!memberDataResponse.ok) {
        const errorData = await memberDataResponse.json();
        throw new Error(errorData.message || "Database API request failed");
      }

      const parsedMemberData = memberDataReviewSchema.safeParse(
        memberData.data[0],
      );

      if (!parsedMemberData.success) {
        const errorMessages = parsedMemberData.error.errors.map((err) => ({
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

      fullData.push(parsedMemberData.data);
    }

    // Get and save teacher data
    const teacherDataResponse = await databasePost("/etc/get/teacher", {
      _id: teacherID,
      ignore_encryption: defaultIgnoreEncryption,
    });
    const teacherData = await teacherDataResponse.json();

    if (!teacherDataResponse.ok) {
      const errorData = await teacherDataResponse.json();
      throw new Error(errorData.message || "Database API request failed");
    }

    // Check if teacher data exists before trying to parse it
    if (teacherData.data && teacherData.data.length > 0) {
      const parsedTeacherData = teacherDataReviewSchema.safeParse(
        teacherData.data[0],
      );

      if (!parsedTeacherData.success) {
        const errorMessages = parsedTeacherData.error.errors.map((err) => ({
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

      fullData.push(parsedTeacherData.data);
    }
    // If no teacher data, just continue without adding to fullData

    return NextResponse.json(
      {
        teamid: teamID,
        status: teamStatus,
        message: fullData,
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
