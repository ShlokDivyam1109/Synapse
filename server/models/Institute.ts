import { Schema, model } from "mongoose";

const InstituteSchema = new Schema({
  name: { type: String, required: true },
  domain: { type: String, required: true, unique: true }, // e.g. "iitbhilai.ac.in" — used to auto-match signups by email domain
  city: String,
  createdAt: { type: Date, default: Date.now },
});

export const Institute = model("Institute", InstituteSchema);
