import { Router } from "express";
import { z } from "zod";
import { Grade } from "../models/Grade";
import { semesterSortKey } from "../lib/semester";

const router = Router();

const gradeBodySchema = z.object({
  userId: z.string().min(1),
  semesterNumber: z.number(),
  semesterName: z.string().min(1),
  program: z.string().min(1),
  code: z.string().min(1),
  title: z.string().min(1),
  type: z.enum(["Institute Core", "Program Core", "Program Linked", "Liberal Art", "Non-graded"]),
  credits: z.number(),
  grade: z.enum(["A+", "A", "A-", "B", "B-", "C", "C-", "D", "F", "In Progress"]),
});

function requireAdmin(req: any, res: any, next: any) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// GET /api/grades — ALWAYS scoped to req.user.userId, never to a value from the client.
// A student must never be able to read another student's transcript by passing a
// different id — there is intentionally no ?userId= override here, admin included.
router.get("/", async (req, res) => {
  const grades = await Grade.find({
    instituteId: req.user!.instituteId,
    userId: req.user!.userId,
  });

  // Grouped by semesterName rather than the stored semesterNumber: that field has
  // drifted out of sync across seed scripts (the same semester has been assigned
  // different numbers in different places), which could otherwise split one real
  // semester's grades into two separate groups.
  const bySemester = new Map<
    string,
    { name: string; program: string; courses: any[] }
  >();
  for (const g of grades) {
    if (!bySemester.has(g.semesterName)) {
      bySemester.set(g.semesterName, {
        name: g.semesterName,
        program: g.program,
        courses: [],
      });
    }
    bySemester.get(g.semesterName)!.courses.push({
      code: g.code,
      title: g.title,
      type: g.type,
      credits: g.credits,
      grade: g.grade,
    });
  }

  // Oldest semester first, ordered correctly within an academic year (M before W).
  // `semester` is a clean sequential ordinal (1, 2, 3…) assigned after sorting —
  // the client displays this directly and uses it as a selection key, so it must
  // reflect the correct order rather than any stored (unreliable) value.
  const semesters = Array.from(bySemester.values())
    .sort((a, b) => semesterSortKey(a.name) - semesterSortKey(b.name))
    .map((sem, index) => ({ semester: index + 1, ...sem }));

  res.json({ semesters });
});

// POST /api/grades — admin only: record a grade for a specific student.
// This is the one place userId legitimately comes from the request body, since an
// admin is entering a grade on behalf of a student — but it's still gated by
// requireAdmin, and the student can never hit this route for themselves.
router.post("/", requireAdmin, async (req, res) => {
  const parsed = gradeBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
  }
  const { userId, ...rest } = parsed.data;
  const grade = await Grade.create({
    ...rest,
    userId,
    instituteId: req.user!.instituteId,
  });
  res.status(201).json({ grade });
});

export default router;
