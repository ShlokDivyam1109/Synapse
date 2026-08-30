import { Schema, model, Types } from "mongoose";

const GradeSchema = new Schema({
  instituteId: { type: Types.ObjectId, ref: "Institute", required: true, index: true },
  userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  semesterNumber: { type: Number, required: true },
  semesterName: { type: String, required: true },
  program: { type: String, required: true },
  code: { type: String, required: true },
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ["Institute Core", "Program Core", "Program Linked", "Liberal Art", "Non-graded"],
    required: true,
  },
  credits: { type: Number, required: true },
  grade: {
    type: String,
    enum: ["A+", "A", "A-", "B", "B-", "C", "C-", "D", "F", "In Progress"],
    required: true,
  },
});

GradeSchema.index({ instituteId: 1, userId: 1, semesterNumber: 1 });

export const Grade = model("Grade", GradeSchema);
