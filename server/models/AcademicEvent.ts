import { Schema, model, Types } from "mongoose";

const AcademicEventSchema = new Schema({
  instituteId: { type: Types.ObjectId, ref: "Institute", required: true, index: true },
  title: { type: String, required: true },
  date: { type: String, required: true, index: true }, // "YYYY-MM-DD" — matches existing mock shape
  type: {
    type: String,
    enum: ["exam", "holiday", "event", "deadline", "semester"],
    required: true,
  },
  description: { type: String, required: true },
  time: { type: String, default: "" },
  createdBy: { type: Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export const AcademicEvent = model("AcademicEvent", AcademicEventSchema);
