import "dotenv/config";
import mongoose from "mongoose";
import { Institute } from "../models/Institute";
import { AcademicEvent } from "../models/AcademicEvent";

// Extracted from the original hardcoded client/pages/AcademicCalendar.tsx array.
// Seeded once per institute so both "IIT Bhilai" and "IIT Delhi" have a populated
// calendar to develop/demo against, matching the mock data that used to be shown
// to every user regardless of institute.
const eventTemplates: {
  title: string;
  date: string;
  type: "exam" | "holiday" | "event" | "deadline" | "semester";
  description: string;
  time?: string;
}[] = [
  { title: "Winter Semester Begins", date: "2026-01-05", type: "semester", description: "Start of Winter Semester" },
  { title: "Course Registration Deadline", date: "2026-01-05", type: "deadline", description: "Last day to register courses" },
  { title: "Orientation Program", date: "2026-01-05", type: "event", description: "Welcome orientation" },
  { title: "Data Structures Quiz", date: "2026-01-06", type: "exam", description: "Quiz 1" },
  { title: "Library Orientation", date: "2026-01-06", type: "event", description: "Library resources session" },
  { title: "Web Dev Assignment Released", date: "2026-01-07", type: "event", description: "Assignment briefing" },
  { title: "Assignment Submission Deadline", date: "2026-01-07", type: "deadline", description: "Initial submission" },
  { title: "Guest Lecture: AI Trends", date: "2026-01-08", type: "event", description: "Industry expert talk" },
  { title: "Operating Systems Lab", date: "2026-01-08", type: "exam", description: "Lab evaluation" },
  { title: "Sports Club Registrations", date: "2026-01-09", type: "event", description: "Open registrations" },
  { title: "Weekly Attendance Review", date: "2026-01-10", type: "deadline", description: "Attendance check" },
  { title: "Cultural Club Meet", date: "2026-01-10", type: "event", description: "Introductory meet" },
  { title: "Algorithms Tutorial", date: "2026-01-11", type: "event", description: "Extra tutorial session" },
  { title: "DS Assignment Deadline", date: "2026-01-12", type: "deadline", description: "Submit assignment" },
  { title: "Problem Solving Contest", date: "2026-01-12", type: "event", description: "Coding contest" },
  { title: "Mid-Sem Preparation Session", date: "2026-01-13", type: "event", description: "Exam prep guidance" },
  { title: "Database Quiz", date: "2026-01-14", type: "exam", description: "Short quiz" },
  { title: "Project Proposal Submission", date: "2026-01-14", type: "deadline", description: "Proposal due" },
  { title: "Mid-Sem Exam \u2013 Data Structures", date: "2026-01-15", type: "exam", description: "Written exam" },
  { title: "Coding Contest", date: "2026-01-15", type: "event", description: "Inter-hostel contest" },
  { title: "Attendance Freeze", date: "2026-01-15", type: "deadline", description: "Final attendance locked" },
  { title: "Mid-Sem Exam \u2013 Algorithms", date: "2026-01-16", type: "exam", description: "Theory exam" },
  { title: "Career Guidance Seminar", date: "2026-01-17", type: "event", description: "Industry insights" },
  { title: "Cultural Night", date: "2026-01-18", type: "event", description: "Music & dance night" },
  { title: "Ethics Assignment Deadline", date: "2026-01-18", type: "deadline", description: "Final submission" },
  { title: "Group Discussion Round", date: "2026-01-19", type: "exam", description: "Assessment round" },
  { title: "Hackathon Registration Opens", date: "2026-01-20", type: "event", description: "Register now" },
  { title: "Web Dev Mid-Sem", date: "2026-01-21", type: "exam", description: "Practical exam" },
  { title: "Research Workshop", date: "2026-01-22", type: "event", description: "Research methodology" },
  { title: "Mini Project Deadline", date: "2026-01-23", type: "deadline", description: "Project submission" },
  { title: "Tech Talk Series", date: "2026-01-24", type: "event", description: "Emerging technologies" },
  { title: "Mock Interview Day", date: "2026-01-25", type: "event", description: "Interview practice" },
  { title: "Republic Day Holiday", date: "2026-01-26", type: "holiday", description: "National holiday" },
  { title: "Academic Advising Session", date: "2026-01-27", type: "event", description: "One-on-one faculty guidance" },
  { title: "Database Lab Exam", date: "2026-01-28", type: "exam", description: "Lab assessment" },
  { title: "Internship Awareness Session", date: "2026-01-29", type: "event", description: "Internship roadmap" },
  { title: "Feedback Form Deadline", date: "2026-01-30", type: "deadline", description: "Submit feedback" },
  { title: "Departmental Meetup", date: "2026-01-31", type: "event", description: "Faculty-student interaction" },
  { title: "Sports Week Begins", date: "2026-02-01", type: "event", description: "Annual sports week" },
  { title: "Database Project Demo", date: "2026-02-02", type: "exam", description: "Live demo" },
  { title: "Sports Events", date: "2026-02-02", type: "event", description: "Track & field" },
  { title: "Tech Fest Planning Meet", date: "2026-02-03", type: "event", description: "Volunteer meeting" },
  { title: "Web Dev Hackathon", date: "2026-02-04", type: "event", description: "24-hour hackathon" },
  { title: "Hackathon Submission", date: "2026-02-04", type: "deadline", description: "Final submission" },
  { title: "Hackathon Evaluation", date: "2026-02-05", type: "exam", description: "Judging round" },
  { title: "Resume Review Session", date: "2026-02-06", type: "event", description: "Resume feedback" },
  { title: "Sports Finals", date: "2026-02-07", type: "event", description: "Final matches" },
  { title: "Mental Health Workshop", date: "2026-02-08", type: "event", description: "Wellness session" },
  { title: "Internal Assessment", date: "2026-02-09", type: "exam", description: "Continuous evaluation" },
  { title: "Advanced Coding Workshop", date: "2026-02-10", type: "event", description: "Hands-on problem solving" },
  { title: "Lab Maintenance Window", date: "2026-02-10", type: "deadline", description: "Lab access restricted post 6 PM" },
  { title: "Elective Selection Opens", date: "2026-02-11", type: "event", description: "Choose electives" },
  { title: "Soft Skills Assessment", date: "2026-02-12", type: "exam", description: "Communication test" },
  { title: "Group Presentation", date: "2026-02-12", type: "event", description: "Presentation day" },
  { title: "Course Feedback Deadline", date: "2026-02-13", type: "deadline", description: "Submit feedback" },
  { title: "Cultural Fest Day 1", date: "2026-02-14", type: "event", description: "Fest inauguration" },
  { title: "Cultural Fest Day 2", date: "2026-02-15", type: "event", description: "Performances & DJ" },
  { title: "Elective Orientation Session", date: "2026-01-23", type: "event", description: "Overview of available electives for the semester" },
  { title: "Web Development Assignment Released", date: "2026-01-23", type: "deadline", description: "Assignment instructions shared on portal" },
  { title: "Student Council Open Meet", date: "2026-01-24", type: "event", description: "Open discussion with council members" },
  { title: "Library Usage Workshop", date: "2026-01-25", type: "event", description: "Effective research & referencing techniques" },
  { title: "Minor Project Topic Selection Deadline", date: "2026-01-25", type: "deadline", description: "Submit preferred project topics" },
  { title: "Republic Day Cultural Program", date: "2026-01-26", type: "event", description: "Patriotic performances and speeches" },
  { title: "Faculty Mentorship Meet", date: "2026-01-27", type: "event", description: "Mentor\u2013mentee interaction session" },
  { title: "Database Design Assignment Released", date: "2026-01-27", type: "deadline", description: "ER diagram and schema design task" },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing");
  await mongoose.connect(uri);

  const institutes = await Institute.find();
  if (institutes.length === 0) {
    console.log("No institutes found — run the main seed script first.");
    await mongoose.disconnect();
    return;
  }

  for (const institute of institutes) {
    const existingCount = await AcademicEvent.countDocuments({ instituteId: institute._id });
    if (existingCount > 0) {
      console.log(`Skipping ${institute.name}: already has ${existingCount} academic events.`);
      continue;
    }

    const docs = eventTemplates.map((e) => ({
      ...e,
      instituteId: institute._id,
    }));
    await AcademicEvent.insertMany(docs);
    console.log(`Seeded ${docs.length} academic events for ${institute.name}.`);
  }

  console.log("Academic events seed complete.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
