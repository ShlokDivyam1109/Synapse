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

// POST /api/enrollments — self-service: a user enrolls THEMSELVES in a course.
// courseId comes from the body, but userId is always req.user.userId — never trust
// a client-supplied userId here, or any student could enroll on another's behalf.
router.post("/", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
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
      userId: req.user!.userId,
      courseId: course._id,
      semesterName: course.semesterName,
    });
    res.status(201).json({ enrollment });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Already enrolled in this course" });
    }
    throw err;
  }
});

// DELETE /api/enrollments/:courseId — self-service unenroll. Scoped to the current
// user's own enrollment only — there is no path for unenrolling someone else here.
router.delete("/:courseId", async (req, res) => {
  const result = await Enrollment.findOneAndDelete({
    instituteId: req.user!.instituteId,
    userId: req.user!.userId,
    courseId: req.params.courseId,
  });
  if (!result) return res.status(404).json({ error: "Enrollment not found" });
  res.json({ ok: true });
});

export default router;
