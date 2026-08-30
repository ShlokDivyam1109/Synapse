import "dotenv/config";
import mongoose from "mongoose";
import { Institute } from "../models/Institute";
import { User } from "../models/User";
import { Course } from "../models/Course";
import { Grade } from "../models/Grade";
import { Enrollment } from "../models/Enrollment";

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing");
  await mongoose.connect(uri);

  const targets = [
    {
      domain: "iitbhilai.ac.in",
      program: "B.Tech Computer Science and Engineering",
      inProgress: {
        code: "LAL101",
        title: "INTRODUCTION TO FINANCE",
        type: "Liberal Art",
        credits: 1,
        faculty: "Dr. Rekha Ravindran",
        lastUpdated: "07 Jan, 2026",
        day: "Monday",
        time: "14:30 - 15:30",
        room: "L-209",
      },
      completed: {
        code: "LAL221",
        title: "INDIAN WRITING IN ENGLISH",
        type: "Liberal Art",
        credits: 2,
        faculty: "Dr. Sruthi Vinayan",
        lastUpdated: "01 Aug, 2025",
        grade: "A-",
        day: "Wednesday",
        time: "09:30 - 10:30",
        room: "L-208",
      },
    },
    {
      domain: "iitd.ac.in",
      program: "B.Tech Computer Science and Engineering",
      inProgress: {
        code: "LAL224",
        title: "INTRODUCTION TO POSTCOLONIAL LITERATURE",
        type: "Liberal Art",
        credits: 2,
        faculty: "Dr. Sruthi Vinayan",
        lastUpdated: "07 Jan, 2026",
        day: "Monday",
        time: "12:30 - 13:30",
        room: "L-208",
      },
      completed: {
        code: "LAL100",
        title: "INTRODUCTION TO COMMUNICATION SKILLS",
        type: "Institute Core",
        credits: 2,
        faculty: "Dr. Anubhav Pradhan",
        lastUpdated: "01 Aug, 2025",
        grade: "A",
        day: "Tuesday",
        time: "09:30 - 10:30",
        room: "L-101",
      },
    },
  ];

  const IN_PROGRESS_SEMESTER = { number: 2, name: "2026-27-M" };
  const COMPLETED_SEMESTER = { number: 1, name: "2025-26-W" };

  for (const t of targets) {
    const institute = await Institute.findOne({ domain: t.domain });
    if (!institute) {
      console.warn(`Institute ${t.domain} not found — run the main seed script first. Skipping.`);
      continue;
    }

    const admin = await User.findOne({ email: `admin@${t.domain}` });
    if (!admin) {
      console.warn(`Admin user for ${t.domain} not found — run the main seed script first. Skipping.`);
      continue;
    }

    // ---- Course catalog entries (shown on the Courses page, shared institute-wide) ----
    const inProgressCourse = await Course.findOneAndUpdate(
      {
        instituteId: institute._id,
        code: t.inProgress.code,
        semesterName: IN_PROGRESS_SEMESTER.name,
      },
      {
        instituteId: institute._id,
        program: t.program,
        semesterNumber: IN_PROGRESS_SEMESTER.number,
        semesterName: IN_PROGRESS_SEMESTER.name,
        code: t.inProgress.code,
        title: t.inProgress.title,
        type: t.inProgress.type,
        credits: t.inProgress.credits,
        faculty: t.inProgress.faculty,
        lastUpdated: t.inProgress.lastUpdated,
        day: t.inProgress.day,
        time: t.inProgress.time,
        room: t.inProgress.room,
      },
      { upsert: true, new: true },
    );

    await Course.findOneAndUpdate(
      {
        instituteId: institute._id,
        code: t.completed.code,
        semesterName: COMPLETED_SEMESTER.name,
      },
      {
        instituteId: institute._id,
        program: t.program,
        semesterNumber: COMPLETED_SEMESTER.number,
        semesterName: COMPLETED_SEMESTER.name,
        code: t.completed.code,
        title: t.completed.title,
        type: t.completed.type,
        credits: t.completed.credits,
        faculty: t.completed.faculty,
        lastUpdated: t.completed.lastUpdated,
        day: t.completed.day,
        time: t.completed.time,
        room: t.completed.room,
      },
      { upsert: true },
    );

    // ---- Grade entries (the admin's own transcript, shown on the Grades page) ----
    await Grade.findOneAndUpdate(
      {
        instituteId: institute._id,
        userId: admin._id,
        code: t.inProgress.code,
        semesterName: IN_PROGRESS_SEMESTER.name,
      },
      {
        instituteId: institute._id,
        userId: admin._id,
        semesterNumber: IN_PROGRESS_SEMESTER.number,
        semesterName: IN_PROGRESS_SEMESTER.name,
        program: t.program,
        code: t.inProgress.code,
        title: t.inProgress.title,
        type: t.inProgress.type,
        credits: t.inProgress.credits,
        grade: "In Progress",
      },
      { upsert: true },
    );

    await Grade.findOneAndUpdate(
      {
        instituteId: institute._id,
        userId: admin._id,
        code: t.completed.code,
        semesterName: COMPLETED_SEMESTER.name,
      },
      {
        instituteId: institute._id,
        userId: admin._id,
        semesterNumber: COMPLETED_SEMESTER.number,
        semesterName: COMPLETED_SEMESTER.name,
        program: t.program,
        code: t.completed.code,
        title: t.completed.title,
        type: t.completed.type,
        credits: t.completed.credits,
        grade: t.completed.grade,
      },
      { upsert: true },
    );

    // ---- Enrollment: links this specific admin to the in-progress course, which is
    // what makes it show up on THEIR timetable specifically (and no one else's). The
    // completed course is from a past semester and deliberately isn't enrolled here —
    // a finished course shouldn't occupy a slot on the live weekly timetable.
    await Enrollment.findOneAndUpdate(
      { userId: admin._id, courseId: inProgressCourse!._id },
      {
        instituteId: institute._id,
        userId: admin._id,
        courseId: inProgressCourse!._id,
        semesterName: IN_PROGRESS_SEMESTER.name,
      },
      { upsert: true },
    );

    console.log(`Seeded courses + grades for ${t.domain} (admin@${t.domain})`);
  }

  console.log("Course/grade seed complete.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
