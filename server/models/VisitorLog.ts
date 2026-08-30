import { Schema, model, Types } from "mongoose";

const VisitorLogSchema = new Schema({
  instituteId: { type: Types.ObjectId, ref: "Institute", required: true, index: true },
  userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true },
  relation: { type: String, required: true },
  visitDate: { type: String, required: true },
  status: { type: String, enum: ["Approved", "Pending"], default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

export const VisitorLog = model("VisitorLog", VisitorLogSchema);
