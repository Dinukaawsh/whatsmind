import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Lead from "@/lib/models/Lead";
import Status from "@/lib/models/Status";
import User from "@/lib/models/User";
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const companyId = searchParams.get("companyId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = (page - 1) * limit;

    // Build query to fetch active leads from CRM database
    const query: any = {
      isActive: true, // Only fetch active leads
    };

    // Add company filter if provided
    if (companyId && companyId !== "all") {
      query.companyId = companyId;
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "phone.number": { $regex: search, $options: "i" } },
        { source: { $regex: search, $options: "i" } },
        { campaign: { $regex: search, $options: "i" } },
        { project: { $regex: search, $options: "i" } },
      ];
    }

    // Get total count for pagination
    const totalCount = await Lead.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch leads with population and pagination
    const leads = await Lead.find(query)
      .select(
        "firstName lastName email phone source campaign project status assignedTo companyId isActive dateInscription whatsappCampaignLaunched createdAt updatedAt"
      )
      .populate({
        path: "status",
        select: "name color isLocked",
        model: Status,
      })
      .populate({
        path: "assignedTo",
        select: "name email",
        model: User,
      })
      .populate({
        path: "companyId",
        select: "name location industry",
        model: Company,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform leads to contact format for frontend
    const contacts = leads.map((lead: any) => {
      // Get primary phone number (prefer mobile, then work, then home)
      const mobilePhone = lead.phone.find((p: any) => p.type === "mobile");
      const workPhone = lead.phone.find((p: any) => p.type === "work");
      const primaryPhone = mobilePhone || workPhone || lead.phone[0];

      return {
        _id: lead._id.toString(),
        name: `${lead.firstName} ${lead.lastName}`.trim(),
        firstName: lead.firstName,
        lastName: lead.lastName,
        phoneNumber: primaryPhone?.number || "",
        phoneType: primaryPhone?.type || "mobile",
        allPhones: lead.phone.map((p: any) => ({
          type: p.type,
          number: p.number,
        })),
        email: lead.email,
        source: lead.source || "",
        campaign: lead.campaign || "",
        project: lead.project || "",
        status: lead.status
          ? {
              _id: lead.status._id.toString(),
              name: lead.status.name,
              color: lead.status.color,
              isLocked: lead.status.isLocked,
            }
          : {
              _id: "active",
              name: "active",
              color: "#10b981",
              isLocked: false,
            },
        assignedTo: lead.assignedTo
          ? {
              _id: lead.assignedTo._id.toString(),
              name: lead.assignedTo.name,
              email: lead.assignedTo.email,
            }
          : null,
        company: lead.companyId
          ? {
              _id: lead.companyId._id.toString(),
              name: lead.companyId.name,
              location: lead.companyId.location,
              industry: lead.companyId.industry,
            }
          : null,
        dateInscription: lead.dateInscription,
        whatsappCampaignLaunched: lead.whatsappCampaignLaunched || false,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
      };
    });

    // Fetch companies for filter dropdown
    const companies = await Company.find({ isActive: true })
      .select("name location industry")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      contacts,
      companies: companies.map((company: any) => ({
        _id: company._id.toString(),
        name: company.name,
        location: company.location,
        industry: company.industry,
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
// POST endpoint removed - contacts are read-only from CRM leads
