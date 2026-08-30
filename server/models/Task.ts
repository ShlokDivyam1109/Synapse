import { Schema, model, Types } from "mongoose";

const TaskSchema = new Schema({
  instituteId: { type: Types.ObjectId, ref: "Institute", required: true, index: true },
  userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  category: {
    type: String,
    enum: ["assignment", "exam-prep", "personal", "study", "other"],
    default: "other",
  },
  deadline: { type: String, required: true }, // "YYYY-MM-DD"
  time: { type: String, default: "" },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  status: { type: String, enum: ["pending", "finished", "unfinished"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export const Task = model("Task", TaskSchema);
