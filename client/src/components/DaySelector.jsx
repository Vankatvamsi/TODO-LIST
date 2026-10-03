import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, History, Sparkles } from 'lucide-react';
import { getTodayDateString, formatDateDisplay } from '../utils/helpers';

export default function DaySelector({ 
  selectedDate, 
  onSelectDate, 
  taskStats,
  onOpenHistory 
}) {
  const today = getTodayDateString();

  // Helper to shift day by offset
  const shiftDay = (days) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + days);
    const newStr = dateObj.toISOString().split('T')[0];
    onSelectDate(newStr);
  };

  const isToday = selectedDate === today;
  const isPast = selectedDate < today;

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  return (
    <div className="w-full glass-panel rounded-2xl p-4 mb-6 border border-slate-800 shadow-xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Navigation Arrows & Date Display */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => shiftDay(-1)}
            title="Previous Day"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center px-2">
            <div className="flex items-center gap-2 justify-center">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {formatDateDisplay(selectedDate)}
              </h2>
              {isPast && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <History className="w-3 h-3" /> Past List
                </span>
              )}
              {isToday && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Active Today
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {selectedDate}
            </p>
          </div>

          <button
            onClick={() => shiftDay(1)}
            title="Next Day"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick presets & Calendar picker */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => onSelectDate(yesterdayStr)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              selectedDate === yesterdayStr
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Yesterday
          </button>

          <button
            onClick={() => onSelectDate(today)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              selectedDate === today
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Today
          </button>

          <button
            onClick={() => onSelectDate(tomorrowStr)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              selectedDate === tomorrowStr
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Tomorrow
          </button>

          {/* Calendar Picker input */}
          <div className="relative flex items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && onSelectDate(e.target.value)}
              className="py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
            />
          </div>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-700/30 text-indigo-300 text-xs font-medium transition-all cursor-pointer"
            title="Browse all past dates and completions"
          >
            <History className="w-3.5 h-3.5" />
            <span>All Past Dates</span>
          </button>
        </div>
      </div>

      {/* Daily Progress summary line */}
      {taskStats && taskStats.total > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">
              Tasks: <strong className="text-white">{taskStats.completed}/{taskStats.total}</strong> Done
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400">
              {taskStats.inProgress} in progress
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">
              {taskStats.pending} pending
            </span>
          </div>

          {/* Mini progress bar */}
          <div className="w-full sm:w-48 flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${taskStats.percent}%` }}
              />
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-400 min-w-[36px] text-right">
              {taskStats.percent}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
