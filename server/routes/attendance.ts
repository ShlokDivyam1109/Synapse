import { Router } from "express";
import { z } from "zod";
import { Attendance } from "../models/Attendance";
import { Course } from "../models/Course";
import { semesterSortKey } from "../lib/semester";

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

  // Grouped by semesterName, same as courses.ts and grades.ts — that field has
  // drifted out of sync across seed scripts (the same semester assigned different
  // numbers in different places), which used to split one real semester's
  // attendance into multiple tabs, or merge different semesters into one.
  const bySemester = new Map<string, { name: string; program: string; records: any[] }>();

  for (const r of records) {
    const course = courseMap.get(r.courseId.toString());
    if (!course) continue; // orphaned record (course deleted) — skip rather than crash

    const percentage = r.totalClasses > 0 ? (r.attendedClasses / r.totalClasses) * 100 : 0;

    if (!bySemester.has(course.semesterName)) {
      bySemester.set(course.semesterName, {
        name: course.semesterName,
        program: course.program,
        records: [],
      });
    }
    bySemester.get(course.semesterName)!.records.push({
      _id: r._id,
      code: course.code,
      title: course.title,
      credits: course.credits,
      type: course.type,
      faculty: course.faculty,
      totalClasses: r.totalClasses,
      attendedClasses: r.attendedClasses,
      percentage: Math.round(percentage * 10) / 10,
      lastUpdated: r.lastUpdated,
    });
  }

  // Oldest semester first, ordered correctly within an academic year (M before W),
  // regardless of any stale semesterNumber value on the underlying course documents.
  const semesters = Array.from(bySemester.values()).sort(
    (a, b) => semesterSortKey(a.name) - semesterSortKey(b.name),
  );

  res.json({ semesters });
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
