import { Router } from "express";
import { z } from "zod";
import { HostelRule } from "../models/HostelRule";

const router = Router();

function requireAdmin(req: any, res: any, next: any) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

router.get("/", async (req, res) => {
  const rules = await HostelRule.find({ instituteId: req.user!.instituteId }).sort({ order: 1 });
  res.json({ rules });
});

router.post("/", requireAdmin, async (req, res) => {
  const { text, order } = z.object({ text: z.string().min(1), order: z.number().optional() }).parse(req.body);
  const rule = await HostelRule.create({ text, order: order ?? 0, instituteId: req.user!.instituteId });
  res.status(201).json({ rule });
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const rule = await HostelRule.findById(req.params.id);
  if (!rule || rule.instituteId.toString() !== req.user!.instituteId) {
    return res.status(404).json({ error: "Rule not found" });
  }
  await rule.deleteOne();
  res.json({ ok: true });
});

export default router;
