import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Index from "./pages/Index";
import Timetable from "./pages/Timetable";
import AcademicCalendar from "./pages/AcademicCalendar";
import HostelManagement from "./pages/HostelManagement";
import Medical from "./pages/Medical";
import Courses from "./pages/Courses";
import Attendance from "./pages/Attendance";
import Grades from "./pages/Grades";
import Notices from "./pages/Notices";
import Tasks from "./pages/Tasks";
import NotFound from "./pages/NotFound";

import Layout from "@/components/Layout";

import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { createRoot } from "react-dom/client";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>

            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected + Layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>

                <Route path="/" element={<Index />} />
                <Route path="/timetable" element={<Timetable />} />
                <Route path="/academic-calendar" element={<AcademicCalendar />} />
                <Route path="/hostel" element={<HostelManagement />} />
                <Route path="/medical" element={<Medical />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/grades" element={<Grades />} />
                <Route path="/notices" element={<Notices />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/profile" element={<Profile />} />

                {/* Authenticated but no matching route */}
                <Route path="*" element={<NotFound />} />

              </Route>
            </Route>

            {/* Unauthenticated fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />

          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

createRoot(document.getElementById("root")!).render(<App />);