import { Router } from "express";
import { z } from "zod";
import { Course } from "../models/Course";

const router = Router();

const courseBodySchema = z.object({
  program: z.string().min(1),
  semesterNumber: z.number(),
  semesterName: z.string().min(1),
  code: z.string().min(1),
  title: z.string().min(1),
  type: z.enum(["Institute Core", "Program Core", "Program Linked", "Liberal Art", "Non-graded"]),
  credits: z.number(),
  faculty: z.string().min(1),
  lastUpdated: z.string().optional(),
});

function requireAdmin(req: any, res: any, next: any) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// GET /api/courses — instituteId-scoped, optional ?program= filter.
// Grouped server-side into the { name, program, courses: [...] } shape the frontend
// already renders, sorted newest semester first (matches the original mock order).
router.get("/", async (req, res) => {
  const { program } = req.query as Record<string, string>;

  const query: Record<string, unknown> = { instituteId: req.user!.instituteId };
  if (program) query.program = program;

  const courses = await Course.find(query).sort({ semesterNumber: -1 });

  const bySemester = new Map<string, { name: string; program: string; courses: any[] }>();
  for (const c of courses) {
    const key = `${c.semesterName}::${c.program}`;
    if (!bySemester.has(key)) {
      bySemester.set(key, { name: c.semesterName, program: c.program, courses: [] });
    }
    bySemester.get(key)!.courses.push({
      code: c.code,
      title: c.title,
      type: c.type,
      credits: c.credits,
      faculty: c.faculty,
      lastUpdated: c.lastUpdated,
    });
  }

  res.json({ semesters: Array.from(bySemester.values()) });
});

// POST /api/courses — admin only: add a course to the catalog.
router.post("/", requireAdmin, async (req, res) => {
  const parsed = courseBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
  }
  const course = await Course.create({ ...parsed.data, instituteId: req.user!.instituteId });
  res.status(201).json({ course });
});

export default router;
