# 🧠 Synapse – Smart Campus Management System

Synapse is a full-stack, student-centric campus management web application that unifies academic, administrative, hostel, and wellness-related services into a single platform. It supports **multiple institutes on one deployment** — each institute's data (courses, doctors, notices, hostel records, etc.) is fully isolated from every other institute's.

A **special focus of Synapse is the Medical & Mental Wellness section**, ensuring students have timely access to health services, notices, and emotional well-being support alongside academics.

---

## 👥 Team Members

- Shlok Divyam
- Adarsh Satyam
- Kadali Gagan Venkata Asish

---

## 🌟 Major Features

### 🔐 Authentication & Multi-Institute Support
- Email/password login with JWT sessions (httpOnly cookie)
- Every user belongs to an institute; nearly all data is scoped to that institute, so students at different institutes never see each other's doctors, notices, courses, etc.
- Student and admin roles
- Profile page displays the logged-in user's institute name alongside their department
- Accounts are provisioned directly (via seed scripts or database entry) rather than public self-signup — this app assumes the institute's user data already exists

### 📚 Academic Management
- Institute-wide course catalog, each course with a fixed weekly schedule slot (day/time/room)
- Courses are grouped by semester (e.g. `2025-26-M`) across all programs — a semester's course list isn't split per-program
- Semester order (Monsoon before Winter within an academic year, years in order) is always derived from the semester name itself, not a manually-entered number, so it can't drift out of order between different data-entry passes
- Students self-enroll/unenroll in courses from the current semester only (past semesters are read-only)
- **Timetable is fully derived from your enrollments** — no separately maintained schedule to fall out of sync; enroll or unenroll on the Courses page and your Timetable updates immediately
- Personal grade transcript per student (SGPA/CGPA calculated from real grade data, not hardcoded)
- Personal attendance record per course, with percentage computed from raw class counts

### 🏥 Medical & Mental Wellness (Special Focus)
- Institute-scoped doctor directory with real appointment booking
- Institute-scoped hospitals and medical stores directory
- AI-powered mental wellness self-assessment (Google Gemini API, called through a secured serverless function — the API key never reaches the browser)
- Distinguishes and handles Gemini's own failure modes gracefully: content-safety blocks (returns a supportive message pointing to real support instead of a raw error) and rate-limit/quota errors are surfaced distinctly from genuine failures, both in the API response and in server logs
- Google Meet integration for starting a video consultation session

### 🔔 Notices & Announcements
- Academic, Exam, Placement, Medical, Hostel, Library, Finance categories
- Priority levels: Urgent, High, Medium, Low
- Category filters and search
- Pinned notices
- Per-user read/unread tracking (persists across sessions, not just local state)

### 🏠 Hostel Management
- Room and roommate lookup (based on actual room assignment, supports any number of roommates)
- Maintenance complaint system, scoped to your own complaints
- Complaint status tracking (Pending / Resolved)
- Visitor request and approval log
- Hostel notices (reuses the main Notices system, filtered by category)

### ✅ Tasks & Reminders
- Fully personal — a user's tasks are never visible to anyone else, including admins
- Task creation with category, priority, deadline date, and time
- Pending / Finished / Unfinished states
- Productivity dashboard with stats

---

## 🛠️ Technologies Used

### Backend
- **Express** (wrapped as a single serverless function via `serverless-http` for Netlify)
- **MongoDB Atlas** with **Mongoose** for data modeling
- **JWT** (httpOnly cookie) + **bcrypt** for authentication
- **Zod** for request validation

### Frontend
- React.js + TypeScript
- Vite
- **TanStack Query** for server-state fetching, caching, and mutations
- Tailwind CSS
- Lucide React Icons

### 🔵 Google Technologies
- **Google Gemini API** – Mental wellness test and emotional health analysis (requires an API key, kept server-side only)
- **Google Meet** – Video conferencing for medical consultations
- **Google Fonts** – Typography
- **Material Design principles** – UI/UX inspiration

---

## 🚀 How to Run the Project Locally

