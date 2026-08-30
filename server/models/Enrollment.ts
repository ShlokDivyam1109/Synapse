import { Schema, model, Types } from "mongoose";

const EnrollmentSchema = new Schema({
  instituteId: { type: Types.ObjectId, ref: "Institute", required: true, index: true },
  userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  courseId: { type: Types.ObjectId, ref: "Course", required: true, index: true },
  semesterName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// A student can only enroll in the same course once.
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Enrollment = model("Enrollment", EnrollmentSchema);
