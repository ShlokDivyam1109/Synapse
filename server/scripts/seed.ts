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
      name: "Campus Health Centre",
      tagline: "Your trusted partner in campus wellness and healthcare",
      address: "",
      mapsDestination: "",
      timings: "Mon–Sun: 09:00 AM–05:30 PM (OPD), Emergency: 24x7",
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
      {
        instituteId: bhilai._id,
        name: "Dr. Anuj Gupta",
        specialization: "ENT",
        availableDays: "2nd & 4th Fri",
        timings: "03:00 PM–05:00 PM",
        availability: [{ day: "Friday", weeks: [2, 4], start: "15:00", end: "17:00" }],
      },
      {
        instituteId: bhilai._id,
        name: "Dr. Vishal Agrawal",
        specialization: "General Medicine",
        availableDays: "2nd & 4th Tue",
        timings: "04:00 PM–06:00 PM",
        availability: [{ day: "Tuesday", weeks: [2, 4], start: "16:00", end: "18:00" }],
      },
      {
        instituteId: bhilai._id,
        name: "Dr. Rahul Thakur",
        specialization: "Orthopaedic",
        availableDays: "1st & 3rd Wed",
        timings: "04:00 PM–06:00 PM",
        availability: [{ day: "Wednesday", weeks: [1, 3], start: "16:00", end: "18:00" }],
      },
      {
        instituteId: bhilai._id,
        name: "Dr. Saket Banchhore",
        specialization: "Dentist",
        availableDays: "2nd & 4th Wed",
        timings: "02:00 PM–04:00 PM",
        availability: [{ day: "Wednesday", weeks: [2, 4], start: "14:00", end: "16:00" }],
      },
      {
        instituteId: bhilai._id,
        name: "Dr. Alloukik Agrawal",
        specialization: "Psychiatry",
        availableDays: "1st & 3rd Thu",
        timings: "12:00 PM–02:00 PM",
        availability: [{ day: "Thursday", weeks: [1, 3], start: "12:00", end: "14:00" }],
      },
      {
        instituteId: bhilai._id,
        name: "Dr. Bhuvaneshwari Dewangan",
        specialization: "Dermatology",
        availableDays: "2nd & 4th Thu",
        timings: "01:30 PM–03:30 PM",
        availability: [{ day: "Thursday", weeks: [2, 4], start: "13:30", end: "15:30" }],
      },
      {
        instituteId: bhilai._id,
        name: "Dr. Monideepa Saha",
        specialization: "Obs & Gynae",
        availableDays: "All Tuesdays",
        timings: "03:30 PM–05:30 PM",
        availability: [{ day: "Tuesday", weeks: [1, 2, 3, 4, 5], start: "15:30", end: "17:30" }],
      },
      {
        instituteId: bhilai._id,
        name: "Dr. Suyas Noel",
        specialization: "Ophthalmologist",
        availableDays: "2nd Saturday",
        timings: "10:00 AM–12:00 PM",
        availability: [{ day: "Saturday", weeks: [2], start: "10:00", end: "12:00" }],
      },
      {
        instituteId: bhilai._id,
        name: "Dr. Anushree",
        specialization: "Physiotherapy",
        availableDays: "Mon–Sat",
        timings: "09:00 AM–03:00 PM",
        availability: [
          { day: "Monday", weeks: [1, 2, 3, 4, 5], start: "09:00", end: "15:00" },
          { day: "Tuesday", weeks: [1, 2, 3, 4, 5], start: "09:00", end: "15:00" },
          { day: "Wednesday", weeks: [1, 2, 3, 4, 5], start: "09:00", end: "15:00" },
          { day: "Thursday", weeks: [1, 2, 3, 4, 5], start: "09:00", end: "15:00" },
          { day: "Friday", weeks: [1, 2, 3, 4, 5], start: "09:00", end: "15:00" },
          { day: "Saturday", weeks: [1, 2, 3, 4, 5], start: "09:00", end: "15:00" },
        ],
      },
      {
        instituteId: bhilai._id,
        name: "Dr. Pavendra Chandrakar",
        specialization: "Yoga",
        availableDays: "Mon–Sat",
        timings: "06:00 AM–08:00 AM & 05:00 PM–07:00 PM",
        availability: [
          { day: "Monday", weeks: [1, 2, 3, 4, 5], start: "06:00", end: "08:00" },
          { day: "Monday", weeks: [1, 2, 3, 4, 5], start: "17:00", end: "19:00" },
          { day: "Tuesday", weeks: [1, 2, 3, 4, 5], start: "06:00", end: "08:00" },
          { day: "Tuesday", weeks: [1, 2, 3, 4, 5], start: "17:00", end: "19:00" },
          { day: "Wednesday", weeks: [1, 2, 3, 4, 5], start: "06:00", end: "08:00" },
          { day: "Wednesday", weeks: [1, 2, 3, 4, 5], start: "17:00", end: "19:00" },
          { day: "Thursday", weeks: [1, 2, 3, 4, 5], start: "06:00", end: "08:00" },
          { day: "Thursday", weeks: [1, 2, 3, 4, 5], start: "17:00", end: "19:00" },
          { day: "Friday", weeks: [1, 2, 3, 4, 5], start: "06:00", end: "08:00" },
          { day: "Friday", weeks: [1, 2, 3, 4, 5], start: "17:00", end: "19:00" },
          { day: "Saturday", weeks: [1, 2, 3, 4, 5], start: "06:00", end: "08:00" },
          { day: "Saturday", weeks: [1, 2, 3, 4, 5], start: "17:00", end: "19:00" },
        ],
      },
    ]);
    console.log("Seeded doctors for IIT Bhilai");
  }

  const existingHospitals = await Hospital.countDocuments({ instituteId: bhilai._id });
  if (existingHospitals === 0) {
    await Hospital.insertMany([
      {
        instituteId: bhilai._id,
        name: "Max Healthcare",
        distance: 2.5,
        travelTime: "",
        specialization: "Multi-specialty",
        helpline: "1860-500-5000",
        availability: "24x7",
        address: "",
      },
      {
        instituteId: bhilai._id,
        name: "Apollo Hospital",
        distance: 3.8,
        travelTime: "",
        specialization: "Cardiology, Neurology",
        helpline: "1860-500-1066",
        availability: "24x7",
        address: "",
      },
      {
        instituteId: bhilai._id,
        name: "Fortis Hospital",
        distance: 1.9,
        travelTime: "",
        specialization: "Emergency, General Surgery",
        helpline: "1860-123-1010",
        availability: "24x7",
        address: "",
      },
      {
        instituteId: bhilai._id,
        name: "City Hospital",
        distance: 4.2,
        travelTime: "",
        specialization: "General Medicine",
        helpline: "0755-4092000",
        availability: "24x7",
        address: "",
      },
    ]);
    console.log("Seeded hospitals for IIT Bhilai");
  }

  const existingStores = await MedicalStore.countDocuments({ instituteId: bhilai._id });
  if (existingStores === 0) {
    await MedicalStore.insertMany([
      {
        instituteId: bhilai._id,
        name: "MedPlus Pharmacy",
        distance: 0.8,
        travelTime: "",
        phone: "09876543210",
        timings: "07:00 AM–11:00 PM",
        address: "",
      },
      {
        instituteId: bhilai._id,
        name: "Apollo Pharmacy",
        distance: 1.2,
        travelTime: "",
        phone: "09876543211",
        timings: "08:00 AM–10:00 PM",
        address: "",
      },
      {
        instituteId: bhilai._id,
        name: "Health First Pharmacy",
        distance: 1.5,
        travelTime: "",
        phone: "09876543212",
        timings: "24x7",
        address: "",
      },
      {
        instituteId: bhilai._id,
        name: "City Pharmacy",
        distance: 2.1,
        travelTime: "",
        phone: "09876543213",
        timings: "07:00 AM–09:00 PM",
        address: "",
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

  // Original mock Timetable data (from the pre-migration frontend) — one Course
  // document per weekly slot, matching the Course schema's one-slot-per-course model.
  // Times normalized to 24h "HH:MM - HH:MM"; course codes invented where the original
  // mock didn't have one (only CSL252 and LAL224 did).
  const timetableCourses = [
    { code: "CSL252", title: "Design and Analysis of Algorithms", type: "Program Core", credits: 4, faculty: "Dr. Vinod Reddy", day: "Monday", time: "11:30 - 12:30", room: "L-102" },
    { code: "LAL224", title: "Introduction to Postcolonial Literature", type: "Liberal Art", credits: 3, faculty: "Ms. Shruti Vinayan", day: "Monday", time: "12:30 - 13:30", room: "L-208" },
    { code: "CSL301", title: "Database Management", type: "Program Core", credits: 4, faculty: "Prof. Aditya Singh", day: "Monday", time: "13:30 - 15:00", room: "Room 205" },
    { code: "CSL201", title: "Algorithms", type: "Program Core", credits: 4, faculty: "Dr. Vikram Patel", day: "Tuesday", time: "09:00 - 10:30", room: "Room 103" },
    { code: "CSL202", title: "Operating Systems", type: "Program Core", credits: 4, faculty: "Dr. Isha Gupta", day: "Tuesday", time: "11:00 - 12:30", room: "Room 210" },
    { code: "CSL203", title: "Object Oriented Programming", type: "Program Core", credits: 4, faculty: "Mr. Rohan Malhotra", day: "Wednesday", time: "09:00 - 10:30", room: "Lab B" },
    { code: "CSL204", title: "Web Development", type: "Program Core", credits: 3, faculty: "Ms. Priya Sharma", day: "Wednesday", time: "10:45 - 12:15", room: "Lab A" },
    { code: "HSL101", title: "Professional Ethics", type: "Institute Core", credits: 2, faculty: "Dr. Meera Desai", day: "Wednesday", time: "14:00 - 15:00", room: "Room 301" },
    { code: "CSL205", title: "Data Structures", type: "Program Core", credits: 4, faculty: "Dr. Rajesh Kumar", day: "Thursday", time: "09:00 - 10:30", room: "Room 101" },
    { code: "CSL206", title: "Compiler Design", type: "Program Core", credits: 4, faculty: "Prof. Arjun Verma", day: "Thursday", time: "13:30 - 15:00", room: "Room 215" },
    { code: "CSL207", title: "Software Engineering", type: "Program Core", credits: 4, faculty: "Dr. Sanjay Mishra", day: "Friday", time: "09:00 - 10:30", room: "Room 205" },
    { code: "CSL301L", title: "Database Management", type: "Program Core", credits: 1, faculty: "Prof. Aditya Singh", day: "Friday", time: "10:45 - 12:15", room: "Lab C" },
    { code: "CSL401", title: "Project Work", type: "Non-graded", credits: 2, faculty: "Various Faculty", day: "Friday", time: "14:00 - 16:00", room: "Room 401" },
  ] as const;

  // Seed all 13 courses + enroll both the IIT Bhilai admin and the mock demo account
  // in every one of them, so Courses, Timetable, and Attendance all have something
  // real to show for both accounts — matching the original mock, which showed the
  // same static weekly schedule regardless of which user was logged in.
  const bhilaiAdmin = await User.findOne({ email: "admin@iitbhilai.ac.in" });

  const existingMockUserBefore = await User.findOne({ email: "mock@email.com" });
  let mockUser = existingMockUserBefore;
  if (!mockUser) {
    const passwordHash = await bcrypt.hash("mock", 10);
    mockUser = await User.create({
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
    console.log("Created demo account: mock@email.com / mock");
  } else {
    console.log("Demo account already exists: mock@email.com");
  }

  const demoUsers = [bhilaiAdmin, mockUser].filter(Boolean) as NonNullable<typeof bhilaiAdmin>[];

  for (const c of timetableCourses) {
    const course = await Course.findOneAndUpdate(
      { instituteId: bhilai._id, code: c.code },
      {
        instituteId: bhilai._id,
        program: "B.Tech",
        semesterNumber: 5,
        semesterName: currentSemesterName(),
        code: c.code,
        title: c.title,
        type: c.type,
        credits: c.credits,
        faculty: c.faculty,
        lastUpdated: "07 Jan, 2026",
        day: c.day,
        time: c.time,
        room: c.room,
      },
      { upsert: true, new: true },
    );

    for (const user of demoUsers) {
      await Enrollment.findOneAndUpdate(
        { userId: user._id, courseId: course._id },
        { userId: user._id, courseId: course._id, instituteId: bhilai._id },
        { upsert: true },
      );
      await Attendance.findOneAndUpdate(
        { userId: user._id, courseId: course._id },
        {
          userId: user._id,
          courseId: course._id,
          instituteId: bhilai._id,
          totalClasses: 24,
          attendedClasses: user.email === "mock@email.com" ? 20 : 18,
          lastUpdated: "07 Jan, 2026",
        },
        { upsert: true },
      );
    }
  }
  console.log(`Seeded ${timetableCourses.length} courses and enrolled admin + demo account in all of them`);

  if (bhilaiAdmin) {
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
  }

  console.log("Seed complete.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

