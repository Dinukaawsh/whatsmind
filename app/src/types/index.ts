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
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumber: string;
  phoneType?: "work" | "home" | "mobile";
  allPhones?: Array<{
    type: "work" | "home" | "mobile";
    number: string;
  }>;
  email?: string;
  source?: string;
  campaign?: string;
  project?: string;
  status?: {
    _id: string;
    name: string;
    color: string;
    isLocked?: boolean;
  } | null;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  tags?: string[];
  customFields?: Record<string, string>;
  dateInscription?: string;
  lastMessageAt?: string;
  whatsappCampaignLaunched?: boolean;
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
  name?: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalLeads: number;
  activeLeads: number;
  totalMessagesSent: number;
  deliveryRate: number;
  replyRate: number;
  recentCampaigns: Campaign[];
  recentLeads?: Array<{
    _id: string;
    name: string;
    email: string;
    phone: string;
    status: {
      name: string;
      color: string;
    } | null;
    company: string | null;
    createdAt: string;
  }>;
  statusCounts?: Array<{
    statusId: string | null;
    count: number;
  }>;
  totalCompanies?: number;
}
