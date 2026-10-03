// API client with offline LocalStorage fallback for 100% resilient user experience
import { getTodayDateString } from './helpers';

const API_BASE = '/api';

// Local storage keys
const LS_USER = 'finishtoday_user';
const LS_TASKS = 'finishtoday_tasks';

// Default initial tasks if using local storage
function getDefaultLocalTasks(userId) {
  const today = getTodayDateString();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  return [
    {
      id: 'local_1',
      userId,
      title: 'Morning planning & check priority emails',
      description: 'Review inbox and outline day key milestones',
      date: today,
      startTime: '09:00',
      durationMinutes: 30,
      reminderLeadMinutes: 10,
      priority: 'high',
      category: 'Work',
      status: 'completed',
      completedAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'local_2',
      userId,
      title: 'FinishToday Feature Review & Code Polish',
      description: 'Check dynamic schedule shift and night reminder flow',
      date: today,
      startTime: '11:00',
      durationMinutes: 60,
      reminderLeadMinutes: 5,
      priority: 'high',
      category: 'Development',
      status: 'in_progress',
      startedAt: new Date().toISOString()
    },
    {
      id: 'local_3',
      userId,
      title: 'Team Sync & Project Walkthrough',
      description: 'Discuss sprint goals and upcoming release notes',
      date: today,
      startTime: '15:30',
      durationMinutes: 45,
      reminderLeadMinutes: 10,
      priority: 'medium',
      category: 'Meeting',
      status: 'pending'
    },
    {
      id: 'local_4',
      userId,
      title: 'Evening 30-min brisk walk & workout',
      description: 'Cardio and relaxation',
      date: today,
      startTime: '18:30',
      durationMinutes: 30,
      reminderLeadMinutes: 5,
      priority: 'low',
      category: 'Health',
      status: 'pending'
    },
    {
      id: 'local_5',
      userId,
      title: 'Setup React & Tailwind CSS project',
      description: 'Project scaffolding and basic configuration',
      date: yesterday,
      startTime: '10:00',
      durationMinutes: 45,
      reminderLeadMinutes: 10,
      priority: 'high',
      category: 'Development',
      status: 'completed',
      completedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'local_6',
      userId,
      title: 'Read UI design guidelines & typography',
      description: 'Selected color tokens and animations',
      date: yesterday,
      startTime: '14:00',
      durationMinutes: 40,
      reminderLeadMinutes: 5,
      priority: 'medium',
      category: 'Study',
      status: 'completed',
      completedAt: new Date(Date.now() - 80000000).toISOString()
    }
  ];
}

