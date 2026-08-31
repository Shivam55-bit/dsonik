const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();

// =========================
// Trust Nginx Reverse Proxy
// =========================
app.set("trust proxy", 1);

// =========================
// Security
// =========================
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// =========================
// Body Parser
// =========================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// =========================
// Allowed Origins
// =========================
const envAllowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
  : [];

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  ...envAllowedOrigins,

  "https://dsonik.onrender.com",
  "https://dsonik-admin.onrender.com",
  "https://naflines.tech",
  "https://naflines.tech/dsonik",
  "https://naflines.tech/dsonik/admin",

  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5176",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:5001",
].filter(Boolean);

// =========================
// CORS
// =========================
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      try {
        const normalizedOrigin = origin.replace(/\/$/, "");
        const hostname = new URL(origin).hostname;

        const isAllowed =
          allowedOrigins.some((o) => o.replace(/\/$/, "") === normalizedOrigin) ||
          hostname.endsWith(".onrender.com") ||
          hostname.endsWith(".naflines.tech") ||
          hostname === "naflines.tech" ||
          hostname === "localhost" ||
          hostname === "127.0.0.1" ||
          process.env.NODE_ENV !== "production";

        if (isAllowed) {
          return callback(null, true);
        }
      } catch (err) {
        console.warn("CORS origin parse error:", err);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    exposedHeaders: ["Set-Cookie"],
  })
);

// =========================
// Uploads
// =========================
const uploadsPath = path.resolve(__dirname, "../uploads");

console.log("Serving uploads from:", uploadsPath);

app.use(
  "/uploads",
  express.static(uploadsPath, {
    fallthrough: true,
    maxAge: "7d",
  })
);

// =========================
// Rate Limiter
// =========================
const limiter = require("./middleware/rateLimit");

if (process.env.NODE_ENV !== "test") {
  app.use(limiter);
}

// =========================
// Health Check & Root Info
// =========================
const healthHandler = (req, res) => {
  res.json({
    success: true,
    status: "ok",
    message: "DSONIK API Server Healthy",
    dbName: mongoose.connection.name,
    dbState: mongoose.connection.readyState,
    environment: process.env.NODE_ENV,
  });
};

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "DSONIK API Server is running",
    version: "1.0.0",
    status: "active",
    healthCheck: "/health",
  });
});

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "DSONIK API Endpoints available",
    status: "active",
  });
});

app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

// =========================
// Database
// =========================
const connectDB = require("./config/db");

connectDB();

// =========================
// Public Routes
// =========================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/banners", require("./routes/banners"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/payment-settings", require("./routes/paymentSettings"));
app.use("/api/checkout", require("./routes/checkout"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/inquiries", require("./routes/inquiries"));
app.use("/api/testimonials", require("./routes/testimonials"));
app.use("/api/achievements", require("./routes/achievements"));
app.use("/api/faqs", require("./routes/faqs"));
app.use("/api/site-content", require("./routes/siteContent"));
app.use("/api/contact-info", require("./routes/contactInfo"));
app.use("/api/clients", require("./routes/clients"));

// =========================
// Admin Routes
// =========================
app.use("/api/admin/products", require("./routes/admin/products"));
app.use("/api/admin/categories", require("./routes/admin/categories"));
app.use("/api/admin/banners", require("./routes/admin/banners"));
app.use("/api/admin/users", require("./routes/admin/users"));
app.use("/api/admin/uploads", require("./routes/admin/uploads"));
app.use("/api/admin/payment-settings", require("./routes/admin/paymentSettings"));
app.use("/api/admin/orders", require("./routes/admin/orders"));
app.use("/api/admin/inquiries", require("./routes/inquiries"));
app.use("/api/admin/testimonials", require("./routes/admin/testimonials"));
app.use("/api/admin/achievements", require("./routes/admin/achievements"));
app.use("/api/admin/faqs", require("./routes/admin/faqs"));
app.use("/api/admin/site-content", require("./routes/admin/siteContent"));
app.use("/api/admin/contact-info", require("./routes/admin/contactInfo"));
app.use("/api/admin/clients", require("./routes/admin/clients"));

// =========================
// 404 Handler
// =========================
const notFound = require("./middleware/notFound");
app.use(notFound);

// =========================
// Error Handler
// =========================
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

module.exports = app;