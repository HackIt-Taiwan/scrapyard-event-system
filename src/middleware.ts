import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/staff/review", "/api/staff/approve", "/api/staff/approve/getteam"];
const publicRoutes = ["/staff/login"];

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = (await cookies()).get("session")?.value;

  if (isProtectedRoute && !cookie) {
    return NextResponse.redirect(new URL("/staff/login", request.url));
  }

  if (cookie && (isProtectedRoute || isPublicRoute)) {
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const decryptResponse = await fetch(
      `${baseUrl}/api/staff/auth/session/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: cookie || "placeholder" }),
      },
    );

    if (isProtectedRoute && !decryptResponse.ok) {
      return NextResponse.redirect(new URL("/staff/login", request.url));
    }

    const email = await decryptResponse.json();

    if (isProtectedRoute && !email.email) {
      return NextResponse.redirect(new URL("/staff/login", request.url));
    }

    if (
      isPublicRoute &&
      email.email &&
      !request.nextUrl.pathname.startsWith("/staff/review")
    ) {
      return NextResponse.redirect(new URL("/staff/review", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/staff/:path*", "/api/staff/approve/:path*"],
};
