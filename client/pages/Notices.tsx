import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Bell, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Megaphone, 
  BookOpen,
  GraduationCap,
  Filter,
  Search,
  ChevronRight,
  Pin,
  User,
  Building,
  Download,
  Share2,
  Eye,
  BellRing,
  X,
  Printer,
  Bookmark,
  FileText,
  ChevronLeft
} from "lucide-react";

interface Notice {
  _id: string;
  title: string;
  description: string;
  fullContent?: string;
  date: string;
  time: string;
  category: string;
  priority: "urgent" | "high" | "medium" | "low";
  department?: string;
  issuedBy?: string;
  attachments?: string[];
  pinned?: boolean;
  isRead: boolean;
}

async function fetchNotices(): Promise<Notice[]> {
  const res = await fetch("/api/notices?limit=100", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load notices");
  const data = await res.json();
  return data.notices;
}

const getPriorityColor = (priority) => {
  switch(priority) {
    case "urgent": return "bg-red-100 text-red-800 border-red-200";
    case "high": return "bg-orange-100 text-orange-800 border-orange-200";
    case "medium": return "bg-blue-100 text-blue-800 border-blue-200";
    case "low": return "bg-gray-100 text-gray-800 border-gray-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getCategoryColor = (category) => {
  switch(category) {
    case "Exam": return "bg-purple-100 text-purple-800";
    case "Placement": return "bg-emerald-100 text-emerald-800";
    case "Academic": return "bg-blue-100 text-blue-800";
    case "Hostel": return "bg-amber-100 text-amber-800";
    case "Medical": return "bg-red-100 text-red-800";
    case "Library": return "bg-indigo-100 text-indigo-800";
    case "Sports": return "bg-green-100 text-green-800";
    case "Cultural": return "bg-pink-100 text-pink-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function Notices() {
  const [selectedNotice, setSelectedNotice] = useState<(Notice & { id: string }) | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const {
    data: rawNotices,
    isLoading,
    error,
    refetch,
  } = useQuery({ queryKey: ["notices"], queryFn: fetchNotices });

  // `id` is used throughout the existing UI below; alias it from Mongo's `_id`.
  const notices = (rawNotices ?? []).map((n) => ({ ...n, id: n._id }));

  const markAsReadMutation = useMutation({
    mutationFn: async (noticeId: string) => {
      const res = await fetch(`/api/notices/${noticeId}/read`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to mark as read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
  });

  const markAsRead = (noticeId: string) => {
    markAsReadMutation.mutate(noticeId);
  };

  const isNoticeRead = (noticeId: string) => {
    return notices.find((n) => n.id === noticeId)?.isRead ?? false;
  };

  const readCount = notices.filter((n) => n.isRead).length;

  // Sort notices by date (latest first)
  const sortedNotices = [...notices].sort((a, b) => {
    const dateComparison = b.date.localeCompare(a.date);

    if (dateComparison !== 0) return dateComparison;

    return b.time.localeCompare(a.time);
  });

  // Categories array
  const categories = [
    { id: "all", label: "All Notices", icon: <Bell className="w-4 h-4" />, count: notices.length },
    { id: "unread", label: "Unread", icon: <BellRing className="w-4 h-4" />, count: notices.length - readCount },
    { id: "urgent", label: "Urgent", icon: <AlertCircle className="w-4 h-4" />, count: notices.filter(n => n.priority === "urgent").length },
    { id: "exam", label: "Exam", icon: <BookOpen className="w-4 h-4" />, count: notices.filter(n => n.category === "Exam").length },
    { id: "academic", label: "Academic", icon: <GraduationCap className="w-4 h-4" />, count: notices.filter(n => n.category === "Academic").length },
    { id: "placement", label: "Placement", icon: <Megaphone className="w-4 h-4" />, count: notices.filter(n => n.category === "Placement").length },
    { id: "hostel", label: "Hostel", icon: <Building className="w-4 h-4" />, count: notices.filter(n => n.category === "Hostel").length },
    { id: "medical", label: "Medical", icon: <AlertCircle className="w-4 h-4" />, count: notices.filter(n => n.category === "Medical").length },
  ];

  // Filter notices based on category and search
  const filteredNotices = sortedNotices.filter(notice => {
   const matchesCategory =
  selectedCategory === "all" ||
  (selectedCategory === "urgent"
    ? notice.priority === "urgent"
    : selectedCategory === "unread"
    ? !isNoticeRead(notice.id)
    : notice.category.toLowerCase() === selectedCategory);
    
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (notice.department ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const visibleNotices = filteredNotices.slice(0, visibleCount);

  const loadMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const isToday = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  const isYesterday = (dateStr) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return dateStr === yesterday.toISOString().split('T')[0];
  };

  const getDisplayDate = (dateStr) => {
    if (isToday(dateStr)) return "Today";
    if (isYesterday(dateStr)) return "Yesterday";
    return formatDate(dateStr);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p>Loading notices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="text-gray-700 font-medium">Couldn't load notices.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-md">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Notices & Announcements
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Stay updated with important college announcements, notices, and critical information.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Notices</p>
                  <p className="text-2xl font-bold text-gray-900">{notices.length}</p>
                </div>
                <Bell className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Urgent</p>
                  <p className="text-2xl font-bold text-red-600">{notices.filter(n => n.priority === "urgent").length}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Today</p>
                  <p className="text-2xl font-bold text-gray-900">{notices.filter(n => isToday(n.date)).length}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pinned</p>
                  <p className="text-2xl font-bold text-amber-600">{notices.filter(n => n.pinned).length}</p>
                </div>
                <Pin className="w-8 h-8 text-amber-500" />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Notices List */}
            <div className="lg:w-2/3">
              {/* Search and Filter Bar */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search notices by title, department, or content..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filter
                  </button>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${selectedCategory === category.id 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}
                    >
                      {category.icon}
                      <span>{category.label}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${selectedCategory === category.id ? 'bg-white/20' : 'bg-gray-100'}`}>
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notices List */}
              <div className="space-y-4">
                {visibleNotices.map((notice) => (
                  <div 
                    key={notice.id} 
                    className={`bg-white rounded-xl shadow-lg border transition-all hover:shadow-xl cursor-pointer ${selectedNotice?.id === notice.id ? 'ring-2 ring-blue-500' : ''} ${notice.pinned ? 'border-l-4 border-l-amber-500' : 'border-gray-200'} ${isNoticeRead(notice.id) ? 'opacity-80' : ''}`}
                    onClick={() => setSelectedNotice(notice)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {notice.pinned && (
                              <Pin className="w-4 h-4 text-amber-500 fill-amber-500" />
                            )}
                            {isNoticeRead(notice.id) && (
                              <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                Read ✓
                              </div>
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notice.priority)}`}>
                              {notice.priority.toUpperCase()}
                            </span>
                            <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getCategoryColor(notice.category)}`}>
                              {notice.category}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{notice.title}</h3>
                          <p className="text-gray-600 mb-4 line-clamp-2">{notice.description}</p>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${selectedNotice?.id === notice.id ? 'rotate-90' : ''}`} />
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Building className="w-4 h-4" />
                            <span>{notice.department}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <User className="w-4 h-4" />
                            <span>{notice.issuedBy}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span className={`font-medium ${isToday(notice.date) ? 'text-green-600' : ''}`}>
                              {getDisplayDate(notice.date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{notice.time}</span>
                          </div>
                        </div>
                      </div>
                      
                      {notice.attachments && notice.attachments.length > 0 && (
                        <div className="mt-4 flex items-center gap-2">
                          <Download className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {notice.attachments.length} attachment{notice.attachments.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {visibleNotices.length < filteredNotices.length && (
                <div className="mt-8 text-center">
                  <button
                    onClick={loadMore}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                  >
                    Load More Notices (Show {Math.min(5, filteredNotices.length - visibleNotices.length)} more)
                  </button>
                  <p className="text-gray-500 text-sm mt-2">
                    Showing {visibleNotices.length} of {filteredNotices.length} notices
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Notice Details Sidebar */}
            <div className="lg:w-1/3 lg:sticky lg:top-6 self-start">
              {selectedNotice ? (
                <div className="h-[calc(100vh-2rem)] flex flex-col bg-white rounded-xl shadow-lg border border-gray-200">
                  {/* Sidebar Header */}
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedNotice(null)}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors lg:hidden"
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h2 className="text-lg font-bold text-gray-900">Notice Details</h2>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                          <Printer className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                          <Bookmark className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setSelectedNotice(null)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedNotice.priority)}`}>
                        {selectedNotice.priority.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getCategoryColor(selectedNotice.category)}`}>
                        {selectedNotice.category}
                      </span>
                      {selectedNotice.pinned && (
                        <Pin className="w-4 h-4 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-900 mb-3">{selectedNotice.title}</h2>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        <span>{selectedNotice.department}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{selectedNotice.issuedBy}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(selectedNotice.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{selectedNotice.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Scrollable Content Area */}
                  <div className="flex-1 overflow-y-auto p-6">
                    {/* Notice Content */}
                    <div 
                      className="prose prose-blue max-w-none mb-8"
                      dangerouslySetInnerHTML={{ __html: selectedNotice.fullContent }}
                    />
                    
                    {/* Attachments */}
                    {selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
                      <div className="mt-8 pt-8 border-t border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Attachments ({selectedNotice.attachments.length})
                        </h3>
                        <div className="space-y-3">
                          {selectedNotice.attachments.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <Download className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-700">{file}</span>
                                  <p className="text-xs text-gray-500 mt-1">PDF Document • 2.4 MB</p>
                                </div>
                              </div>
                              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                Download
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar Footer */}
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => markAsRead(selectedNotice.id)}
                        className={`flex-1 px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
                          isNoticeRead(selectedNotice.id)
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        } transition-colors`}
                      >
                        <BellRing className="w-4 h-4" />
                        {isNoticeRead(selectedNotice.id) ? 'Marked as Read ✓' : 'Mark as Read'}
                      </button>
                      <button className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-3">
                      Last updated: {formatDate(selectedNotice.date)} at {selectedNotice.time}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center h-[calc(100vh-2rem)] flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Eye className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Select a Notice</h3>
                  <p className="text-gray-600 mb-8 max-w-md">
                    Click on any notice from the list to view its full details, attachments, and take actions here.
                  </p>
                  <div className="space-y-4 text-left max-w-xs">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">View full notice content</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Download attachments</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Share important notices</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Mark notices as read</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="font-bold text-gray-900 mb-4">Notice Statistics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Total Notices</span>
                    <span className="font-bold text-gray-900">{notices.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Unread Notices</span>
                    <span className="font-bold text-blue-600">{notices.length - readCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Read Notices</span>
                    <span className="font-bold text-green-600">{readCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Urgent Unread</span>
                    <span className="font-bold text-red-600">{notices.filter(n => n.priority === "urgent" && !isNoticeRead(n.id)).length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}