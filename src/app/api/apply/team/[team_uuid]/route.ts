import { TokenPayload, verifyToken } from '@/lib/jwt';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { team_uuid: string } }) {
  try {
    // Verify required environment variables
    if (!process.env.DATABASE_API || !process.env.DATABASE_AUTH_KEY) {
      throw new Error("Missing required environment variables");
    }

    const { team_uuid } = await params;
    const url = new URL(req.url); // Create a URL object from the request
    const jwt = url.searchParams.get('auth') || "";

    const payload = {
      "_id": team_uuid,
      "ignore_encryption": {
        "_id": true,
      }
    }

    const decodedJWT: TokenPayload | null = verifyToken(jwt);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Include Authorization header only if conditions are met
    if (jwt !== "" && decodedJWT && decodedJWT.teamID === team_uuid) {
      headers.Authorization = `Bearer ${process.env.DATABASE_AUTH_KEY}`;
    }

    const databaseResponse = await fetch(
      `${process.env.DATABASE_API}/etc/get/team`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      }
    );

    if (!databaseResponse.ok) {
      const errorData = await databaseResponse.json();

      throw new Error(errorData.message || "Database API request failed");
    }

    const data = await databaseResponse.json()

    return NextResponse.json({
      status: 201,
      data: data,
      message: "Team acquired successfully",
    });
  } catch (error: unknown) {
    console.error("Error while acquiring team", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json({
        status: 400,
        message: "Invalid JSON in request body",
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
