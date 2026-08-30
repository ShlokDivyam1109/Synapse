import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  PlusCircle, CheckCircle, Clock, AlertCircle, 
  Calendar, Tag, Flag, Trash2, Check,
  FileText, GraduationCap, User, Book, ListTodo,
  CheckSquare, Square, ChevronLeft, ChevronRight
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  category: 'assignment' | 'exam-prep' | 'personal' | 'study' | 'other';
  deadline: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'finished' | 'unfinished';
  createdAt: string;
}

async function fetchTasks(): Promise<Task[]> {
  const res = await fetch("/api/tasks", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load tasks");
  const data = await res.json();
  return data.tasks.map((t: any) => ({ ...t, id: t._id }));
}

export default function Tasks() {
  const queryClient = useQueryClient();
  const { data: tasks = [], isLoading, error } = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks });

  const addTaskMutation = useMutation({
    mutationFn: async (payload: Omit<Task, "id" | "status" | "createdAt">) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to add task");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Task["status"] }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete task");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });


  const [filter, setFilter] = useState<'all' | 'pending' | 'finished' | 'unfinished'>('all');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'assignment' as Task['category'],
    deadline: getTodayDate(),
    time: getCurrentTimePlusOneHour(),
    priority: 'medium' as Task['priority']
  });
  const [showTaskForm, setShowTaskForm] = useState(true);

  // Helper functions
  function getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getCurrentTimePlusOneHour(): string {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  function isDeadlineToday(deadline: string): boolean {
    const today = getTodayDate();
    return deadline === today;
  }

  function formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

  // Task management functions
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    addTaskMutation.mutate(newTask);
    setNewTask({
      title: '',
      description: '',
      category: 'assignment',
      deadline: getTodayDate(),
      time: getCurrentTimePlusOneHour(),
      priority: 'medium'
    });
  };

  const markTaskAsDone = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'finished' });
  };

  const markTaskAsPending = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'pending' });
  };

  const deleteTask = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(id);
    }
  };

  // Filter tasks
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const finishedTasks = tasks.filter(task => task.status === 'finished');
  const unfinishedTasks = tasks.filter(task => task.status === 'unfinished');

  // Get category icon
  const getCategoryIcon = (category: Task['category']) => {
    switch(category) {
      case 'assignment': return <FileText className="w-4 h-4" />;
      case 'exam-prep': return <GraduationCap className="w-4 h-4" />;
      case 'personal': return <User className="w-4 h-4" />;
      case 'study': return <Book className="w-4 h-4" />;
      default: return <ListTodo className="w-4 h-4" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: Task['priority']) => {
    switch(priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Get status icon
  const getStatusIcon = (status: Task['status']) => {
    switch(status) {
      case 'pending': return <Square className="w-5 h-5 text-gray-400" />;
      case 'finished': return <CheckSquare className="w-5 h-5 text-green-600" />;
      case 'unfinished': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <Square className="w-5 h-5 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading your tasks...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Couldn't load your tasks.
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-lg mb-4">
              <ListTodo className="w-10 h-10 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">Tasks & Reminders</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Manage assignments, exam prep, and personal notes in one productivity hub.
            </p>
          </header>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 shadow-lg">
              <div className="text-3xl font-bold text-indigo-600">{tasks.length}</div>
              <div className="text-gray-600 text-sm">Total Tasks</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-lg">
              <div className="text-3xl font-bold text-yellow-500">{pendingTasks.length}</div>
              <div className="text-gray-600 text-sm">Pending</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-lg">
              <div className="text-3xl font-bold text-green-500">{finishedTasks.length}</div>
              <div className="text-gray-600 text-sm">Finished</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-lg">
              <div className="text-3xl font-bold text-red-500">{unfinishedTasks.length}</div>
              <div className="text-gray-600 text-sm">Unfinished</div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Add Task Form - LEFT SIDE with separate scroll */}
            <div className={`lg:w-1/3 mt-10 lg:mt-12 lg:sticky lg:top-6 self-start transition-all duration-300 ${showTaskForm ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col h-[600px]">
                {/* Form Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <PlusCircle className="w-6 h-6 text-white" />
                      <h2 className="text-xl font-bold text-white">Add New Task</h2>
                    </div>
                    <button 
                      onClick={() => setShowTaskForm(!showTaskForm)}
                      className="lg:hidden p-2 hover:bg-white/20 rounded-lg transition"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
                
                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <form onSubmit={handleAddTask} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Task Title
                      </label>
                      <input
                        type="text"
                        required
                        value={newTask.title}
                        onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                        placeholder="Enter task title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={newTask.category}
                        onChange={(e) => setNewTask({...newTask, category: e.target.value as Task['category']})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                      >
                        <option value="assignment">Assignment</option>
                        <option value="exam-prep">Exam Preparation</option>
                        <option value="personal">Personal</option>
                        <option value="study">Study Materials</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                      </label>
                      <textarea
                        value={newTask.description}
                        onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition resize-none"
                        rows={4}
                        placeholder="Add details about your task..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Deadline Date
                        </label>
                        <input
                          type="date"
                          required
                          value={newTask.deadline}
                          onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Clock className="w-4 h-4 inline mr-2" />
                          Time
                        </label>
                        <input
                          type="time"
                          required
                          value={newTask.time}
                          onChange={(e) => setNewTask({...newTask, time: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Flag className="w-4 h-4 inline mr-2" />
                        Priority
                      </label>
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({...newTask, priority: e.target.value as Task['priority']})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <PlusCircle className="w-5 h-5 inline mr-2" />
                      Add Task
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Tasks Display - RIGHT SIDE */}
            <div className="lg:w-2/3 space-y-8">
              {/* Mobile toggle for task form */}
              <button 
                onClick={() => setShowTaskForm(!showTaskForm)}
                className="lg:hidden w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2"
              >
                {showTaskForm ? (
                  <>
                    <ChevronRight className="w-5 h-5" />
                    Show Tasks
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-5 h-5" />
                    Show Add Task Form
                  </>
                )}
              </button>

              {/* Filter Tabs */}
              <div className="flex bg-white rounded-2xl shadow-lg p-1">
                {(['all', 'pending', 'finished', 'unfinished'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                      filter === tab 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)} Tasks
                  </button>
                ))}
              </div>

              {/* Tasks Sections */}
              {(filter === 'all' || filter === 'pending') && (
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-yellow-500" />
                      <h2 className="text-2xl font-bold text-gray-800">Pending Tasks</h2>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded-full">
                      {pendingTasks.length} tasks
                    </span>
                  </div>

                  <div className="space-y-4">
                    {pendingTasks.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No pending tasks</p>
                      </div>
                    ) : (
                      pendingTasks.map((task) => (
                        <div 
                          key={task.id}
                          className={`p-5 rounded-xl border-l-4 ${
                            isDeadlineToday(task.deadline) 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-yellow-500 bg-gray-50'
                          } transition-all hover:shadow-md`}
                        >
                          {isDeadlineToday(task.deadline) && (
                            <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
                              DEADLINE TODAY
                            </div>
                          )}
                          
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {getStatusIcon(task.status)}
                                {getCategoryIcon(task.category)}
                                <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                                <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                              </div>
                              <p className="text-gray-600 mb-3 ml-8">{task.description}</p>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-500 ml-8">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(task.deadline)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {task.time}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Tag className="w-4 h-4" />
                                  {task.category}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => markTaskAsDone(task.id)}
                                className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition"
                                title="Mark as done"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition"
                                title="Delete task"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {(filter === 'all' || filter === 'finished') && (
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <h2 className="text-2xl font-bold text-gray-800">Finished Tasks</h2>
                    </div>
                    <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                      {finishedTasks.length} tasks
                    </span>
                  </div>

                  <div className="space-y-4">
                    {finishedTasks.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No finished tasks</p>
                      </div>
                    ) : (
                      finishedTasks.map((task) => (
                        <div 
                          key={task.id}
                          className="p-5 rounded-xl border-l-4 border-green-500 bg-green-50"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {getStatusIcon(task.status)}
                                {getCategoryIcon(task.category)}
                                <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                                <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                              </div>
                              <p className="text-gray-600 mb-3 ml-8">{task.description}</p>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-500 ml-8">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(task.deadline)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Tag className="w-4 h-4" />
                                  {task.category}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => markTaskAsPending(task.id)}
                                className="bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition"
                                title="Mark as pending"
                              >
                                <Clock className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition"
                                title="Delete task"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {(filter === 'all' || filter === 'unfinished') && (
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-6 h-6 text-red-500" />
                      <h2 className="text-2xl font-bold text-gray-800">Unfinished Tasks</h2>
                    </div>
                    <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
                      {unfinishedTasks.length} task{unfinishedTasks.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {unfinishedTasks.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No unfinished tasks</p>
                      </div>
                    ) : (
                      unfinishedTasks.map((task) => (
                        <div 
                          key={task.id}
                          className="p-5 rounded-xl border-l-4 border-red-500 bg-red-50"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {getStatusIcon(task.status)}
                                {getCategoryIcon(task.category)}
                                <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                                <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                              </div>
                              <p className="text-gray-600 mb-3 ml-8">{task.description}</p>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-500 ml-8">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(task.deadline)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Tag className="w-4 h-4" />
                                  {task.category}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => markTaskAsDone(task.id)}
                                className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition"
                                title="Mark as done"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition"
                                title="Delete task"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}