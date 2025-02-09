import { sendVerificationEmail } from "@/lib/email";
import { generateEmailVerificationToken, verifyToken } from "@/lib/jwt";
import { defaultIgnoreEncryption } from "@/models/common";
import { memberDatabaseSchemaType, memberSchema } from "@/models/member";
import { teacherDatabaseSchemaType, teacherSchema } from "@/models/teacher";
import { databasePost } from "@/utils/databaseAPI";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: { team_uuid?: string } }
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
  const { team_uuid } = await Promise.resolve(context.params);
  const jwt = request.nextUrl.searchParams.get("auth");
  const requestBody = await request.json();

  if (!jwt || !team_uuid)
    return NextResponse.json(
      {
        success: false,
        message: "JWT or team_uuid is missing",
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

  const databaseResponse = await databasePost("/etc/get/team", {
    _id: team_uuid,
    ignore_encryption: {
      _id: true,
    },
  });

  const teamData = await databaseResponse.json();
  const requestedID = decodedJWT.userID;
  let returnedData;

  switch (decodedJWT.role) {
    case "member": {
      const memberIDArray = teamData.data[0].members_id;
      let isMatch = false;
      for (const id of memberIDArray) {
        if (id === requestedID) {
          isMatch = true;
          break;
        }
      }

      if (!isMatch)
        return NextResponse.json(
          {
            success: false,
            message: "ID does not match any member",
          },
          { status: 400 },
        );

      const checkResponse = await databasePost("/etc/get/member", {
        _id: requestedID,
        ignore_encryption: {
          _id: true,
        },
      });

      const checkResponseData = await checkResponse.json();

      // The actual update / create member data in database part
      const validationResult = memberSchema.safeParse(requestBody);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map((err) => ({
          field: err.path.join("、"),
          message: err.message,
        }));

        return NextResponse.json(
          {
            success: false,
            message: errorMessages,
          },
          { status: 400 },
        );
      }

      const memberData: memberDatabaseSchemaType = {
        _id: requestedID,
        ...validationResult.data,
        is_leader: false,
        email_verified:
          (checkResponseData?.data?.email ?? null) === validationResult.data.email,
        team_id: team_uuid,

        ignore_encryption: defaultIgnoreEncryption,
      };

      // Send verification email if email updated
      if (!checkResponseData.data || checkResponseData.data.email != validationResult.data.email) {
        const url = generateEmailVerificationToken({
          teamID: memberData.team_id,
          userID: memberData._id,
          role: "member",
        });
        const emailSuccess = await sendVerificationEmail(
          memberData.email,
          url,
          memberData.name_zh,
        );
        if (!emailSuccess)
          return NextResponse.json(
            {
              success: false,
              message: "發送驗證信件至此信箱時發生問題",
            },
            { status: 500 },
          );
      }

      const databaseResponse = await databasePost(
        `/etc/${checkResponseData.data ? "edit" : "create"}/member`,
        memberData,
      );

      if (!databaseResponse.ok)
        return NextResponse.json(
          {
            success: false,
            message: (await databaseResponse.json()).errorData,
          },
          { status: 500 },
        );

      returnedData = memberData;
      break;
    }

    case "leader": {
      // This will be created as a team completion signal
      const roleID = teamData.data[0].leader_id;

      if (requestedID != roleID)
        return NextResponse.json(
          {
            success: false,
            message: "ID does not match team leader",
          },
          { status: 400 },
        );

      const checkResponse = await databasePost("/etc/get/member", {
        _id: roleID,
        ignore_encryption: {
          _id: true,
        },
      });

      const checkResponseData = await checkResponse.json();

      // The actual update / create member data in database part
      const validationResult = memberSchema.strict().safeParse(requestBody);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map((err) => ({
          field: err.path.join("、"),
          message: err.message,
        }));

        return NextResponse.json(
          {
            success: false,
            message: errorMessages,
          },
          { status: 400 },
        );
      }

      const leaderData: memberDatabaseSchemaType = {
        _id: requestedID,
        ...validationResult.data,
        is_leader: true,
        email_verified: true,  // Leaders don't need email verification to access finish page
        team_id: team_uuid,

        ignore_encryption: defaultIgnoreEncryption,
      };

      // Still send verification email but don't block access
      if (!checkResponseData.data || checkResponseData.data.email != validationResult.data.email) {
        const url = generateEmailVerificationToken({
          teamID: leaderData.team_id,
          userID: leaderData._id,
          role: "leader",
        });
        // Generate finish page URL
        const finishPageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/apply/steps/${team_uuid}/finish-page?auth=${jwt}`;
        // Send email with both URLs
        await sendVerificationEmail(
          leaderData.email,
          url,
          leaderData.name_zh,
          true,  // isLeader
          finishPageUrl,
        );
      }

      const databaseResponse = await databasePost(
        `/etc/${checkResponseData.data ? "edit" : "create"}/member`,
        leaderData,
      );

      if (!databaseResponse.ok)
        return NextResponse.json(
          {
            success: false,
            message: (await databaseResponse.json()).errorData,
          },
          { status: 500 },
        );

      returnedData = leaderData;
      break;
    }

    case "teacher": {
      const roleID = teamData.data[0].teacher_id;

      if (requestedID != roleID)
        return NextResponse.json(
          {
            success: false,
            message: "ID does not match team leader",
          },
          { status: 400 },
        );

      const checkResponse = await databasePost("/etc/get/teacher", {
        _id: roleID,
        ignore_encryption: {
          _id: true,
        },
      });

      const checkResponseData = await checkResponse.json();

      // The actual update / create member data in database part
      const validationResult = teacherSchema.strict().safeParse(requestBody);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map((err) => ({
          field: err.path.join("、"),
          message: err.message,
        }));

        return NextResponse.json(
          {
            success: false,
            message: errorMessages,
          },
          { status: 400 },
        );
      }

      const teacherData: teacherDatabaseSchemaType = {
        _id: requestedID,
        ...validationResult.data,
        email_verified:
          (checkResponseData?.data?.email ?? null) === validationResult.data.email,
        team_id: team_uuid,

        ignore_encryption: defaultIgnoreEncryption,
      };

      if (!checkResponseData.data || checkResponseData.data.email === validationResult.data.email) {
        const url = generateEmailVerificationToken({
          teamID: teacherData.team_id,
          userID: teacherData._id,
          role: "teacher",
        });
        const emailSuccess = await sendVerificationEmail(
          teacherData.email,
          url,
          teacherData.name_zh,
        );
        if (!emailSuccess)
          return NextResponse.json(
            {
              success: false,
              message: "發送驗證信件至此信箱時發生問題",
            },
            { status: 500 },
          );
      }

      const databaseResponse = await databasePost(
        `/etc/${checkResponseData.data ? "edit" : "create"}/teacher`,
        teacherData,
      );

      if (!databaseResponse.ok)
        return NextResponse.json(
          {
            success: false,
            message: (await databaseResponse.json()).errorData,
          },
          { status: 500 },
        );

      returnedData = teacherData;
      break;
    }

    default:
      return NextResponse.json({
        success: false,
        message: "Unknown role",
      });
  }

  return NextResponse.json(
    {
      success: true,
      data: returnedData,
    },
    { status: 200 },
  );
}

export async function GET(
  // TODO: fix this
  request: NextRequest,
  context: { params: { team_uuid?: string } }
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
  const { team_uuid } = await Promise.resolve(context.params);

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
  if (decodedJWT?.teamID !== team_uuid || !decodedJWT?.teamID)
    return NextResponse.json(
      {
        success: false,
        message: "JWT and team_uuid mismatch",
      },
      { status: 403 },
    );


  const member_uuid = decodedJWT.userID
  let returnedData;

  switch (decodedJWT.role) {
    case "leader": {
      const databaseResponse = await databasePost("/etc/get/member", {
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
      // Add finish page link for leaders
      if (returnedData.data && returnedData.data[0]) {
        returnedData.data[0].is_leader = true;
      }
      break;
    }
    case "member": {
      const databaseResponse = await databasePost("/etc/get/member", {
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
      const databaseResponse = await databasePost("/etc/get/teacher", {
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
      data: returnedData.data ? returnedData.data[0] : {},
    },
    {
      status: 200,
    },
  );
}
