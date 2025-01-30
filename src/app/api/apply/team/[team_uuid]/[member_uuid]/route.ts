import { TokenPayload, verifyToken } from '@/lib/jwt';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { team_uuid: string, member_uuid: string } }) {
  try {
    // Verify required environment variables
    if (!process.env.DATABASE_API || !process.env.DATABASE_AUTH_KEY) {
      return NextResponse.json(
        {
          message: "Missing required environment variables"
        },
        {
          status: 500
        }
      );
    }

    const { team_uuid, member_uuid } = params;
    const url = new URL(request.url); // Create a URL object from the request
    const jwt = url.searchParams.get('auth') || "";

    const decodedJWT: TokenPayload | null = verifyToken(jwt);

    // Include Authorization header only if conditions are met
    if (jwt === "" || !decodedJWT || decodedJWT.teamID != team_uuid || decodedJWT.userID != member_uuid) {
        const error = new Error("Authorization Failed");
        (error as any).status = 401;
        throw error;
    }

    const payload = {
      "_id": member_uuid,
      "ignore_encryption": {
        "_id": true,
      }
    }
    let returnedData

    switch (decodedJWT.role) {
      case 'leader':
      case 'member': {
        const databaseResponse = await fetch(
          `${process.env.DATABASE_API}/etc/get/member`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.DATABASE_AUTH_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!databaseResponse.ok) {
          const errorData = await databaseResponse.json();
          return NextResponse.json(
            {
              message: errorData.message || "Database API request failed"
            },
            {
              status: 500
            }
          );
        }

        returnedData = await databaseResponse.json()
        break
      }

      case 'teacher': {
        const databaseResponse = await fetch(
          `${process.env.DATABASE_API}/etc/get/teacher`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.DATABASE_AUTH_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!databaseResponse.ok) {
          const errorData = await databaseResponse.json();
          return NextResponse.json(
            {
              message: errorData.message || "Database API request failed"
            },
            {
              status: 500
            }
          );
        }

        returnedData = await databaseResponse.json()
        break;
      }

      default:
        const error = new Error("Incorrect role");
        (error as any).status = 401;
        throw error;
    }

    return NextResponse.json(
      {
        message: `${decodedJWT.role[0].toUpperCase() + decodedJWT.role.slice(1)} acquired successfully`, // INFO: I love the complexity of this thing
        data: returnedData
      },
      {
        status: 200
      }
    );

  } catch (error: unknown) {
    console.error("Error while acquiring team", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          message: "Invalid JSON in request body"
        },
        {
          status: 400
        }
      );
    }

    if (error instanceof Error && (error as any).status) {
      return NextResponse.json(
        { message: error.message },
        { status: (error as any).status },
      );
    }

    return NextResponse.json(
      {
        message: "Internal server error"
      },
      {
        status: 500
      }
    );
  }
}
