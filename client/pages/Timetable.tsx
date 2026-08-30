import { Card } from "@/components/ui/card";
import { Clock, MapPin, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ClassSession {
  id: string;
  subject: string;
  time: string;
  room: string;
  faculty: string;
}

interface DaySchedule {
  day: string;
  classes: ClassSession[];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Colors are purely a display choice, cycled by position — there's nothing here a
// user needs to choose or that needs to be stored anywhere.
const CARD_COLORS = [
  "bg-blue-100 border-blue-300 text-blue-900",
  "bg-purple-100 border-purple-300 text-purple-900",
  "bg-green-100 border-green-300 text-green-900",
  "bg-orange-100 border-orange-300 text-orange-900",
  "bg-red-100 border-red-300 text-red-900",
  "bg-pink-100 border-pink-300 text-pink-900",
  "bg-indigo-100 border-indigo-300 text-indigo-900",
  "bg-cyan-100 border-cyan-300 text-cyan-900",
  "bg-teal-100 border-teal-300 text-teal-900",
  "bg-emerald-100 border-emerald-300 text-emerald-900",
];

// Computes this week's real calendar date for a weekday name, instead of a baked-in
// placeholder like "Jan 20" that would go stale immediately.
function dateLabelForDay(dayName: string): string {
  const index = DAYS.indexOf(dayName);
  const today = new Date();
  const todayIndex = (today.getDay() + 6) % 7; // Sun=0..Sat=6 -> Mon=0..Sun=6
  const target = new Date(today);
  target.setDate(today.getDate() + (index - todayIndex));
  return target.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

async function fetchTimetable(): Promise<DaySchedule[]> {
  const res = await fetch("/api/timetable", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load timetable");
  const data = await res.json();
  return data.days;
}

function ClassCard({ session, color }: { session: ClassSession; color: string }) {
  return (
    <Card className={`p-4 border-l-4 ${color} cursor-pointer hover:shadow-md transition-shadow`}>
      <h3 className="font-semibold text-sm mb-3">{session.subject}</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Clock size={16} className="opacity-70" />
          <span>{session.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={16} className="opacity-70" />
          <span>{session.room}</span>
        </div>
        <div className="flex items-center gap-2">
          <User size={16} className="opacity-70" />
          <span className="text-xs">{session.faculty}</span>
        </div>
      </div>
    </Card>
  );
}

export default function Timetable() {
  const { data: schedule, isLoading, isError, refetch } = useQuery({
    queryKey: ["timetable"],
    queryFn: fetchTimetable,
  });

  const days = schedule ?? [];
  const totalClasses = days.reduce((sum, d) => sum + d.classes.length, 0);

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">Timetable</h1>
          <p className="text-muted-foreground mt-2">
            Your weekly class schedule, based on the courses you're enrolled in
          </p>
        </div>

        {isLoading && (
          <p className="text-muted-foreground">Loading your timetable…</p>
        )}
        {isError && (
          <div>
            <p className="text-red-600 mb-3">Failed to load your timetable.</p>
            <button onClick={() => refetch()} className="px-4 py-2 bg-primary text-white rounded-md">
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && totalClasses === 0 && (
          <Card className="p-8 text-center bg-gray-50">
            <p className="text-muted-foreground">
              You're not enrolled in any courses yet. Enroll from the Courses page to see your timetable here.
            </p>
          </Card>
        )}

        {/* Weekly View */}
        {!isLoading && !isError && totalClasses > 0 && (
          <div className="space-y-6">
            {days.map((daySchedule) => (
              <div key={daySchedule.day}>
                <div className="flex items-center justify-between mb-4 pb-2 border-b">
                  <div>
                    <h2 className="text-2xl font-bold">{daySchedule.day}</h2>
                    <p className="text-sm text-muted-foreground">{dateLabelForDay(daySchedule.day)}</p>
                  </div>
                </div>

                {daySchedule.classes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {daySchedule.classes.map((session, i) => (
                      <ClassCard
                        key={session.id}
                        session={session}
                        color={CARD_COLORS[i % CARD_COLORS.length]}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center bg-gray-50">
                    <p className="text-muted-foreground">No classes scheduled</p>
                  </Card>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
