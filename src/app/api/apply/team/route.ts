// app/api/teams/route.ts
import { NextResponse } from "next/server";
import { defaultIgnoreEncryption, Team } from "@/models/team";
import { randomUUID } from 'crypto';
import { z } from "zod";

// Define Zod schema for request validation
const TeamSchema = z.object({
  team_name: z.string()
    .min(1, "Team name is required")
    .max(36, "Team name must be 36 characters or fewer")
    .trim(),
  team_size: z.union([z.literal(4), z.literal(5)]),
}).strict();

export async function POST(request: Request) {
  try {
    // Verify required environment variables
    if (!process.env.DATABASE_API || !process.env.DATABASE_AUTH_KEY) {
      throw new Error("Missing required environment variables");
    }

    // Parse and validate request body
    const requestBody = await request.json();
    const validationResult = TeamSchema.safeParse(requestBody);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return NextResponse.json(
        { message: "Validation failed", errors: errorMessages },
        { status: 400 }
      );
    }

    // Create validated team object
    const validatedData = validationResult.data;
    const newTeam: Team = {
      _id: randomUUID(),
      team_name: validatedData.team_name,
      team_size: validatedData.team_size,
      createdAt: new Date(),
      ignore_encryption: defaultIgnoreEncryption
    };

    // Send to database API
    const databaseResponse = await fetch(`${process.env.DATABASE_API}/etc/team`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.DATABASE_AUTH_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTeam),
    });

    if (!databaseResponse.ok) {
      const errorData = await databaseResponse.json();

      throw new Error(errorData.message || "Database API request failed");
    }

    return NextResponse.json(
      { message: "Team created successfully", teamId: newTeam._id },
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error("Team creation error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return NextResponse.json(
        { message: "Validation failed", errors: errorMessages },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}