export const api = {
  // Auth
  async signup(data) {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Signup failed');
      }
      const json = await res.json();
      localStorage.setItem(LS_USER, JSON.stringify(json.user));
      return json;
    } catch (err) {
      if (err.message && err.message.includes('fetch')) {
        // Fallback for standalone offline execution
        const newUser = {
          id: 'user_' + Date.now(),
          name: data.name,
          email: data.email,
          phone: data.phone.replace(/\D/g, ''),
          nightReminderTime: '21:00',
          reminderLeadMinutes: 10
        };
        localStorage.setItem(LS_USER, JSON.stringify(newUser));
        const initTasks = getDefaultLocalTasks(newUser.id);
        localStorage.setItem(LS_TASKS, JSON.stringify(initTasks));
        return { user: newUser, message: 'Account created (offline mode)' };
      }
      throw err;
    }
  },

  async login(identifier, password) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Login failed');
      }
      const json = await res.json();
      localStorage.setItem(LS_USER, JSON.stringify(json.user));
      return json;
    } catch (err) {
      if (err.message && err.message.includes('fetch')) {
        const stored = localStorage.getItem(LS_USER);
        if (stored) {
          const user = JSON.parse(stored);
          return { user, message: 'Login successful' };
        }
        // Create demo session
        const demoUser = {
          id: 'user_demo',
          name: 'Vamsi User',
          email: identifier.includes('@') ? identifier : 'user@finishtoday.com',
          phone: '9876543210',
          nightReminderTime: '21:00',
          reminderLeadMinutes: 10
        };
        localStorage.setItem(LS_USER, JSON.stringify(demoUser));
        localStorage.setItem(LS_TASKS, JSON.stringify(getDefaultLocalTasks(demoUser.id)));
        return { user: demoUser, message: 'Demo Login' };
      }
      throw err;
    }
  },

  getCurrentUser() {
    try {
      const u = localStorage.getItem(LS_USER);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem(LS_USER);
  },

  // Tasks
  async getTasks(userId, date) {
    try {
      const query = new URLSearchParams({ userId });
      if (date) query.append('date', date);
      const res = await fetch(`${API_BASE}/tasks?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      return data;
    } catch {
      // LocalStorage fallback
      const stored = localStorage.getItem(LS_TASKS);
      const tasks = stored ? JSON.parse(stored) : getDefaultLocalTasks(userId);
      let filtered = tasks.filter(t => t.userId === userId);
      if (date) filtered = filtered.filter(t => t.date === date);
      return filtered.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    }
  },

  async getDates(userId) {
    try {
      const res = await fetch(`${API_BASE}/tasks/dates?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch dates');
      return await res.json();
    } catch {
      const stored = localStorage.getItem(LS_TASKS);
      const tasks = stored ? JSON.parse(stored) : getDefaultLocalTasks(userId);
      const userTasks = tasks.filter(t => t.userId === userId);
      const dateMap = {};
      userTasks.forEach(task => {
        const d = task.date;
        if (!dateMap[d]) {
          dateMap[d] = { date: d, total: 0, completed: 0, pending: 0, in_progress: 0 };
        }
        dateMap[d].total += 1;
        if (task.status === 'completed') dateMap[d].completed += 1;
        else if (task.status === 'in_progress') dateMap[d].in_progress += 1;
        else dateMap[d].pending += 1;
      });
      return Object.values(dateMap).sort((a, b) => b.date.localeCompare(a.date));
    }
  },

  async createTask(taskData) {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (!res.ok) throw new Error('Failed to create task');
      return await res.json();
    } catch {
      const stored = localStorage.getItem(LS_TASKS);
      const tasks = stored ? JSON.parse(stored) : [];
      const newTask = {
        ...taskData,
        id: 'task_' + Date.now(),
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      tasks.push(newTask);
      localStorage.setItem(LS_TASKS, JSON.stringify(tasks));
      return newTask;
    }
  },

  async updateTask(id, updates) {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update task');
      return await res.json();
    } catch {
      const stored = localStorage.getItem(LS_TASKS);
      const tasks = stored ? JSON.parse(stored) : [];
      const idx = tasks.findIndex(t => t.id === id);
      if (idx !== -1) {
        tasks[idx] = { ...tasks[idx], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(LS_TASKS, JSON.stringify(tasks));
        return tasks[idx];
      }
      throw new Error('Task not found');
    }
  },

  async deleteTask(id) {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      return await res.json();
    } catch {
      const stored = localStorage.getItem(LS_TASKS);
      const tasks = stored ? JSON.parse(stored) : [];
      const filtered = tasks.filter(t => t.id !== id);
      localStorage.setItem(LS_TASKS, JSON.stringify(filtered));
      return { message: 'Deleted' };
    }
  },

  async cascadeSchedule(payload) {
    try {
      const res = await fetch(`${API_BASE}/tasks/cascade-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to cascade schedule');
      return await res.json();
    } catch {
      // Local implementation
      const stored = localStorage.getItem(LS_TASKS);
      let tasks = stored ? JSON.parse(stored) : [];
      const { completedTaskId, action, restMinutes = 15, date, userId } = payload;
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMins = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentHours}:${currentMins}`;

      tasks = tasks.map(t => {
        if (t.id === completedTaskId) {
          return { ...t, status: 'completed', completedAt: now.toISOString(), completedEarly: true };
        }
        return t;
      });

      const dayTasks = tasks.filter(t => t.userId === userId && t.date === date);
      const upcoming = dayTasks.filter(t => t.status === 'pending' && t.id !== completedTaskId);
      upcoming.sort((a, b) => a.startTime.localeCompare(b.startTime));

      if (action === 'start_next_now') {
        let runningTime = currentTime;
        upcoming.forEach(task => {
          const tIdx = tasks.findIndex(x => x.id === task.id);
          if (tIdx !== -1) {
            tasks[tIdx].startTime = runningTime;
            const [h, m] = runningTime.split(':').map(Number);
            const total = h * 60 + m + (task.durationMinutes || 30);
            runningTime = `${String(Math.floor((total % 1440) / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
          }
        });
      }

      localStorage.setItem(LS_TASKS, JSON.stringify(tasks));
      const updated = tasks.filter(t => t.userId === userId && t.date === date);
      return { tasks: updated, message: 'Schedule updated' };
    }
  },

  async getNightReview(userId, date) {
    try {
      const res = await fetch(`${API_BASE}/tasks/night-review?userId=${userId}&date=${date}`);
      if (!res.ok) throw new Error('Failed to get night review');
      return await res.json();
    } catch {
      const stored = localStorage.getItem(LS_TASKS);
      const tasks = stored ? JSON.parse(stored) : [];
      const dayTasks = tasks.filter(t => t.userId === userId && t.date === date);
      const completed = dayTasks.filter(t => t.status === 'completed');
      const pending = dayTasks.filter(t => t.status !== 'completed');
      return {
        date,
        total: dayTasks.length,
        completedCount: completed.length,
        pendingCount: pending.length,
        completionRate: dayTasks.length > 0 ? Math.round((completed.length / dayTasks.length) * 100) : 0,
        completedTasks: completed,
        pendingTasks: pending
      };
    }
  },

  async rolloverTasks(payload) {
    try {
      const res = await fetch(`${API_BASE}/tasks/rollover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to rollover tasks');
      return await res.json();
    } catch {
      const stored = localStorage.getItem(LS_TASKS);
      let tasks = stored ? JSON.parse(stored) : [];
      const { userId, fromDate, toDate, taskIds } = payload;
      let count = 0;
      tasks = tasks.map(t => {
        if (t.userId === userId && t.date === fromDate && t.status !== 'completed') {
          if (!taskIds || taskIds.includes(t.id)) {
            count++;
            return { ...t, date: toDate, status: 'pending', rolledOverFrom: fromDate };
          }
        }
        return t;
      });
      localStorage.setItem(LS_TASKS, JSON.stringify(tasks));
      return { message: `Moved ${count} task(s)`, movedCount: count };
    }
  }
};
