import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Minus,
  Stethoscope,
  Phone,
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  MessageSquare,
  Video,
  Brain,
  Map,
  Search,
  Heart,
  Users,
  Building2,
  Pill,
  Navigation,
  Plus,
  X,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";

const IIT_BHILAI_ORIGIN =
  "Indian Institute of Technology Bhilai, IIT Bhilai, 6th Lane Road, Jevra, Chhattisgarh 491002";

const openGoogleMapsDirections = (destination: string) => {
  const origin = encodeURIComponent(IIT_BHILAI_ORIGIN);
  const encodedDestination = encodeURIComponent(destination);

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${encodedDestination}&travelmode=driving`;

  window.open(mapsUrl, "_blank");
};

const openDirectionsFromIIT = (destination: string) => {
  const origin = encodeURIComponent(IIT_BHILAI_ORIGIN);
  const dest = encodeURIComponent(destination);

  const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
  window.open(url, "_blank");
};

// Alternative with current location explicitly requested
const openGoogleMapsWithCurrentLocation = (destination: string) => {
  // This will prompt user to allow location access
  const encodedDestination = encodeURIComponent(destination);
  
  // Construct URL that will ask for current location
  const mapsUrl = `https://www.google.com/maps/dir//${encodedDestination}`;
  
  window.open(mapsUrl, '_blank');
};


type MentalHealthAPIResponse = {
  percentage: number;
  rating: string;
  suggestions: string[];
};


async function evaluateMentalHealth(
  summary: {
    question: string;
    answer: string;
    score: number;
  }[]
): Promise<MentalHealthAPIResponse> {
  const response = await fetch("/api/mental-health", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers: summary }),
  });

  if (!response.ok) {
    throw new Error("Mental health evaluation failed");
  }

  return response.json();
}




// ============ DATA ============

const doctorsData = [
  {
    id: 1,
    name: "Dr. Atul Prakash Srivastava",
    specialization: "General & Emergency Physician",
    availableDays: "Mon–Fri",
    timings: "09:30 AM–06:00 PM",
    availability: [
      { day: "Monday", weeks: [1,2,3,4,5], start: "09:30", end: "18:00" },
      { day: "Tuesday", weeks: [1,2,3,4,5], start: "09:30", end: "18:00" },
      { day: "Wednesday", weeks: [1,2,3,4,5], start: "09:30", end: "18:00" },
      { day: "Thursday", weeks: [1,2,3,4,5], start: "09:30", end: "18:00" },
      { day: "Friday", weeks: [1,2,3,4,5], start: "09:30", end: "18:00" },
    ],
  },

  {
    id: 2,
    name: "Dr. Ankur Parganiha",
    specialization: "Paediatric",
    availableDays: "1st & 3rd Fri",
    timings: "02:00 PM–04:00 PM",
    availability: [
      { day: "Friday", weeks: [1,3], start: "14:00", end: "16:00" },
    ],
  },

  {
    id: 3,
    name: "Dr. Anuj Gupta",
    specialization: "ENT",
    availableDays: "2nd & 4th Fri",
    timings: "03:00 PM–05:00 PM",
    availability: [
      { day: "Friday", weeks: [2,4], start: "15:00", end: "17:00" },
    ],
  },

  {
    id: 4,
    name: "Dr. Vishal Agrawal",
    specialization: "General Medicine",
    availableDays: "2nd & 4th Tue",
    timings: "04:00 PM–06:00 PM",
    availability: [
      { day: "Tuesday", weeks: [2,4], start: "16:00", end: "18:00" },
    ],
  },

  {
    id: 5,
    name: "Dr. Rahul Thakur",
    specialization: "Orthopaedic",
    availableDays: "1st & 3rd Wed",
    timings: "04:00 PM–06:00 PM",
    availability: [
      { day: "Wednesday", weeks: [1,3], start: "16:00", end: "18:00" },
    ],
  },

  {
    id: 6,
    name: "Dr. Saket Banchhore",
    specialization: "Dentist",
    availableDays: "2nd & 4th Wed",
    timings: "02:00 PM–04:00 PM",
    availability: [
      { day: "Wednesday", weeks: [2,4], start: "14:00", end: "16:00" },
    ],
  },

  {
    id: 7,
    name: "Dr. Alloukik Agrawal",
    specialization: "Psychiatry",
    availableDays: "1st & 3rd Thu",
    timings: "12:00 PM–02:00 PM",
    availability: [
      { day: "Thursday", weeks: [1,3], start: "12:00", end: "14:00" },
    ],
  },

  {
    id: 8,
    name: "Dr. Bhuvaneshwari Dewangan",
    specialization: "Dermatology",
    availableDays: "2nd & 4th Thu",
    timings: "01:30 PM–03:30 PM",
    availability: [
      { day: "Thursday", weeks: [2,4], start: "13:30", end: "15:30" },
    ],
  },

  {
    id: 9,
    name: "Dr. Monideepa Saha",
    specialization: "Obs & Gynae",
    availableDays: "All Tuesdays",
    timings: "03:30 PM–05:30 PM",
    availability: [
      { day: "Tuesday", weeks: [1,2,3,4,5], start: "15:30", end: "17:30" },
    ],
  },

  {
    id: 10,
    name: "Dr. Suyas Noel",
    specialization: "Ophthalmologist",
    availableDays: "2nd Saturday",
    timings: "10:00 AM–12:00 PM",
    availability: [
      { day: "Saturday", weeks: [2], start: "10:00", end: "12:00" },
    ],
  },

  {
    id: 11,
    name: "Dr. Anushree",
    specialization: "Physiotherapy",
    availableDays: "Mon–Sat",
    timings: "09:00 AM–03:00 PM",
    availability: [
      { day: "Monday", weeks: [1,2,3,4,5], start: "09:00", end: "15:00" },
      { day: "Tuesday", weeks: [1,2,3,4,5], start: "09:00", end: "15:00" },
      { day: "Wednesday", weeks: [1,2,3,4,5], start: "09:00", end: "15:00" },
      { day: "Thursday", weeks: [1,2,3,4,5], start: "09:00", end: "15:00" },
      { day: "Friday", weeks: [1,2,3,4,5], start: "09:00", end: "15:00" },
      { day: "Saturday", weeks: [1,2,3,4,5], start: "09:00", end: "15:00" },
    ],
  },

  {
    id: 12,
    name: "Dr. Pavendra Chandrakar",
    specialization: "Yoga",
    availableDays: "Mon–Sat",
    timings: "06:00 AM–08:00 AM & 05:00 PM–07:00 PM",
    availability: [
      { day: "Monday", weeks: [1,2,3,4,5], start: "06:00", end: "08:00" },
      { day: "Monday", weeks: [1,2,3,4,5], start: "17:00", end: "19:00" },

      { day: "Tuesday", weeks: [1,2,3,4,5], start: "06:00", end: "08:00" },
      { day: "Tuesday", weeks: [1,2,3,4,5], start: "17:00", end: "19:00" },

      { day: "Wednesday", weeks: [1,2,3,4,5], start: "06:00", end: "08:00" },
      { day: "Wednesday", weeks: [1,2,3,4,5], start: "17:00", end: "19:00" },

      { day: "Thursday", weeks: [1,2,3,4,5], start: "06:00", end: "08:00" },
      { day: "Thursday", weeks: [1,2,3,4,5], start: "17:00", end: "19:00" },

      { day: "Friday", weeks: [1,2,3,4,5], start: "06:00", end: "08:00" },
      { day: "Friday", weeks: [1,2,3,4,5], start: "17:00", end: "19:00" },

      { day: "Saturday", weeks: [1,2,3,4,5], start: "06:00", end: "08:00" },
      { day: "Saturday", weeks: [1,2,3,4,5], start: "17:00", end: "19:00" },
    ],
  },
];



