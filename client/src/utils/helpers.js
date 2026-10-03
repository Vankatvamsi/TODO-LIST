// Helper utilities for FinishToday

// Formats YYYY-MM-DD
export function getTodayDateString() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const today = getTodayDateString();

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split('T')[0];

  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  if (dateStr === tomorrow) return 'Tomorrow';

  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: dateObj.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
}

// Convert 24h HH:mm to 12h AM/PM
export function formatTime12(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}

// Validation functions
export function isValidEmail(email) {
  if (!email) return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).trim());
}

export function isValidPhone(phone) {
  if (!phone) return false;
  // Clean all non-digit characters
  const clean = String(phone).replace(/\D/g, '');
  return clean.length === 10;
}

export function formatPhoneNumber(phone) {
  const clean = String(phone).replace(/\D/g, '').slice(0, 10);
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `(${clean.slice(0, 3)}) ${clean.slice(3)}`;
  return `(${clean.slice(0, 3)}) ${clean.slice(3, 6)}-${clean.slice(6, 10)}`;
}

// Time mathematics
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(totalMin) {
  const normalized = ((totalMin % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function addMinutesToTime(timeStr, minutes) {
  return minutesToTime(timeToMinutes(timeStr) + minutes);
}

// Check if currently night time (e.g., between 8:00 PM and 4:00 AM)
export function isNightTime(userNightTime = '21:00') {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const nightMinutes = timeToMinutes(userNightTime);
  // Either past evening user time (e.g., 21:00 to 23:59) or early night (00:00 to 04:00)
  return currentMinutes >= nightMinutes || currentMinutes < 240;
}

// Calculate task end time
export function getTaskEndTime(startTime, durationMinutes = 30) {
  return addMinutesToTime(startTime, durationMinutes);
}

// Current time in HH:mm
export function getCurrentTimeHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
