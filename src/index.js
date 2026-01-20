import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dbConnect from "./configs/db.config.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { notFound } from "./middleware/notFound.js";
import { NODE_ENV, PORT } from "./configs/env.js";
import "./configs/env.js";

dotenv.config();
const app = express();
dbConnect();

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

// Parse req body into buffer for stripe webhooks signature verification
app.use("/api/v1/webhooks/stripe", express.raw({ type: "application/json" }));
app.use("/api/v1/webhooks/resend", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(
  cors({
    origin:
      NODE_ENV === "production"
        ? [
            "https://breezeway-prod.netlify.app",
            "https://bwc-admin-six.vercel.app",
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
          ]
        : [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
          ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(compression({ threshold: 1024 }));

// Route Imports
import apiRoutes from "./routes/index.js";
import { applyRateLimit } from "./middleware/applyRateLimit.js";
import { testRateLimiter } from "./middleware/rateLimit.js";
import { globalRateLimitMiddleware } from "./middleware/globalRateLimit.middleware.js";
import { testNotification } from "./modules/notifications/controllers/v1/notification.controller.js";
import { serverAdapter } from "./queues/email/email.queue.js";

app.get("/", (req, res) => {
  res.send("BWC Backend Admin is running");
});

app.get("/test", applyRateLimit(testRateLimiter), (req, res) =>
  res.send("Test route works!"),
);

app.post("/test-notification", testNotification);
app.use("/admin/queues", serverAdapter.getRouter());

// 🔥 Global rate limiter
app.use(globalRateLimitMiddleware);

// API Routes
app.use("/api", apiRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT || 5000, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
  console.log(`API v1: http://localhost:${PORT}/api/v1`);
  console.log(`Access Redis Insight GUI at http://localhost:5540`);
  console.log(
    "For the BullMQ Admin UI, open http://localhost:8080/admin/queues",
  );
});

export default app;
