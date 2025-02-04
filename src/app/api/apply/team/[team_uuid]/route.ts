import { TokenPayload, verifyToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { team_uuid: string } },
) {
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

    const { team_uuid } = await params;
    const url = new URL(request.url); // Create a URL object from the request
    const jwt = url.searchParams.get("auth") || "";
    let allEmailVerified = true;
    const payload = {
      _id: team_uuid,
      ignore_encryption: {
        _id: true,
      },
    };

    const decodedJWT: TokenPayload | null = verifyToken(jwt);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Include Authorization header only if conditions are met
    if (jwt != "" && decodedJWT && decodedJWT.teamID === team_uuid) {
      headers.Authorization = `Bearer ${process.env.DATABASE_AUTH_KEY}`;
    }

    const databaseResponse = await fetch(
      `${process.env.DATABASE_API}/etc/get/team`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      },
    );

    if (!databaseResponse.ok) {
      const errorData = await databaseResponse.json();
      return NextResponse.json(
        {
          message: errorData.message || "Database API request failed",
        },
        {
          status: 500,
        },
      );
    }

    // Acquiring team members/teacher's email verification status
    let data = await databaseResponse.json();

    const membersID = data.data[0].members_id;
    const teacherPayload = {
      _id: data.data[0].teacher_id,
      ignore_encryption: {
        _id: true
      }
    }

    for (const memberID of membersID) {
      const payload = {
        _id: memberID,
        ignore_encryption: {
          _id: true,
        },
      };

      const memberResponse = await fetch(
        `${process.env.DATABASE_API}/etc/get/member`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        }
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
      
      const member = await memberResponse.json()
      if (!member.data || !member.data[0].email_verified) {
        allEmailVerified = false
      }
    }

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
    }

    // Adding that to returned data
    data = data.data
    data[0].all_email_verified = allEmailVerified

    return NextResponse.json(
      {
        message: "Team acquired successfully",
        data: data,
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
