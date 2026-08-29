import { Router } from "express";
import { z } from "zod";
import { MedicalStore } from "../models/MedicalStore";

const router = Router();

const bodySchema = z.object({
  name: z.string().min(1),
  distance: z.number().optional(),
  travelTime: z.string().optional(),
  phone: z.string().optional(),
  timings: z.string().optional(),
  address: z.string().optional(),
});

function requireAdmin(req: any, res: any, next: any) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

router.get("/", async (req, res) => {
  const medicalStores = await MedicalStore.find({ instituteId: req.user!.instituteId }).sort({ distance: 1 });
  res.json({ medicalStores });
});

router.post("/", requireAdmin, async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
  }
  const store = await MedicalStore.create({ ...parsed.data, instituteId: req.user!.instituteId });
  res.status(201).json({ medicalStore: store });
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const parsed = bodySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
  }
  const store = await MedicalStore.findById(req.params.id);
  if (!store || store.instituteId.toString() !== req.user!.instituteId) {
    return res.status(404).json({ error: "Medical store not found" });
  }
  Object.assign(store, parsed.data);
  await store.save();
  res.json({ medicalStore: store });
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const store = await MedicalStore.findById(req.params.id);
  if (!store || store.instituteId.toString() !== req.user!.instituteId) {
    return res.status(404).json({ error: "Medical store not found" });
  }
  await store.deleteOne();
  res.json({ ok: true });
});

export default router;
