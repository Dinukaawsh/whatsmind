import mongoose, { Schema, Model } from "mongoose";

export interface ICampaign {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  status: "draft" | "scheduled" | "running" | "paused" | "completed" | "failed";
  messageTemplate: string;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  totalContacts: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  repliedCount: number;
  failedCount: number;
  tags?: string[];
  targetContactIds?: mongoose.Types.ObjectId[];
  settings?: {
    delayBetweenMessages?: number; // in seconds
    dailyLimit?: number;
    timeWindowStart?: string; // e.g., "09:00"
    timeWindowEnd?: string; // e.g., "18:00"
  };
  createdAt: Date;
  updatedAt: Date;
}

type CampaignModel = Model<ICampaign>;

const CampaignSchema = new Schema<ICampaign, CampaignModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Campaign name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "running", "paused", "completed", "failed"],
      default: "draft",
      index: true,
    },
    messageTemplate: {
      type: String,
      required: [true, "Message template is required"],
    },
    scheduledAt: {
      type: Date,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    totalContacts: {
      type: Number,
      default: 0,
    },
    sentCount: {
      type: Number,
      default: 0,
    },
    deliveredCount: {
      type: Number,
      default: 0,
    },
    readCount: {
      type: Number,
      default: 0,
    },
    repliedCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    targetContactIds: {
      type: [Schema.Types.ObjectId],
      ref: "Contact",
      default: [],
    },
    settings: {
      delayBetweenMessages: {
        type: Number,
        default: 5,
      },
      dailyLimit: {
        type: Number,
      },
      timeWindowStart: {
        type: String,
      },
      timeWindowEnd: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Campaign =
  (mongoose.models.Campaign as CampaignModel) ||
  mongoose.model<ICampaign, CampaignModel>("Campaign", CampaignSchema);

export default Campaign;
