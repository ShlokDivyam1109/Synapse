import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Institute } from "../models/Institute";
import { User } from "../models/User";
import { HealthCentre } from "../models/HealthCentre";
import { Doctor } from "../models/Doctor";
import { Hospital } from "../models/Hospital";
import { MedicalStore } from "../models/MedicalStore";
import { HostelRoom } from "../models/HostelRoom";
import { HostelRule } from "../models/HostelRule";
import { HostelNotice } from "../models/HostelNotice";
import { Course } from "../models/Course";
import { Enrollment } from "../models/Enrollment";
import { Attendance } from "../models/Attendance";
import { Task } from "../models/Task";

// Same academic-calendar convention as server/lib/semester.ts: Monsoon (M) runs
// roughly July-December, Winter (W) runs roughly January-June. Computed at seed
// time rather than hardcoded, so demo data stays in the current semester (and
// therefore visible on the Timetable) no matter when this script is run.
function currentSemesterName(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const isMonsoon = month >= 7;
  const startYear = isMonsoon ? now.getFullYear() : now.getFullYear() - 1;
  const endYearShort = ((startYear + 1) % 100).toString().padStart(2, "0");
  return `${startYear}-${endYearShort}-${isMonsoon ? "M" : "W"}`;
}

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

  const existingRules = await HostelRule.countDocuments({ instituteId: bhilai._id });
  if (existingRules === 0) {
    await HostelRule.insertMany([
      { instituteId: bhilai._id, text: "Entry after 11 PM requires prior permission.", order: 1 },
      { instituteId: bhilai._id, text: "Visitors are allowed only in common areas.", order: 2 },
      { instituteId: bhilai._id, text: "Maintain cleanliness in rooms and corridors.", order: 3 },
      { instituteId: bhilai._id, text: "Electric appliances require approval.", order: 4 },
      { instituteId: bhilai._id, text: "Ragging is strictly prohibited.", order: 5 },
    ]);
    console.log("Seeded hostel rules for IIT Bhilai");
  }

  const existingHostelNotices = await HostelNotice.countDocuments({ instituteId: bhilai._id });
  if (existingHostelNotices === 0) {
    await HostelNotice.insertMany([
      {
        instituteId: bhilai._id,
        title: "Fire Safety Drill",
        description: "Mandatory fire safety drill for all hostel residents.",
      },
      {
        instituteId: bhilai._id,
        title: "Mess Menu Update",
        description: "New mess menu will be applicable from next week.",
      },
    ]);
    console.log("Seeded hostel notices for IIT Bhilai");
  }

  // Upsert (not just create-once) so this room is always available to assign users to,
  // even on re-runs of this script after the room already exists.
  const seededRoom = await HostelRoom.findOneAndUpdate(
    { instituteId: bhilai._id, hostelName: "Aryabhatta Hostel", roomNumber: "B-214" },
    {
      instituteId: bhilai._id,
      hostelName: "Aryabhatta Hostel",
      roomNumber: "B-214",
      floor: 2,
      roomType: "Double",
    },
    { upsert: true, new: true },
  );

  // Assign the IIT Bhilai admin to the seeded room, purely so there's something to see
  // when testing the Hostel Management page end-to-end.
  if (seededRoom) {
    await User.updateOne({ email: "admin@iitbhilai.ac.in" }, { hostelRoomId: seededRoom._id });
  }

  // Seed a course + enrollment + attendance + tasks for the IIT Bhilai admin, so
  // Courses, Timetable, Attendance, and Tasks all have something real to show.
  const bhilaiAdmin = await User.findOne({ email: "admin@iitbhilai.ac.in" });
  if (bhilaiAdmin) {
    const course = await Course.findOneAndUpdate(
      { instituteId: bhilai._id, code: "CSL253" },
      {
        instituteId: bhilai._id,
        program: "B.Tech",
        semesterNumber: 5,
        semesterName: currentSemesterName(),
        code: "CSL253",
        title: "Theory of Computation",
        type: "Program Core",
        credits: 4,
        faculty: "Dr. Rishi Ranjan Singh",
        lastUpdated: "07 Jan, 2026",
        day: "Monday",
        time: "14:30 - 15:30",
        room: "LT-3",
      },
      { upsert: true, new: true },
    );

    await Enrollment.findOneAndUpdate(
      { userId: bhilaiAdmin._id, courseId: course._id },
      { userId: bhilaiAdmin._id, courseId: course._id, instituteId: bhilai._id },
      { upsert: true },
    );

    await Attendance.findOneAndUpdate(
      { userId: bhilaiAdmin._id, courseId: course._id },
      {
        userId: bhilaiAdmin._id,
        courseId: course._id,
        instituteId: bhilai._id,
        totalClasses: 24,
        attendedClasses: 18,
        lastUpdated: "07 Jan, 2026",
      },
      { upsert: true },
    );

    const existingTasks = await Task.countDocuments({ userId: bhilaiAdmin._id });
    if (existingTasks === 0) {
      await Task.insertMany([
        {
          instituteId: bhilai._id,
          userId: bhilaiAdmin._id,
          title: "Prepare TOC Lecture Slides",
          description: "Cover pushdown automata for next week",
          category: "assignment",
          deadline: "2026-02-05",
          time: "18:00",
          priority: "high",
          status: "pending",
        },
        {
          instituteId: bhilai._id,
          userId: bhilaiAdmin._id,
          title: "Grade Assignment 3",
          description: "Grade submitted regex-to-NFA assignments",
          category: "other",
          deadline: "2026-02-03",
          time: "12:00",
          priority: "medium",
          status: "pending",
        },
      ]);
      console.log("Seeded tasks for IIT Bhilai admin");
    }
    console.log("Seeded course, enrollment, and attendance for IIT Bhilai admin");
  }

  // Demo/reviewer account, shown on the login page. Plain student role, deliberately
  // simple password since this is a public demo login, not a real user's account.
  const existingMockUser = await User.findOne({ email: "mock@email.com" });
  if (!existingMockUser) {
    const passwordHash = await bcrypt.hash("mock", 10);
    const mockUser = await User.create({
      instituteId: bhilai._id,
      name: "Mock Student",
      email: "mock@email.com",
      passwordHash,
      role: "student",
      studentId: "MOCK001",
    });

    if (seededRoom) {
      await User.updateOne({ _id: mockUser._id }, { hostelRoomId: seededRoom._id });
    }

    const demoCourse = await Course.findOne({ instituteId: bhilai._id, code: "CSL253" });
    if (demoCourse) {
      await Enrollment.findOneAndUpdate(
        { userId: mockUser._id, courseId: demoCourse._id },
        { userId: mockUser._id, courseId: demoCourse._id, instituteId: bhilai._id },
        { upsert: true },
      );
      await Attendance.findOneAndUpdate(
        { userId: mockUser._id, courseId: demoCourse._id },
        {
          userId: mockUser._id,
          courseId: demoCourse._id,
          instituteId: bhilai._id,
          totalClasses: 24,
          attendedClasses: 20,
          lastUpdated: "07 Jan, 2026",
        },
        { upsert: true },
      );
    }

    console.log("Created demo account: mock@email.com / mock");
  } else {
    console.log("Demo account already exists: mock@email.com");
  }

  console.log("Seed complete.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

