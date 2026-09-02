import "dotenv/config";
import mongoose from "mongoose";
import { Institute } from "../models/Institute";
import { Notice } from "../models/Notice";

// Transcribed from the original hardcoded `initialNotices` mock array that used
// to live in client/pages/Notices.tsx before it was migrated to fetch from the
// database. Field names match the Notice schema exactly (it was modeled on this
// mock data), so this is a direct mapping — only the `id` field is dropped,
// since MongoDB generates its own `_id`.
const noticeTemplates: {
  title: string;
  description: string;
  fullContent: string;
  date: string;
  time: string;
  category: string;
  priority: "urgent" | "high" | "medium" | "low";
  department: string;
  issuedBy: string;
  attachments?: string[];
  pinned?: boolean;
}[] = [
  {
    title: "Final Year Project Submission Deadline Extended",
    description:
      "Due to technical issues with the submission portal, the deadline for final year project submissions has been extended until January 30, 2026. All groups must submit their complete project reports and code repositories through the updated portal.",
    fullContent: `
      <h2>Final Year Project Submission - Deadline Extension</h2>
      <p>Dear Final Year Students,</p>
      <p>Due to unforeseen technical difficulties with our project submission portal, the Computer Science Department has decided to extend the submission deadline for all final year projects.</p>
      <p><strong>New Deadline:</strong> January 30, 2026 (Friday) - 11:59 PM</p>
      <p><strong>Important Notes:</strong></p>
      <ul>
        <li>The submission portal has been updated and is now fully functional</li>
        <li>All submissions must include: Complete project report, Source code repository link, Project demonstration video (10-15 minutes)</li>
        <li>Late submissions after the extended deadline will not be accepted under any circumstances</li>
        <li>Contact your project guide for any queries regarding submission format</li>
      </ul>
      <p>We apologize for the inconvenience and wish you the best for your project submissions.</p>
      <p><strong>Dr. S.K. Subidh Ali</strong><br>Head, Department of Computer Science<br>January 22, 2026</p>
    `,
    date: "2026-01-22",
    time: "10:30 AM",
    category: "Exam",
    priority: "urgent",
    department: "Computer Science",
    issuedBy: "Dr. S.K. Subidh Ali",
    attachments: ["Project Submission Guidelines.pdf"],
    pinned: true,
  },
  {
    title: "Campus Placement Drive: Google (2026 Batch)",
    description:
      "Google is conducting campus placements on February 15-16, 2026. All final year students with CGPA 8.0+ are eligible. Registration deadline: February 5, 2026.",
    fullContent: `
      <h2>Google Campus Placement Drive 2026</h2>
      <p><strong>Company:</strong> Google LLC</p>
      <p><strong>Drive Dates:</strong> February 15-16, 2026</p>
      <p><strong>Venue:</strong> Main Auditorium, Block A</p>
      <p><strong>Eligibility Criteria:</strong></p>
      <ul>
        <li>CGPA: 8.0 and above (No backlogs)</li>
        <li>Branches: Computer Science, IT, ECE, EEE</li>
        <li>Year of Passing: 2026</li>
      </ul>
      <p><strong>Registration Process:</strong></p>
      <ol>
        <li>Login to the placement portal</li>
        <li>Fill the Google registration form</li>
        <li>Upload updated resume</li>
        <li>Submit by February 5, 2026</li>
      </ol>
      <p><strong>Selection Process:</strong></p>
      <ul>
        <li>Online Assessment Test (February 10)</li>
        <li>Technical Interviews (February 15)</li>
        <li>HR Round (February 16)</li>
      </ul>
      <p>For queries, contact the Placement Cell.</p>
    `,
    date: "2026-01-22",
    time: "09:15 AM",
    category: "Placement",
    priority: "urgent",
    department: "Placement Cell",
    issuedBy: "Dr. Rekha Ravindran",
    attachments: ["Google_Placement_Brochure.pdf", "Registration_Form.docx"],
  },
  {
    title: "Semester 4 Time Table Released",
    description:
      "The detailed timetable for Semester 4 (2025-26 Winter) has been released. Check the academic portal for your class schedule, room allocations, and faculty details.",
    fullContent: `
      <h2>Semester 4 Timetable (2025-26 Winter Session)</h2>
      <p>The timetable for the ongoing semester has been finalized and published. All students must adhere to the schedule strictly.</p>
      <p><strong>Key Points:</strong></p>
      <ul>
        <li>Timetable is effective from January 20, 2026</li>
        <li>Classes will follow the regular schedule</li>
        <li>Lab sessions are marked in blue on the timetable</li>
        <li>Tutorial sessions are marked in green</li>
      </ul>
      <p><strong>Important Notes:</strong></p>
      <ul>
        <li>Attendance is mandatory for all classes</li>
        <li>Changes in timetable will be notified separately</li>
        <li>Contact your class representative for any conflicts</li>
      </ul>
      <p>Download the timetable from the attachments below.</p>
    `,
    date: "2026-01-21",
    time: "04:45 PM",
    category: "Academic",
    priority: "high",
    department: "Academic Office",
    issuedBy: "Dr. Arnab Patra",
    attachments: ["Sem4_Timetable.pdf"],
  },
  {
    title: "Hostel Maintenance - Water Supply Interruption",
    description:
      "Due to pipeline maintenance work, water supply in Boys Hostel Block B will be interrupted from 9 AM to 5 PM on January 24, 2026. Alternative arrangements have been made.",
    fullContent: `
      <h2>Hostel Water Supply Maintenance Notice</h2>
      <p>Dear Hostel Residents,</p>
      <p>This is to inform you that due to essential pipeline maintenance work, the water supply in Boys Hostel Block B will be temporarily interrupted.</p>
      <p><strong>Affected Area:</strong> Boys Hostel Block B (All floors)</p>
      <p><strong>Date:</strong> January 24, 2026 (Saturday)</p>
      <p><strong>Time:</strong> 9:00 AM to 5:00 PM</p>
      <p><strong>Alternative Arrangements:</strong></p>
      <ul>
        <li>Water tanks have been placed on each floor</li>
        <li>Boys Hostel Block A water supply will remain normal</li>
        <li>Mess timings will remain unchanged</li>
      </ul>
      <p>We apologize for the inconvenience and request your cooperation.</p>
      <p><strong>Hostel Warden Office</strong></p>
    `,
    date: "2026-01-21",
    time: "03:20 PM",
    category: "Hostel",
    priority: "medium",
    department: "Hostel Management",
    issuedBy: "Dr. Pawan Kumar Mishra",
  },
  {
    title: "Library Extended Hours for End-Semester Exams",
    description:
      "Central library will remain open 24/7 from January 25 to February 10, 2026 for end-semester exam preparation. Night canteen facilities will be available.",
    fullContent: `
      <h2>Library Extended Hours Announcement</h2>
      <p>To facilitate end-semester exam preparation, the Central Library will operate 24/7 during the following period:</p>
      <p><strong>Extended Hours Period:</strong> January 25 - February 10, 2026</p>
      <p><strong>Facilities Available:</strong></p>
      <ul>
        <li>All reading sections open 24/7</li>
        <li>Discussion rooms available (book in advance)</li>
        <li>Night canteen service from 10 PM to 6 AM</li>
        <li>Extra charging points installed</li>
        <li>Wi-Fi available throughout</li>
      </ul>
      <p><strong>Rules to Follow:</strong></p>
      <ul>
        <li>Carry your college ID card</li>
        <li>Maintain silence in reading areas</li>
        <li>No food items allowed except in designated areas</li>
        <li>Personal belongings responsibility</li>
      </ul>
      <p>Best wishes for your exams!</p>
    `,
    date: "2026-01-21",
    time: "11:00 AM",
    category: "Library",
    priority: "medium",
    department: "Central Library",
    issuedBy: "Library Committee",
    attachments: ["Library_Rules.pdf"],
  },
  {
    title: "Sports Week 2026 Registrations Open",
    description:
      "Annual Sports Week will be held from February 20-25, 2026. Registrations for all events are now open. Last date: February 10, 2026.",
    fullContent: `
      <h2>Sports Week 2026 - Registration Notice</h2>
      <p>Get ready for the most exciting event of the year! Sports Week 2026 is here with more events and bigger prizes.</p>
      <p><strong>Dates:</strong> February 20-25, 2026</p>
      <p><strong>Events:</strong></p>
      <ul>
        <li><strong>Athletics:</strong> 100m, 200m, 400m, Long Jump, High Jump</li>
        <li><strong>Team Sports:</strong> Football, Basketball, Volleyball, Cricket</li>
        <li><strong>Indoor Games:</strong> Chess, Carrom, Table Tennis</li>
        <li><strong>Special Events:</strong> Marathon, Tug of War</li>
      </ul>
      <p><strong>Registration Details:</strong></p>
      <ul>
        <li>Register at Sports Complex Office</li>
        <li>Online registration available on portal</li>
        <li>Last Date: February 10, 2026</li>
        <li>Registration Fee: ₹100 per individual event</li>
      </ul>
      <p>For more details, visit the Sports Office.</p>
    `,
    date: "2026-01-20",
    time: "02:30 PM",
    category: "Sports",
    priority: "medium",
    department: "Sports Committee",
    issuedBy: "Dr. Mahavir Sharma",
  },
  {
    title: "Medical Camp: Free Health Check-up",
    description:
      "A free health check-up camp will be organized at the Medical Center on January 25, 2026 from 10 AM to 4 PM. All students and staff are encouraged to participate.",
    fullContent: `
      <h2>Free Health Check-up Camp</h2>
      <p>The College Medical Center in collaboration with City General Hospital is organizing a free comprehensive health check-up camp for all students and staff members.</p>
      <p><strong>Date:</strong> January 25, 2026 (Saturday)</p>
      <p><strong>Time:</strong> 10:00 AM to 4:00 PM</p>
      <p><strong>Venue:</strong> Medical Center, Ground Floor, Admin Block</p>
      <p><strong>Tests Included:</strong></p>
      <ul>
        <li>Basic Health Checkup (BP, Sugar, Weight, Height)</li>
        <li>Eye Checkup</li>
        <li>Dental Checkup</li>
        <li>Nutritional Counseling</li>
        <li>Mental Health Consultation</li>
      </ul>
      <p><strong>Registration:</strong> No prior registration required. Walk-ins welcome.</p>
      <p>Take care of your health - it's your most valuable asset!</p>
    `,
    date: "2026-01-20",
    time: "10:00 AM",
    category: "Medical",
    priority: "medium",
    department: "Medical Center",
    issuedBy: "Dr. Anindita Ghosh",
  },
  {
    title: "Fee Payment Deadline for Semester 4",
    description:
      "Last date for payment of Semester 4 tuition fee is January 31, 2026. Late payment will attract a fine of ₹500 per day.",
    fullContent: `
      <h2>Semester 4 Fee Payment Deadline</h2>
      <p>Attention all students! This is a reminder regarding the payment of Semester 4 tuition and hostel fees.</p>
      <p><strong>Last Date for Payment:</strong> January 31, 2026 (Saturday)</p>
      <p><strong>Payment Methods:</strong></p>
      <ul>
        <li>Online payment through college portal</li>
        <li>DD in favor of "College Name" payable at City Bank</li>
        <li>Cash payment at Accounts Office (10 AM - 4 PM)</li>
      </ul>
      <p><strong>Late Payment Charges:</strong></p>
      <ul>
        <li>₹500 per day after deadline</li>
        <li>No exam permission if fees pending</li>
        <li>Hostel accommodation may be suspended</li>
      </ul>
      <p>For fee structure and payment queries, contact Accounts Office.</p>
    `,
    date: "2026-01-19",
    time: "05:00 PM",
    category: "Finance",
    priority: "urgent",
    department: "Accounts Office",
    issuedBy: "Finance Department",
  },
  {
    title: "Workshop on Machine Learning Applications",
    description:
      "Two-day workshop on 'Advanced Machine Learning Applications in Industry' scheduled for February 5-6, 2026. Limited seats available.",
    fullContent: `
      <h2>Machine Learning Workshop Announcement</h2>
      <p>The Department of Computer Science is organizing a two-day workshop on Advanced Machine Learning Applications.</p>
      <p><strong>Topic:</strong> "Real-world ML Applications: From Theory to Practice"</p>
      <p><strong>Dates:</strong> February 5-6, 2026</p>
      <p><strong>Timings:</strong> 9:30 AM to 5:00 PM</p>
      <p><strong>Venue:</strong> Computer Lab 3, IT Block</p>
      <p><strong>Workshop Highlights:</strong></p>
      <ul>
        <li>Hands-on sessions with Python and TensorFlow</li>
        <li>Industry case studies</li>
        <li>Project implementation guidance</li>
        <li>Certificate of participation</li>
      </ul>
      <p><strong>Registration:</strong> ₹500 per participant (includes lunch)</p>
      <p><strong>Seats:</strong> Limited to 40 participants</p>
      <p>Register at CS Department Office.</p>
    `,
    date: "2026-01-19",
    time: "02:15 PM",
    category: "Workshop",
    priority: "medium",
    department: "Computer Science",
    issuedBy: "Dr. Vinod Kumar Reddy",
  },
  {
    title: "Cultural Fest Auditions Schedule",
    description:
      "Auditions for the Annual Cultural Fest 'Utsav 2026' will be held from January 27-29, 2026. All interested students must register online.",
    fullContent: `
      <h2>Utsav 2026 - Cultural Fest Auditions</h2>
      <p>Get ready to showcase your talent! Auditions for Utsav 2026 are around the corner.</p>
      <p><strong>Audition Dates:</strong> January 27-29, 2026</p>
      <p><strong>Venue:</strong> Cultural Hall, Block C</p>
      <p><strong>Categories:</strong></p>
      <ul>
        <li>Music: Solo Singing, Band Performance</li>
        <li>Dance: Solo, Group, Classical, Western</li>
        <li>Drama: Skits, Mime, Stand-up Comedy</li>
        <li>Fine Arts: Painting, Photography</li>
      </ul>
      <p><strong>Registration Process:</strong></p>
      <ol>
        <li>Fill online registration form</li>
        <li>Select audition time slot</li>
        <li>Report 15 minutes before scheduled time</li>
        <li>Bring your own instruments if required</li>
      </ol>
      <p>Last date for registration: January 25, 2026</p>
    `,
    date: "2026-01-18",
    time: "04:00 PM",
    category: "Cultural",
    priority: "medium",
    department: "Cultural Committee",
    issuedBy: "Student Council",
  },
  {
    title: "Scholarship Application Deadline Approaching",
    description:
      "Last date for submitting scholarship applications for economically weaker students is February 15, 2026.",
    fullContent: "Full content about scholarship...",
    date: "2026-01-18",
    time: "11:00 AM",
    category: "Scholarship",
    priority: "high",
    department: "Student Welfare",
    issuedBy: "Dr. Anubhav Pradhan",
  },
  {
    title: "Internet Maintenance on January 23",
    description:
      "Campus Wi-Fi will be unavailable from 2 AM to 6 AM on January 23 for scheduled maintenance.",
    fullContent: "Full content about internet maintenance...",
    date: "2026-01-17",
    time: "03:45 PM",
    category: "IT",
    priority: "medium",
    department: "IT Department",
    issuedBy: "Network Administrator",
  },
  {
    title: "Alumni Meet 2026 Save the Date",
    description: "Annual Alumni Meet scheduled for March 15, 2026. All alumni are invited to register.",
    fullContent: "Full content about alumni meet...",
    date: "2026-01-17",
    time: "10:30 AM",
    category: "Alumni",
    priority: "low",
    department: "Alumni Relations",
    issuedBy: "Alumni Association",
  },
  {
    title: "Research Paper Publication Workshop",
    description: "Workshop on how to publish research papers in reputed journals on February 8, 2026.",
    fullContent: "Full content about research workshop...",
    date: "2026-01-16",
    time: "02:00 PM",
    category: "Research",
    priority: "medium",
    department: "Research Cell",
    issuedBy: "Dr. Baswade Anand",
  },
  {
    title: "Hostel Room Change Applications",
    description: "Applications for hostel room changes will be accepted from January 25-30, 2026.",
    fullContent: "Full content about hostel room change...",
    date: "2026-01-16",
    time: "11:15 AM",
    category: "Hostel",
    priority: "medium",
    department: "Hostel Management",
    issuedBy: "Hostel Warden",
  },
  {
    title: "Mid-Semester Exam Schedule Released",
    description: "Schedule for mid-semester examinations of Semester 4 has been published.",
    fullContent: "Full content about mid-semester exams...",
    date: "2026-01-15",
    time: "05:30 PM",
    category: "Exam",
    priority: "high",
    department: "Examination Cell",
    issuedBy: "Dr. Kuldeep Kataria",
  },
  {
    title: "Cafeteria Menu Update",
    description: "New healthy food options added to cafeteria menu starting January 20, 2026.",
    fullContent: "Full content about cafeteria...",
    date: "2026-01-15",
    time: "01:00 PM",
    category: "Mess",
    priority: "low",
    department: "Food Committee",
    issuedBy: "Mess Committee",
  },
  {
    title: "Book Bank Scheme Renewal",
    description: "Last date for Book Bank scheme renewal is January 31, 2026 for existing members.",
    fullContent: "Full content about book bank...",
    date: "2026-01-14",
    time: "03:00 PM",
    category: "Library",
    priority: "medium",
    department: "Central Library",
    issuedBy: "Library Committee",
  },
  {
    title: "Environmental Awareness Program",
    description: "Tree plantation drive scheduled for January 28, 2026. Volunteers needed.",
    fullContent: "Full content about environmental program...",
    date: "2026-01-14",
    time: "10:00 AM",
    category: "Event",
    priority: "low",
    department: "NSS",
    issuedBy: "NSS Coordinator",
  },
  {
    title: "Transport Bus Schedule Change",
    description: "Revised bus timings effective from January 22, 2026. Check new schedule.",
    fullContent: "Full content about transport...",
    date: "2026-01-13",
    time: "04:45 PM",
    category: "Transport",
    priority: "medium",
    department: "Transport Office",
    issuedBy: "Transport Incharge",
  },
  {
    title: "Career Counseling Session",
    description: "Free career counseling for final year students on February 3, 2026.",
    fullContent: "Full content about career counseling...",
    date: "2026-01-13",
    time: "11:30 AM",
    category: "Career",
    priority: "medium",
    department: "Training & Placement",
    issuedBy: "Career Counselor",
  },
  {
    title: "Power Backup Testing",
    description: "Generator testing on January 24 from 10 AM to 12 PM. Minor power fluctuations expected.",
    fullContent: "Full content about power backup...",
    date: "2026-01-12",
    time: "02:15 PM",
    category: "Maintenance",
    priority: "medium",
    department: "Electrical",
    issuedBy: "Maintenance Dept",
  },
  {
    title: "Technical Symposium Registrations",
    description: "Annual technical symposium 'TechFest 2026' registrations open till February 5.",
    fullContent: "Full content about tech symposium...",
    date: "2026-01-12",
    time: "10:00 AM",
    category: "Technical",
    priority: "medium",
    department: "IEEE Club",
    issuedBy: "IEEE Coordinator",
  },
  {
    title: "Hostel Fee Refund Process",
    description: "Process for hostel fee refund for students leaving hostel mid-semester.",
    fullContent: "Full content about fee refund...",
    date: "2026-01-11",
    time: "03:30 PM",
    category: "Finance",
    priority: "medium",
    department: "Accounts",
    issuedBy: "Accounts Office",
  },
  {
    title: "Faculty Development Program",
    description: "FDP on 'Innovative Teaching Methods' from January 29-31, 2026.",
    fullContent: "Full content about FDP...",
    date: "2026-01-11",
    time: "09:45 AM",
    category: "Faculty",
    priority: "low",
    department: "HRD",
    issuedBy: "HR Department",
  },
  {
    title: "Anti-Ragging Awareness Campaign",
    description: "Series of workshops on anti-ragging from January 25-27, 2026.",
    fullContent: "Full content about anti-ragging...",
    date: "2026-01-10",
    time: "04:00 PM",
    category: "Awareness",
    priority: "high",
    department: "Disciplinary",
    issuedBy: "Disciplinary Committee",
  },
  {
    title: "Student Grievance Redressal Meeting",
    description: "Monthly meeting with student representatives on January 28, 2026.",
    fullContent: "Full content about grievance meeting...",
    date: "2026-01-10",
    time: "11:00 AM",
    category: "Administration",
    priority: "medium",
    department: "Dean Office",
    issuedBy: "Dean Student Welfare",
  },
  {
    title: "Entrepreneurship Cell Launch",
    description: "New Entrepreneurship Cell launching ceremony on February 1, 2026.",
    fullContent: "Full content about E-cell...",
    date: "2026-01-09",
    time: "02:30 PM",
    category: "Entrepreneurship",
    priority: "medium",
    department: "E-Cell",
    issuedBy: "Startup Cell",
  },
  {
    title: "Blood Donation Camp",
    description: "Voluntary blood donation camp on January 26, 2026. All eligible donors welcome.",
    fullContent: "Full content about blood donation...",
    date: "2026-01-09",
    time: "10:15 AM",
    category: "Medical",
    priority: "medium",
    department: "Medical Center",
    issuedBy: "Red Cross Society",
  },
  {
    title: "Library New Arrivals",
    description: "New books added to computer science and engineering sections.",
    fullContent: "Full content about library books...",
    date: "2026-01-08",
    time: "03:00 PM",
    category: "Library",
    priority: "low",
    department: "Library",
    issuedBy: "Librarian",
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

  const existingCount = await Notice.countDocuments({ instituteId: institute._id });
  if (existingCount > 0) {
    console.log(`Skipping: IIT Bhilai already has ${existingCount} notices.`);
    await mongoose.disconnect();
    return;
  }

  const docs = noticeTemplates.map((n) => ({
    ...n,
    instituteId: institute._id,
  }));
  await Notice.insertMany(docs);
  console.log(`Seeded ${docs.length} notices for IIT Bhilai.`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
