import { Schema, model, Types } from "mongoose";

const AttendanceSchema = new Schema({
  instituteId: { type: Types.ObjectId, ref: "Institute", required: true, index: true },
  userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  courseId: { type: Types.ObjectId, ref: "Course", required: true, index: true },
  totalClasses: { type: Number, default: 0 },
  attendedClasses: { type: Number, default: 0 },
  lastUpdated: { type: String, default: "" },
});
AttendanceSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Attendance = model("Attendance", AttendanceSchema);
