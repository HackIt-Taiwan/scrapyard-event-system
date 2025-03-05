import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  // Staff page routes
  "/staff",
  "/staff/home",
  "/staff/review",
  "/staff/dashboard",
  "/staff/checkin",
  "/staff/meal",
  
  // Staff approval API routes
  "/api/staff/approve",
  "/api/staff/approve/getteam",
  "/api/staff/approve/get-all-team",
  
  // Staff checkin API routes
  "/api/staff/checkin",
  "/api/staff/checkin/get-members",
  
  // Staff meal API routes
  "/api/staff/meal/add-pickup",
  "/api/staff/meal/get-history",
];

// Routes that should be accessible without authentication
const publicRoutes = [
  "/staff/login",
  "/api/staff/auth/send-code",
  "/api/staff/auth/verify-code",
  "/api/staff/auth/session/verify",
];

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Better protection for all staff routes
  // This checks if path starts with /staff/ or is exactly /staff but isn't the login page
  const isStaffRoute = (path === "/staff" || path.startsWith("/staff/")) && path !== "/staff/login";
  const isProtectedApiRoute = path.startsWith("/api/staff/") && 
                             !path.startsWith("/api/staff/auth/");
  
  // This combines the explicit list with the new logic
  const isProtectedRoute = protectedRoutes.includes(path) || isStaffRoute || isProtectedApiRoute;
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = (await cookies()).get("session")?.value;

  // Redirect to login if trying to access protected route without a cookie
  if (isProtectedRoute && !cookie) {
    // Prevent redirect loops by checking we're not already going to the login page
    const redirectUrl = new URL("/staff/login", request.url);
    if (request.nextUrl.pathname !== redirectUrl.pathname) {
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (cookie && (isProtectedRoute || isPublicRoute)) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
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
    
    // Redirect root staff URL to home page when authenticated
    if (path === '/staff' && email.email) {
      return NextResponse.redirect(new URL("/staff/home", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/staff/:path*", "/api/staff/:path*"],
};
