/**
 * Script to create a user in the database
 * Usage: node scripts/createUser.js
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");

// Load environment variables from .env
require("dotenv").config({ path: ".env" });

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/whatsmind";
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || "whatsmind";

// User Schema (matching the TypeScript model)
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function createUser() {
  try {
    // Connect to MongoDB
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DATABASE,
    });
    console.log("✅ Connected to MongoDB\n");

    // Get user input
    const email = await question("Enter email: ");
    const username = await question("Enter username: ");
    const password = await question("Enter password: ");

    if (!email || !username || !password) {
      console.error("❌ All fields are required!");
      process.exit(1);
    }

    // Hash password
    console.log("\n🔐 Hashing password...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    console.log("👤 Creating user...");
    const user = new User({
      email: email.toLowerCase().trim(),
      username: username.trim(),
      password: hashedPassword,
    });

    await user.save();

    console.log("\n✅ User created successfully!");
    console.log("📧 Email:", user.email);
    console.log("👤 Username:", user.username);
    console.log("🆔 User ID:", user._id);
  } catch (error) {
    console.error("\n❌ Error creating user:", error.message);
    if (error.code === 11000) {
      console.error("A user with this email or username already exists!");
    }
  } finally {
    rl.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

createUser();
