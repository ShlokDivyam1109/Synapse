import { Schema, model, Types } from "mongoose";

const ComplaintSchema = new Schema({
  instituteId: { type: Types.ObjectId, ref: "Institute", required: true, index: true },
  userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, required: true }, // "Electricity", "Water", "WiFi", "Furniture", "Other"
  description: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Resolved"], default: "Pending" },
  complainerName: { type: String, required: true }, // denormalized display value
  roomNo: { type: String, required: true }, // denormalized display value
  createdAt: { type: Date, default: Date.now },
});

export const Complaint = model("Complaint", ComplaintSchema);
