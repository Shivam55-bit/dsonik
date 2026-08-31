const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

let isConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1 || isConnecting) {
    return;
  }

  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/dsonik-ecommerce";

  if (!uri) {
    console.error("⚠️ MONGODB_URI is not defined in environment variables!");
    return;
  }

  isConnecting = true;

  try {
    await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });

    isConnecting = false;
    console.log("✅ MongoDB connected successfully to database:", mongoose.connection.name);

    // Automatically create default admin if not exists
    const adminEmail = (
      process.env.DEFAULT_ADMIN_EMAIL || "admin@dsonik.com"
    ).toLowerCase();

    const existingAdmin = await User.findOne({
      email: adminEmail,
    });

    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(
        process.env.DEFAULT_ADMIN_PASSWORD || "Admin@123",
        salt
      );

      await User.create({
        name: "DSONIK Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        phone: "9000000000",
      });

      console.log(`Default admin account created: ${adminEmail}`);
    }
  } catch (err) {
    isConnecting = false;
    console.error("❌ MongoDB connection error:", err.message);
    console.log("🔄 Retrying MongoDB connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
