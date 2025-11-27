import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Campaign from "@/lib/models/Campaign";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    const campaigns = await Campaign.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Get campaigns error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      messageTemplate,
      scheduledAt,
      targetContactIds,
      tags,
      settings,
    } = body;

    if (!name || !messageTemplate) {
      return NextResponse.json(
        { error: "Name and message template are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const campaign = await Campaign.create({
      userId,
      name,
      description,
      messageTemplate,
      scheduledAt,
      targetContactIds: targetContactIds || [],
      totalContacts: targetContactIds?.length || 0,
      tags,
      settings,
      status: scheduledAt ? "scheduled" : "draft",
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error("Create campaign error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
