import { Router } from "express";
import { z } from "zod";
import { Appointment } from "../models/Appointment";
import { Doctor } from "../models/Doctor";

const router = Router();

const bodySchema = z.object({
  doctorId: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
});

// GET /api/appointments — only the current user's own appointments, latest first.
router.get("/", async (req, res) => {
  const appointments = await Appointment.find({
    instituteId: req.user!.instituteId,
    userId: req.user!.userId,
  }).sort({ createdAt: -1 });
  res.json({ appointments });
});

// POST /api/appointments — any authenticated user books for themselves.
router.post("/", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid input" });
  }
  const { doctorId, date, time } = parsed.data;

  const doctor = await Doctor.findById(doctorId);
  if (!doctor || doctor.instituteId.toString() !== req.user!.instituteId) {
    return res.status(404).json({ error: "Doctor not found" });
  }

  const appointment = await Appointment.create({
    instituteId: req.user!.instituteId,
    userId: req.user!.userId,
    doctorId: doctor._id,
    doctorName: doctor.name,
    date,
    time,
  });
  res.status(201).json({ appointment });
});

// PATCH /api/appointments/:id — cancel your own appointment (only status change allowed).
router.patch("/:id", async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (
    !appointment ||
    appointment.instituteId.toString() !== req.user!.instituteId ||
    appointment.userId.toString() !== req.user!.userId
  ) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  appointment.status = "cancelled";
  await appointment.save();
  res.json({ appointment });
});

export default router;
