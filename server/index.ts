import "dotenv/config";
import mentalHealthRoute from "./routes/mentalHealth";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { handleDemo } from "./routes/demo";
import { connectDB } from "./db";
import authRoutes from "./routes/auth";
import instituteRoutes from "./routes/institutes";
import noticesRoutes from "./routes/notices";
import { requireAuth } from "./middleware/requireAuth";

export function createServer() {
  const app = express();

  // Connect to MongoDB once per warm container (guarded internally).
  connectDB().catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });

  // Middleware
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  // serverless-http can pre-populate req.body as a raw Buffer before Express's
  // own json parser runs, causing express.json() to skip parsing entirely.
  // This normalizes that case so req.body is always a proper parsed object.
  app.use((req, _res, next) => {
    if (Buffer.isBuffer(req.body)) {
      const raw = req.body.toString("utf8");
      try {
        req.body = raw ? JSON.parse(raw) : {};
      } catch {
        req.body = {};
      }
    }
    next();
  });

  app.use(cookieParser());
  app.use("/api", mentalHealthRoute);

  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Public
  app.use("/api", authRoutes);
  app.use("/api", instituteRoutes);

  // Authenticated
  app.use("/api/notices", requireAuth, noticesRoutes);

  return app;
}
