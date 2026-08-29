import { Schema, model, Types } from "mongoose";

const NoticeSchema = new Schema({
  instituteId: { type: Types.ObjectId, ref: "Institute", required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  fullContent: { type: String, default: "" },
  date: { type: String, required: true }, // "YYYY-MM-DD" — matches existing mock shape
  time: { type: String, default: "" }, // e.g. "10:30 AM"
  category: { type: String, required: true, index: true }, // free-text in the current UI (Exam, Placement, Hostel, ...)
  priority: {
    type: String,
    enum: ["urgent", "high", "medium", "low"],
    default: "medium",
  },
  department: { type: String, default: "" },
  issuedBy: { type: String, default: "" },
  attachments: [{ type: String }], // filenames, matches current mock (no file hosting yet — see non-goals)
  pinned: { type: Boolean, default: false },
  createdBy: { type: Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export const Notice = model("Notice", NoticeSchema);
