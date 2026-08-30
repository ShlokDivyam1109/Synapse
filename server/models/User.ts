import { Schema, model, Types } from "mongoose";

const UserSchema = new Schema({
  instituteId: { type: Types.ObjectId, ref: "Institute", required: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["student", "admin"], default: "student" },
  studentId: String,
  department: String,
  year: String,
  contact: String,
  bloodGroup: String,
  // Extra profile fields already rendered by client/pages/Profile.tsx — kept optional since
  // signup doesn't collect them yet; editable later via a profile-update route if needed.
  fatherName: String,
  motherName: String,
  fatherContact: String,
  motherContact: String,
  address: String,
  dateOfBirth: String,
  guardianName: String,
  emergencyContact: String,
  avatarUrl: String,
  hostelRoomId: { type: Types.ObjectId, ref: "HostelRoom", default: null },
  createdAt: { type: Date, default: Date.now },
});

export const User = model("User", UserSchema);
