import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Data storage paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

// Ensure data directory and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}
if (!fs.existsSync(TASKS_FILE)) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify([]));
}

function readData(file) {
  try {
    const raw = fs.readFileSync(file, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading ' + file, err);
    return [];
  }
}

function writeData(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing ' + file, err);
  }
}

// Helpers for validation
function validateEmail(email) {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).trim().toLowerCase());
}

function validatePhone(phone) {
  const cleanPhone = String(phone).replace(/\D/g, '');
  return cleanPhone.length === 10;
}

// Helper to calculate time math (HH:mm)
function addMinutesToTime(timeStr, minutes) {
  const [h, m] = timeStr.split(':').map(Number);
  const totalMin = h * 60 + m + minutes;
  const newH = Math.floor((totalMin % 1440) / 60);
  const newM = totalMin % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins) {
  const norm = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ==================== AUTH ROUTES ====================

// Signup
app.post('/api/auth/signup', (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address (e.g., name@example.com)' });
  }

  if (!phone || !validatePhone(phone)) {
    return res.status(400).json({ error: 'Phone number must contain exactly 10 digits' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  const cleanPhone = String(phone).replace(/\D/g, '');
  const cleanEmail = email.trim().toLowerCase();
  const users = readData(USERS_FILE);

  const existingEmail = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existingEmail) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const existingPhone = users.find(u => u.phone === cleanPhone);
  if (existingPhone) {
    return res.status(400).json({ error: 'An account with this phone number already exists' });
  }

  const newUser = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: name.trim(),
    email: cleanEmail,
    phone: cleanPhone,
    password: password, // For demo application
    nightReminderTime: '21:00', // Default 9:00 PM
    reminderLeadMinutes: 10,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeData(USERS_FILE, users);

  // Auto populate a few demo tasks for today and yesterday so the user sees rich data immediately
  const tasks = readData(TASKS_FILE);
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const initialTasks = [
    {
      id: 'task_' + Date.now() + '_1',
      userId: newUser.id,
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
      id: 'task_' + Date.now() + '_2',
      userId: newUser.id,
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
      id: 'task_' + Date.now() + '_3',
      userId: newUser.id,
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
      id: 'task_' + Date.now() + '_4',
      userId: newUser.id,
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
    // Yesterday tasks
    {
      id: 'task_' + Date.now() + '_5',
      userId: newUser.id,
      title: 'Setup React & Vite project environment',
      description: 'Configured Tailwind and client tools',
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
      id: 'task_' + Date.now() + '_6',
      userId: newUser.id,
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

  tasks.push(...initialTasks);
  writeData(TASKS_FILE, tasks);

  res.status(201).json({
    message: 'Account created successfully',
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      nightReminderTime: newUser.nightReminderTime,
      reminderLeadMinutes: newUser.reminderLeadMinutes
    }
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Please provide email or phone and password' });
  }

  const cleanId = identifier.trim().toLowerCase();
  const cleanPhone = identifier.replace(/\D/g, '');

  const users = readData(USERS_FILE);
  const user = users.find(u => 
    u.email.toLowerCase() === cleanId || (cleanPhone.length === 10 && u.phone === cleanPhone)
  );

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials. Please verify your email/phone and password.' });
  }

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      nightReminderTime: user.nightReminderTime || '21:00',
      reminderLeadMinutes: user.reminderLeadMinutes || 10
    }
  });
});

// Update Profile / Preferences
app.put('/api/auth/profile/:id', (req, res) => {
  const { id } = req.params;
  const { nightReminderTime, reminderLeadMinutes } = req.body;

  const users = readData(USERS_FILE);
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (nightReminderTime) users[idx].nightReminderTime = nightReminderTime;
  if (reminderLeadMinutes !== undefined) users[idx].reminderLeadMinutes = reminderLeadMinutes;

  writeData(USERS_FILE, users);
  res.json({ message: 'Profile updated', user: users[idx] });
});

// ==================== TASK ROUTES ====================

// Get all tasks for a user, optionally filtered by date
app.get('/api/tasks', (req, res) => {
  const { userId, date } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const allTasks = readData(TASKS_FILE);
  let userTasks = allTasks.filter(t => t.userId === userId);

  if (date) {
    userTasks = userTasks.filter(t => t.date === date);
  }

  // Sort by startTime
  userTasks.sort((a, b) => {
    if (!a.startTime) return 1;
    if (!b.startTime) return -1;
    return a.startTime.localeCompare(b.startTime);
  });

  res.json(userTasks);
});

// Get date list with statistics for historical view
app.get('/api/tasks/dates', (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const allTasks = readData(TASKS_FILE);
  const userTasks = allTasks.filter(t => t.userId === userId);

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

  const dates = Object.values(dateMap).sort((a, b) => b.date.localeCompare(a.date));
  res.json(dates);
});

// Create task
app.post('/api/tasks', (req, res) => {
  const {
    userId,
    title,
    description,
    date,
    startTime,
    durationMinutes = 30,
    reminderLeadMinutes = 10,
    priority = 'medium',
    category = 'General'
  } = req.body;

  if (!userId || !title || !date) {
    return res.status(400).json({ error: 'userId, title, and date are required' });
  }

  const tasks = readData(TASKS_FILE);
  const newTask = {
    id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    userId,
    title: title.trim(),
    description: description ? description.trim() : '',
    date,
    startTime: startTime || '09:00',
    durationMinutes: Number(durationMinutes) || 30,
    reminderLeadMinutes: Number(reminderLeadMinutes) || 10,
    priority,
    category,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  writeData(TASKS_FILE, tasks);
  res.status(201).json(newTask);
});

// Update task
app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const tasks = readData(TASKS_FILE);
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const prevStatus = tasks[idx].status;
  tasks[idx] = {
    ...tasks[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  if (updates.status === 'completed' && prevStatus !== 'completed') {
    tasks[idx].completedAt = new Date().toISOString();
  }

  writeData(TASKS_FILE, tasks);
  res.json(tasks[idx]);
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const tasks = readData(TASKS_FILE);
  const filtered = tasks.filter(t => t.id !== id);

  if (filtered.length === tasks.length) {
    return res.status(404).json({ error: 'Task not found' });
  }

  writeData(TASKS_FILE, filtered);
  res.json({ message: 'Task deleted successfully' });
});

// ==================== DYNAMIC SCHEDULE CASCADE ====================
// When task is completed early:
// Option 1: Rest/Break -> doesn't shift remaining tasks (optional rest record)
// Option 2: Shift Next Task Now -> shifts upcoming tasks earlier so user can proceed immediately
app.post('/api/tasks/cascade-schedule', (req, res) => {
  const { userId, date, completedTaskId, action, restMinutes = 15 } = req.body;

  if (!userId || !date || !completedTaskId) {
    return res.status(400).json({ error: 'userId, date, and completedTaskId are required' });
  }

  const tasks = readData(TASKS_FILE);
  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMins = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${currentHours}:${currentMins}`;

  // Find all user tasks for that date
  const dayTasks = tasks.filter(t => t.userId === userId && t.date === date);
  const currentTaskIndex = dayTasks.findIndex(t => t.id === completedTaskId);

  if (currentTaskIndex === -1) {
    return res.status(404).json({ error: 'Task not found for this date' });
  }

  // Mark task as completed
  const currentTask = dayTasks[currentTaskIndex];
  currentTask.status = 'completed';
  currentTask.completedAt = now.toISOString();
  currentTask.completedEarly = true;

  if (action === 'start_next_now') {
    // Collect pending tasks that were scheduled after this task
    const upcomingTasks = dayTasks.filter(t => t.status === 'pending' && t.id !== completedTaskId);
    upcomingTasks.sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (upcomingTasks.length > 0) {
      let nextStartTime = currentTime;
      upcomingTasks.forEach((task, index) => {
        // Shift task to start now or right after previous
        task.startTime = nextStartTime;
        nextStartTime = addMinutesToTime(nextStartTime, task.durationMinutes || 30);
      });
    }
  } else if (action === 'take_break') {
    // Optionally create a break task or simply delay/keep schedule intact
    // If upcoming task starts sooner than restMinutes, shift it to currentTime + restMinutes
    const upcomingTasks = dayTasks.filter(t => t.status === 'pending' && t.id !== completedTaskId);
    upcomingTasks.sort((a, b) => a.startTime.localeCompare(b.startTime));

    const breakEndTime = addMinutesToTime(currentTime, Number(restMinutes));
    const breakEndMins = timeToMinutes(breakEndTime);

    let runningTime = breakEndTime;
    upcomingTasks.forEach(task => {
      const taskStartMins = timeToMinutes(task.startTime);
      if (taskStartMins < breakEndMins) {
        task.startTime = runningTime;
        runningTime = addMinutesToTime(runningTime, task.durationMinutes || 30);
      }
    });
  }

  writeData(TASKS_FILE, tasks);

  const updatedDayTasks = tasks
    .filter(t => t.userId === userId && t.date === date)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  res.json({
    message: action === 'start_next_now' ? 'Schedule shifted to start next task right now!' : 'Break recorded! Schedule adjusted.',
    tasks: updatedDayTasks
  });
});

// ==================== NIGHT REVIEW & ROLLOVER ====================
app.get('/api/tasks/night-review', (req, res) => {
  const { userId, date } = req.query;
  if (!userId || !date) {
    return res.status(400).json({ error: 'userId and date are required' });
  }

  const allTasks = readData(TASKS_FILE);
  const dayTasks = allTasks.filter(t => t.userId === userId && t.date === date);

  const completed = dayTasks.filter(t => t.status === 'completed');
  const pending = dayTasks.filter(t => t.status !== 'completed');
  const completionRate = dayTasks.length > 0 ? Math.round((completed.length / dayTasks.length) * 100) : 0;

  res.json({
    date,
    total: dayTasks.length,
    completedCount: completed.length,
    pendingCount: pending.length,
    completionRate,
    completedTasks: completed,
    pendingTasks: pending
  });
});

// Rollover pending tasks to another date (e.g., tomorrow)
app.post('/api/tasks/rollover', (req, res) => {
  const { userId, fromDate, toDate, taskIds } = req.body;
  if (!userId || !fromDate || !toDate) {
    return res.status(400).json({ error: 'userId, fromDate, and toDate are required' });
  }

  const tasks = readData(TASKS_FILE);
  let movedCount = 0;

  tasks.forEach(t => {
    if (t.userId === userId && t.date === fromDate && t.status !== 'completed') {
      if (!taskIds || taskIds.includes(t.id)) {
        t.date = toDate;
        t.status = 'pending';
        t.rolledOverFrom = fromDate;
        movedCount++;
      }
    }
  });

  writeData(TASKS_FILE, tasks);
  res.json({ message: `Successfully moved ${movedCount} pending task(s) to ${toDate}`, movedCount });
});

app.listen(PORT, () => {
  console.log(`FinishToday Server running on http://localhost:${PORT}`);
});
