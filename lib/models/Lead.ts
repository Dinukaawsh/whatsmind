import mongoose, { Schema, Model } from "mongoose";

// Interface for phone numbers in the Lead model
interface IPhone {
  type: "work" | "home" | "mobile";
  number: string;
}

// Interface for Lead document (matching CRM's Lead structure)
export interface ILead {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: IPhone[];
  address?: {
    street?: string;
    country?: string;
    postCode?: string;
  };
  status?: mongoose.Types.ObjectId;
  tags?: mongoose.Types.ObjectId[];
  assignedTo?: mongoose.Types.ObjectId;
  companyId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type LeadModel = Model<ILead>;

const LeadSchema = new Schema<ILead, LeadModel>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: [
      {
        type: {
          type: String,
          enum: ["work", "home", "mobile"],
          required: true,
        },
        number: {
          type: String,
          required: true,
        },
      },
    ],
    address: {
      street: { type: String },
      country: { type: String },
      postCode: { type: String },
    },
    status: {
      type: Schema.Types.ObjectId,
      ref: "Status",
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
LeadSchema.index({ email: 1 });
LeadSchema.index({ isActive: 1 });
LeadSchema.index({ companyId: 1, isActive: 1 });

const Lead =
  (mongoose.models.Lead as LeadModel) ||
  mongoose.model<ILead, LeadModel>("Lead", LeadSchema);

export default Lead;
