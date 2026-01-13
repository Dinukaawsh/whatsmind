import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    console.log("[Login] Attempting login for:", email);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if user is Admin
    if (user.role !== "Admin") {
      console.log("[Login] User is not Admin:", email, "- Role:", user.role);
      return NextResponse.json(
        {
          error: "Access denied. Only Admin users can access this application.",
        },
        { status: 403 }
      );
    }

    // Check if user status is Enabled
    if (user.status !== "Enabled") {
      console.log("[Login] User account disabled:", email);
      return NextResponse.json(
        { error: "Account is disabled. Please contact administrator." },
        { status: 403 }
      );
    }

    // Verify password - handle both hashed and plain text comparison
    let isPasswordValid = false;
    if (user.comparePassword) {
      isPasswordValid = await user.comparePassword(password);
    } else {
      // Fallback: direct bcrypt comparison if method doesn't exist
      isPasswordValid = await bcrypt.compare(password, user.password);
    }

    if (!isPasswordValid) {
      console.log("[Login] Invalid password for:", email);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log("[Login] Login successful for:", email, "- Role:", user.role);

    // Create JWT token with role included
    const token = jwt.sign(
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
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // Set cookie with proper production configuration for Vercel
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    };

    console.log("[Login] Setting cookie with options:", {
      ...cookieOptions,
      token: "[REDACTED]",
    });
    response.cookies.set("token", token, cookieOptions);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
