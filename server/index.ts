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
import academicEventsRoutes from "./routes/academicEvents";
import healthCentreRoutes from "./routes/healthCentre";
import doctorsRoutes from "./routes/doctors";
import hospitalsRoutes from "./routes/hospitals";
import medicalStoresRoutes from "./routes/medicalStores";
import appointmentsRoutes from "./routes/appointments";
import coursesRoutes from "./routes/courses";
import gradesRoutes from "./routes/grades";

export function createServer() {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));

  // Every request waits for the (cached, reused-on-warm-containers) DB connection
  // before reaching any route. Without this, a cold serverless invocation can let
  // a route's query run before the connection exists — Mongoose then queues
  // ("buffers") that query and only fails after a 10s timeout instead of
  // immediately. Failing fast here with a 503 is far more diagnosable.
  app.use(async (_req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (err) {
      console.error("MongoDB connection error:", (err as Error).message);
      res.status(503).json({ error: "Database unavailable, please try again shortly" });
    }
  });

  // Middleware
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
  app.use("/api/academic-events", requireAuth, academicEventsRoutes);
  app.use("/api/health-centre", requireAuth, healthCentreRoutes);
  app.use("/api/doctors", requireAuth, doctorsRoutes);
  app.use("/api/hospitals", requireAuth, hospitalsRoutes);
  app.use("/api/medical-stores", requireAuth, medicalStoresRoutes);
  app.use("/api/appointments", requireAuth, appointmentsRoutes);
  app.use("/api/courses", requireAuth, coursesRoutes);
  app.use("/api/grades", requireAuth, gradesRoutes);
  return app;
}
