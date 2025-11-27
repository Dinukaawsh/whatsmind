export interface Campaign {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  status: "draft" | "scheduled" | "running" | "paused" | "completed" | "failed";
  messageTemplate: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  totalContacts: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  repliedCount: number;
  failedCount: number;
  tags?: string[];
  targetContactIds?: string[];
  settings?: {
    delayBetweenMessages?: number;
    dailyLimit?: number;
    timeWindowStart?: string;
    timeWindowEnd?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  _id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  email?: string;
  tags?: string[];
  customFields?: Record<string, string>;
  status: "active" | "unsubscribed" | "blocked";
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  userId: string;
  campaignId?: string;
  contactId: string;
  phoneNumber: string;
  message: string;
  status: "pending" | "sent" | "delivered" | "read" | "failed";
  errorMessage?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  repliedAt?: string;
  reply?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalContacts: number;
  totalMessagesSent: number;
  deliveryRate: number;
  replyRate: number;
  recentCampaigns: Campaign[];
}
