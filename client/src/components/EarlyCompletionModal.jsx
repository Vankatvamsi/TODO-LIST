import React, { useState } from 'react';
import { 
  Zap, 
  Coffee, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  X,
  FastForward,
  Calendar
} from 'lucide-react';
import { 
  formatTime12, 
  getCurrentTimeHHMM, 
  addMinutesToTime, 
  getTaskEndTime, 
  timeToMinutes 
} from '../utils/helpers';

export default function EarlyCompletionModal({ 
  task, 
  allTasks, 
  onClose, 
  onConfirmCascade 
}) {
  const [choice, setChoice] = useState('start_next_now'); // 'start_next_now' or 'take_break'
  const [restMinutes, setRestMinutes] = useState(15);
  const currentTime = getCurrentTimeHHMM();

  if (!task) return null;

  // Upcoming pending tasks for today
  const upcomingTasks = allTasks
    .filter(t => t.id !== task.id && t.status === 'pending')
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  // Calculate preview of new times if starting next now
  const previewStartNow = [];
  let runningTime = currentTime;
  upcomingTasks.forEach((t) => {
    previewStartNow.push({
      ...t,
      newStartTime: runningTime,
      newEndTime: addMinutesToTime(runningTime, t.durationMinutes || 30)
    });
    runningTime = addMinutesToTime(runningTime, t.durationMinutes || 30);
  });

  // Calculate preview if taking rest
  const previewRest = [];
  const breakEnd = addMinutesToTime(currentTime, restMinutes);
  let restRunningTime = breakEnd;
  upcomingTasks.forEach((t) => {
    // If original start time is earlier than break end, shift it
    const origStartMin = timeToMinutes(t.startTime);
    const breakEndMin = timeToMinutes(breakEnd);
    if (origStartMin < breakEndMin) {
      previewRest.push({
        ...t,
        newStartTime: restRunningTime,
        newEndTime: addMinutesToTime(restRunningTime, t.durationMinutes || 30)
      });
      restRunningTime = addMinutesToTime(restRunningTime, t.durationMinutes || 30);
    } else {
      previewRest.push({
        ...t,
        newStartTime: t.startTime,
        newEndTime: getTaskEndTime(t.startTime, t.durationMinutes)
      });
    }
  });

  const activePreview = choice === 'start_next_now' ? previewStartNow : previewRest;

  const handleApply = () => {
    onConfirmCascade({
      completedTaskId: task.id,
      action: choice,
      restMinutes: Number(restMinutes)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-6 sm:p-8 overflow-hidden rounded-2xl glass-panel glass-panel-glow border border-emerald-500/30 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Ahead of Schedule!
              </span>
              <span className="text-xs text-slate-400 font-mono">Current Time: {formatTime12(currentTime)}</span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight mt-0.5">
              Completed "{task.title}" Early!
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          You finished before your scheduled end time! How would you like FinishToday to manage your remaining schedule?
        </p>

        {/* 2 Strategic Choices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* Option 1: Start Next Task Now */}
          <div
            onClick={() => setChoice('start_next_now')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              choice === 'start_next_now'
                ? 'bg-indigo-950/60 border-indigo-500 shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <FastForward className="w-4 h-4" />
              </div>
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                choice === 'start_next_now' ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600'
              }`}>
                {choice === 'start_next_now' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">Start Next Task Now</h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">
              Pull upcoming tasks forward so your next task starts at {formatTime12(currentTime)}. Finish your day earlier!
            </p>
          </div>

          {/* Option 2: Take a Rest */}
          <div
            onClick={() => setChoice('take_break')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              choice === 'take_break'
                ? 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-500/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <Coffee className="w-4 h-4" />
              </div>
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                choice === 'take_break' ? 'border-emerald-400 bg-emerald-500' : 'border-slate-600'
              }`}>
                {choice === 'take_break' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">Take a Rest / Break</h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">
              Relax and recharge. Next tasks are adjusted to begin smoothly after your break.
            </p>
          </div>
        </div>

        {/* Break Duration Selector (if take_break is selected) */}
        {choice === 'take_break' && (
          <div className="mb-6 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 animate-in fade-in duration-200">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Choose Rest Duration:
            </label>
            <div className="flex items-center gap-2">
              {[10, 15, 20, 30, 45].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setRestMinutes(mins)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                    restMinutes === mins
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
            <p className="text-[11px] text-emerald-400 font-mono mt-2">
              Break until: {formatTime12(addMinutesToTime(currentTime, restMinutes))}
            </p>
          </div>
        )}

        {/* Live Preview of Cascaded Schedule */}
        {activePreview.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Preview: New Schedule for Upcoming Tasks</span>
            </h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {activePreview.map((item, idx) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs"
                >
                  <div className="truncate max-w-[200px]">
                    <span className="font-medium text-slate-200">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                    <span className="line-through text-slate-500">{formatTime12(item.startTime)}</span>
                    <ArrowRight className="w-3 h-3 text-indigo-400" />
                    <span className="text-emerald-400 font-semibold">{formatTime12(item.newStartTime)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Confirm & Update Schedule</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
