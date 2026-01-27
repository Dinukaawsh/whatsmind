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
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: string;
    };

    // Verify user is Admin
    if (decoded.role !== "Admin") {
      return null;
    }

    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Only Admin users can access this resource." },
        { status: 403 }
      );
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
      return NextResponse.json(
        { error: "Unauthorized. Only Admin users can access this resource." },
        { status: 403 }
      );
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
      initialStatus,
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
      status: initialStatus || (scheduledAt ? "scheduled" : "draft"),
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

export async function PATCH(request: NextRequest) {
  try {
    const userId = getUserFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Only Admin users can access this resource." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      campaignId,
      status,
      name,
      description,
      messageTemplate,
      tags,
      settings,
    } = body as {
      campaignId?: string;
      status?: string;
      name?: string;
      description?: string;
      messageTemplate?: string;
      tags?: string[];
      settings?: any;
    };

    if (!campaignId) {
      return NextResponse.json(
        { error: "campaignId is required" },
        { status: 400 }
      );
    }

    const update: any = {};

    if (typeof status === "string") {
      const allowedStatuses = [
        "draft",
        "scheduled",
        "running",
        "paused",
        "completed",
        "failed",
      ];

      if (!allowedStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 }
        );
      }

      update.status = status;
    }

    if (typeof name === "string") {
      update.name = name;
    }
    if (typeof description === "string") {
      update.description = description;
    }
    if (typeof messageTemplate === "string") {
      update.messageTemplate = messageTemplate;
    }
    if (Array.isArray(tags)) {
      update.tags = tags;
    }
    if (settings && typeof settings === "object") {
      update.settings = settings;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided to update" },
        { status: 400 }
      );
    }

    await connectDB();

    const campaign = await Campaign.findOneAndUpdate(
      { _id: campaignId, userId },
      update,
      { new: true }
    );

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("Update campaign status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Only Admin users can access this resource." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Campaign id is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const deleted = await Campaign.findOneAndDelete({ _id: id, userId });

    if (!deleted) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete campaign error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
