import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// NextAuth session token names (for CRM integration)
const NEXTAUTH_TOKEN_PROD = "__Secure-next-auth.session-token";
const NEXTAUTH_TOKEN_DEV = "next-auth.session-token";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = [
    "/login",
    "/api/auth/login",
    "/api/auth/create-user",
    "/api/auth/sync-crm",
    "/api/health",
    "/unauthorized",
  ];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // If accessing a public path, allow the request
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check for WhatsMind app token first
  if (token) {
    try {
      // Verify JWT using jose (Edge Runtime compatible)
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token.value, secret);

      const email = payload.email as string;
      const role = payload.role as string;

      console.log("[Middleware] Valid token for:", email, "- Role:", role);

      // Only allow Admin users to access the application
      if (role !== "Admin") {
        console.log("[Middleware] Non-admin user blocked:", email);
        const unauthorizedUrl = new URL("/unauthorized", request.url);
        return NextResponse.redirect(unauthorizedUrl);
      }

      // Token is valid and user is Admin, allow the request
      return NextResponse.next();
    } catch (error) {
      // Invalid app token, check for CRM session
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.log("[Middleware] Token verification failed:", errorMessage);
    }
  } else {
    console.log("[Middleware] No token found for path:", pathname);
  }

  // Check for NextAuth session token from CRM
  const nextAuthToken =
    request.cookies.get(NEXTAUTH_TOKEN_PROD) ||
    request.cookies.get(NEXTAUTH_TOKEN_DEV);

  if (nextAuthToken) {
    // NextAuth session exists, allow request to proceed
    // The sync-crm endpoint will be called automatically by the frontend
    return NextResponse.next();
  }

  // No valid tokens found, redirect to login
  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
