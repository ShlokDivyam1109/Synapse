import { Router } from "express";
import { z } from "zod";
import { Attendance } from "../models/Attendance";
import { Course } from "../models/Course";

const router = Router();

// GET /api/attendance — ALWAYS scoped to req.user.userId, same rule as grades:
// a student must never be able to read another student's attendance record.
router.get("/", async (req, res) => {
  const records = await Attendance.find({
    instituteId: req.user!.instituteId,
    userId: req.user!.userId,
  });
  const courseIds = records.map((r) => r.courseId);
  const courses = await Course.find({ _id: { $in: courseIds } });
  const courseMap = new Map(courses.map((c) => [c._id.toString(), c]));

  const attendance = records.map((r) => {
    const course = courseMap.get(r.courseId.toString());
    const percentage = r.totalClasses > 0 ? (r.attendedClasses / r.totalClasses) * 100 : 0;
    return {
      _id: r._id,
      code: course?.code ?? "",
      title: course?.title ?? "",
      credits: course?.credits ?? 0,
      type: course?.type ?? "",
      faculty: course?.faculty ?? "",
      totalClasses: r.totalClasses,
      attendedClasses: r.attendedClasses,
      percentage: Math.round(percentage * 10) / 10,
      lastUpdated: r.lastUpdated,
      status: percentage >= 75 ? "good" : percentage >= 50 ? "warning" : "critical",
    };
  });

  res.json({ attendance });
});

// PUT /api/attendance — admin only, upserts one student's record for one course.
router.put("/", async (req, res) => {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Admin access required" });
  const parsed = z
    .object({
      userId: z.string().min(1),
      courseId: z.string().min(1),
      totalClasses: z.number(),
      attendedClasses: z.number(),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
  }
  const { userId, courseId, totalClasses, attendedClasses } = parsed.data;
  const record = await Attendance.findOneAndUpdate(
    { userId, courseId },
    {
      userId,
      courseId,
      totalClasses,
      attendedClasses,
      instituteId: req.user!.instituteId,
      lastUpdated: new Date().toISOString().slice(0, 10),
    },
    { upsert: true, new: true },
  );
  res.json({ record });
});

export default router;
