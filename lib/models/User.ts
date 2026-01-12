import mongoose, { Schema, Model, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: string;
  password: string;
  image?: string;
  role: "Admin" | "Manager" | "Salesman";
  managedBy?: mongoose.Schema.Types.ObjectId;
  company?: mongoose.Schema.Types.ObjectId;
  passwordResetToken?: string;
  passwordResetTokenExpires?: Date;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  login_status: "Online" | "Offline";
  createdBy?: mongoose.Schema.Types.ObjectId;
  status: "Enabled" | "Disabled";
  languages?: string[];
  voipExtension?: string[];
  ipRestriction?: {
    enabled: boolean;
  };
  telegramChatId?: string;
  username?: string; // Keep for backward compatibility
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const UserSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: { type: String, required: false },
    lastName: { type: String, required: false },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phone: { type: String, required: false },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    image: { type: String, required: false },
    address: { type: String, required: false },
    role: {
      type: String,
      enum: ["Admin", "Manager", "Salesman"],
      default: "Salesman",
      required: true,
    },
    managedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: false,
    },
    passwordResetToken: { type: String },
    passwordResetTokenExpires: { type: Date },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    login_status: {
      type: String,
      enum: ["Online", "Offline"],
      default: "Offline",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    status: {
      type: String,
      enum: ["Enabled", "Disabled"],
      default: "Enabled",
    },
    languages: {
      type: [String],
      required: false,
    },
    voipExtension: {
      type: [String],
      required: false,
      default: [],
    },
    ipRestriction: {
      enabled: {
        type: Boolean,
        default: false,
      },
    },
    telegramChatId: { type: String, required: false },
    username: { type: String, required: false, unique: false }, // Keep for backward compatibility
  },
  {
    timestamps: true,
  }
);

// Method to compare passwords
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Prevent model recompilation in development
const User =
  (mongoose.models.User as UserModel) ||
  mongoose.model<IUser, UserModel>("User", UserSchema);

export default User;
