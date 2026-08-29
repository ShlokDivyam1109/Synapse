import { Router } from "express";
import { z } from "zod";
import { Doctor } from "../models/Doctor";

const router = Router();

const slotSchema = z.object({
  day: z.string().min(1),
  weeks: z.array(z.number()),
  start: z.string().min(1),
  end: z.string().min(1),
});

const bodySchema = z.object({
  name: z.string().min(1),
  specialization: z.string().min(1),
  availableDays: z.string().optional(),
  timings: z.string().optional(),
  availability: z.array(slotSchema).optional(),
});

function requireAdmin(req: any, res: any, next: any) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

router.get("/", async (req, res) => {
  const doctors = await Doctor.find({ instituteId: req.user!.instituteId }).sort({ name: 1 });
  res.json({ doctors });
});

router.post("/", requireAdmin, async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
  }
  const doctor = await Doctor.create({ ...parsed.data, instituteId: req.user!.instituteId });
  res.status(201).json({ doctor });
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const parsed = bodySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
  }
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor || doctor.instituteId.toString() !== req.user!.instituteId) {
    return res.status(404).json({ error: "Doctor not found" });
  }
  Object.assign(doctor, parsed.data);
  await doctor.save();
  res.json({ doctor });
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor || doctor.instituteId.toString() !== req.user!.instituteId) {
    return res.status(404).json({ error: "Doctor not found" });
  }
  await doctor.deleteOne();
  res.json({ ok: true });
});

export default router;
