import { Router } from "express";
import { z } from "zod";
import { HealthCentre } from "../models/HealthCentre";

const router = Router();

const bodySchema = z.object({
  name: z.string().min(1),
  tagline: z.string().optional(),
  address: z.string().optional(),
  mapsDestination: z.string().optional(),
  timings: z.string().optional(),
  emergencyContacts: z
    .array(z.object({ title: z.string().min(1), number: z.string().min(1) }))
    .optional(),
});

function requireAdmin(req: any, res: any, next: any) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// GET /api/health-centre — this institute's own centre. 404 if not yet configured.
router.get("/", async (req, res) => {
  const centre = await HealthCentre.findOne({ instituteId: req.user!.instituteId });
  if (!centre) return res.status(404).json({ error: "Health centre not configured for this institute" });
  res.json({ healthCentre: centre });
});

// PUT /api/health-centre — admin only, upserts the single record for this institute.
router.put("/", requireAdmin, async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
  }
  const centre = await HealthCentre.findOneAndUpdate(
    { instituteId: req.user!.instituteId },
    { ...parsed.data, instituteId: req.user!.instituteId },
    { upsert: true, new: true },
  );
  res.json({ healthCentre: centre });
});

export default router;
