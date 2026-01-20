import mongoose from "mongoose";
import dotenv from "dotenv";
import { ADMIN_EMAIL, ADMIN_PASSWORD, MONGO_URI } from "../configs/env.js";
import Auth from "../models/auth/auth.model.js";

// Load environment variables
dotenv.config();
const validateEnv = () => {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is missing in environment variables");
  }

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables"
    );
  }
};

const connectDB = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Database connected");
};

const createAdmin = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  // Check if an admin already exists
  const existingAdmin = await Auth.findOne({ role: "admin" });

  if (existingAdmin) {
    console.log("⚠️ Admin already exists. Skipping creation.");
    return;
  }

  // Create admin
  const admin = await Auth.create({
    email: ADMIN_EMAIL.toLowerCase(),
    password: ADMIN_PASSWORD, // will be hashed by pre-save hook
    role: "admin",
    isEmailVerified: true, // trusted creation
  });

  console.log("✅ Admin created successfully");
  console.log(`📧 Admin Email: ${admin.email}`);
};

const run = async () => {
  try {
    validateEnv();
    await connectDB();
    await createAdmin();
  } catch (error) {
    console.error("❌ Failed to create admin:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
