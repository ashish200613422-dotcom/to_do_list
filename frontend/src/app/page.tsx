"use client";

import { useState, useEffect } from "react";

interface Task {
  _id?: string;
  name: string; // Used as unique identifier/title
  day: string;  // e.g. Monday, or Date
  task: string; // description
}

const API_URL = "http://localhost:8000";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [name, setName] = useState("");
  const [day, setDay] = useState("");
  const [taskText, setTaskText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit states
  const [editingTask, setEditingTask] = useState<string | null>(null); // holds task name being edited
  const [editDay, setEditDay] = useState("");
  const [editTaskText, setEditTaskText] = useState("");

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong while loading tasks.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !day.trim() || !taskText.trim()) return;

    setError(null);
    try {
      const res = await fetch(`${API_URL}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          day: day.trim(),
          task: taskText.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to add task");
      
      // Reset inputs
      setName("");
      setDay("");
      setTaskText("");
      
      // Refresh list
      fetchTasks();
    } catch (err: any) {
      setError(err.message || "Failed to create task. Check if server is running.");
    }
  };

  const handleDeleteTask = async (taskName: string) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${encodeURIComponent(taskName)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete task");
      fetchTasks();
    } catch (err: any) {
      setError(err.message || "Failed to delete task.");
    }
  };

  const startEdit = (t: Task) => {
    setEditingTask(t.name);
    setEditDay(t.day);
    setEditTaskText(t.task);
  };

  const handleUpdateTask = async (e: React.FormEvent, originalName: string) => {
    e.preventDefault();
    if (!editDay.trim() || !editTaskText.trim()) return;

    setError(null);
    try {
      const res = await fetch(`${API_URL}/${encodeURIComponent(originalName)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: originalName, // backend needs name in the body and URL
          day: editDay.trim(),
          task: editTaskText.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to update task");

      setEditingTask(null);
      fetchTasks();
    } catch (err: any) {
      setError(err.message || "Failed to update task.");
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-slate-100 font-sans flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Blur Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-4xl z-10 flex flex-col gap-8">
        
        {/* Header */}
        <header className="text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              HyperTask
            </h1>
            <p className="text-slate-400 mt-2 text-sm sm:text-base">
              A premium, high-performance task manager integrated with MongoDB.
            </p>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Backend Connected
            </span>
          </div>
        </header>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-xl flex items-center gap-3 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-rose-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Task Form Component (Left column) */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl sticky top-8">
              <h2 className="text-xl font-bold mb-4 text-slate-100 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Create New Task
              </h2>
              <form onSubmit={handleAddTask} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Task Name (Unique ID)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Design Dashboard"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Day / Date</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Monday, Aug 31"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Task Details</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe the task instructions or details..."
                    value={taskText}
                    onChange={(e) => setTaskText(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  Create Task
                </button>
              </form>
            </div>
          </div>

          {/* Tasks List Component (Right column) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Active Tasks ({tasks.length})
              </h2>
              <button 
                onClick={fetchTasks} 
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium py-1 px-3 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 transition-all border border-indigo-500/10"
              >
                Refresh
              </button>
            </div>

            {loading && tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 border border-slate-800/50 rounded-2xl gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                <p className="text-slate-400 text-sm">Retrieving tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 border border-slate-800/50 rounded-2xl text-center px-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <h3 className="font-semibold text-slate-300 text-lg">No tasks scheduled</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-xs">Create your first task using the task generator form on the left.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {tasks.map((t) => (
                  <div 
                    key={t.name}
                    className="bg-slate-900/40 backdrop-blur-md border border-slate-800/40 hover:border-slate-800/80 rounded-xl p-5 shadow-lg transition-all hover:translate-y-[-2px]"
                  >
                    {editingTask === t.name ? (
                      /* Edit Mode Form */
                      <form onSubmit={(e) => handleUpdateTask(e, t.name)} className="flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <span className="text-xs font-semibold text-indigo-400">EDITING: {t.name}</span>
                          <button 
                            type="button" 
                            onClick={() => setEditingTask(null)}
                            className="text-xs text-slate-400 hover:text-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Day / Date</label>
                          <input
                            type="text"
                            required
                            value={editDay}
                            onChange={(e) => setEditDay(e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Task Details</label>
                          <textarea
                            required
                            rows={2}
                            value={editTaskText}
                            onChange={(e) => setEditTaskText(e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none transition-all resize-none"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 px-3 rounded-lg shadow transition-all"
                        >
                          Save Changes
                        </button>
                      </form>
                    ) : (
                      /* Display Mode */
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 mb-2">
                              {t.day}
                            </span>
                            <h3 className="text-lg font-bold text-slate-100 tracking-tight leading-tight">
                              {t.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Edit Button */}
                            <button
                              onClick={() => startEdit(t)}
                              aria-label="Edit task"
                              className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/50 rounded-lg transition-all"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteTask(t.name)}
                              aria-label="Delete task"
                              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 rounded-lg transition-all"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line bg-slate-950/30 p-3 rounded-lg border border-slate-800/40">
                          {t.task}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
