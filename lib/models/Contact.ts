import mongoose, { Schema, Model } from "mongoose";

export interface IContact {
  userId: mongoose.Types.ObjectId;
  name: string;
  phoneNumber: string;
  email?: string;
  tags?: string[];
  customFields?: Record<string, string>;
  status: "active" | "unsubscribed" | "blocked";
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

type ContactModel = Model<IContact>;

const ContactSchema = new Schema<IContact, ContactModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Contact name is required"],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    customFields: {
      type: Map,
      of: String,
      default: {},
    },
    status: {
      type: String,
      enum: ["active", "unsubscribed", "blocked"],
      default: "active",
    },
    lastMessageAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user and phone number
ContactSchema.index({ userId: 1, phoneNumber: 1 }, { unique: true });

const Contact =
  (mongoose.models.Contact as ContactModel) ||
  mongoose.model<IContact, ContactModel>("Contact", ContactSchema);

export default Contact;