### Prerequisites
- Node.js (v18+)
- npm
- Git
- A MongoDB Atlas cluster (free tier is enough) — see [Step 4](#step-4-set-up-environment-variables)

---

### Step 1: Clone the Repository

    git clone https://github.com/ShlokDivyam1109/Synapse.git

---

### Step 2: Navigate to Project Directory

    cd Synapse

---

### Step 3: Install Dependencies

    npm install

---

### Step 4: Set up Environment Variables

Create a `.env` file in the root directory (same level as `package.json`) with the following content:

```env
# MongoDB Atlas connection string
MONGODB_URI=your_mongodb_connection_string_here

# Long random string used to sign JWT session tokens
JWT_SECRET=your_own_random_secret_here

# Optional — customizes the /api/ping healthcheck response
PING_MESSAGE="ping pong"

# Required for the AI-powered mental wellness test
GEMINI_API_KEY=your_gemini_api_key_here
```

Note: the `.env` file is excluded from Git (via `.gitignore`) for security. Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey), and your MongoDB connection string from your [Atlas](https://www.mongodb.com/atlas) cluster's "Connect" dialog.

⚠️ **Never commit real secrets.** Treat any value that's been pasted into a terminal, chat log, or screenshot as compromised — rotate it before going to production.

---

### Step 5: Seed the Database

The app has no signup flow — accounts, institutes, and sample data are created by seed scripts. At minimum, run:

    npm run seed

This creates sample institutes and admin accounts (check `server/scripts/seed.ts` for the exact accounts/credentials it creates — change these before deploying publicly).

Additional, optional seed scripts fill in more sample data for specific features:

    npx tsx server/scripts/seedAcademicEvents.ts
    npx tsx server/scripts/seedCoursesGrades.ts
    npx tsx server/scripts/seedNotices.ts
    npx tsx server/scripts/seedMockUserTasks.ts
    npx tsx server/scripts/updateMyProfile.ts

`seedNotices.ts` seeds the original 30 sample notices for the IIT Bhilai institute specifically. `seedMockUserTasks.ts` seeds 10 sample tasks for a specific existing user (edit the target email in the script before running it — it looks up an existing account rather than creating one). `updateMyProfile.ts` fills in profile details (phone, address, guardian info, etc.) for one specific account — open the file and edit the placeholder values with real data before running it.

---

### Step 6: Start Development Server

    npm run dev

---

### Step 7: Open in Browser

The development server will start on an available port (typically `5173`, `3000`, or `8080`). Check your terminal output for the exact local URL.

---

## ☁️ Deployment

This project is set up to deploy on **Netlify**:
- The Vite client builds to `dist/spa`
- The Express backend is wrapped as a single Netlify Function (`netlify/functions/api.ts`), so every backend route change only needs to happen once in `server/` — nothing is duplicated
- `netlify.toml` redirects all `/api/*` requests to that function
- Set `MONGODB_URI`, `JWT_SECRET`, and `GEMINI_API_KEY` as environment variables in your Netlify site settings (not just locally) before deploying
- MongoDB Atlas Network Access needs to allow connections from anywhere (`0.0.0.0/0`), since Netlify Functions don't have a fixed outbound IP

### ⚠️ Known Netlify/serverless gotchas (already handled, documented for future maintainers)

- **`packageManager` must stay unset / npm-based.** The project previously used `pnpm`; if a `pnpm-lock.yaml` and a `packageManager: pnpm@...` field in `package.json` both reappear without the other, Netlify's build will try to install with pnpm and fail to bundle `mongoose` correctly (`Cannot find module 'mongoose'` at runtime). Stick with `package-lock.json`/npm unless you deliberately migrate back and verify the deploy end-to-end.
- **Netlify's function bundler can hand Express a pre-parsed request body as a raw `Buffer`** instead of letting `express.json()` parse it, which silently breaks any route reading `req.body` (e.g. login would fail with a generic "Invalid email or password" even with correct credentials). `server/index.ts` includes a middleware that normalizes this — don't remove it when touching the middleware stack.

---

## 🔧 Data Handling

- All data is persisted in **MongoDB Atlas** via Mongoose — nothing is hardcoded or stored in `localStorage`/`sessionStorage`
- **TanStack Query** handles client-side data fetching, caching, and cache invalidation after mutations
- Nearly every collection is scoped by `instituteId`, and personal data (tasks, grades, attendance, notices read-state) is additionally scoped by `userId` — enforced server-side on every request, never trusted from the client
- Timetable has no independent storage at all; it's computed on each request from the user's current course enrollments

---

## 🔮 Future Enhancements

- Admin dashboard UI for managing courses, doctors, hostel rooms, etc. (currently managed via seed scripts or direct database entry)
- File upload support for notice attachments (currently metadata-only)
- Real-time notice/task updates (currently fetch-on-load / fetch-on-action)
- Password reset and email verification flows
- Rate limiting on authentication routes

---

## 📌 Conclusion

Synapse is a scalable, modular, multi-institute campus platform with a strong emphasis on **medical awareness, mental wellness, academics, and productivity** — built on a real MongoDB-backed API, not mock data.

⭐ Star the repository if you like the project!
