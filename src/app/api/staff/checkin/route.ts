import { defaultIgnoreEncryption } from "@/models/common";
import { checkInSchema } from "@/models/staff";
import { databasePost } from "@/utils/databaseAPI";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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
    const validationResult = checkInSchema.safeParse(requestBody);

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

    // Check member exists
    const memberStatusPayload = {
      _id: validationResult.data.member_id,
      ignore_encryption: defaultIgnoreEncryption,
    };
    const memberStatusCheckResponse = await databasePost(
      `/etc/get/member`,
      memberStatusPayload,
    );
    const memberStatusCheckData = await memberStatusCheckResponse.json();

    if (!memberStatusCheckResponse.ok) {
      throw new Error(
        memberStatusCheckData.message || "Database API request failed",
      );
    }

    if (!memberStatusCheckData.data || memberStatusCheckData.data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Member not found",
        },
        {
          status: 404,
        },
      );
    }

    // Update member check-in status
    const memberPayload = {
      _id: validationResult.data.member_id,
      checked_in: validationResult.data.checked_in,
      ignore_encryption: defaultIgnoreEncryption,
    };

    const memberUpdateResponse = await databasePost(
      "/etc/edit/member",
      memberPayload,
    );

    if (!memberUpdateResponse.ok) {
      const errorData = await memberUpdateResponse.json();
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || "Database API request failed",
        },
        {
          status: 500,
        },
      );
    }

    // Get team info for the response
    const teamId = memberStatusCheckData.data[0].team_id;
    const teamInfoPayload = {
      _id: teamId,
      ignore_encryption: defaultIgnoreEncryption,
    };
    
    const teamInfoResponse = await databasePost(
      "/etc/get/team",
      teamInfoPayload,
    );
    
    const teamInfoData = await teamInfoResponse.json();
    let teamName = "Unknown Team";
    
    if (teamInfoResponse.ok && teamInfoData.data && teamInfoData.data.length > 0) {
      teamName = teamInfoData.data[0].team_name;
    }

    // Get the student ID information from the member data
    const memberData = memberStatusCheckData.data[0];
    const studentId = memberData.student_id || null;

    return NextResponse.json(
      {
        success: true,
        message: "Successfully updated check-in status",
        data: {
          member_id: validationResult.data.member_id,
          team_id: teamId,
          team_name: teamName,
          member_name: memberData.name_zh || "Unknown Member",
          student_id: studentId,
          is_leader: memberData.is_leader || false
        }
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while updating check-in status:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
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
          success: false,
          message: "Validation failed",
          errors: errorMessages,
        },
        {
          status: 400,
        },
      );
    }

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
      {
        status: 500,
      },
    );
  }
} 