const emergencyContacts = [
  { title: "Health Centre Telephone", number: "07882991612", icon: Phone },
  { title: "Health Centre Helpline", number: "09424283691", icon: Phone },
  { title: "Ambulance", number: "07647068419", icon: AlertCircle },
];

const hospitalsData = [
  { 
    id: 1, 
    name: "HI-TEK Superspeciality Hospital, Bhilai", 
    distance: 4.6, 
    travelTime: "19 min", 
    specialization: "Multi-specialty, Emergency", 
    helpline: "0788-2233445", 
    availability: "24x7",
    address: "Bhilai, Chhattisgarh"
  },
  { 
    id: 2, 
    name: "Sparsh MultiSpecialty Hospital", 
    distance: 6.4, 
    travelTime: "18 min", 
    specialization: "Multi-specialty, Critical Care", 
    helpline: "0788-2233556", 
    availability: "24x7",
    address: "Ram Nagar Supela, Bhilai"
  },
  { 
    id: 3, 
    name: "Dr. B. R. Ambedkar Memorial Hospital", 
    distance: 39.2, 
    travelTime: "1 hr 28 min", 
    specialization: "Government, Multi-specialty", 
    helpline: "0771-2445300", 
    availability: "24x7",
    address: "Pandri, Raipur"
  },
  { 
    id: 4, 
    name: "Narayana Multispeciality Hospital", 
    distance: 45.6, 
    travelTime: "1 hr 17 min", 
    specialization: "Cardiology, Neurology", 
    helpline: "0771-3988888", 
    availability: "24x7",
    address: "Shankar Nagar, Raipur"
  },
];

const medicalStoresData = [
  { 
    id: 1, 
    name: "Jan Aushadhi Store", 
    distance: 4.6, 
    travelTime: "15 min", 
    phone: "078229-00777", 
    timings: "08:00 AM–08:00 PM",
    address: "Vivekanand Nagar, Bhilai"
  },
  { 
    id: 2, 
    name: "C.G. Medical Stores", 
    distance: 4.6, 
    travelTime: "13 min", 
    phone: "09876543211", 
    timings: "08:00 AM–10:00 PM",
    address: "Smriti Nagar, Bhilai, Durg"
  },
  { 
    id: 3, 
    name: "Mahadev Medical Store", 
    distance: 5.0, 
    travelTime: "14 min", 
    phone: "09876543212", 
    timings: "08:00 AM–10:00 PM",
    address: "Shanti Nagar, Smriti Nagar, Durg"
  },
  { 
    id: 4, 
    name: "Laxmi Medical Hall", 
    distance: 6.5, 
    travelTime: "17 min", 
    phone: "09876543213", 
    timings: "08:00 AM–10:00 PM",
    address: "Supela, Bhilai, Chhattisgarh "
  },
];

