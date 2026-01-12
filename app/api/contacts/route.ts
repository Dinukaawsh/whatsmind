import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Lead from "@/lib/models/Lead";
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

    // Build query to fetch active leads from CRM database
    const query: any = { 
      isActive: true // Only fetch active leads
    };

    // Add search filter if provided
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "phone.number": { $regex: search, $options: "i" } },
      ];
    }

    // Fetch leads and transform to contact format
    const leads = await Lead.find(query)
      .select("firstName lastName email phone isActive createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    // Transform leads to contact format for frontend
    const contacts = leads.map((lead) => {
      // Get primary phone number (prefer mobile, then work, then home)
      const mobilePhone = lead.phone.find((p) => p.type === "mobile");
      const workPhone = lead.phone.find((p) => p.type === "work");
      const primaryPhone = mobilePhone || workPhone || lead.phone[0];

      return {
        _id: lead._id.toString(),
        name: `${lead.firstName} ${lead.lastName}`.trim(),
        firstName: lead.firstName,
        lastName: lead.lastName,
        phoneNumber: primaryPhone?.number || "",
        phoneType: primaryPhone?.type || "mobile",
        allPhones: lead.phone.map(p => ({
          type: p.type,
          number: p.number
        })),
        email: lead.email,
        status: "active", // All leads from CRM are considered active contacts
        tags: [], // Can be enhanced later with lead tags
        source: "CRM Lead",
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
      };
    });

    return NextResponse.json({ 
      contacts,
      total: contacts.length
    });
  } catch (error) {
    console.error("Get contacts error:", error);
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
    const { name, phoneNumber, email, tags, customFields } = body;

    if (!name || !phoneNumber) {
      return NextResponse.json(
        { error: "Name and phone number are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingContact = await Contact.findOne({ userId, phoneNumber });
    if (existingContact) {
      return NextResponse.json(
        { error: "Contact with this phone number already exists" },
        { status: 409 }
      );
    }

    const contact = await Contact.create({
      userId,
      name,
      phoneNumber,
      email,
      tags,
      customFields,
    });

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    console.error("Create contact error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
