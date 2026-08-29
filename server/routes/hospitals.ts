import { Router } from "express";
import { z } from "zod";
import { Hospital } from "../models/Hospital";

const router = Router();

const bodySchema = z.object({
  name: z.string().min(1),
  distance: z.number().optional(),
  travelTime: z.string().optional(),
  specialization: z.string().optional(),
  helpline: z.string().optional(),
  availability: z.string().optional(),
  address: z.string().optional(),
});

function requireAdmin(req: any, res: any, next: any) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

router.get("/", async (req, res) => {
  const hospitals = await Hospital.find({ instituteId: req.user!.instituteId }).sort({ distance: 1 });
  res.json({ hospitals });
});

router.post("/", requireAdmin, async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
  }
  const hospital = await Hospital.create({ ...parsed.data, instituteId: req.user!.instituteId });
  res.status(201).json({ hospital });
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const parsed = bodySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
  }
  const hospital = await Hospital.findById(req.params.id);
  if (!hospital || hospital.instituteId.toString() !== req.user!.instituteId) {
    return res.status(404).json({ error: "Hospital not found" });
  }
  Object.assign(hospital, parsed.data);
  await hospital.save();
  res.json({ hospital });
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const hospital = await Hospital.findById(req.params.id);
  if (!hospital || hospital.instituteId.toString() !== req.user!.instituteId) {
    return res.status(404).json({ error: "Hospital not found" });
  }
  await hospital.deleteOne();
  res.json({ ok: true });
});

export default router;
