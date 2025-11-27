export type Sentiment = "positive" | "neutral" | "negative";

export type StreamChannel = "email" | "slack" | "meeting" | "whatsapp";

export interface ActionItem {
  id: string;
  owner: string;
  description: string;
  status: "open" | "in-progress" | "done";
}

export interface ConversationSnapshot {
  id: string;
  topic: string;
  channel: StreamChannel;
  owner: string;
  sentiment: Sentiment;
  energy: number;
  updatedAt: string;
  focusAreas: string[];
  summary: string;
  actionItems: ActionItem[];
}

export interface SnapshotFilters {
  focus?: string;
  sentiment?: Sentiment;
  q?: string;
}

const baseSnapshots: ConversationSnapshot[] = [
  {
    id: "conv-01",
    topic: "Agency onboarding feedback",
    channel: "slack",
    owner: "Product Ops",
    sentiment: "positive",
    energy: 82,
    updatedAt: "2025-11-18T10:05:00.000Z",
    focusAreas: ["onboarding", "automation"],
    summary:
      "Agency partners loved the automated playbooks. They want clearer hand‑off signals between CSM and finance.",
    actionItems: [
      {
        id: "action-01",
        owner: "CS Ops",
        description: "Ship shared checklist for partner hand-offs",
        status: "in-progress",
      },
      {
        id: "action-02",
        owner: "Finance",
        description: "Add invoice reminder step to journey",
        status: "open",
      },
    ],
  },
  {
    id: "conv-02",
    topic: "Marketing <> Sales weekly sync",
    channel: "meeting",
    owner: "Growth",
    sentiment: "neutral",
    energy: 61,
    updatedAt: "2025-11-17T17:30:00.000Z",
    focusAreas: ["handoff", "pipeline"],
    summary:
      "Lead quality is stabilizing but outbound playbooks still feel noisy. Team asked for shared visibility on experiments.",
    actionItems: [
      {
        id: "action-03",
        owner: "Demand Gen",
        description: "Publish single source of truth for campaign guardrails",
        status: "open",
      },
      {
        id: "action-04",
        owner: "RevOps",
        description: "Map experiment IDs to CRM opportunities",
        status: "open",
      },
    ],
  },
  {
    id: "conv-03",
    topic: "Customer advisory WhatsApp loop",
    channel: "whatsapp",
    owner: "Customer Success",
    sentiment: "negative",
    energy: 48,
    updatedAt: "2025-11-16T08:50:00.000Z",
    focusAreas: ["roadmap", "billing"],
    summary:
      "Enterprise champions flagged dashboard latency and recurring billing drift. Sentiment dipped after the last patch.",
    actionItems: [
      {
        id: "action-05",
        owner: "Platform",
        description: "Add tracing to dashboard widgets",
        status: "in-progress",
      },
      {
        id: "action-06",
        owner: "Billing",
        description: "Backfill invoices that slipped the October update",
        status: "done",
      },
    ],
  },
];

export interface Overview {
  snapshots: ConversationSnapshot[];
  metrics: {
    totalStreams: number;
    positiveRate: number;
    criticalStreams: number;
    activeActionItems: number;
  };
  generatedAt: string;
}

export const getMindOverview = (filters?: SnapshotFilters): Overview => {
  const filtered = baseSnapshots.filter((snapshot) => {
    if (filters?.sentiment && snapshot.sentiment !== filters.sentiment) {
      return false;
    }
    if (filters?.focus && !snapshot.focusAreas.includes(filters.focus)) {
      return false;
    }
    if (
      filters?.q &&
      !`${snapshot.topic} ${snapshot.summary}`
        .toLowerCase()
        .includes(filters.q.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const positiveCount = filtered.filter(
    (snapshot) => snapshot.sentiment === "positive",
  ).length;

  const activeActionItems = filtered.reduce(
    (total, snapshot) =>
      total +
      snapshot.actionItems.filter((item) => item.status !== "done").length,
    0,
  );

  return {
    snapshots: filtered,
    metrics: {
      totalStreams: filtered.length,
      positiveRate: filtered.length
        ? Math.round((positiveCount / filtered.length) * 100)
        : 0,
      criticalStreams: filtered.filter(
        (snapshot) =>
          snapshot.sentiment === "negative" || snapshot.energy < 55,
      ).length,
      activeActionItems,
    },
    generatedAt: new Date().toISOString(),
  };
};

export interface InsightRequest {
  topic: string;
  note: string;
  owner?: string;
  channel?: StreamChannel;
}

export const createInsight = (input: InsightRequest) => {
  const now = new Date().toISOString();
  return {
    id: `draft-${Date.now()}`,
    ...input,
    sentimentHint:
      input.note.toLowerCase().includes("delay") ||
      input.note.toLowerCase().includes("blocker")
        ? "negative"
        : "positive",
    createdAt: now,
    nextSteps: [
      "Review with the rituals squad",
      "Map owner in Monday board",
      "Publish snippet to Whats Mind canvas",
    ],
  };
};


