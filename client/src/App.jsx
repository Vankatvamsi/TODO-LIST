import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  Search, 
  SlidersHorizontal, 
  Clock, 
  Moon, 
  Zap, 
  Coffee,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

import Navbar from './components/Navbar';
import DaySelector from './components/DaySelector';
import TaskCard from './components/TaskCard';
import ActiveTimerBar from './components/ActiveTimerBar';
import EarlyCompletionModal from './components/EarlyCompletionModal';
import NightReviewModal from './components/NightReviewModal';
import TaskFormModal from './components/TaskFormModal';
import HistoryModal from './components/HistoryModal';
import NotificationToast from './components/NotificationToast';
import AuthModal from './components/AuthModal';

import { api } from './utils/api';
import { 
  getTodayDateString, 
  getCurrentTimeHHMM, 
  timeToMinutes, 
  formatTime12, 
  isNightTime 
} from './utils/helpers';
import { 
  playSuccessSound, 
  playReminderSound, 
  playEveningChime 
} from './utils/audio';

export default function App() {
  const [user, setUser] = useState(() => api.getCurrentUser());
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, completed

  // Modals state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [earlyCompleteTarget, setEarlyCompleteTarget] = useState(null);
  const [showNightReview, setShowNightReview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [notification, setNotification] = useState(null);

  // Track fired reminders to prevent duplicate spamming
  const firedReminders = useRef(new Set());
  const nightReminderFired = useRef(false);

  const today = getTodayDateString();
  const isSelectedToday = selectedDate === today;

  // Load tasks when user or selected date changes
  useEffect(() => {
    if (!user) return;
    loadTasks();
  }, [user?.id, selectedDate]);

  const loadTasks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.getTasks(user.id, selectedDate);
      setTasks(data || []);
    } catch (err) {
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time reminder monitor (Runs every 10 seconds)
  useEffect(() => {
    if (!user) return;

    const checkReminders = () => {
      const currentTime = getCurrentTimeHHMM();
      const currentMins = timeToMinutes(currentTime);

      // 1. Check Night Reminder prompt
      const nightTime = user.nightReminderTime || '21:00';
      if (currentTime === nightTime && !nightReminderFired.current) {
        nightReminderFired.current = true;
        if (soundEnabled) playEveningChime();
        setNotification({
          type: 'night_reminder',
          title: 'Night Reflection Time',
          message: 'It is 9:00 PM! Take a moment to check what got completed and what is left for today.',
          actionLabel: 'Open Night Review'
        });
      }

      // 2. Check scheduled tasks for Today
      if (isSelectedToday) {
        tasks.forEach(task => {
          if (task.status === 'completed' || !task.startTime) return;
          const taskStartMins = timeToMinutes(task.startTime);

          // Lead time reminder (e.g. 5 or 10 mins before)
          const leadMins = task.reminderLeadMinutes || 0;
          const leadKey = `${task.id}_lead_${task.startTime}`;
          if (leadMins > 0 && currentMins === (taskStartMins - leadMins)) {
            if (!firedReminders.current.has(leadKey)) {
              firedReminders.current.add(leadKey);
              if (soundEnabled) playReminderSound();
              setNotification({
                type: 'lead_reminder',
                title: `Upcoming Task in ${leadMins} mins`,
                message: `"${task.title}" is scheduled to begin at ${formatTime12(task.startTime)}.`,
                actionLabel: 'View Task',
                task
              });
            }
          }

          // At scheduled start time reminder
          const startKey = `${task.id}_start_${task.startTime}`;
          if (currentMins === taskStartMins) {
            if (!firedReminders.current.has(startKey)) {
              firedReminders.current.add(startKey);
              if (soundEnabled) playReminderSound();
              setNotification({
                type: 'start_reminder',
                title: 'Time for Your Task!',
                message: `Scheduled time reached for "${task.title}". Ready to begin?`,
                actionLabel: 'Start Focus Timer',
                task
              });
            }
          }
        });
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 10000);
    return () => clearInterval(interval);
  }, [user, tasks, isSelectedToday, soundEnabled]);

  // Handle task status changes & completion
  const handleToggleComplete = async (taskId, newStatus) => {
    try {
      const updated = await api.updateTask(taskId, { status: newStatus });
      if (newStatus === 'completed') {
        if (soundEnabled) playSuccessSound();
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      }
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartTask = async (taskId, status) => {
    try {
      const updated = await api.updateTask(taskId, { status });
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (taskData.id) {
        // Edit existing
        const updated = await api.updateTask(taskData.id, taskData);
        setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
      } else {
        // Create new
        const created = await api.createTask({
          ...taskData,
          userId: user.id
        });
        if (taskData.date === selectedDate) {
          setTasks(prev => [...prev, created].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || '')));
        }
      }
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error(err);
    }
  };

  // Dynamic Schedule Cascade Confirmation
  const handleConfirmCascade = async ({ completedTaskId, action, restMinutes }) => {
    try {
      const res = await api.cascadeSchedule({
        userId: user.id,
        date: selectedDate,
        completedTaskId,
        action,
        restMinutes
      });

      if (res && res.tasks) {
        setTasks(res.tasks);
      } else {
        await loadTasks();
      }

      setEarlyCompleteTarget(null);
      if (soundEnabled) playSuccessSound();

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.5 }
        });
      } catch (e) {}

      setNotification({
        type: 'early_finish',
        title: action === 'start_next_now' ? 'Schedule Pulled Forward!' : 'Break Time Activated!',
        message: action === 'start_next_now' 
          ? 'Next task scheduled to begin immediately! Great momentum.' 
          : `Enjoy your ${restMinutes}-minute break. Schedule has been aligned.`
      });
    } catch (err) {
      console.error('Cascade error:', err);
    }
  };

  // Night Rollover
  const handleRolloverTasks = async ({ fromDate, toDate, taskIds }) => {
    try {
      await api.rolloverTasks({
        userId: user.id,
        fromDate,
        toDate,
        taskIds
      });
      setShowNightReview(false);
      await loadTasks();
      setNotification({
        type: 'night_reminder',
        title: 'Rollover Complete',
        message: `Unfinished tasks smoothly transferred to tomorrow's agenda.`
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Copy unfinished from a past date to today
  const handleCopyUnfinishedToToday = async (pastDate) => {
    try {
      await api.rolloverTasks({
        userId: user.id,
        fromDate: pastDate,
        toDate: today
      });
      setSelectedDate(today);
      await loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // Notification action handler
  const handleNotificationAction = (notif) => {
    if (notif.type === 'night_reminder') {
      setShowNightReview(true);
    } else if (notif.task) {
      handleStartTask(notif.task.id, 'in_progress');
    }
  };

  // Active / running task
  const activeTask = tasks.find(t => t.status === 'in_progress');

  // Stats calculation
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter tasks based on search & tags
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesStatus = statusFilter === 'all' 
      ? true 
      : statusFilter === 'completed' 
        ? t.status === 'completed' 
        : t.status !== 'completed';
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative">
      {/* Background radial gradient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[300px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Auth Modal if no user logged in */}
      {!user && (
        <AuthModal 
          onAuthSuccess={(u) => {
            setUser(u);
            setSelectedDate(today);
          }} 
        />
      )}

      {/* Main App Content */}
      {user && (
        <>
          <Navbar 
            user={user} 
            onLogout={() => {
              api.logout();
              setUser(null);
            }}
            onOpenHistory={() => setShowHistory(true)}
            onOpenNightReview={() => setShowNightReview(true)}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            pendingCount={pendingCount}
          />

          <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {/* Day Selector & Archive Bar */}
            <DaySelector 
              selectedDate={selectedDate} 
              onSelectDate={(d) => setSelectedDate(d)} 
              taskStats={{
                total: totalCount,
                completed: completedCount,
                inProgress: inProgressCount,
                pending: pendingCount,
                percent
              }}
              onOpenHistory={() => setShowHistory(true)}
            />

            {/* In-Progress Live Focus Session Bar */}
            {isSelectedToday && activeTask && (
              <ActiveTimerBar 
                activeTask={activeTask}
                onToggleStatus={handleStartTask}
                onRequestEarlyComplete={(task) => setEarlyCompleteTarget(task)}
              />
            )}

            {/* Quick Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tasks by title or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Status Filters & Add Task */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({totalCount})
                  </button>
                  <button
                    onClick={() => setStatusFilter('pending')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      statusFilter === 'pending' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Pending ({pendingCount + inProgressCount})
                  </button>
                  <button
                    onClick={() => setStatusFilter('completed')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      statusFilter === 'completed' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Done ({completedCount})
                  </button>
                </div>

                <button
                  onClick={() => {
                    setEditingTask(null);
                    setShowTaskForm(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>

            {/* Category Pill Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
              {['All', 'Work', 'Development', 'Meeting', 'Health', 'Study', 'Personal'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                    selectedCategory === cat
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Task Cards List */}
            {loading ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p>Loading your agenda...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="py-16 px-4 text-center rounded-2xl glass-panel border border-slate-800">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-white">No tasks found for this view</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {searchQuery || selectedCategory !== 'All' || statusFilter !== 'all'
                    ? 'Try clearing your filters or search term to see other tasks.'
                    : `No tasks scheduled for ${selectedDate}. Plan your day ahead!`}
                </p>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setShowTaskForm(true);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Task</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map(task => (
                  <TaskCard 
                    key={task.id}
                    task={task}
                    isToday={isSelectedToday}
                    onToggleComplete={handleToggleComplete}
                    onStartTask={handleStartTask}
                    onEditTask={(t) => {
                      setEditingTask(t);
                      setShowTaskForm(true);
                    }}
                    onDeleteTask={handleDeleteTask}
                    onRequestEarlyComplete={(t) => setEarlyCompleteTarget(t)}
                  />
                ))}
              </div>
            )}
          </main>

          {/* Early Completion & Cascade Modal */}
          {earlyCompleteTarget && (
            <EarlyCompletionModal 
              task={earlyCompleteTarget}
              allTasks={tasks}
              onClose={() => setEarlyCompleteTarget(null)}
              onConfirmCascade={handleConfirmCascade}
            />
          )}

          {/* Night Review Modal */}
          {showNightReview && (
            <NightReviewModal 
              user={user}
              date={selectedDate}
              tasks={tasks}
              onClose={() => setShowNightReview(false)}
              onRolloverTasks={handleRolloverTasks}
              onToggleStatus={handleToggleComplete}
            />
          )}

          {/* Task Form Modal (Add / Edit) */}
          {showTaskForm && (
            <TaskFormModal 
              initialData={editingTask}
              currentDate={selectedDate}
              onClose={() => {
                setShowTaskForm(false);
                setEditingTask(null);
              }}
              onSave={handleSaveTask}
            />
          )}

          {/* Past History Modal */}
          {showHistory && (
            <HistoryModal 
              user={user}
              onClose={() => setShowHistory(false)}
              onSelectDate={(d) => setSelectedDate(d)}
              onCopyUnfinishedToToday={handleCopyUnfinishedToToday}
            />
          )}

          {/* Live Notification Toast */}
          {notification && (
            <NotificationToast 
              notification={notification}
              onClose={() => setNotification(null)}
              onAction={handleNotificationAction}
            />
          )}
        </>
      )}
    </div>
  );
}
