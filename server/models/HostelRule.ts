import { Schema, model, Types } from "mongoose";

const HostelRuleSchema = new Schema({
  instituteId: { type: Types.ObjectId, ref: "Institute", required: true, index: true },
  text: { type: String, required: true },
  order: { type: Number, default: 0 },
});

export const HostelRule = model("HostelRule", HostelRuleSchema);
