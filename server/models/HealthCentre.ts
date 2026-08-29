import { Schema, model, Types } from "mongoose";

const HealthCentreSchema = new Schema({
  instituteId: { type: Types.ObjectId, ref: "Institute", required: true, unique: true, index: true },
  name: { type: String, required: true }, // e.g. "Sushrut Health Centre, IIT Bhilai"
  tagline: { type: String, default: "" },
  address: { type: String, default: "" },
  mapsDestination: { type: String, default: "" }, // full string passed to Google Maps directions
  timings: { type: String, default: "" },
  emergencyContacts: [
    {
      title: { type: String, required: true },
      number: { type: String, required: true },
    },
  ],
});

export const HealthCentre = model("HealthCentre", HealthCentreSchema);
