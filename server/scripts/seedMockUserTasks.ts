import "dotenv/config";
import mongoose from "mongoose";
import { Institute } from "../models/Institute";
import { User } from "../models/User";
import { Task } from "../models/Task";

// Transcribed from the original hardcoded `tasks` mock state that used to live
// in client/pages/Tasks.tsx before it was migrated to fetch from the database.
// Field names match the Task schema exactly — only `id` is dropped (MongoDB
// generates its own `_id`), and `createdAt` strings are converted to real Date
// objects since the schema stores it as Date, not String.
//
// The first task's deadline was originally computed at render time via
// getTodayDate() (i.e. "whatever day it is right now"). That's reproduced here
// by computing today's date at seed time, so the seeded task keeps the same
// "due today" behavior the mock always had.
function todayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const taskTemplates: {
  title: string;
  description: string;
  category: "assignment" | "exam-prep" | "personal" | "study" | "other";
  deadline: string;
  time: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "finished" | "unfinished";
  createdAt: Date;
}[] = [
  {
    title: "Complete Math Assignment",
    description: "Solve calculus problems from chapter 5",
    category: "assignment",
    deadline: todayDate(),
    time: "18:00",
    priority: "high",
    status: "pending",
    createdAt: new Date("2023-10-15"),
  },
  {
    title: "Prepare for Physics Exam",
    description: "Review thermodynamics and optics chapters",
    category: "exam-prep",
    deadline: "2026-01-27",
    time: "14:00",
    priority: "high",
    status: "pending",
    createdAt: new Date("2026-01-27"),
  },
  {
    title: "Buy Groceries",
    description: "Milk, eggs, bread, fruits, and vegetables",
    category: "personal",
    deadline: "2026-01-28",
    time: "20:00",
    priority: "medium",
    status: "pending",
    createdAt: new Date("2023-10-18"),
  },
  {
    title: "Finish History Essay",
    description: "World War II causes and consequences",
    category: "assignment",
    deadline: "2026-01-12",
    time: "23:59",
    priority: "high",
    status: "finished",
    createdAt: new Date("2023-10-05"),
  },
  {
    title: "Chemistry Lab Report",
    description: "Acid-base titration experiment results",
    category: "assignment",
    deadline: "2025-12-28",
    time: "10:00",
    priority: "medium",
    status: "finished",
    createdAt: new Date("2023-10-08"),
  },
  {
    title: "Create Study Flashcards",
    description: "Biology terms for upcoming test",
    category: "study",
    deadline: "2026-01-16",
    time: "17:00",
    priority: "low",
    status: "finished",
    createdAt: new Date("2023-10-05"),
  },
  {
    title: "Group Project Meeting",
    description: "Discuss project progress and next steps",
    category: "other",
    deadline: "2026-01-19",
    time: "15:30",
    priority: "medium",
    status: "finished",
    createdAt: new Date("2023-10-10"),
  },
  {
    title: "Update Resume",
    description: "Add recent experience and skills",
    category: "personal",
    deadline: "2026-01-23",
    time: "12:00",
    priority: "medium",
    status: "finished",
    createdAt: new Date("2023-10-01"),
  },
  {
    title: "Prepare Presentation Slides",
    description: "Marketing strategy presentation for class",
    category: "assignment",
    deadline: "2025-12-09",
    time: "09:00",
    priority: "high",
    status: "finished",
    createdAt: new Date("2023-10-01"),
  },
  {
    title: "Return Library Books",
    description: "3 books are due today",
    category: "personal",
    deadline: "2026-01-24",
    time: "17:00",
    priority: "low",
    status: "unfinished",
    createdAt: new Date("2023-10-01"),
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing");
  await mongoose.connect(uri);

  const institute = await Institute.findOne({ name: "IIT Bhilai" });
  if (!institute) {
    console.log('No institute named "IIT Bhilai" found — run the main seed script first.');
    await mongoose.disconnect();
    return;
  }

  const user = await User.findOne({ email: "mock@email.com", instituteId: institute._id });
  if (!user) {
    console.log(
      'No user with email "mock@email.com" found under IIT Bhilai — create that account first, then re-run this script.',
    );
    await mongoose.disconnect();
    return;
  }

  const existingCount = await Task.countDocuments({ userId: user._id });
  if (existingCount > 0) {
    console.log(`Skipping: mock@email.com already has ${existingCount} tasks.`);
    await mongoose.disconnect();
    return;
  }

  const docs = taskTemplates.map((t) => ({
    ...t,
    instituteId: institute._id,
    userId: user._id,
  }));
  await Task.insertMany(docs);
  console.log(`Seeded ${docs.length} tasks for mock@email.com.`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
