import { Schema, model, Types } from "mongoose";

const AppointmentSchema = new Schema({
  instituteId: { type: Types.ObjectId, ref: "Institute", required: true, index: true },
  userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  doctorId: { type: Types.ObjectId, ref: "Doctor", required: true },
  doctorName: { type: String, required: true }, // denormalized so history survives a doctor being edited/removed
  date: { type: String, required: true }, // "YYYY-MM-DD"
  time: { type: String, required: true },
  status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
  createdAt: { type: Date, default: Date.now },
});

export const Appointment = model("Appointment", AppointmentSchema);
