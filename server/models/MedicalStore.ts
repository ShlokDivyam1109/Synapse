import { Schema, model, Types } from "mongoose";

const MedicalStoreSchema = new Schema({
  instituteId: { type: Types.ObjectId, ref: "Institute", required: true, index: true },
  name: { type: String, required: true },
  distance: { type: Number, default: 0 }, // km
  travelTime: { type: String, default: "" },
  phone: { type: String, default: "" },
  timings: { type: String, default: "" },
  address: { type: String, default: "" },
});

export const MedicalStore = model("MedicalStore", MedicalStoreSchema);
