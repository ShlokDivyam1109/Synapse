import { Router } from "express";
import { Enrollment } from "../models/Enrollment";
import { Course } from "../models/Course";
import { semesterSortKey, currentSemesterSortKey } from "../lib/semester";

const router = Router();

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

function startMinutes(time: string): number {
  const match = time.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return 0;
  return Number(match[1]) * 60 + Number(match[2]);
}

// GET /api/timetable — derived entirely from the current user's own Enrollment
// records, joined to their Course's schedule slot. There is no separately-stored
// timetable: if a user isn't enrolled in a course, it can never appear here, and if
// they enroll/unenroll on the Courses page, this reflects it immediately with no
// separate sync step.
//
// Only courses in the CURRENT semester are shown — a student enrolled in a past
// semester's course (kept around for grade/attendance history) shouldn't see it on
// their live weekly schedule.
router.get("/", async (req, res) => {
  const enrollments = await Enrollment.find({
    instituteId: req.user!.instituteId,
    userId: req.user!.userId,
  });
  const courseIds = enrollments.map((e) => e.courseId);
  const allCourses = await Course.find({ _id: { $in: courseIds } });

  const nowKey = currentSemesterSortKey();
  const courses = allCourses.filter((c) => semesterSortKey(c.semesterName) === nowKey);

  const byDay = new Map<string, any[]>(DAYS.map((d) => [d, []]));
  for (const c of courses) {
    byDay.get(c.day)?.push({
      id: c._id,
      subject: `${c.title} (${c.code})`,
      time: c.time,
      room: c.room,
      faculty: c.faculty,
    });
  }
  for (const classes of byDay.values()) {
    classes.sort((a, b) => startMinutes(a.time) - startMinutes(b.time));
  }

  const days = DAYS.map((day) => ({ day, classes: byDay.get(day)! }));
  res.json({ days });
});

export default router;
