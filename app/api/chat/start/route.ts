import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Lead from "@/lib/models/Lead";
import ChatHistory from "@/lib/models/ChatHistory";
import { getUserFromToken } from "@/lib/auth";

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "";

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Only Admin users can access this resource." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Fetch lead details
    const lead = await Lead.findById(leadId).lean();
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Get primary phone number
    const mobilePhone = lead.phone?.find((p: any) => p.type === "mobile");
    const workPhone = lead.phone?.find((p: any) => p.type === "work");
    const primaryPhone = mobilePhone || workPhone || lead.phone?.[0];

    if (!primaryPhone) {
      return NextResponse.json(
        { error: "Lead has no phone number" },
        { status: 400 }
      );
    }

    // Check if chat history already exists
    let chatHistory = await ChatHistory.findOne({
      leadId: lead._id,
      phone: primaryPhone.number,
    });

    // Prepare data for n8n webhook
    const webhookData = {
      leadId: lead._id.toString(),
      phone: primaryPhone.number,
      email: lead.email || "",
      firstName: lead.firstName || "",
      lastName: lead.lastName || "",
      source: lead.source || "",
      campaign: lead.campaign || "",
      project: lead.project || "",
      companyId: lead.companyId?.toString() || "",
      status: lead.status?.toString() || "",
      dateInscription: lead.dateInscription || null,
    };

    // Call n8n webhook
    if (N8N_WEBHOOK_URL) {
      try {
        const webhookResponse = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(webhookData),
        });

        if (!webhookResponse.ok) {
          console.error("N8N webhook error:", await webhookResponse.text());
          // Continue even if webhook fails, we'll create the chat history anyway
        }
      } catch (webhookError) {
        console.error("Error calling N8N webhook:", webhookError);
        // Continue even if webhook fails
      }
    }

    // Create or update chat history
    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        leadId: lead._id,
        phone: primaryPhone.number,
        email: lead.email || undefined,
        messages: [],
      });
    }

    return NextResponse.json({
      success: true,
      chatHistoryId: chatHistory._id.toString(),
      message: "Chat initiated successfully",
    });
  } catch (error) {
    console.error("Start chat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
