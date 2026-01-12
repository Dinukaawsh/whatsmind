import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Campaign from "@/lib/models/Campaign";
import Message from "@/lib/models/Message";
import Lead from "@/lib/models/Lead";
import Status from "@/lib/models/Status";
import Company from "@/lib/models/company";
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

    // Campaign stats
    const totalCampaigns = await Campaign.countDocuments({ userId });
    const activeCampaigns = await Campaign.countDocuments({
      userId,
      status: { $in: ["running", "scheduled"] },
    });

    // Lead stats from CRM
    const totalLeads = await Lead.countDocuments({ isActive: true });
    const activeLeads = await Lead.countDocuments({ isActive: true });

    // Get leads by status
    const statusCounts = await Lead.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get leads by company
    const companyCounts = await Lead.aggregate([
      { $match: { isActive: true, companyId: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$companyId",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent leads
    const recentLeads = await Lead.find({ isActive: true })
      .select("firstName lastName email phone status companyId createdAt")
      .populate({
        path: "status",
        select: "name color",
        model: Status,
      })
      .populate({
        path: "companyId",
        select: "name",
        model: Company,
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Message stats
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

    // Recent campaigns
    const recentCampaigns = await Campaign.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    // Transform recent leads
    const transformedRecentLeads = recentLeads.map((lead: any) => ({
      _id: lead._id.toString(),
      name: `${lead.firstName || ""} ${lead.lastName || ""}`.trim(),
      email: lead.email || "",
      phone: lead.phone?.[0]?.number || "",
      status: lead.status
        ? {
            name: lead.status.name,
            color: lead.status.color,
          }
        : null,
      company: lead.companyId ? lead.companyId.name : null,
      createdAt: lead.createdAt,
    }));

    return NextResponse.json({
      totalCampaigns,
      activeCampaigns,
      totalLeads,
      activeLeads,
      totalMessagesSent,
      deliveryRate: parseFloat(deliveryRate),
      replyRate: parseFloat(replyRate),
      recentCampaigns,
      recentLeads: transformedRecentLeads,
      statusCounts: statusCounts.map((s) => ({
        statusId: s._id?.toString() || null,
        count: s.count,
      })),
      totalCompanies: companyCounts.length,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
