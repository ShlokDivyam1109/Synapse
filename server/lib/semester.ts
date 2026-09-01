// Derives a reliable chronological sort key directly from a semester name like
// "2024-25-M" or "2024-25-W", instead of trusting a manually-typed
// `semesterNumber` field on each course/grade document. That field has drifted
// out of sync across different seed scripts (the same semester name has been
// assigned different numbers in different places), which is what caused
// semesters to display out of order. Parsing the name itself is always
// correct: M (Monsoon) sorts before W (Winter) within the same academic year,
// and academic years sort naturally by their starting year.
export function semesterSortKey(semesterName: string): number {
  const match = /^(\d{4})-\d{2}-([MW])$/.exec(semesterName);
  if (!match) return 0; // Unrecognized format — don't crash, just group at the start.
  const [, startYear, term] = match;
  return parseInt(startYear, 10) * 10 + (term === "M" ? 0 : 1);
}

// Derives "now" as a semester sort key, using the same academic-calendar convention
// as semesterName itself: Monsoon (M) runs roughly July-December, Winter (W) runs
// roughly January-June. There's no explicit "current semester" field anywhere in the
// DB — this is intentional, since a hand-set flag would just be one more thing that
// silently goes stale each semester. Deriving it from the real date never goes stale.
export function currentSemesterSortKey(): number {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const isMonsoon = month >= 7;
  const academicStartYear = isMonsoon ? now.getFullYear() : now.getFullYear() - 1;
  return academicStartYear * 10 + (isMonsoon ? 0 : 1);
}
