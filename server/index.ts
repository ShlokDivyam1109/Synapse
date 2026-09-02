import "dotenv/config";
import mentalHealthRoute from "./routes/mentalHealth";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
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
import enrollmentsRoutes from "./routes/enrollments";
import timetableRoutes from "./routes/timetable";
import hostelRoomRoutes from "./routes/hostelRoom";
import hostelRulesRoutes from "./routes/hostelRules";
import hostelNoticesRoutes from "./routes/hostelNotices";
import complaintsRoutes from "./routes/complaints";
import visitorsRoutes from "./routes/visitors";
import tasksRoutes from "./routes/tasks";
import attendanceRoutes from "./routes/attendance";

export function createServer() {
  const app = express();

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

  // Mounted before the DB-connect middleware below: this route calls Gemini
  // only and never touches Mongo, so it shouldn't be blocked by (or count
  // against the request's time budget for) a slow/cold Atlas connection.
  app.use("/api", mentalHealthRoute);

  // Every request from here down waits for the (cached, reused-on-warm-containers) DB connection
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

  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));

  // Healthcheck
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

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
  app.use("/api/enrollments", requireAuth, enrollmentsRoutes);
  app.use("/api/timetable", requireAuth, timetableRoutes);
  app.use("/api/hostel-room", requireAuth, hostelRoomRoutes);
  app.use("/api/hostel-rules", requireAuth, hostelRulesRoutes);
  app.use("/api/hostel-notices", requireAuth, hostelNoticesRoutes);
  app.use("/api/complaints", requireAuth, complaintsRoutes);
  app.use("/api/visitors", requireAuth, visitorsRoutes);
  app.use("/api/tasks", requireAuth, tasksRoutes);
  app.use("/api/attendance", requireAuth, attendanceRoutes);
  return app;
}
