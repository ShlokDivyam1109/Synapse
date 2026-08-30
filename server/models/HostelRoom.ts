import { Schema, model, Types } from "mongoose";

const HostelRoomSchema = new Schema({
  instituteId: { type: Types.ObjectId, ref: "Institute", required: true, index: true },
  hostelName: { type: String, required: true },
  roomNumber: { type: String, required: true },
  floor: { type: Number, required: true },
  roomType: { type: String, enum: ["Single", "Double"], required: true },
});

export const HostelRoom = model("HostelRoom", HostelRoomSchema);
