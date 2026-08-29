import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Institute } from "../models/Institute";
import { User } from "../models/User";
import { HealthCentre } from "../models/HealthCentre";
import { Doctor } from "../models/Doctor";
import { Hospital } from "../models/Hospital";
import { MedicalStore } from "../models/MedicalStore";

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing");
  await mongoose.connect(uri);

  const institutesData = [
    { name: "IIT Bhilai", domain: "iitbhilai.ac.in", city: "Bhilai" },
    { name: "IIT Delhi", domain: "iitd.ac.in", city: "New Delhi" },
  ];

  const instituteDocs: Record<string, any> = {};

  for (const data of institutesData) {
    const institute = await Institute.findOneAndUpdate(
      { domain: data.domain },
      data,
      { upsert: true, returnDocument: "after" },
    );
    instituteDocs[data.domain] = institute;

    const adminEmail = `admin@${data.domain}`;
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash("admin1234", 10);
      await User.create({
        instituteId: institute._id,
        name: `${data.name} Admin`,
        email: adminEmail,
        passwordHash,
        role: "admin",
      });
      console.log(`Created admin for ${data.name}: ${adminEmail} / admin1234`);
    } else {
      console.log(`Admin already exists for ${data.name}: ${adminEmail}`);
    }
  }

  // Seed IIT Bhilai's real health-centre data — deliberately institute-specific;
  // IIT Delhi gets none, which is the point (proves the old hardcoded values are gone).
  const bhilai = instituteDocs["iitbhilai.ac.in"];

  await HealthCentre.findOneAndUpdate(
    { instituteId: bhilai._id },
    {
      instituteId: bhilai._id,
      name: "Sushrut Health Centre, IIT Bhilai",
      tagline: "Your trusted partner in campus wellness and healthcare",
      address: "IIT Bhilai 6th Ln Rd, Jevra Sirsa, Chhattisgarh 491002",
      mapsDestination: "Sushrut Health Centre, IIT Bhilai, IIT Bhilai 6th Ln Rd, Jevra Sirsa, Chhattisgarh 491002",
      timings: "24x7 (Emergency), OPD 09:30 AM–06:00 PM",
      emergencyContacts: [
        { title: "Health Centre Telephone", number: "07882991612" },
        { title: "Health Centre Helpline", number: "09424283691" },
        { title: "Ambulance", number: "07647068419" },
      ],
    },
    { upsert: true },
  );

  const existingDoctors = await Doctor.countDocuments({ instituteId: bhilai._id });
  if (existingDoctors === 0) {
    await Doctor.insertMany([
      {
        instituteId: bhilai._id,
        name: "Dr. Atul Prakash Srivastava",
        specialization: "General & Emergency Physician",
        availableDays: "Mon–Fri",
        timings: "09:30 AM–06:00 PM",
        availability: [
          { day: "Monday", weeks: [1, 2, 3, 4, 5], start: "09:30", end: "18:00" },
          { day: "Tuesday", weeks: [1, 2, 3, 4, 5], start: "09:30", end: "18:00" },
          { day: "Wednesday", weeks: [1, 2, 3, 4, 5], start: "09:30", end: "18:00" },
          { day: "Thursday", weeks: [1, 2, 3, 4, 5], start: "09:30", end: "18:00" },
          { day: "Friday", weeks: [1, 2, 3, 4, 5], start: "09:30", end: "18:00" },
        ],
      },
      {
        instituteId: bhilai._id,
        name: "Dr. Ankur Parganiha",
        specialization: "Paediatric",
        availableDays: "1st & 3rd Fri",
        timings: "02:00 PM–04:00 PM",
        availability: [{ day: "Friday", weeks: [1, 3], start: "14:00", end: "16:00" }],
      },
    ]);
    console.log("Seeded doctors for IIT Bhilai");
  }

  const existingHospitals = await Hospital.countDocuments({ instituteId: bhilai._id });
  if (existingHospitals === 0) {
    await Hospital.insertMany([
      {
        instituteId: bhilai._id,
        name: "HI-TEK Superspeciality Hospital, Bhilai",
        distance: 4.6,
        travelTime: "19 min",
        specialization: "Multi-specialty, Emergency",
        helpline: "0788-2233445",
        availability: "24x7",
        address: "Bhilai, Chhattisgarh",
      },
      {
        instituteId: bhilai._id,
        name: "Sparsh MultiSpecialty Hospital",
        distance: 6.4,
        travelTime: "18 min",
        specialization: "Multi-specialty, Critical Care",
        helpline: "0788-2233556",
        availability: "24x7",
        address: "Ram Nagar Supela, Bhilai",
      },
    ]);
    console.log("Seeded hospitals for IIT Bhilai");
  }

  const existingStores = await MedicalStore.countDocuments({ instituteId: bhilai._id });
  if (existingStores === 0) {
    await MedicalStore.insertMany([
      {
        instituteId: bhilai._id,
        name: "Jan Aushadhi Store",
        distance: 4.6,
        travelTime: "15 min",
        phone: "078229-00777",
        timings: "08:00 AM–08:00 PM",
        address: "Vivekanand Nagar, Bhilai",
      },
      {
        instituteId: bhilai._id,
        name: "C.G. Medical Stores",
        distance: 4.6,
        travelTime: "13 min",
        phone: "09876543211",
        timings: "08:00 AM–10:00 PM",
        address: "Smriti Nagar, Bhilai, Durg",
      },
    ]);
    console.log("Seeded medical stores for IIT Bhilai");
  }

  console.log("Seed complete.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

