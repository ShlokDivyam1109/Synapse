import { Router } from "express";
import { z } from "zod";
import { VisitorLog } from "../models/VisitorLog";

const router = Router();

const bodySchema = z.object({
  name: z.string().min(1),
  relation: z.string().min(1),
  visitDate: z.string().min(1),
});

// GET /api/visitors — ALWAYS scoped to req.user.userId, same rule as complaints/grades.
router.get("/", async (req, res) => {
  const visitors = await VisitorLog.find({
    instituteId: req.user!.instituteId,
    userId: req.user!.userId,
  }).sort({ createdAt: -1 });
  res.json({ visitors });
});

router.post("/", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
  }
  const visitor = await VisitorLog.create({
    ...parsed.data,
    instituteId: req.user!.instituteId,
    userId: req.user!.userId,
  });
  res.status(201).json({ visitor });
});

export default router;
