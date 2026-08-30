import { Router } from "express";
import { z } from "zod";
import { Enrollment } from "../models/Enrollment";
import { Course } from "../models/Course";

const router = Router();

const bodySchema = z.object({
  courseId: z.string().min(1),
});

// GET /api/enrollments/me — the current user's enrolled courses, with course details joined.
router.get("/me", async (req, res) => {
  const enrollments = await Enrollment.find({
    instituteId: req.user!.instituteId,
    userId: req.user!.userId,
  });
  const courseIds = enrollments.map((e) => e.courseId);
  const courses = await Course.find({ _id: { $in: courseIds } });
  res.json({ courses });
});

// POST /api/enrollments — admin only. Enrollment is managed by admins directly, not
// self-service by students, so this requires the admin role even though it accepts
// any userId+courseId pair (unlike most routes here, which lock to req.user.userId).
router.post("/", async (req, res) => {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Admin access required" });
  const parsed = bodySchema.extend({ userId: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
  }

  const course = await Course.findOne({
    _id: parsed.data.courseId,
    instituteId: req.user!.instituteId,
  });
  if (!course) return res.status(404).json({ error: "Course not found" });

  try {
    const enrollment = await Enrollment.create({
      instituteId: req.user!.instituteId,
      userId: parsed.data.userId,
      courseId: course._id,
    });
    res.status(201).json({ enrollment });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Already enrolled in this course" });
    }
    throw err;
  }
});

// DELETE /api/enrollments/:courseId — admin only, needs ?userId= since it's no longer
// scoped to the caller's own enrollment.
router.delete("/:courseId", async (req, res) => {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Admin access required" });
  const userId = req.query.userId as string | undefined;
  if (!userId) return res.status(400).json({ error: "userId query param required" });
  const result = await Enrollment.findOneAndDelete({
    instituteId: req.user!.instituteId,
    userId,
    courseId: req.params.courseId,
  });
  if (!result) return res.status(404).json({ error: "Enrollment not found" });
  res.json({ ok: true });
});

export default router;
