import { Schema, model, Types } from "mongoose";

const HostelNoticeSchema = new Schema({
  instituteId: { type: Types.ObjectId, ref: "Institute", required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  dateTime: { type: Date, default: Date.now },
});

export const HostelNotice = model("HostelNotice", HostelNoticeSchema);
