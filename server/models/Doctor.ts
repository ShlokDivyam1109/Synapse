import { Schema, model, Types } from "mongoose";

const AvailabilitySlotSchema = new Schema(
  {
    day: { type: String, required: true },
    weeks: [{ type: Number }], // 1-5, which weeks of the month
    start: { type: String, required: true }, // "HH:MM" 24h
    end: { type: String, required: true },
  },
  { _id: false },
);

const DoctorSchema = new Schema({
  instituteId: { type: Types.ObjectId, ref: "Institute", required: true, index: true },
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  availableDays: { type: String, default: "" }, // display string, e.g. "Mon–Fri"
  timings: { type: String, default: "" }, // display string, e.g. "09:30 AM–06:00 PM"
  availability: [AvailabilitySlotSchema],
});

export const Doctor = model("Doctor", DoctorSchema);
