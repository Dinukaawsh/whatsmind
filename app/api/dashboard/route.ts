import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Campaign from "@/lib/models/Campaign";
import Message from "@/lib/models/Message";
import Contact from "@/lib/models/Contact";
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

    const totalCampaigns = await Campaign.countDocuments({ userId });
    const activeCampaigns = await Campaign.countDocuments({
      userId,
      status: { $in: ["running", "scheduled"] },
    });
    const totalContacts = await Contact.countDocuments({ userId });

    const messages = await Message.find({ userId });
    const totalMessagesSent = messages.filter(
      (m) => m.status !== "pending"
    ).length;
    const deliveredMessages = messages.filter((m) =>
      ["delivered", "read"].includes(m.status)
    ).length;
    const repliedMessages = messages.filter((m) => m.reply).length;

    const deliveryRate =
      totalMessagesSent > 0
        ? ((deliveredMessages / totalMessagesSent) * 100).toFixed(2)
        : "0.00";
    const replyRate =
      totalMessagesSent > 0
        ? ((repliedMessages / totalMessagesSent) * 100).toFixed(2)
        : "0.00";

    const recentCampaigns = await Campaign.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(5);

    return NextResponse.json({
      totalCampaigns,
      activeCampaigns,
      totalContacts,
      totalMessagesSent,
      deliveryRate: parseFloat(deliveryRate),
      replyRate: parseFloat(replyRate),
      recentCampaigns,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
