import { Schema, model, Types } from "mongoose";

const CourseSchema = new Schema({
  instituteId: { type: Types.ObjectId, ref: "Institute", required: true, index: true },
  program: { type: String, required: true },
  semesterNumber: { type: Number, required: true },
  semesterName: { type: String, required: true }, // e.g. "2025-26-W"
  code: { type: String, required: true },
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ["Institute Core", "Program Core", "Program Linked", "Liberal Art", "Non-graded"],
    required: true,
  },
  credits: { type: Number, required: true },
  faculty: { type: String, required: true },
  lastUpdated: { type: String, default: "" },
  // Weekly schedule slot for this course offering. A course has one fixed slot per
  // semester in this model (single-section courses) — every student enrolled in it
  // meets at the same day/time/room. Multi-section scheduling is out of scope for now.
  day: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    required: true,
  },
  time: { type: String, required: true }, // e.g. "14:30 - 15:30"
  room: { type: String, required: true },
});

CourseSchema.index({ instituteId: 1, semesterNumber: 1 });

export const Course = model("Course", CourseSchema);
