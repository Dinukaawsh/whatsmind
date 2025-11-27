import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/lib/db";
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query: any = { userId };
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const contacts = await Contact.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ contacts });
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
