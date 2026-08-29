import { Router } from "express";
import { z } from "zod";
import { AcademicEvent } from "../models/AcademicEvent";

const router = Router();

const eventBodySchema = z.object({
  title: z.string().min(1),
  date: z.string().min(1),
  type: z.enum(["exam", "holiday", "event", "deadline", "semester"]),
  description: z.string().min(1),
  time: z.string().optional(),
});

function requireAdmin(req: any, res: any, next: any) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// GET /api/academic-events — instituteId-scoped, optional ?type= filter, sorted by date.
router.get("/", async (req, res) => {
  const { type } = req.query as Record<string, string>;

  const query: Record<string, unknown> = { instituteId: req.user!.instituteId };
  if (type) query.type = type;

  const events = await AcademicEvent.find(query).sort({ date: 1 });
  res.json({ events });
});

// GET /api/academic-events/:id — same-institute check, 404 (not 403) if elsewhere.
router.get("/:id", async (req, res) => {
  const event = await AcademicEvent.findById(req.params.id);
  if (!event || event.instituteId.toString() !== req.user!.instituteId) {
    return res.status(404).json({ error: "Event not found" });
  }
  res.json({ event });
});

// POST /api/academic-events — admin only.
router.post("/", requireAdmin, async (req, res) => {
  const parsed = eventBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
  }
  const event = await AcademicEvent.create({
    ...parsed.data,
    instituteId: req.user!.instituteId,
    createdBy: req.user!.userId,
  });
  res.status(201).json({ event });
});

// PATCH /api/academic-events/:id — admin only, same-institute check.
router.patch("/:id", requireAdmin, async (req, res) => {
  const parsed = eventBodySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
  }
  const event = await AcademicEvent.findById(req.params.id);
  if (!event || event.instituteId.toString() !== req.user!.instituteId) {
    return res.status(404).json({ error: "Event not found" });
  }
  Object.assign(event, parsed.data);
  await event.save();
  res.json({ event });
});

// DELETE /api/academic-events/:id — admin only, same-institute check.
router.delete("/:id", requireAdmin, async (req, res) => {
  const event = await AcademicEvent.findById(req.params.id);
  if (!event || event.instituteId.toString() !== req.user!.instituteId) {
    return res.status(404).json({ error: "Event not found" });
  }
  await event.deleteOne();
  res.json({ ok: true });
});

export default router;
