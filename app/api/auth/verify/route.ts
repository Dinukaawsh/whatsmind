import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    console.log("[Verify] Checking token, exists:", !!token);

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
      name?: string;
    };

    console.log(
      "[Verify] Token valid for:",
      decoded.email,
      "- Role:",
      decoded.role
    );

    // Verify user is Admin
    if (decoded.role !== "Admin") {
      return NextResponse.json(
        {
          error: "Access denied. Only Admin users can access this application.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
