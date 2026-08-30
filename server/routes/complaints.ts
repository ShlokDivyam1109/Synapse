import { Router } from "express";
import { z } from "zod";
import { Complaint } from "../models/Complaint";

const router = Router();

const bodySchema = z.object({
  type: z.string().min(1),
  description: z.string().min(1),
  complainerName: z.string().min(1),
  roomNo: z.string().min(1),
});

// GET /api/complaints — ALWAYS scoped to req.user.userId, same rule as grades: a
// student must never be able to read another student's complaints.
router.get("/", async (req, res) => {
  const complaints = await Complaint.find({
    instituteId: req.user!.instituteId,
    userId: req.user!.userId,
  }).sort({ createdAt: -1 });
  res.json({ complaints });
});

router.post("/", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
  }
  const complaint = await Complaint.create({
    ...parsed.data,
    instituteId: req.user!.instituteId,
    userId: req.user!.userId,
  });
  res.status(201).json({ complaint });
});

export default router;
