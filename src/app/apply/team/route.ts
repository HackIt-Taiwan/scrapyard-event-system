import { NextResponse } from "next/server";
import { defaultIgnoreEncryption, IgnoreEncryption, Team } from "@/models/team";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate the request body
    if (!body.team_name || typeof body.team_name !== "string") {
      return NextResponse.json(
        { message: "The 'team_name' field is required and must be a string." },
        { status: 400 },
      );
    }

    if (body.team_name.length > 36) {
      return NextResponse.json(
        { message: "The 'team_name' field must be 36 characters or fewer." },
        { status: 400 },
      );
    }

    if (!body.team_size || (body.team_size !== 4 && body.team_size !== 5)) {
      return NextResponse.json(
        { message: "The 'team_size' field must be a correct range." },
        { status: 400 },
      );
    }

    const newTeam: Omit<Team, "_id"> = {
      _id: uuidv4(),
      team_name: body.team_name,
      team_size: body.team_size,
      createdAt: new Date(),
      ignore_encryption: defaultIgnoreEncryption,
    };

    const response = await fetch(`${process.env.DATABASE_API}/etc/team`, {
      method: "POST",
      body: JSON.stringify(newTeam),
      headers: {
        "authorization": `Bearer ${process.env.DATABASE_AUTH_KEY}`,
        "content-type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    return NextResponse.json(
      { message: "Team created successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(error);

    if (error instanceof SyntaxError) {
      // this is cool, but no idea what does this do xD
      return NextResponse.json(
        { message: "Invalid JSON in the request body." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
