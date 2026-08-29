import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  List,
  BookOpen,
  Trophy,
  AlertCircle,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "exam" | "holiday" | "event" | "deadline" | "semester";
  description: string;
  time?: string;
}




function getTypeColor(type: CalendarEvent["type"]) {
  switch (type) {
    case "exam":
      return "bg-red-100 text-red-900 border-red-300";
    case "holiday":
      return "bg-green-100 text-green-900 border-green-300";
    case "event":
      return "bg-blue-100 text-blue-900 border-blue-300";
    case "deadline":
      return "bg-orange-100 text-orange-900 border-orange-300";
    case "semester":
      return "bg-purple-100 text-purple-900 border-purple-300";
    default:
      return "bg-gray-100 text-gray-900 border-gray-300";
  }
}

function getTypeIcon(type: CalendarEvent["type"]) {
  switch (type) {
    case "exam":
      return <Trophy size={16} />;
    case "holiday":
      return <AlertCircle size={16} />;
    case "event":
      return <Zap size={16} />;
    case "deadline":
      return <AlertCircle size={16} />;
    case "semester":
      return <BookOpen size={16} />;
    default:
      return null;
  }
}

function getTypeLabel(type: CalendarEvent["type"]) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function EventCard({ event }: { event: CalendarEvent }) {
  const date = new Date(event.date);
  const formatted = date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className={`p-4 border-l-4 rounded-lg border ${getTypeColor(event.type)} cursor-pointer hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm">{event.title}</h3>
          <p className="text-xs opacity-75">{formatted}</p>
        </div>
        <Badge className="gap-1" variant="outline">
          {getTypeIcon(event.type)}
          {getTypeLabel(event.type)}
        </Badge>
      </div>
      <p className="text-sm mb-2">{event.description}</p>
      {event.time && <p className="text-xs opacity-75">⏰ {event.time}</p>}
    </div>
  );
}

export default function AcademicCalendar() {
 const [selectedDate, setSelectedDate] = useState<Date | undefined>(
  new Date()
);

const [activeFilter, setActiveFilter] = useState<
  "all" | "exam" | "deadline" | "holiday" | "event" | "semester"
>("all");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["academic-events"],
    queryFn: () =>
      fetch("/api/academic-events", { credentials: "include" }).then((r) => {
        if (!r.ok) throw new Error("Failed to load events");
        return r.json();
      }),
  });
  const academicEvents: CalendarEvent[] = (data?.events ?? []).map(
    (e: any) => ({ ...e, id: e._id }),
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading academic calendar…</p>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Could not load academic events.</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const eventsForSelectedDate = academicEvents.filter(
    (event) =>
      new Date(event.date).toDateString() ===
      selectedDate?.toDateString()
  );

  // Sort events by date
  const filteredEvents =
  activeFilter === "all"
    ? academicEvents
    : academicEvents.filter((event) => event.type === activeFilter);

const sortedEvents = [...filteredEvents].sort(
  (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
);


  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">Academic Calendar</h1>
          <p className="text-muted-foreground mt-2">
            Track important dates, exams, deadlines, and events
          </p>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarIcon size={18} />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List size={18} />
              List View
            </TabsTrigger>
          </TabsList>

          {/* Calendar View */}
          <TabsContent value="calendar" className="space-y-6 mt-6">
            <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6 items-stretch">


             <Card className="p-8 lg:col-span-1 flex flex-col min-h-[540px]">

  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
    Select a date
  </h3>

  <div className="flex-1 flex items-center justify-center">
   <Calendar
  mode="single"
  selected={selectedDate}
  onSelect={setSelectedDate}
  showOutsideDays={false}
  className="w-full max-w-xl bg-blue-50 rounded-xl px-8 py-6"


 classNames={{
  table: "w-full",

  weekdays: "grid grid-cols-[repeat(7,56px)] justify-center mb-4",
 weekday:
  "h-14 w-14 flex items-center justify-center text-base font-semibold text-blue-700 tabular-nums leading-none",

  weeks: "space-y-4",
  week: "grid grid-cols-[repeat(7,56px)] justify-center",

  cell: "h-14 w-14 flex items-center justify-center",

 day:
  "h-full w-full flex items-center justify-center text-lg rounded-md transition aria-selected:bg-blue-600 aria-selected:text-white aria-disabled:pointer-events-none aria-disabled:bg-transparent",

  day_selected: "!bg-blue-600 !text-white !font-bold hover:bg-blue-600",
  day_today: "!ring-2 !ring-blue-600 !font-bold hover:bg-indigo-200",

  nav_button: "hover:bg-indigo-200 text-indigo-700",
}}
/>


  </div>

  <Button
    variant="outline"
    size="sm"
    className="mt-4 w-full"
    onClick={() => setSelectedDate(new Date())}
  >
    Go to Today
  </Button>
</Card>


              {/* Events for selected date */}
              <div className="flex flex-col h-full">

               <h2 className="text-2xl font-bold mb-1">
  {selectedDate?.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}
</h2>

<p className="text-sm text-muted-foreground mb-4">
  Academic events on selected date
</p>


                {eventsForSelectedDate.length > 0 ? (
                  <div className="space-y-4">
                    {eventsForSelectedDate.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center bg-gray-50">
                    <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                    <p className="text-muted-foreground">
                      No events scheduled for this date
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* List View */}
          <TabsContent value="list" className="mt-6">
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
               <Button
  size="sm"
  variant={activeFilter === "all" ? "outline" : "ghost"}
  onClick={() => setActiveFilter("all")}
>
  All Events
</Button>

<Button
  size="sm"
  variant={activeFilter === "exam" ? "outline" : "ghost"}
  onClick={() => setActiveFilter("exam")}
>
  Exams
</Button>

<Button
  size="sm"
  variant={activeFilter === "deadline" ? "outline" : "ghost"}
  onClick={() => setActiveFilter("deadline")}
>
  Deadlines
</Button>

<Button
  size="sm"
  variant={activeFilter === "holiday" ? "outline" : "ghost"}
  onClick={() => setActiveFilter("holiday")}
>
  Holidays
</Button>

<Button
  size="sm"
  variant={activeFilter === "event" ? "outline" : "ghost"}
  onClick={() => setActiveFilter("event")}
>
  Events
</Button>

              </div>

              {/* Events list */}
              <div className="space-y-3">
                {sortedEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Legend */}
        <Card className="p-6 bg-gray-50">
          <h3 className="font-semibold mb-4">Event Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm">Exam</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">Holiday</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm">Event</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-sm">Deadline</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-sm">Semester</span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
