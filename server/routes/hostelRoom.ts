import { Router } from "express";
import { z } from "zod";
import { HostelRoom } from "../models/HostelRoom";
import { User } from "../models/User";

const router = Router();

const bodySchema = z.object({
  hostelName: z.string().min(1),
  roomNumber: z.string().min(1),
  floor: z.number(),
  roomType: z.enum(["Single", "Double"]),
});

function requireAdmin(req: any, res: any, next: any) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// GET /api/hostel-room/me — current user's own room + roommates, resolved via User.hostelRoomId.
router.get("/me", async (req, res) => {
  const me = await User.findById(req.user!.userId);
  if (!me || !me.hostelRoomId) {
    return res.status(404).json({ error: "No room assigned yet" });
  }

  const room = await HostelRoom.findById(me.hostelRoomId);
  if (!room || room.instituteId.toString() !== req.user!.instituteId) {
    return res.status(404).json({ error: "No room assigned yet" });
  }

  const roommates = await User.find({
    hostelRoomId: room._id,
    _id: { $ne: me._id },
  }).select("name studentId contact");

  res.json({
    student: {
      name: me.name,
      studentId: me.studentId,
      city: me.address,
      contactNo: me.contact,
    },
    room,
    roommates: roommates.map((r) => ({ name: r.name, rollNo: r.studentId, contactNo: r.contact })),
  });
});

// POST /api/hostel-room — admin only, creates a room.
router.post("/", requireAdmin, async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
  }
  const room = await HostelRoom.create({ ...parsed.data, instituteId: req.user!.instituteId });
  res.status(201).json({ room });
});

// POST /api/hostel-room/:id/assign — admin only, assigns a student to a room.
router.post("/:id/assign", requireAdmin, async (req, res) => {
  const { userId } = z.object({ userId: z.string().min(1) }).parse(req.body);
  const room = await HostelRoom.findById(req.params.id);
  if (!room || room.instituteId.toString() !== req.user!.instituteId) {
    return res.status(404).json({ error: "Room not found" });
  }
  const student = await User.findById(userId);
  if (!student || student.instituteId.toString() !== req.user!.instituteId) {
    return res.status(404).json({ error: "Student not found" });
  }
  student.hostelRoomId = room._id;
  await student.save();
  res.json({ ok: true });
});

export default router;
