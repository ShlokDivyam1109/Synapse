import { CheckCircle, AlertCircle, TrendingUp, Calendar, Clock, Target, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AttendanceData {
  id: string;
  code: string;
  title: string;
  credits: number;
  type: string;
  faculty: string;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  lastUpdated: string;
  status: "good" | "warning" | "critical";
}

async function fetchAttendance(): Promise<AttendanceData[]> {
  const res = await fetch("/api/attendance", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load attendance");
  const data = await res.json();
  return data.attendance.map((a: any) => ({ ...a, id: a._id }));
}

export default function Attendance() {
  const { data: attendanceData = [], isLoading, error } = useQuery({
    queryKey: ["attendance"],
    queryFn: fetchAttendance,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading your attendance...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Couldn't load your attendance.
      </div>
    );
  }



  const getStatusColor = (percentage: number) => {
    if (percentage >= 75) return "text-emerald-600";
    if (percentage >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getStatusBgColor = (percentage: number) => {
    if (percentage >= 75) return "bg-emerald-50";
    if (percentage >= 50) return "bg-amber-50";
    return "bg-red-50";
  };

  const getStatusBorderColor = (percentage: number) => {
    if (percentage >= 75) return "border-emerald-200";
    if (percentage >= 50) return "border-amber-200";
    return "border-red-200";
  };

  const getCircularProgressColor = (percentage: number) => {
    if (percentage >= 75) return "text-emerald-500";
    if (percentage >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const getStatusText = (percentage: number) => {
    if (percentage >= 75) return "Good";
    if (percentage >= 50) return "Warning";
    return "Critical";
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 75) return <CheckCircle className="w-5 h-5 text-emerald-600" />;
    if (percentage >= 50) return <AlertCircle className="w-5 h-5 text-amber-600" />;
    return <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  const overallAttendance = attendanceData.reduce((total, course) => total + course.percentage, 0) / attendanceData.length;
  const coursesAbove75 = attendanceData.filter(course => course.percentage >= 75).length;
  const coursesBelow75 = attendanceData.filter(course => course.percentage < 75).length;
  const totalCredits = attendanceData.reduce((total, course) => total + course.credits, 0);

  return (
    <>
      <div className="space-y-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-md">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  Attendance Tracker
                </h1>
              </div>
            </div>
            <p className="text-gray-600 text-lg">Monitor your subject-wise attendance with visual progress indicators and alerts</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-emerald-200 via-green-200 to-lime-200 mb-8"></div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-200">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">Overall</span>
              </div>
              <div className="text-center mb-2">
                <div className="text-4xl font-bold text-emerald-700 mb-1">{overallAttendance.toFixed(1)}%</div>
                <p className="text-sm text-emerald-600">Average Attendance</p>
              </div>
              <div className="w-full bg-emerald-100 rounded-full h-2 mt-3">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full"
                  style={{ width: `${overallAttendance}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="w-8 h-8 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full">Good</span>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-700 mb-1">{coursesAbove75}</div>
                <p className="text-sm text-blue-600">Courses ≥ 75%</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-2xl border border-amber-200">
              <div className="flex items-center justify-between mb-4">
                <AlertCircle className="w-8 h-8 text-amber-600" />
                <span className="text-sm font-medium text-amber-700 bg-amber-100 px-3 py-1 rounded-full">Warning</span>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-700 mb-1">{coursesBelow75}</div>
                <p className="text-sm text-amber-600">Courses {'<'} 75%</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                <span className="text-sm font-medium text-purple-700 bg-purple-100 px-3 py-1 rounded-full">Total</span>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-700 mb-1">{totalCredits}</div>
                <p className="text-sm text-purple-600">Semester Credits</p>
              </div>
            </div>
          </div>

          {/* Semester Info */}
          <div className="mb-10 p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">2025-26-W Semester</h2>
                <p className="text-gray-600">B.Tech Computer Science and Engineering</p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>3 weeks completed</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Last updated: 23 Jan, 2026</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl border border-emerald-200">
                    <p className="text-sm text-emerald-600 font-medium mb-1">Target</p>
                    <p className="text-2xl font-bold text-emerald-700">75%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-emerald-200 via-green-200 to-lime-200 mb-10"></div>

          {/* Attendance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {attendanceData.map((course) => (
              <div 
                key={course.id} 
                className={`group border rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${getStatusBgColor(course.percentage)} ${getStatusBorderColor(course.percentage)}`}
              >
                {/* Course Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 group-hover:text-emerald-600 transition-colors">
                      {course.code}
                    </h3>
                    <p className="text-gray-800 font-semibold text-sm mt-1 line-clamp-2">
                      {course.title}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBgColor(course.percentage)} ${getStatusColor(course.percentage)} border ${getStatusBorderColor(course.percentage)}`}>
                        {course.type}
                      </span>
                      <span className="text-xs font-medium text-gray-500">
                        {course.credits} credit{course.credits !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(course.percentage)}
                    <span
  className={`text-sm font-semibold ${getStatusColor(course.percentage)} whitespace-nowrap`}
>
                      {getStatusText(course.percentage)}
                    </span>
                  </div>
                </div>

                {/* Circular Progress */}
                <div className="relative mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Attendance</p>
                      <p className="text-2xl font-bold text-gray-900">{course.percentage.toFixed(1)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Classes</p>
                      <p className="text-lg font-bold text-gray-900">
                        {course.attendedClasses}/{course.totalClasses}
                      </p>
                    </div>
                  </div>
                  
                  {/* Circular Progress Bar */}
                  <div className="relative w-48 h-48 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      {/* Background circle */}
                      <circle
                        cx="96"
                        cy="96"
                        r="84"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="96"
                        cy="96"
                        r="84"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray="528"
                        strokeDashoffset={528 - (course.percentage / 100) * 528}
                        strokeLinecap="round"
                        className={`transition-all duration-1000 ${getCircularProgressColor(course.percentage)}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${getStatusColor(course.percentage)}`}>
                          {course.percentage.toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {course.attendedClasses} of {course.totalClasses} classes
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Faculty and Details */}
                <div className="space-y-3 pt-6 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Faculty</p>
                    <p className="font-medium text-gray-900 text-sm">{course.faculty}</p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Last Updated</p>
                      <p className="font-medium text-gray-900 text-sm">{course.lastUpdated}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Classes/week</p>
                      <p className="font-medium text-gray-900 text-sm text-center">
                        {Math.round(course.totalClasses / 3)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Attendance Status Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span>0%</span>
                    <span className="font-medium">75% Target</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${course.percentage >= 75 ? 'bg-emerald-500' : course.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${course.percentage}%` }}
                    ></div>
                    <div className="relative h-2 -mt-2">
                      <div className="absolute left-3/4 transform -translate-x-1/2 w-0.5 h-2 bg-gray-400"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Poor</span>
                    <span className={course.percentage >= 75 ? 'text-emerald-600 font-medium' : ''}>
                      {course.percentage >= 75 ? '✓ Target Achieved' : 'Target'}
                    </span>
                    <span>Excellent</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend and Info */}
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Attendance Status Legend
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <div>
                  <p className="font-medium text-emerald-700">Good (75% and above)</p>
                  <p className="text-sm text-emerald-600">Attendance is satisfactory</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div>
                  <p className="font-medium text-amber-700">Warning (50% - 74%)</p>
                  <p className="text-sm text-amber-600">Improvement needed</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div>
                  <p className="font-medium text-red-700">Critical (Below 50%)</p>
                  <p className="text-sm text-red-600">Immediate attention required</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> 75% attendance is mandatory for each course. 
                Higher credit courses ({">"}3 credits) have more classes per week. 
                Data updated weekly based on faculty reports.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}