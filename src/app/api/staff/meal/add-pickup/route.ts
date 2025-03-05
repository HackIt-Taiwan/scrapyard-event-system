import { defaultIgnoreEncryption } from "@/models/common";
import { databasePost } from "@/utils/databaseAPI";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema for meal pickup request
const mealPickupSchema = z.object({
  member_id: z.string(),
  meal_type: z.string(), // Accept any string for meal type (早餐, 午餐, 晚餐, 点心)
  meal_day: z.string(), // Accept any string for meal day (Day 1, Day 2, Day 3)
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Verify required environment variables
    if (!process.env.DATABASE_API || !process.env.DATABASE_AUTH_KEY) {
      return NextResponse.json(
        {
          success: false,
          message: "Internal Server Error, missing DATABASE_API and DATABASE_AUTH_KEY",
        },
        { status: 500 },
      );
    }

    // Parse and validate request body
    const requestBody = await request.json();
    const validationResult = mealPickupSchema.safeParse(requestBody);

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

    // Check if member exists
    const memberPayload = {
      _id: validationResult.data.member_id,
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
        {
          status: 404,
        },
      );
    }

    // Get the member's name for the response
    const memberName = memberData.data[0].name_zh || "Unknown Member";
    const teamId = memberData.data[0].team_id;
    const studentId = memberData.data[0].student_id || null;
    const isLeader = memberData.data[0].is_leader || false;

    // Get team info for the response
    const teamPayload = {
      _id: teamId,
      ignore_encryption: defaultIgnoreEncryption,
    };

    const teamResponse = await databasePost("/etc/get/team", teamPayload);
    const teamData = await teamResponse.json();
    const teamName = teamResponse.ok && teamData.data && teamData.data.length > 0
      ? teamData.data[0].team_name
      : "Unknown Team";

    // Check if the member has meal_pickups field
    // If not, we'll need to add it with an initial empty array
    if (!memberData.data[0].meal_pickups) {
      const updateMemberPayload = {
        _id: validationResult.data.member_id,
        meal_pickups: [],
        ignore_encryption: defaultIgnoreEncryption,
      };

      const updateMemberResponse = await databasePost(
        "/etc/edit/member", 
        updateMemberPayload
      );

      if (!updateMemberResponse.ok) {
        const errorData = await updateMemberResponse.json();
        throw new Error(errorData.message || "Failed to initialize meal pickups");
      }
    }

    // Get existing meal pickups
    const existingPickups = memberData.data[0].meal_pickups || [];
    
    // Check if this meal has already been picked up
    const mealAlreadyPickedUp = existingPickups.some(
      (pickup: any) => 
        pickup.meal_type === validationResult.data.meal_type && 
        pickup.meal_day === validationResult.data.meal_day
    );

    if (mealAlreadyPickedUp) {
      return NextResponse.json(
        {
          success: false,
          message: "This meal has already been picked up",
          data: {
            member_id: validationResult.data.member_id,
            member_name: memberName,
            team_id: teamId,
            team_name: teamName,
            meal_type: validationResult.data.meal_type,
            meal_day: validationResult.data.meal_day,
            already_picked_up: true,
            student_id: studentId,
            is_leader: isLeader
          },
        },
        { status: 409 }, // Conflict
      );
    }

    // Create the pickup record
    const newPickup = {
      meal_type: validationResult.data.meal_type,
      meal_day: validationResult.data.meal_day,
      pickup_time: new Date().toISOString(),
      notes: validationResult.data.notes || "",
    };

    // Add the pickup record to the member
    const updatePayload = {
      _id: validationResult.data.member_id,
      meal_pickups: [...existingPickups, newPickup],
      ignore_encryption: defaultIgnoreEncryption,
    };

    const updateResponse = await databasePost("/etc/edit/member", updatePayload);

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(errorData.message || "Failed to record meal pickup");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Meal pickup recorded successfully",
        data: {
          member_id: validationResult.data.member_id,
          member_name: memberName,
          team_id: teamId,
          team_name: teamName,
          pickup: newPickup,
          student_id: studentId,
          is_leader: isLeader
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error recording meal pickup:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 },
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