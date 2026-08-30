import { Router } from "express";
import { z } from "zod";
import { HostelNotice } from "../models/HostelNotice";

const router = Router();

function requireAdmin(req: any, res: any, next: any) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

router.get("/", async (req, res) => {
  const notices = await HostelNotice.find({ instituteId: req.user!.instituteId }).sort({ dateTime: -1 });
  res.json({ notices });
});

router.post("/", requireAdmin, async (req, res) => {
  const parsed = z.object({ title: z.string().min(1), description: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
  }
  const notice = await HostelNotice.create({ ...parsed.data, instituteId: req.user!.instituteId });
  res.status(201).json({ notice });
});

export default router;
