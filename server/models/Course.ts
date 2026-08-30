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
});

CourseSchema.index({ instituteId: 1, semesterNumber: 1 });

export const Course = model("Course", CourseSchema);
