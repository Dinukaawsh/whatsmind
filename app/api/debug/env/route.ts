import { NextResponse } from "next/server";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function GET() {
  // Only show partial secret for security
  const secretPreview = JWT_SECRET.substring(0, 10) + "...";
  const secretLength = JWT_SECRET.length;
  const isDefault = JWT_SECRET === "your-secret-key-change-in-production";

  return NextResponse.json({
    secretPreview,
    secretLength,
    isDefault,
    nodeEnv: process.env.NODE_ENV,
    hasMongoUri: !!process.env.MONGODB_URI,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
  });
}
