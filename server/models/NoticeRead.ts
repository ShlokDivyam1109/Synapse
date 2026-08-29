import { Schema, model, Types } from "mongoose";

const NoticeReadSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  noticeId: { type: Types.ObjectId, ref: "Notice", required: true, index: true },
  readAt: { type: Date, default: Date.now },
});
NoticeReadSchema.index({ userId: 1, noticeId: 1 }, { unique: true });

export const NoticeRead = model("NoticeRead", NoticeReadSchema);
