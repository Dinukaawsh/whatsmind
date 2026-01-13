import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Lead from "@/lib/models/Lead";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "";
// WEBHOOK_AUTH_HEADER can be in different formats:
// - "Bearer your-token-here" (for Bearer token auth)
// - "your-api-key" (for simple API key auth)
// - "Basic base64-encoded-credentials" (for Basic auth)
// - Or leave empty if webhook doesn't require authentication
const WEBHOOK_AUTH_HEADER = process.env.WEBHOOK_AUTH_HEADER || "";

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
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Fetch lead details
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Check if already launched
    if (lead.whatsappCampaignLaunched) {
      return NextResponse.json(
        { error: "Campaign already launched for this lead" },
        { status: 400 }
      );
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

    // Prepare headers for webhook request
    const webhookHeaders: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add auth header if configured
    if (WEBHOOK_AUTH_HEADER) {
      webhookHeaders["Authorization"] = WEBHOOK_AUTH_HEADER;
    }

    // Debug logging
    console.log("=== WEBHOOK DEBUG ===");
    console.log("Webhook URL:", N8N_WEBHOOK_URL);
    console.log(
      "Auth Header Value:",
      WEBHOOK_AUTH_HEADER
        ? `"${WEBHOOK_AUTH_HEADER.substring(0, 20)}..."`
        : "✗ Not configured"
    );
    console.log("Auth Header Length:", WEBHOOK_AUTH_HEADER?.length || 0);
    console.log("Payload:", JSON.stringify(webhookData, null, 2));
    console.log("Headers:", JSON.stringify(webhookHeaders, null, 2));
    console.log("==================");

    // Call n8n webhook
    if (N8N_WEBHOOK_URL) {
      try {
        const webhookResponse = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: webhookHeaders,
          body: JSON.stringify(webhookData),
        });

        console.log("Webhook response status:", webhookResponse.status);

        if (!webhookResponse.ok) {
          const errorText = await webhookResponse.text();
          console.error("N8N webhook error:", errorText);
          return NextResponse.json(
            {
              error: "Failed to launch campaign via webhook",
              details: errorText,
              webhookUrl: N8N_WEBHOOK_URL,
            },
            { status: 500 }
          );
        }

        const responseData = await webhookResponse.text();
        console.log("Webhook response:", responseData);
      } catch (webhookError) {
        console.error("Error calling N8N webhook:", webhookError);
        return NextResponse.json(
          { error: "Failed to connect to webhook service" },
          { status: 500 }
        );
      }
    } else {
      // If no webhook URL is configured, still update the lead
      console.warn(
        "N8N_WEBHOOK_URL not configured, updating lead without webhook call"
      );
    }

    // Update lead with whatsappCampaignLaunched flag
    lead.whatsappCampaignLaunched = true;
    await lead.save();

    return NextResponse.json({
      success: true,
      message: "Campaign launched successfully",
      leadId: lead._id.toString(),
    });
  } catch (error) {
    console.error("Launch campaign error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
