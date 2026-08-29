import { Schema, model, Types } from "mongoose";

const HospitalSchema = new Schema({
  instituteId: { type: Types.ObjectId, ref: "Institute", required: true, index: true },
  name: { type: String, required: true },
  distance: { type: Number, default: 0 }, // km
  travelTime: { type: String, default: "" },
  specialization: { type: String, default: "" },
  helpline: { type: String, default: "" },
  availability: { type: String, default: "" }, // e.g. "24x7"
  address: { type: String, default: "" },
});

export const Hospital = model("Hospital", HospitalSchema);
