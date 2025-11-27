import { NextRequest, NextResponse } from "next/server";
import {
  createInsight,
  getMindOverview,
  InsightRequest,
  SnapshotFilters,
  Sentiment,
} from "@/lib/sample-data";

const toFilter = (params: URLSearchParams): SnapshotFilters => {
  const focus = params.get("focus") ?? undefined;
  const sentiment = params.get("sentiment") as Sentiment | null;
  const q = params.get("q") ?? undefined;

  return {
    focus,
    q,
    sentiment:
      sentiment && ["positive", "neutral", "negative"].includes(sentiment)
        ? sentiment
        : undefined,
  };
};

export const GET = async (request: NextRequest) => {
  const filters = toFilter(request.nextUrl.searchParams);
  const overview = getMindOverview(filters);

  return NextResponse.json(overview, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
};

export const POST = async (request: NextRequest) => {
  let payload: InsightRequest;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  if (!payload.topic?.trim() || !payload.note?.trim()) {
    return NextResponse.json(
      { error: "Both topic and note are required" },
      { status: 422 },
    );
  }

  const insight = createInsight(payload);
  return NextResponse.json(insight, { status: 201 });
};


