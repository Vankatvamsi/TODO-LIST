import React, { useState, useEffect } from 'react';
import { Play, Pause, CheckCircle2, Zap, Clock, Coffee } from 'lucide-react';
import { formatTime12, getTaskEndTime } from '../utils/helpers';

export default function ActiveTimerBar({ 
  activeTask, 
  onToggleStatus, 
  onRequestEarlyComplete 
}) {
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    if (!activeTask) {
      setSecondsElapsed(0);
      return;
    }

    const timer = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTask?.id]);

  if (!activeTask) return null;

  const totalDurationSeconds = (activeTask.durationMinutes || 30) * 60;
  const remainingSeconds = Math.max(0, totalDurationSeconds - secondsElapsed);
  const progressPercent = Math.min(100, Math.round((secondsElapsed / totalDurationSeconds) * 100));

  const formatCountdown = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-4 mb-6 border border-indigo-500/40 shadow-xl shadow-indigo-500/10 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-1000"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-1">
        {/* Left: Active info */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 shrink-0">
            <Clock className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Focus Session
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {formatTime12(activeTask.startTime)} - {formatTime12(getTaskEndTime(activeTask.startTime, activeTask.durationMinutes))}
              </span>
            </div>
            <h3 className="text-base font-bold text-white truncate max-w-md mt-0.5">
              {activeTask.title}
            </h3>
          </div>
        </div>

        {/* Center / Timer Countdown */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <span className="text-3xl font-extrabold font-mono tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
              {formatCountdown(remainingSeconds)}
            </span>
            <p className="text-[10px] text-slate-400 font-mono">
              REMAINING OF {activeTask.durationMinutes || 30}M
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => onToggleStatus(activeTask.id, 'pending')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-all cursor-pointer"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>Pause</span>
          </button>

          <button
            onClick={() => onRequestEarlyComplete(activeTask)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Complete Early & Cascade</span>
          </button>
        </div>
      </div>
    </div>
  );
}
