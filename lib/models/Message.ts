import mongoose, { Schema, Model } from "mongoose";

export interface IMessage {
  userId: mongoose.Types.ObjectId;
  campaignId?: mongoose.Types.ObjectId;
  contactId: mongoose.Types.ObjectId;
  phoneNumber: string;
  message: string;
  status: "pending" | "sent" | "delivered" | "read" | "failed";
  errorMessage?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  repliedAt?: Date;
  reply?: string;
  createdAt: Date;
  updatedAt: Date;
}

type MessageModel = Model<IMessage>;

const MessageSchema = new Schema<IMessage, MessageModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      index: true,
    },
    contactId: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
      required: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message content is required"],
    },
    status: {
      type: String,
      enum: ["pending", "sent", "delivered", "read", "failed"],
      default: "pending",
      index: true,
    },
    errorMessage: {
      type: String,
    },
    sentAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    readAt: {
      type: Date,
    },
    repliedAt: {
      type: Date,
    },
    reply: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying messages by campaign and status
MessageSchema.index({ campaignId: 1, status: 1 });

const Message =
  (mongoose.models.Message as MessageModel) ||
  mongoose.model<IMessage, MessageModel>("Message", MessageSchema);

export default Message;
