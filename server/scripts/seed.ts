import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Institute } from "../models/Institute";
import { User } from "../models/User";

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing");
  await mongoose.connect(uri);

  const institutesData = [
    { name: "IIT Bhilai", domain: "iitbhilai.ac.in", city: "Bhilai" },
    { name: "IIT Delhi", domain: "iitd.ac.in", city: "New Delhi" },
  ];

  for (const data of institutesData) {
    const institute = await Institute.findOneAndUpdate(
      { domain: data.domain },
      data,
      { upsert: true, new: true },
    );

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

  console.log("Seed complete.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
