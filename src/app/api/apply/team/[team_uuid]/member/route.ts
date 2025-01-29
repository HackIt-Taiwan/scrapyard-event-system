import { NextResponse } from 'next/server';
import { defaultIgnoreEncryption, Member } from "@/models/member";
import { randomUUID } from "crypto";
import { string, z } from "zod";
import { generateToken, TokenPayload } from "@/lib/jwt";

// Define Zod schema for request validation
const MemberSchema = z
  .object({
    team_name: z
      .string()
      .min(1, "Team name is required")
      .max(24, "Team name must be 24 characters or fewer")
      .trim(),
    team_size: z.union([z.literal(4), z.literal(5)]),
  })
  .strict();

export async function POST(req: Request, { params }: { params: { team_uuid: string } }) {
  try {
    // Verify required environment variables
    if (!process.env.DATABASE_API || !process.env.DATABASE_AUTH_KEY) {
      throw new Error("Missing required environment variables");
    }

    const { team_uuid } = params;
    const url = new URL(req.url); // Create a URL object from the request
    const jwt = url.searchParams.get('auth');
    const requestBody = await request.json();

    return NextResponse.json({
      status: 201,
      message: "Member created successfully",
    });
  } catch (error: unknown) {
    console.error("Error while creating a team:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json({
        status: 400,
        message: "Invalid JSON in request body",
      });
    }

    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return NextResponse.json({
        status: 400,
        message: "Validation failed",
        errors: errorMessages,
      });
    }

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      status: 500,
      message: "Internal server error",
    });
  }
}
