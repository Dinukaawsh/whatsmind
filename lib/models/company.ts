import mongoose, { Schema, Document } from "mongoose";

export interface ICompany extends Document {
  name: string;
  location: string;
  industry: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  emailAutomationEnabled?: boolean; // Enable/disable email automation on status changes
}

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    industry: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    emailAutomationEnabled: { type: Boolean, default: true }, // Default to enabled
  },
  { timestamps: true }
);

const Company =
  mongoose.models.Company || mongoose.model<ICompany>("Company", companySchema);
export default Company;