const getWeekOfMonth = (date: Date) => {
  return Math.ceil(date.getDate() / 7);
};

const getNext14ValidDates = (doctor: any) => {
  const today = new Date();
  const validDates: string[] = [];

  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);

    const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
    const week = getWeekOfMonth(d);

    const allowed = doctor.availability.some(
      (a: any) => a.day === dayName && a.weeks.includes(week)
    );

    if (allowed) {
      validDates.push(d.toISOString().split("T")[0]);
    }
  }

  return validDates;
};

const generateTimeSlots = (start: string, end: string) => {
  const slots: string[] = [];
  let [h, m] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  while (h < eh || (h === eh && m < em)) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += 15;
    if (m >= 60) {
      h++;
      m = 0;
    }
  }
  return slots;
};


const mentalHealthQuestions = [
  {
    id: 1,
    question: "How often do you feel stressed or overwhelmed?",
    options: [
      { label: "Almost never", value: 1 },
      { label: "Occasionally", value: 2 },
      { label: "Quite often", value: 3 },
      { label: "Almost always", value: 4 },
    ],
  },
  {
    id: 2,
    question: "How would you rate your quality of sleep recently?",
    options: [
      { label: "Very good and refreshing", value: 1 },
      { label: "Mostly good", value: 2 },
      { label: "Poor or irregular", value: 3 },
      { label: "Very poor or insomnia", value: 4 },
    ],
  },
  {
    id: 3,
    question: "How well are you able to concentrate on studies or work?",
    options: [
      { label: "Very well", value: 1 },
      { label: "Fairly well", value: 2 },
      { label: "With difficulty", value: 3 },
      { label: "Unable to concentrate", value: 4 },
    ],
  },
  {
    id: 4,
    question: "How often do you feel low, sad, or demotivated?",
    options: [
      { label: "Rarely", value: 1 },
      { label: "Sometimes", value: 2 },
      { label: "Frequently", value: 3 },
      { label: "Almost every day", value: 4 },
    ],
  },
  {
    id: 5,
    question: "How comfortable are you sharing your problems with others?",
    options: [
      { label: "Very comfortable", value: 1 },
      { label: "Somewhat comfortable", value: 2 },
      { label: "Not very comfortable", value: 3 },
      { label: "I avoid sharing completely", value: 4 },
    ],
  },
  {
    id: 6,
    question: "How often do you feel mentally exhausted?",
    options: [
      { label: "Rarely", value: 1 },
      { label: "Occasionally", value: 2 },
      { label: "Frequently", value: 3 },
      { label: "Almost all the time", value: 4 },
    ],
  },
  {
    id: 7,
    question: "How balanced is your daily routine (sleep, food, activity)?",
    options: [
      { label: "Very balanced", value: 1 },
      { label: "Mostly balanced", value: 2 },
      { label: "Quite irregular", value: 3 },
      { label: "Completely irregular", value: 4 },
    ],
  },
  {
    id: 8,
    question: "How hopeful do you feel about your near future?",
    options: [
      { label: "Very hopeful", value: 1 },
      { label: "Somewhat hopeful", value: 2 },
      { label: "Uncertain", value: 3 },
      { label: "Not hopeful at all", value: 4 },
    ],
  },
];


// ============ COMPONENTS ============

// Tab 1: Overview
function OverviewTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      {/* Welcome Card */}
<Card className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 border-0">
  <h2 className="text-3xl font-bold mb-2">Sushrut Health Centre, IIT Bhilai</h2>
  <p className="text-muted-foreground mb-6">Your trusted partner in campus wellness and healthcare</p>
        <div className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
             <Button className="gap-2" onClick={() => setActiveTab("consultation")}>

                <Calendar size={18} /> Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Book an Appointment</DialogTitle>
                <DialogDescription>Select a doctor and preferred time</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">Feature fully integrated in "Online Consultation" tab</p>
              </div>
            </DialogContent>
          </Dialog>
          <Button
  variant="outline"
  className="gap-2"
  onClick={() => setActiveTab("emergency")}
>

            <AlertCircle size={18} /> Emergency Call
          </Button>
        </div>
      </Card>

      {/* Health Centre Timings */}
      <div className="grid md:grid-cols-2 gap-6">
       {/* Sushrut Health Centre Timings */}
