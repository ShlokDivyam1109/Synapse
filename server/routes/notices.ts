import { Router } from "express";
import { z } from "zod";
import { Notice } from "../models/Notice";
import { NoticeRead } from "../models/NoticeRead";

const router = Router();

const noticeBodySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  fullContent: z.string().optional(),
  date: z.string().min(1),
  time: z.string().optional(),
  category: z.string().min(1),
  priority: z.enum(["urgent", "high", "medium", "low"]).optional(),
  department: z.string().optional(),
  issuedBy: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  pinned: z.boolean().optional(),
});

function requireAdmin(req: any, res: any, next: any) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// GET /api/notices — instituteId-scoped, filterable, paginated, attaches per-user read state.
router.get("/", async (req, res) => {
  const { category, priority, search, page = "1", limit = "20" } = req.query as Record<string, string>;

  const query: Record<string, unknown> = { instituteId: req.user!.instituteId };
  if (category) query.category = category;
  if (priority) query.priority = priority;
  if (search) {
    const regex = new RegExp(search, "i");
    query.$or = [{ title: regex }, { description: regex }];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 20);

  const [notices, total, readRows] = await Promise.all([
    Notice.find(query)
      .sort({ pinned: -1, createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Notice.countDocuments(query),
    NoticeRead.find({ userId: req.user!.userId }).select("noticeId"),
  ]);

  const readSet = new Set(readRows.map((r) => r.noticeId.toString()));
  const withReadState = notices.map((n) => ({
    ...n.toObject(),
    isRead: readSet.has(n._id.toString()),
  }));

  res.json({ notices: withReadState, total, page: pageNum, limit: limitNum });
});

// GET /api/notices/:id — same-institute check, 404 (not 403) if it belongs elsewhere.
router.get("/:id", async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  if (!notice || notice.instituteId.toString() !== req.user!.instituteId) {
    return res.status(404).json({ error: "Notice not found" });
  }
  const readRow = await NoticeRead.findOne({ userId: req.user!.userId, noticeId: notice._id });
  res.json({ notice: { ...notice.toObject(), isRead: !!readRow } });
});

// POST /api/notices — admin only.
router.post("/", requireAdmin, async (req, res) => {
  const parsed = noticeBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
  }
  const notice = await Notice.create({
    ...parsed.data,
    instituteId: req.user!.instituteId,
    createdBy: req.user!.userId,
  });
  res.status(201).json({ notice });
});

// PATCH /api/notices/:id — admin only, same-institute check.
router.patch("/:id", requireAdmin, async (req, res) => {
  const parsed = noticeBodySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
  }
  const notice = await Notice.findById(req.params.id);
  if (!notice || notice.instituteId.toString() !== req.user!.instituteId) {
    return res.status(404).json({ error: "Notice not found" });
  }
  Object.assign(notice, parsed.data);
  await notice.save();
  res.json({ notice });
});

// DELETE /api/notices/:id — admin only, same-institute check.
router.delete("/:id", requireAdmin, async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  if (!notice || notice.instituteId.toString() !== req.user!.instituteId) {
    return res.status(404).json({ error: "Notice not found" });
  }
  await notice.deleteOne();
  res.json({ ok: true });
});

// POST /api/notices/:id/read — upsert read state for the current user.
router.post("/:id/read", async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  if (!notice || notice.instituteId.toString() !== req.user!.instituteId) {
    return res.status(404).json({ error: "Notice not found" });
  }
  await NoticeRead.updateOne(
    { userId: req.user!.userId, noticeId: notice._id },
    { $setOnInsert: { readAt: new Date() } },
    { upsert: true },
  );
  res.json({ ok: true });
});

export default router;
