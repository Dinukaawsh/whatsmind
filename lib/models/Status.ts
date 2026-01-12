import mongoose, { Schema, Model, Document } from "mongoose";

export interface IStatus extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  isLocked: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  visibleToAll: boolean;
  visibleToCompanies?: mongoose.Types.ObjectId[];
  color: string;
  order: number;
}

type StatusModel = Model<IStatus>;

const StatusSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    isLocked: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    visibleToAll: { type: Boolean, default: true },
    visibleToCompanies: [{ type: Schema.Types.ObjectId, ref: "Company" }],
    color: { type: String, default: "#8cff97" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Status =
  (mongoose.models.Status as StatusModel) ||
  mongoose.model<IStatus, StatusModel>("Status", StatusSchema);

export default Status;