<Card className="p-6">
  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
    <Clock size={20} className="text-primary" />
    Sushrut Health Centre Timings
  </h3>
  <div className="space-y-3">
    <div className="flex justify-between pb-3 border-b">
      <span className="font-medium">Monday to Friday</span>
      <span className="text-muted-foreground">09:00 AM – 05:30 PM</span>
    </div>
    <div className="flex justify-between pb-3 border-b">
      <span className="font-medium">Saturday, Sunday & Holidays</span>
      <span className="text-muted-foreground">09:00 AM – 05:30 PM</span>
    </div>
    <div className="flex justify-between pt-3 bg-red-50 p-3 rounded-lg">
      <span className="font-semibold text-red-900">Emergency</span>
      <span className="font-bold text-red-900">24x7</span>
    </div>
  </div>
</Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Stethoscope size={20} className="text-primary" />
            Quick Actions
          </h3>
          <div className="space-y-3">
           <Button
  variant="outline"
  className="w-full justify-start gap-2"
  onClick={() => setActiveTab("doctors")}
>

              <Users size={18} />
              View All Doctors
            </Button>
            <Button
  variant="outline"
  className="w-full justify-start gap-2"
  onClick={() => setActiveTab("emergency")}
>

              <AlertCircle size={18} />
              Emergency Contacts
            </Button>
            <Button
  variant="outline"
  className="w-full justify-start gap-2"
  onClick={() => setActiveTab("hospitals")}
>

              <Building2 size={18} />
              View Hospitals
            </Button>
          </div>
        </Card>
      </div>

      {/* Important Information */}
      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <div className="flex gap-4">
          <AlertCircle size={24} className="text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-yellow-900 mb-2">Important Medical Instructions</h4>
            <ul className="space-y-1 text-sm text-yellow-800 list-disc list-inside">
              <li>Please bring your college ID for all medical consultations</li>
              <li>Arrive 10 minutes early for appointments</li>
              <li>For emergencies, call 07647068419 immediately</li>
              <li>All prescriptions and medical reports are confidential</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Tab 2: Doctors & Timings
function DoctorsTab({
  selectedDoctor,
  setSelectedDoctor,
  setActiveTab,
}: {
  selectedDoctor: any;
  setSelectedDoctor: (doc: any) => void;
  setActiveTab: (tab: string) => void;
}) {


 




  const [searchQuery, setSearchQuery] = useState("");
  const [filterSpecialization, setFilterSpecialization] = useState("");

  const filteredDoctors = doctorsData.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialization = !filterSpecialization || doctor.specialization.includes(filterSpecialization);
    return matchesSearch && matchesSpecialization;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
  <Input
    placeholder="Search doctor by name..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
</div>

        <select
          value={filterSpecialization}
          onChange={(e) => setFilterSpecialization(e.target.value)}
          className="px-4 py-2 rounded-lg border border-border bg-background"
        >
          
          <option value="">All Specializations</option>
  <option value="General">General & Emergency Physician</option>
  <option value="General Medicine">General Medicine</option>
  <option value="Paediatric">Paediatric</option>
  <option value="ENT">ENT</option>
  <option value="Orthopaedic">Orthopaedic</option>
  <option value="Dentist">Dentist</option>
  <option value="Psychiatry">Psychiatry</option>
  <option value="Dermatology">Dermatology</option>
  <option value="Obs">Obs & Gynae</option>
  <option value="Ophthalmologist">Ophthalmologist</option>
  <option value="Physiotherapy">Physiotherapy</option>
  <option value="Yoga">Yoga</option>
        </select>
      </div>


      {/* Doctors Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-4 font-semibold">Sr No</th>
              <th className="text-left p-4 font-semibold">Doctor Name</th>
              <th className="text-left p-4 font-semibold">Specialization</th>
              <th className="text-left p-4 font-semibold">Available Days</th>
              <th className="text-left p-4 font-semibold">Timings</th>
              <th className="text-left p-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.map((doctor, index) => (
              <tr key={doctor.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-4">{index + 1}</td>
                <td className="p-4 font-medium">{doctor.name}</td>
                <td className="p-4">{doctor.specialization}</td>
               <td className="p-4">{doctor.availableDays}</td>
<td className="p-4 text-muted-foreground">{doctor.timings}</td>

                <td className="p-4">
                <Button
  size="sm"
  onClick={() => {
    setSelectedDoctor(doctor);
    setActiveTab("consultation");

    // 👇 ADD THIS LINE
    window.scrollTo({ top: 0, behavior: "smooth" });
  }}
>
  Book
</Button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredDoctors.length === 0 && (
        <Card className="p-8 text-center bg-gray-50">
          <p className="text-muted-foreground">No doctors found matching your criteria</p>
        </Card>
      )}
    </div>
  );
}

// Tab 3: Emergency Contacts
function EmergencyContactsTab() {
  return (
    <div className="space-y-6">
      {/* Emergency Warning */}
      <Card className="p-6 bg-red-50 border-red-200">
        <div className="flex gap-4">
          <AlertCircle size={28} className="text-red-600 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-red-900 mb-2">In case of medical emergency</h3>
            <p className="text-red-800">Call the ambulance number immediately: <span className="font-bold text-2xl">07647068419</span></p>
          </div>
        </div>
      </Card>

      {/* Emergency Contacts Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {emergencyContacts.map((contact, index) => {
          const IconComponent = contact.icon;
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <IconComponent size={24} className="text-primary" />
                <Badge variant="outline">Important</Badge>
              </div>
              <h3 className="font-semibold mb-3">{contact.title}</h3>
              <p className="text-2xl font-bold text-primary mb-4">{contact.number}</p>
              <Button className="w-full gap-2">
                <Phone size={18} />
                Call Now
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Additional Emergency Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">On-call Services</h3>
        <ul className="space-y-3">
          <li className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>On-call Doctors (available 24/7)</span>
          </li>
          <li className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Nursing Staff (available 24/7)</span>
          </li>
          <li className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Psychological Counselor (on call)</span>
          </li>
          <li className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Ambulance Service (immediate dispatch)</span>
          </li>
        </ul>
      </Card>

      {/* Quick Tips */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Emergency Tips</h3>
        <ul className="space-y-2 text-sm text-blue-800 list-disc list-inside">
          <li>Always keep emergency numbers saved in your phone</li>
          <li>Know your blood type and any allergies</li>
          <li>Keep important medical documents handy</li>
          <li>Share emergency contacts with close friends and family</li>
        </ul>
      </Card>
    </div>
  );
}

