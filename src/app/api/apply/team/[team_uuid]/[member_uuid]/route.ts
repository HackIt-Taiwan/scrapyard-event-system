import { verifyToken } from "@/lib/jwt";
import { databasePost } from "@/utils/databaseAPI";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  {
    params: { team_uuid, member_uuid },
  }: { params: { team_uuid: string; member_uuid: string } },
) {
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

  const jwt = request.nextUrl.searchParams.get("auth");

  if (!jwt)
    return NextResponse.json(
      {
        success: false,
        message: "JWT is missing",
      },
      { status: 403 },
    );

  const decodedJWT = verifyToken(jwt);

  if (decodedJWT?.teamID !== team_uuid)
    return NextResponse.json(
      {
        success: false,
        message: "JWT and team_uuid mismatch",
      },
      { status: 403 },
    );

  let returnedData;

  switch (decodedJWT.role) {
    case "leader":
    case "member": {
      const databaseResponse = await databasePost("/etc/get/team", {
        _id: member_uuid,
        ignore_encryption: {
          _id: true,
        },
      });

      if (!databaseResponse.ok)
        return NextResponse.json(
          {
            message:
              (await databaseResponse.json()) || "Database API request failed",
          },
          { status: 500 },
        );

      returnedData = await databaseResponse.json();
      break;
    }

    case "teacher": {
      const databaseResponse = await databasePost("/etc/get/team", {
        _id: member_uuid,
        ignore_encryption: {
          _id: true,
        },
      });

      if (!databaseResponse.ok)
        return NextResponse.json(
          {
            message:
              (await databaseResponse.json()) || "Database API request failed",
          },
          { status: 500 },
        );

      returnedData = await databaseResponse.json();
      break;
    }

    default:
      return NextResponse.json({
        error: true,
        message: "Unknown role",
      });
  }

  return NextResponse.json(
    {
      message: `${decodedJWT.role[0].toUpperCase() + decodedJWT.role.slice(1)} acquired successfully`, // INFO: I love the complexity of this thing
      data: returnedData,
    },
    {
      status: 200,
    },
  );
}
