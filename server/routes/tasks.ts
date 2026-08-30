import { Router } from "express";
import { z } from "zod";
import { Task } from "../models/Task";

const router = Router();

const bodySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(["assignment", "exam-prep", "personal", "study", "other"]).optional(),
  deadline: z.string().min(1),
  time: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

// GET /api/tasks — ALWAYS scoped to req.user.userId; a task list is personal, never
// shared even within the same institute.
router.get("/", async (req, res) => {
  const tasks = await Task.find({
    instituteId: req.user!.instituteId,
    userId: req.user!.userId,
  }).sort({ createdAt: -1 });
  res.json({ tasks });
});

router.post("/", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
  }
  const task = await Task.create({
    ...parsed.data,
    instituteId: req.user!.instituteId,
    userId: req.user!.userId,
  });
  res.status(201).json({ task });
});

router.patch("/:id", async (req, res) => {
  const parsed = bodySchema.partial().extend({ status: z.enum(["pending", "finished", "unfinished"]).optional() }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
  }
  const task = await Task.findOne({ _id: req.params.id, userId: req.user!.userId });
  if (!task) return res.status(404).json({ error: "Task not found" });
  Object.assign(task, parsed.data);
  await task.save();
  res.json({ task });
});

router.delete("/:id", async (req, res) => {
  const result = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
  if (!result) return res.status(404).json({ error: "Task not found" });
  res.json({ ok: true });
});

export default router;