// Tab 4: Hospitals & Medical Stores
function HospitalsTab() {
  const [hospitalSubTab, setHospitalSubTab] = useState("hospitals");

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setHospitalSubTab("hospitals")}
          className={`pb-4 px-4 font-medium transition-colors ${
            hospitalSubTab === "hospitals"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 size={18} className="inline mr-2" />
          Nearby Hospitals
        </button>
        <button
          onClick={() => setHospitalSubTab("stores")}
          className={`pb-4 px-4 font-medium transition-colors ${
            hospitalSubTab === "stores"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Pill size={18} className="inline mr-2" />
          Medical Stores
        </button>
      </div>

      {/* Hospitals Content */}
      {hospitalSubTab === "hospitals" && (
        <div className="grid md:grid-cols-2 gap-6">
          {hospitalsData.map((hospital) => (
            <Card key={hospital.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">{hospital.name}</h3>
                <Badge className="bg-green-100 text-green-800">{hospital.availability}</Badge>
              </div>
             <div className="space-y-3 mb-4 text-sm">
  <div className="flex items-center gap-2">
    <MapPin size={16} className="text-muted-foreground" />
    <span>{hospital.distance} km away • {hospital.travelTime} by car</span>
  </div>
  <div className="flex items-center gap-2">
    <Stethoscope size={16} className="text-muted-foreground" />
    <span>{hospital.specialization}</span>
  </div>
  <div className="flex items-center gap-2">
    <Phone size={16} className="text-muted-foreground" />
    <span>{hospital.helpline}</span>
  </div>
  <div className="text-xs text-muted-foreground mt-1">
    {hospital.address}
  </div>
</div>
<Button 
  className="w-full gap-2"
  onClick={() => openGoogleMapsDirections(`${hospital.name}, ${hospital.address}`)}
>
  <Navigation size={18} />
  View on Map
</Button>
            </Card>
          ))}
        </div>
      )}

      {/* Medical Stores Content */}
      {hospitalSubTab === "stores" && (
        <div className="grid md:grid-cols-2 gap-6">
          {medicalStoresData.map((store) => (
            <Card key={store.id} className="p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-4">{store.name}</h3>
             <div className="space-y-3 mb-4 text-sm">
  <div className="flex items-center gap-2">
    <MapPin size={16} className="text-muted-foreground" />
    <span>{store.distance} km away • {store.travelTime} by car</span>
  </div>
  <div className="flex items-center gap-2">
    <Clock size={16} className="text-muted-foreground" />
    <span>{store.timings}</span>
  </div>
  <div className="text-xs text-muted-foreground mt-1">
    {store.address}
  </div>
</div>
<Button 
  className="w-full gap-2"
  onClick={() => openGoogleMapsDirections(`${store.name}, ${store.address}`)}
>
  <Navigation size={18} />
  View on Map
</Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Tab 5: Online Consultation
function OnlineConsultationTab({
  selectedDoctor,
  appointments,
  setAppointments,
}: {
  selectedDoctor: any;
  appointments: any[];
  setAppointments: React.Dispatch<React.SetStateAction<any[]>>;
}) {

  const [doctorId, setDoctorId] = useState<number | null>(
    
  selectedDoctor ? selectedDoctor.id : null
);

useEffect(() => {
  if (selectedDoctor) {
    setDoctorId(selectedDoctor.id);
  }
}, [selectedDoctor]);

const [selectedDate, setSelectedDate] = useState("");
const [selectedTime, setSelectedTime] = useState("");

const activeDoctor = doctorsData.find(d => d.id === doctorId);

const selectedDateObj = selectedDate ? new Date(selectedDate) : null;
const selectedDayName = selectedDateObj
  ? selectedDateObj.toLocaleDateString("en-US", { weekday: "long" })
  : null;
const selectedWeek = selectedDateObj
  ? Math.ceil(selectedDateObj.getDate() / 7)
  : null;



  

  return (
    <div className="space-y-6">
      {/* Book Appointment Section */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Plus size={20} /> Book New Appointment
        </h3>
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <div>
            <Label className="text-sm">Doctor</Label>
           <select
  className="w-full mt-2 px-3 py-2 rounded-lg border border-border"
  value={doctorId ?? ""}
  onChange={(e) => {
    setDoctorId(Number(e.target.value));
    setSelectedDate("");
    setSelectedTime("");
  }}
>
  <option value="">Select Doctor</option>
  {doctorsData.map((doc) => (
    <option key={doc.id} value={doc.id}>
      {doc.name}
    </option>
  ))}
</select>

          </div>
          <div>
            <Label className="text-sm">Preferred Date</Label>
           <select
  className="w-full mt-2 px-3 py-2 rounded-lg border border-border"
  disabled={!activeDoctor}
  value={selectedDate}
  onChange={(e) => {
    setSelectedDate(e.target.value);
    setSelectedTime("");
  }}
>
  <option value="">Select Date</option>
  {activeDoctor &&
    getNext14ValidDates(activeDoctor).map((date) => (
      <option key={date} value={date}>
        {date}
      </option>
    ))}
</select>

          </div>
          <div>
            <Label className="text-sm">Preferred Time</Label>
           <select
  className="w-full mt-2 px-3 py-2 rounded-lg border border-border"
  disabled={!selectedDate}
  value={selectedTime}
  onChange={(e) => setSelectedTime(e.target.value)}
>
  <option value="">Select Time</option>

 {activeDoctor &&
selectedDate &&
[
  ...new Set(
    activeDoctor.availability
      .filter(
        (a: any) =>
          a.day === selectedDayName &&
          a.weeks.includes(selectedWeek)
      )
      .flatMap((a: any) => generateTimeSlots(a.start, a.end))
  ),
].map((slot) => (
  <option key={slot} value={slot}>
    {slot}
  </option>
))}


</select>

          </div>
         <div className="flex items-end">
  <Button
    className="w-full"
    disabled={!doctorId || !selectedDate || !selectedTime}
    onClick={() => {
      if (!activeDoctor) return;

      const newAppointment = {
        id: Date.now(),
        doctor: activeDoctor.name,
        date: selectedDate,
        time: selectedTime,
        status: "confirmed",
      };

      setAppointments((prev) => [newAppointment, ...prev]);

      // reset fields
      setSelectedDate("");
      setSelectedTime("");

      alert("Appointment booked successfully");
    }}
  >
    Book Appointment
  </Button>
</div>

        </div>
      </Card>

      {/* My Appointments */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar size={20} /> My Appointments
        </h3>
        <div className="space-y-3">
          {appointments.map((apt) => (
            <div key={apt.id} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold">{apt.doctor}</h4>
                  <p className="text-sm text-muted-foreground">
                    {apt.date} at {apt.time}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800">{apt.status}</Badge>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="gap-2">
                  <MessageSquare size={16} />
                  Reschedule
                </Button>
               <Button
  size="sm"
  className="gap-2 bg-green-600 hover:bg-green-700"
  onClick={() => {
    window.open("https://meet.google.com/new", "_blank");
  }}
>
  <Video size={16} />
  Join Video Call
</Button>


              </div>
            </div>
          ))}
        </div>
      </Card>

     {/* Interactive Video Call Interface */}
<Card 
  className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white min-h-96 flex flex-col items-center justify-center rounded-lg cursor-pointer hover:from-gray-800 hover:to-gray-700 transition-all group border border-gray-700"
  onClick={() => {
    window.open("https://meet.google.com/new", "_blank");
  }}
>
  <div className="relative mb-6">
    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
      <Video size={32} />
    </div>
    <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
      <div className="w-4 h-4 bg-white rounded-full"></div>
    </div>
  </div>
  
  <p className="text-2xl font-bold mb-2">Start Video Consultation</p>
  <p className="text-gray-300 text-center mb-4 max-w-md">
    Connect with your healthcare provider via secure video call
  </p>
  
  <div className="flex items-center gap-2 bg-gray-700/50 px-4 py-2 rounded-lg border border-gray-600 group-hover:border-blue-400 transition-colors">
    <Video size={18} className="text-blue-300" />
    <span className="font-medium">Join Google Meet Session</span>
    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
  </div>
  
  <p className="text-gray-400 text-xs mt-4">Click anywhere to start your video consultation</p>
</Card>
    </div>
  );
}

// Tab 6: Mental Wellness
function MentalWellnessTab() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  const [aiResult, setAiResult] = useState<null | {
    percentage: number;
    rating: string;
    suggestions: string[];
  }>(null);

  const [showGeminiTest, setShowGeminiTest] = useState(true);

  const handleAnswer = (value: number) => {
    setAnswers({ ...answers, [mentalHealthQuestions[currentQuestion].id]: value });
  };

  const nextQuestion = () => {
    if (currentQuestion < mentalHealthQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const buildSummaryForAI = () => {
    return mentalHealthQuestions.map((q) => {
      const selectedValue = answers[q.id];
      const selectedOption = q.options.find(
        (opt) => opt.value === selectedValue
      );

      return {
        question: q.question,
        answer: selectedOption?.label || "No answer",
        score: selectedValue || 0,
      };
    });
  };

  const finishAssessment = async () => {
    if (Object.keys(answers).length !== mentalHealthQuestions.length) return;

    setLoading(true);

    const summary = buildSummaryForAI();

    try {
      const response = await evaluateMentalHealth(summary);

      setAiResult({
        percentage: response.percentage,
        rating: response.rating,
        suggestions: response.suggestions,
      });

      setShowResults(true);
    } catch (err) {
      alert("Failed to evaluate mental health");
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = () => {
    const values = Object.values(answers);
    return values.length > 0 ? Math.round((values.reduce((a, b) => a + b, 0) / (values.length * 5)) * 100) : 0;
  };

  const getRecommendation = (score: number) => {
    if (score >= 70) return { level: "High", text: "Please consult a healthcare professional", color: "red" };
    if (score >= 40) return { level: "Moderate", text: "Consider talking to a counselor", color: "yellow" };
    return { level: "Low", text: "You're doing well, continue self-care practices", color: "green" };
  };

  if (showResults && aiResult) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Mental Health Evaluation</h2>

          <div className="text-5xl font-bold text-primary mb-2">
            {aiResult.percentage}%
          </div>

          <p className="text-lg font-semibold mb-6">
            Overall Status: {aiResult.rating}
          </p>

          <div className="text-left bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-3">Suggestions</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              {(aiResult.suggestions ?? []).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <Button
            className="w-full"
            onClick={() => {
              setShowResults(false);
              setAiResult(null);
              setAnswers({});
              setCurrentQuestion(0);
            }}
          >
            Start Again
          </Button>
        </Card>
      </div>
    );
  }

  // Gemini Test Section
  if (showGeminiTest) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Card className="p-8 border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-4">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">AI-Powered Wellness Test</h1>
            <p className="text-gray-600 mb-6">Powered by Google Gemini AI • Advanced analysis</p>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800">Gemini AI Engine Active</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-white/80 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                What Gemini AI Offers
              </h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span>Advanced emotional pattern recognition</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span>Personalized wellness recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span>Context-aware mental health analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span>Real-time stress level monitoring</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 bg-white/80 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-3">Test Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Questions</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Duration</span>
                  <span className="font-semibold">3-5 minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI Analysis</span>
                  <span className="font-semibold text-blue-600">Gemini-Powered</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">Enhanced with Gemini AI</h4>
                <p className="text-sm text-gray-600">Get insights powered by Google's advanced AI model</p>
              </div>
            </div>
            
            <Button 
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => setShowGeminiTest(false)}
            >
              Start AI-Powered Test
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className="p-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Mental Wellness Assessment</h3>
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {mentalHealthQuestions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / mentalHealthQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">{mentalHealthQuestions[currentQuestion].question}</h2>

          <RadioGroup
            onValueChange={(value) => handleAnswer(parseInt(value))}
            value={
              answers[mentalHealthQuestions[currentQuestion].id]
                ? answers[mentalHealthQuestions[currentQuestion].id].toString()
                : ""
            }
          >
            <div className="space-y-3">
              {mentalHealthQuestions[currentQuestion].options.map((opt, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                >
                  <RadioGroupItem
                    value={opt.value.toString()}
                    id={`q${mentalHealthQuestions[currentQuestion].id}-opt${idx}`}
                  />
                  <Label
                    htmlFor={`q${mentalHealthQuestions[currentQuestion].id}-opt${idx}`}
                    className="cursor-pointer flex-1"
                  >
                    {opt.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          {currentQuestion < mentalHealthQuestions.length - 1 ? (
            <Button onClick={nextQuestion} className="flex-1" disabled={!answers[mentalHealthQuestions[currentQuestion].id]}>
              Next
            </Button>
          ) : (
            <Button onClick={finishAssessment} className="flex-1" disabled={loading}>
              {loading ? "Analyzing..." : "Finish Assessment"}
            </Button>
          )}
        </div>
      </Card>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-xs text-blue-800">
          <strong>Disclaimer:</strong> This assessment is not a medical diagnosis. Please consult with a mental health professional for proper evaluation.
        </p>
      </Card>
    </div>
  );
}

// Tab 7: Maps & Navigation
function MapsTab() {
  return (
    <div className="space-y-6">
      {/* Simple Google Maps Embed centered on IIT Bhilai 6th Lane Road */}
      <Card className="p-0 overflow-hidden h-96">
        <a 
          href="https://www.google.com/maps/place/Indian+Institute+of+Technology+Bhilai/@21.2469983,81.3182281,17z/data=!3m1!4b1!4m6!3m5!1s0x3a28db65364103d5:0x9ca0815dc09dac5f!8m2!3d21.2469983!4d81.3182281!16s%2Fg%2F11g9pvz_n7?entry=ttu"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full"
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3937.4631089018458!2d81.31603930793509!3d21.246998262067454!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a28db65364103d5%3A0x9ca0815dc09dac5f!2sIndian%20Institute%20of%20Technology%20Bhilai!5e0!3m2!1sen!2sin!4v1769110968659!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="IIT Bhilai Campus Map - 6th Lane Road, Jevra"
            className="hover:opacity-90 transition-opacity"
          ></iframe>
        </a>
      </Card>

      {/* Simple Campus Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="text-primary" size={20} />
          IIT Bhilai - 6th Lane Road Campus
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <div>
              <p className="font-semibold text-blue-800">IIT Bhilai Main Campus</p>
              <p className="text-sm text-blue-600">6th Lane Road, Jevra, Chhattisgarh 491002</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
           <div className="text-center p-3 bg-gray-50 rounded-lg">
  <p className="text-sm text-gray-600">Distance from</p>
  <p className="font-semibold">Durg Railway Station</p>
  <p className="text-lg font-bold text-primary">5.4 km</p>
  <p className="text-xs text-gray-500 mb-3">(19 min drive)</p>

 <Button
  className="w-full gap-2 mt-3 bg-primary text-white hover:bg-primary/90"
  onClick={() =>
    openDirectionsFromIIT("Durg Railway Station, Durg, Chhattisgarh")
  }
>
  <Navigation size={18} />
  Get Directions
</Button>
</div>

<div className="text-center p-3 bg-gray-50 rounded-lg">
  <p className="text-sm text-gray-600">Distance from</p>
  <p className="font-semibold">Raipur Airport</p>
  <p className="text-lg font-bold text-primary">54 km</p>
  <p className="text-xs text-gray-500 mb-3">(1 hr 27 min drive)</p>

  <Button
  className="w-full gap-2 mt-3 bg-primary text-white hover:bg-primary/90"
  onClick={() =>
    openDirectionsFromIIT("Swami Vivekananda Airport, Raipur, Chhattisgarh")
  }
>
  <Navigation size={18} />
  Get Directions
</Button>
</div>
          </div>
          
         <div className="flex flex-col gap-3 mt-2">
  
</div>
        </div>
      </Card>

      {/* Navigation Options - Keep your existing cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Health Centre */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Stethoscope size={20} className="text-primary" />
            Sushrut Health Centre, IIT Bhilai
          </h3>
          <div className="space-y-3 mb-4 text-sm">
            <p><strong>Address:</strong> IIT Bhilai 6th Ln Rd, Jevra Sirsa</p>
            <p><strong>City:</strong> Chhattisgarh 491002</p>
            <p><strong>Location:</strong> Inside IIT Bhilai Campus</p>
          </div>
          <Button 
            className="w-full gap-2"
            onClick={() => openGoogleMapsDirections("Sushrut Health Centre, IIT Bhilai, IIT Bhilai 6th Ln Rd, Jevra Sirsa, Chhattisgarh 491002")}
          >
            <Navigation size={18} />
            View on Map
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 size={20} className="text-primary" />
            Nearest Hospital
          </h3>
          <div className="space-y-3 mb-4 text-sm">
            <p><strong>Name:</strong> HI-TEK Superspeciality Hospital, Bhilai</p>
            <p><strong>Distance:</strong> 4.6 km</p>
            <p><strong>ETA:</strong> 19 minutes by car</p>
          </div>
          <Button 
            className="w-full gap-2"
            onClick={() => openGoogleMapsDirections("HI-TEK Superspeciality Hospital, Bhilai")}
          >
            <Navigation size={18} />
            Get Route
          </Button>
        </Card>
      </div>
    </div>
  );
}

// ============ MAIN COMPONENT ============

export default function Medical() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  const [appointments, setAppointments] = useState([
    {
      id: 1,
      doctor: "Dr. Atul Prakash Srivastava",
      date: "2026-01-25",
      time: "14:00",
      status: "confirmed",
    },
  ]);
  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Medical & Healthcare</h1>
            <p className="text-muted-foreground mt-2">Comprehensive healthcare access for all campus members</p>
          </div>
        </div>

        {/* Main Tabs */}
      

<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
            <TabsTrigger value="consultation">Consultation</TabsTrigger>
            <TabsTrigger value="mental">Wellness</TabsTrigger>
            <TabsTrigger value="maps">Maps</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab setActiveTab={setActiveTab} />

          </TabsContent>

          <TabsContent value="doctors">
 <DoctorsTab
  selectedDoctor={selectedDoctor}
  setSelectedDoctor={setSelectedDoctor}
  setActiveTab={setActiveTab}
/>

</TabsContent>


          <TabsContent value="emergency">
            <EmergencyContactsTab />
          </TabsContent>

          <TabsContent value="hospitals">
            <HospitalsTab />
          </TabsContent>

         <TabsContent value="consultation">
  <OnlineConsultationTab
    selectedDoctor={selectedDoctor}
    appointments={appointments}
    setAppointments={setAppointments}
  />
</TabsContent>



          <TabsContent value="mental">
            <MentalWellnessTab />
          </TabsContent>

          <TabsContent value="maps">
            <MapsTab />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
