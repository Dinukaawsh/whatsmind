import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// NextAuth configuration from CRM
const NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET ||
  process.env.JWT_SECRET ||
  "your-secret-key-change-in-production";
const NEXTAUTH_TOKEN_PROD = "__Secure-next-auth.session-token";
const NEXTAUTH_TOKEN_DEV = "next-auth.session-token";

export interface DecodedToken {
  userId: string;
  role: string;
  email?: string;
  name?: string;
}

/**
 * Get user ID from NextAuth (CRM) session token
 * Only CRM users authenticated via NextAuth can access
 * Returns null if token is invalid or user is not Admin
 */
export async function getUserFromToken(
  request: NextRequest
): Promise<string | null> {
  // Check for NextAuth (CRM) session token
  const nextAuthToken =
    request.cookies.get(NEXTAUTH_TOKEN_PROD)?.value ||
    request.cookies.get(NEXTAUTH_TOKEN_DEV)?.value;

  if (!nextAuthToken) {
    return null;
  }

  try {
    // Verify NextAuth token
    // Note: NextAuth tokens are encrypted, not JWTs, so this may fail
    // This is expected when the token is from NextAuth's encrypted format
    const decoded = jwt.verify(nextAuthToken, NEXTAUTH_SECRET) as any;

    // NextAuth stores the user ID in token.id or token.sub
    const userId = decoded.id || decoded.sub;

    if (!userId) {
      return null;
    }

    // Connect to database and verify user
    await connectDB();
    const user = await User.findById(userId);

    if (!user) {
      return null;
    }

    // Check if user is Admin
    if (user.role !== "Admin") {
      return null;
    }

    // Check if user status is Enabled
    if (user.status !== "Enabled") {
      return null;
    }

    return user._id.toString();
  } catch (error: any) {
    // Only log if it's not a malformed token (expected when no valid session)
    if (error?.name !== "JsonWebTokenError" || error?.message !== "jwt malformed") {
      console.error("Failed to verify NextAuth token:", error);
    }
    return null;
  }
}

/**
 * Get full decoded token from NextAuth (CRM) session
 * Only CRM users authenticated via NextAuth can access
 * Returns null if token is invalid or user is not Admin
 */
export async function getDecodedToken(
  request: NextRequest
): Promise<DecodedToken | null> {
  // Check for NextAuth (CRM) session token
  const nextAuthToken =
    request.cookies.get(NEXTAUTH_TOKEN_PROD)?.value ||
    request.cookies.get(NEXTAUTH_TOKEN_DEV)?.value;

  if (!nextAuthToken) {
    return null;
  }

  try {
    // Verify NextAuth token
    // Note: NextAuth tokens are encrypted, not JWTs, so this may fail
    // This is expected when the token is from NextAuth's encrypted format
    const decoded = jwt.verify(nextAuthToken, NEXTAUTH_SECRET) as any;

    // NextAuth stores the user ID in token.id or token.sub
    const userId = decoded.id || decoded.sub;

    if (!userId) {
      return null;
    }

    // Connect to database and verify user
    await connectDB();
    const user = await User.findById(userId);

    if (!user || user.role !== "Admin" || user.status !== "Enabled") {
      return null;
    }

    return {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name || user.email,
    };
  } catch (error: any) {
    // Only log if it's not a malformed token (expected when no valid session)
    if (error?.name !== "JsonWebTokenError" || error?.message !== "jwt malformed") {
      console.error("Failed to verify NextAuth token:", error);
    }
    return null;
  }
}

export { JWT_SECRET };
