import mongoose, { Schema, Model, Document } from "mongoose";

export interface IMessage {
  type: "human" | "ai";
  data: {
    content: string;
    tool_calls?: any[];
    invalid_tool_calls?: any[];
    additional_kwargs?: Record<string, any>;
    response_metadata?: Record<string, any>;
  };
}

export interface IChatHistory extends Document {
  _id: mongoose.Types.ObjectId;
  leadId: mongoose.Types.ObjectId;
  phone: string;
  email?: string;
  messages: IMessage[];
  createdAt?: Date;
  updatedAt?: Date;
}

type ChatHistoryModel = Model<IChatHistory>;

const MessageSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["human", "ai"],
      required: true,
    },
    data: {
      content: {
        type: String,
        required: true,
      },
      tool_calls: {
        type: [Schema.Types.Mixed],
        default: [],
      },
      invalid_tool_calls: {
        type: [Schema.Types.Mixed],
        default: [],
      },
      additional_kwargs: {
        type: Schema.Types.Mixed,
        default: {},
      },
      response_metadata: {
        type: Schema.Types.Mixed,
        default: {},
      },
    },
  },
  { _id: false }
);

const ChatHistorySchema = new Schema<IChatHistory, ChatHistoryModel>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      index: true,
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for leadId and phone
ChatHistorySchema.index({ leadId: 1, phone: 1 });

const ChatHistory =
  (mongoose.models.ChatHistory as ChatHistoryModel) ||
  mongoose.model<IChatHistory, ChatHistoryModel>(
    "ChatHistory",
    ChatHistorySchema
  );

export default ChatHistory;
