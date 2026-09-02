import { Search, BookOpen, X } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";


interface Course {
  id: string;
  code: string;
  title: string;
  type: string;
  credits: number | string;
  faculty: string;
  lastUpdated: string;
  day: string;
  time: string;
  room: string;
  enrolled: boolean;
}

interface Semester {
  name: string;
  program: string;
  courses: Course[];
}

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState("");

  const [program] = useState<string | undefined>(undefined);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["courses", program],
    queryFn: () =>
      fetch(`/api/courses${program ? `?program=${encodeURIComponent(program)}` : ""}`, {
        credentials: "include",
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to load courses");
        return r.json();
      }),
  });

  const semesters: Semester[] = data?.semesters ?? [];

  const filteredSemesters = semesters
    .map(semester => ({
      ...semester,
      courses: semester.courses.filter(course =>
        course.enrolled &&
        (course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.faculty.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }))
    .filter(semester => semester.courses.length > 0);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Institute Core":
        return "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700";
      case "Program Core":
        return "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700";
      case "Program Linked":
        return "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700";
      case "Liberal Art":
        return "bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700";
      case "Non-graded":
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700";
      default:
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700";
    }
  };

  const getTypeBorderColor = (type: string) => {
    switch (type) {
      case "Institute Core":
        return "border-blue-300";
      case "Program Core":
        return "border-emerald-300";
      case "Program Linked":
        return "border-purple-300";
      case "Liberal Art":
        return "border-amber-300";
      case "Non-graded":
        return "border-gray-300";
      default:
        return "border-gray-300";
    }
  };

  return (
    <>
      <div className="space-y-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-md">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Academic Courses
                </h1>
              </div>
            </div>
            <p className="text-gray-600 text-lg">View the courses you're enrolled in, by semester</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 mb-8"></div>

          {/* Search Bar */}
          <div className="mb-10 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
            <p className="text-gray-700 font-medium mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-500" />
              Search by course code, title, or faculty name...
            </p>
            <div className="relative max-w-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl blur-sm opacity-50"></div>
              <input
                type="text"
                placeholder="Type course code, title, or faculty..."
                className="relative w-full pl-12 pr-10 py-4 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 bg-white/95 hover:bg-white shadow-sm hover:shadow-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>

          {/* Another horizontal line */}
          <div className="h-px bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 mb-10"></div>

          {/* Courses List */}
          <div className="space-y-12">
            {isLoading && (
              <p className="text-gray-600 text-center py-10">Loading courses…</p>
            )}
            {isError && (
              <div className="text-center py-10">
                <p className="text-red-600 mb-3">Failed to load courses.</p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-primary text-white rounded-md"
                >
                  Retry
                </button>
              </div>
            )}
            {!isLoading && !isError && filteredSemesters.length === 0 && (
              <p className="text-gray-600 text-center py-10">
                {searchQuery ? "No enrolled courses match your search." : "You aren't enrolled in any courses yet."}
              </p>
            )}
            {filteredSemesters.map((semester, semesterIndex) => (
              <div key={semesterIndex} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Semester Header with Stats */}
                <div className="relative p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                          <span className="text-white font-bold text-sm">
                            {semester.name.split('-')[2]}
                          </span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{semester.name}</h2>
                      </div>
                      <p className="text-gray-600">{semester.program}</p>
                    </div>
                    
                    <div className="flex gap-6">
                      <div className="text-center">
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                          <p className="text-sm text-blue-600 font-medium mb-1">Courses</p>
                          <p className="text-3xl font-bold text-blue-700">{semester.courses.length}</p>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                          <p className="text-sm text-emerald-600 font-medium mb-1">Credits</p>
                          <p className="text-3xl font-bold text-emerald-700">
                            {semester.courses.reduce((total, course) => {
                              const credits = typeof course.credits === 'string' ? parseFloat(course.credits) : course.credits;
                              return total + credits;
                            }, 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  

                </div>

                {/* Courses Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {semester.courses.map((course) => (
                      <div
                        key={course.id}
                        className="group relative border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white overflow-hidden"
                      >
                        {/* Gradient background effect */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                        
                        {/* Course code with icon */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                              <div className="w-6 h-6 flex items-center justify-center font-bold text-blue-700">
                                {course.code.charAt(0)}
                              </div>
                            </div>
                            <div>
                              <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                                {course.code}
                              </h3>
                              <p className="text-gray-800 font-semibold text-base mt-1 line-clamp-2">
                                {course.title}
                              </p>
                            </div>
                          </div>
                          
                          {/* Course type badge */}
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${getTypeColor(course.type)} border ${getTypeBorderColor(course.type)} shadow-sm`}>
                            {course.type}
                          </span>
                        </div>
                        
                        {/* Credits display with progress ring */}
                        <div className="flex items-center justify-between mb-6 pt-4 border-t border-gray-100">
                          <div className="text-center">
                            <div className="relative w-20 h-20 mx-auto">
                              <svg className="w-20 h-20 transform -rotate-90">
                                <circle
                                  cx="40"
                                  cy="40"
                                  r="34"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="transparent"
                                  className="text-gray-200"
                                />
                                <circle
                                  cx="40"
                                  cy="40"
                                  r="34"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="transparent"
                                  strokeDasharray="214"
                                  strokeDashoffset={214 - (typeof course.credits === 'number' ? (course.credits / 4.5) * 214 : 0)}
                                  className="text-blue-500 transition-all duration-500"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <span className="text-2xl font-bold text-gray-900">{course.credits}</span>
                                  <span className="block text-xs text-gray-500 font-medium">credits</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Faculty and Date info */}
                          <div className="flex-1 pl-6 space-y-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-gray-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                <span className="text-xs font-medium uppercase tracking-wider">Faculty</span>
                              </div>
                              <p className="font-medium text-gray-900 text-sm">{course.faculty}</p>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-gray-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                <span className="text-xs font-medium uppercase tracking-wider">Updated</span>
                              </div>
                              <p className="font-medium text-gray-900 text-sm">{course.lastUpdated}</p>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-gray-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                <span className="text-xs font-medium uppercase tracking-wider">Schedule</span>
                              </div>
                              <p className="font-medium text-gray-900 text-sm">
                                {course.day}, {course.time} · {course.room}
                              </p>
                            </div>
                          </div>
                        </div>

                        {course.enrolled && (
                          <div className="w-full py-2.5 rounded-lg text-sm font-semibold text-center bg-green-100 text-green-800">
                            Enrolled
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Features Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Features:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                "List of enrolled courses and subjects",
                "Course credits and semester information",
                "Faculty details and office hours",
                "Access to syllabus and course materials",
                "Prerequisites and course requirements",
                "Course announcements and updates",
                "GPA impact calculator",
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
