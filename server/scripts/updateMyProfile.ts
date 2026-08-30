import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../models/User";

// Fill in your real details below before running this. Every value here is a
// placeholder — nothing was invented on your behalf. Leave a field as `undefined`
// (or delete the line) to leave it untouched in the database.
const EMAIL = "shlokd@iitbhilai.ac.in";

const updates = {
  contact: "REPLACE_WITH_YOUR_PHONE_NUMBER",
  address: "REPLACE_WITH_YOUR_RESIDENTIAL_ADDRESS",
  dateOfBirth: "REPLACE_WITH_YOUR_DOB", // e.g. "2006-04-12"
  bloodGroup: "REPLACE_WITH_YOUR_BLOOD_GROUP", // e.g. "O+"
  guardianName: "REPLACE_WITH_GUARDIAN_NAME",
  emergencyContact: "REPLACE_WITH_EMERGENCY_CONTACT_NUMBER",
  fatherName: "REPLACE_WITH_FATHERS_NAME",
  fatherContact: "REPLACE_WITH_FATHERS_CONTACT",
  motherName: "REPLACE_WITH_MOTHERS_NAME",
  motherContact: "REPLACE_WITH_MOTHERS_CONTACT",
  // Keeps the existing photo that was previously hardcoded for every user on the
  // site — this now applies it only to your own account. Point this at a real,
  // hosted image URL of your choosing if you'd rather use something else, or
  // delete this line to fall back to the initials avatar instead.
  avatarUrl: "/Adarsh%20Satyam.jpeg",
};

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing");
  await mongoose.connect(uri);

  const user = await User.findOneAndUpdate({ email: EMAIL }, updates, { new: true });
  if (!user) {
    console.log(`No user found with email ${EMAIL} — nothing updated.`);
  } else {
    console.log(`Updated profile for ${user.email}.`);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
