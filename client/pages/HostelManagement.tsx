import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  Building2,
  Wrench,
  FileText,
  Users,
  Bell,
} from "lucide-react";

/* ============================
   TYPES
============================ */

interface Roommate {
  name: string;
  rollNo?: string;
  contactNo?: string;
}

interface RoomDetails {
  _id: string;
  hostelName: string;
  roomNumber: string;
  floor: number;
  roomType: "Single" | "Double";
}

interface StudentSelf {
  name: string;
  studentId?: string;
  city?: string;
  contactNo?: string;
}

interface Complaint {
  _id: string;
  type: string;
  description: string;
  createdAt: string;
  status: "Pending" | "Resolved";
  complainerName: string;
  roomNo: string;
}

interface HostelNotice {
  _id: string;
  title: string;
  dateTime: string;
  description: string;
}

interface VisitorLog {
  _id: string;
  name: string;
  relation: string;
  visitDate: string;
  status: "Approved" | "Pending";
}

interface HostelRule {
  _id: string;
  text: string;
}

/* ============================
   FETCHERS
============================ */

async function fetchMyRoom(): Promise<{ student: StudentSelf; room: RoomDetails; roommates: Roommate[] } | null> {
  const res = await fetch("/api/hostel-room/me", { credentials: "include" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load room details");
  return res.json();
}

async function fetchHostelRules(): Promise<HostelRule[]> {
  const res = await fetch("/api/hostel-rules", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load hostel rules");
  const data = await res.json();
  return data.rules;
}

async function fetchHostelNotices(): Promise<HostelNotice[]> {
  const res = await fetch("/api/hostel-notices", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load hostel notices");
  const data = await res.json();
  return data.notices;
}

async function fetchComplaints(): Promise<Complaint[]> {
  const res = await fetch("/api/complaints", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load complaints");
  const data = await res.json();
  return data.complaints;
}

async function fetchVisitors(): Promise<VisitorLog[]> {
  const res = await fetch("/api/visitors", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load visitor log");
  const data = await res.json();
  return data.visitors;
}

/* ============================
   MAIN COMPONENT
============================ */

export default function HostelManagement() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("room");

  // ---- Room details ----
  const { data: roomData, isLoading: roomLoading, error: roomError } = useQuery({
    queryKey: ["hostel-room-me"],
    queryFn: fetchMyRoom,
  });

  const { data: rules, isLoading: rulesLoading } = useQuery({
    queryKey: ["hostel-rules"],
    queryFn: fetchHostelRules,
  });

  // ---- Complaints ----
  const { data: complaints, isLoading: complaintsLoading, error: complaintsError } = useQuery({
    queryKey: ["complaints"],
    queryFn: fetchComplaints,
  });
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [type, setType] = useState("Electricity");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitComplaintMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type,
          description,
          complainerName: roomData?.student.name ?? "",
          roomNo: roomData?.room.roomNumber ?? "",
        }),
      });
      if (!res.ok) throw new Error("Failed to submit complaint");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      setSelectedComplaint(data.complaint);
      setDescription("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    },
  });

  // ---- Notices ----
  const { data: notices, isLoading: noticesLoading, error: noticesError } = useQuery({
    queryKey: ["hostel-notices"],
    queryFn: fetchHostelNotices,
  });

  // ---- Visitors ----
  const { data: visitorRequests, isLoading: visitorsLoading, error: visitorsError } = useQuery({
    queryKey: ["visitors"],
    queryFn: fetchVisitors,
  });
  const [guestName, setGuestName] = useState("");
  const [relation, setRelation] = useState("");
  const [visitDate, setVisitDate] = useState("");

  const submitVisitorMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: guestName, relation, visitDate }),
      });
      if (!res.ok) throw new Error("Failed to submit visitor request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      setGuestName("");
      setRelation("");
      setVisitDate("");
    },
  });

  const sortedComplaints = [...(complaints ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Hostel Management</h1>
        <p className="text-muted-foreground">
          Manage room details, complaints, notices, and visitors.
        </p>
      </div>

      {/* Top Tabs (LIKE Medical Page) */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted rounded-lg p-1 inline-flex">
          <TabsTrigger value="room">Room Details</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
          <TabsTrigger value="notices">Hostel Notices</TabsTrigger>
          <TabsTrigger value="visitors">Visitor Logs</TabsTrigger>
        </TabsList>

        {/* ROOM DETAILS */}
        <TabsContent value="room" className="space-y-6">
          {roomLoading && <p className="text-muted-foreground">Loading room details...</p>}
          {roomError && <p className="text-red-600">Couldn't load room details.</p>}

          {!roomLoading && !roomError && !roomData && (
            <section className="rounded-xl border bg-background p-6 shadow-sm">
              <p className="text-muted-foreground">
                You haven't been assigned a hostel room yet. Contact your hostel admin.
              </p>
            </section>
          )}

          {roomData && (
            <>
              <section className="rounded-xl border bg-background p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Student Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Student Name", value: roomData.student.name, color: "bg-blue-50 text-blue-700" },
                    { label: "Student ID", value: roomData.student.studentId || "—", color: "bg-purple-50 text-purple-700" },
                    { label: "City", value: roomData.student.city || "—", color: "bg-green-50 text-green-700" },
                    { label: "Contact No", value: roomData.student.contactNo || "—", color: "bg-indigo-50 text-indigo-700" },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-lg p-4 ${item.color}`}>
                      <p className="text-xs opacity-80">{item.label}</p>
                      <p className="text-lg font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border bg-background p-6 shadow-sm">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  My Room Details
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {[
                    { label: "Hostel", value: roomData.room.hostelName, color: "bg-indigo-50 text-indigo-700" },
                    { label: "Room No", value: roomData.room.roomNumber, color: "bg-blue-50 text-blue-700" },
                    { label: "Floor", value: roomData.room.floor, color: "bg-emerald-50 text-emerald-700" },
                    { label: "Room Type", value: roomData.room.roomType, color: "bg-violet-50 text-violet-700" },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-lg p-4 ${item.color}`}>
                      <p className="text-xs opacity-80">{item.label}</p>
                      <p className="text-lg font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border bg-background p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Roommate Details</h2>
                {roomData.roommates.length === 0 ? (
                  <p className="text-muted-foreground">No roommates assigned to this room yet.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {roomData.roommates.map((rm, i) => (
                      <div key={i} className="rounded-lg p-4 bg-orange-50 text-orange-700">
                        <p className="text-xs opacity-80">Name</p>
                        <p className="text-lg font-semibold">{rm.name}</p>
                        {rm.rollNo && <p className="text-xs mt-1 opacity-80">{rm.rollNo}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {/* Hostel Rules */}
          <section className="rounded-xl border bg-background p-6 shadow-sm">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Hostel Rules
            </h2>
            {rulesLoading && <p className="text-muted-foreground mt-2">Loading rules...</p>}
            {rules && rules.length === 0 && (
              <p className="text-muted-foreground mt-2">No rules have been added for your institute yet.</p>
            )}
            <ul className="list-disc list-inside mt-4 space-y-2">
              {(rules ?? []).map((rule) => (
                <li key={rule._id}>{rule.text}</li>
              ))}
            </ul>
          </section>
        </TabsContent>

        {/* COMPLAINTS */}
        <TabsContent value="complaints" className="space-y-6">
          <section className="rounded-xl border bg-background p-6 shadow-sm">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Raise Maintenance Complaint
            </h2>

            <div className="space-y-4 mt-4">
              <select
                className="w-full border rounded-md p-2"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option>Electricity</option>
                <option>Water</option>
                <option>WiFi</option>
                <option>Furniture</option>
                <option>Other</option>
              </select>

              <textarea
                className="w-full border rounded-md p-2"
                placeholder="Describe the issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <button
                onClick={() => submitComplaintMutation.mutate()}
                disabled={!description || submitComplaintMutation.isPending}
                className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
              >
                {submitComplaintMutation.isPending ? "Submitting..." : "Submit Complaint"}
              </button>

              {submitted && (
                <p className="text-green-600">Complaint submitted successfully.</p>
              )}
              {submitComplaintMutation.isError && (
                <p className="text-red-600">Couldn't submit your complaint. Try again.</p>
              )}
            </div>
          </section>

          {/* Complaint Tracking */}
          <section className="rounded-xl border bg-background p-6 shadow-sm">
            <h2 className="text-xl font-semibold">My Complaints</h2>

            {complaintsLoading && <p className="text-muted-foreground mt-2">Loading complaints...</p>}
            {complaintsError && <p className="text-red-600 mt-2">Couldn't load your complaints.</p>}
            {complaints && complaints.length === 0 ? (
              <p className="text-muted-foreground mt-2">No complaints submitted yet.</p>
            ) : (
              <ul className="space-y-3 mt-4">
                {sortedComplaints.map((c) => {
                  const isOpen = selectedComplaint?._id === c._id;
                  const displayDateTime = new Date(c.createdAt).toLocaleString();
                  return (
                    <li key={c._id} className="space-y-2">
                      <div
                        onClick={() => setSelectedComplaint(isOpen ? null : c)}
                        className={`border rounded-md p-4 flex justify-between cursor-pointer
                          ${isOpen ? "bg-muted" : "hover:bg-muted"}`}
                      >
                        <div>
                          <p className="font-medium">{c.type}</p>
                          <p className="text-sm text-muted-foreground">{displayDateTime}</p>
                        </div>
                        <span
                          className={`text-sm font-semibold px-2 py-1 rounded-md ${
                            c.status === "Resolved"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>

                      {isOpen && (
                        <div className="ml-4 rounded-lg border bg-background p-4 text-sm">
                          <p><b>Complainer:</b> {c.complainerName}</p>
                          <p><b>Room No:</b> {c.roomNo}</p>
                          <p><b>Type:</b> {c.type}</p>
                          <p><b>Date & Time:</b> {displayDateTime}</p>
                          <p><b>Status:</b> {c.status}</p>
                          <p className="mt-2">
                            <b>Description:</b><br />
                            {c.description}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedComplaint(null);
                            }}
                            className="mt-3 text-xs text-primary underline"
                          >
                            Hide details
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </TabsContent>

        {/* NOTICES */}
        <TabsContent value="notices">
          <section className="rounded-xl border bg-background p-6 shadow-sm">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Hostel Notices
            </h2>

            {noticesLoading && <p className="text-muted-foreground mt-2">Loading notices...</p>}
            {noticesError && <p className="text-red-600 mt-2">Couldn't load hostel notices.</p>}
            {notices && notices.length === 0 && (
              <p className="text-muted-foreground mt-2">No hostel notices yet.</p>
            )}

            <div className="space-y-4 mt-4">
              {(notices ?? []).map((n) => (
                <div key={n._id} className="border-2 border-black rounded-md p-4 bg-orange-100">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(n.dateTime).toLocaleString()}
                  </p>
                  <p className="mt-1">{n.description}</p>
                </div>
              ))}
            </div>
          </section>
        </TabsContent>

        {/* VISITORS */}
        <TabsContent value="visitors" className="space-y-6">
          <section className="rounded-xl border bg-background p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Request Visitor Approval
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                className="border-2 border-black rounded-md p-2"
                placeholder="Guest Name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
              <input
                className="border-2 border-black rounded-md p-2"
                placeholder="Relation"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
              />
              <input
                type="date"
                className="border-2 border-black rounded-md p-2"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
              />
            </div>

            <button
              onClick={() => submitVisitorMutation.mutate()}
              disabled={!guestName || !relation || !visitDate || submitVisitorMutation.isPending}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
            >
              {submitVisitorMutation.isPending ? "Submitting..." : "Request Approval"}
            </button>
            {submitVisitorMutation.isError && (
              <p className="text-red-600 mt-2">Couldn't submit your request. Try again.</p>
            )}
          </section>

          <section className="rounded-xl border bg-background p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Visitor Log</h2>

            {visitorsLoading && <p className="text-muted-foreground">Loading visitor log...</p>}
            {visitorsError && <p className="text-red-600">Couldn't load visitor log.</p>}
            {visitorRequests && visitorRequests.length === 0 && (
              <p className="text-muted-foreground">No visitors logged yet.</p>
            )}

            <ul className="space-y-3">
              {(visitorRequests ?? []).map((v) => (
                <li
                  key={v._id}
                  className={`border-2 rounded-md p-4 flex justify-between
                    ${v.status === "Approved"
                      ? "bg-green-50 border-green-600"
                      : "bg-red-50 border-red-600"}`}
                >
                  <div>
                    <p className="font-medium">{v.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {v.relation} • {v.visitDate}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-semibold px-3 py-1 rounded-md
                      ${v.status === "Approved"
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"}`}
                  >
                    {v.status}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
