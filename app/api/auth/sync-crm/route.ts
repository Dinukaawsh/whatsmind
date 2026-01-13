import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// NextAuth configuration from CRM
const NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET ||
  process.env.JWT_SECRET ||
  "your-secret-key-change-in-production";
const NEXTAUTH_TOKEN_PROD = "__Secure-next-auth.session-token";
const NEXTAUTH_TOKEN_DEV = "next-auth.session-token";

/**
 * Syncs CRM session with WhatsMind application.
 * This endpoint checks for a NextAuth session token from the CRM,
 * verifies the user is an Admin, and creates a WhatsMind JWT token.
 */
export async function GET(request: NextRequest) {
  try {
    // Check for NextAuth session token (CRM uses NextAuth)
    const nextAuthToken =
      request.cookies.get(NEXTAUTH_TOKEN_PROD)?.value ||
      request.cookies.get(NEXTAUTH_TOKEN_DEV)?.value;

    if (!nextAuthToken) {
      return NextResponse.json(
        { error: "No CRM session found" },
        { status: 401 }
      );
    }

    // Verify NextAuth token
    // Note: NextAuth tokens are encrypted, not JWTs, so this may fail
    // This is expected when the token is from NextAuth's encrypted format
    let decoded: any;
    try {
      decoded = jwt.verify(nextAuthToken, NEXTAUTH_SECRET);
    } catch (error: any) {
      // Only log if it's not a malformed token (expected when no valid session)
      if (
        error?.name !== "JsonWebTokenError" ||
        error?.message !== "jwt malformed"
      ) {
        console.error("Failed to verify NextAuth token:", error);
      }
      return NextResponse.json(
        { error: "Invalid CRM session" },
        { status: 401 }
      );
    }

    // NextAuth stores the user ID in token.id or token.sub
    const userId = decoded.id || decoded.sub;

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid session token structure" },
        { status: 401 }
      );
    }

    await connectDB();

    // Find user in database by ID
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is Admin
    if (user.role !== "Admin") {
      return NextResponse.json(
        {
          error: "Access denied. Only Admin users can access this application.",
        },
        { status: 403 }
      );
    }

    // Check if user status is Enabled
    if (user.status !== "Enabled") {
      return NextResponse.json(
        { error: "Account is disabled. Please contact administrator." },
        { status: 403 }
      );
    }

    // Create JWT token for this app
    const appToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name || user.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      message: "Session synced successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // Set token for this app
    response.cookies.set("token", appToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Sync CRM session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
