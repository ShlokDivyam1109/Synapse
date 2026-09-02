import { Router } from "express";
import { z } from "zod";
import { Course } from "../models/Course";
import { Enrollment } from "../models/Enrollment";
import { semesterSortKey } from "../lib/semester";

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
  day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]),
  time: z.string().min(1),
  room: z.string().min(1),
});

function requireAdmin(req: any, res: any, next: any) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// GET /api/courses — instituteId-scoped, optional ?program= filter.
// Grouped server-side into the { name, program, courses: [...] } shape the frontend
// already renders, sorted newest semester first. Each course carries an `enrolled`
// flag for the current user, driven by a single query against their own Enrollment
// records — never trust a client-supplied enrolled state.
router.get("/", async (req, res) => {
  const { program } = req.query as Record<string, string>;

  const query: Record<string, unknown> = { instituteId: req.user!.instituteId };
  if (program) query.program = program;

  const courses = await Course.find(query);

  const myEnrollments = await Enrollment.find({ userId: req.user!.userId });
  const enrolledCourseIds = new Set(myEnrollments.map((e) => e.courseId.toString()));

  const bySemester = new Map<
    string,
    { name: string; programs: Set<string>; courses: any[] }
  >();
  for (const c of courses) {
    if (!bySemester.has(c.semesterName)) {
      bySemester.set(c.semesterName, { name: c.semesterName, programs: new Set(), courses: [] });
    }
    const group = bySemester.get(c.semesterName)!;
    group.programs.add(c.program);
    group.courses.push({
      id: c._id,
      code: c.code,
      title: c.title,
      type: c.type,
      credits: c.credits,
      faculty: c.faculty,
      lastUpdated: c.lastUpdated,
      day: c.day,
      time: c.time,
      room: c.room,
      enrolled: enrolledCourseIds.has(c._id.toString()),
    });
  }

  // Newest semester first, ordered correctly within an academic year (M before W)
  // regardless of any stale semesterNumber value on the underlying documents.
  // `program` is now the distinct set of programs present in that semester
  // (joined for display), since courses are no longer split by program.
  const semesters = Array.from(bySemester.values())
    .map((g) => ({
      name: g.name,
      program: Array.from(g.programs).sort().join(", "),
      courses: g.courses,
    }))
    .sort((a, b) => semesterSortKey(b.name) - semesterSortKey(a.name));

  res.json({ semesters });
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
