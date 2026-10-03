import React, { useState, useEffect } from 'react';
import { 
  Moon, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  ArrowRight, 
  X, 
  Sparkles, 
  RotateCw, 
  Star,
  Clock
} from 'lucide-react';
import { formatDateDisplay, formatTime12 } from '../utils/helpers';
import confetti from 'canvas-confetti';

export default function NightReviewModal({ 
  user,
  date, 
  tasks, 
  onClose, 
  onRolloverTasks, 
  onToggleStatus 
}) {
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [reflectionRating, setReflectionRating] = useState(5);
  const [reflectionNote, setReflectionNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const total = tasks.length;
  const completionRate = total > 0 ? Math.round((completedTasks.length / total) * 100) : 0;

  // By default, select all pending tasks for rollover
  useEffect(() => {
    setSelectedTaskIds(pendingTasks.map(t => t.id));
  }, [tasks]);

  const toggleSelectTask = (id) => {
    setSelectedTaskIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleRollover = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    onRolloverTasks({
      fromDate: date,
      toDate: tomorrowStr,
      taskIds: selectedTaskIds
    });
    setSubmitted(true);
    
    // Mini confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl p-6 sm:p-8 overflow-hidden rounded-2xl glass-panel glass-panel-glow border border-purple-500/30 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-400 p-0.5 shadow-lg shadow-purple-600/30">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Moon className="w-6 h-6 text-purple-300 fill-purple-300/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                Nightly Review & Reflection
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {formatDateDisplay(date)}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight mt-0.5">
              Review Today’s Accomplishments
            </h2>
          </div>
        </div>

        {/* Completion Progress Banner */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400">Day Score</p>
            <p className="text-2xl font-extrabold font-mono text-white mt-0.5">
              {completionRate}% <span className="text-xs font-normal text-slate-400 font-sans">completed</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              <strong className="text-emerald-400">{completedTasks.length}</strong> tasks completed • <strong className="text-amber-400">{pendingTasks.length}</strong> unfinished
            </p>
          </div>

          {/* Star rating for the day */}
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-1">Rate Your Productivity</p>
            <div className="flex items-center gap-1 justify-end">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReflectionRating(star)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star className={`w-5 h-5 ${
                    star <= reflectionRating 
                      ? 'text-amber-400 fill-amber-400' 
                      : 'text-slate-700'
                  }`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Two Columns: Completed vs Unfinished */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Completed Column */}
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>What Got Done ({completedTasks.length})</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {completedTasks.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic py-2">No tasks marked completed yet.</p>
              ) : (
                completedTasks.map(t => (
                  <div key={t.id} className="p-2 rounded-lg bg-slate-900/60 border border-emerald-500/10 text-xs">
                    <p className="font-medium text-slate-200 line-through truncate">{t.title}</p>
                    <span className="text-[10px] text-slate-500 font-mono">{formatTime12(t.startTime)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Unfinished Column */}
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <AlertCircle className="w-4 h-4" />
                <span>What's Left ({pendingTasks.length})</span>
              </div>
              {pendingTasks.length > 0 && (
                <span className="text-[10px] text-slate-400">Select to rollover</span>
              )}
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {pendingTasks.length === 0 ? (
                <div className="p-4 text-center">
                  <Sparkles className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-emerald-300">All tasks completed today!</p>
                  <p className="text-[11px] text-slate-400">Enjoy your restful night!</p>
                </div>
              ) : (
                pendingTasks.map(t => {
                  const isChecked = selectedTaskIds.includes(t.id);
                  return (
                    <div 
                      key={t.id} 
                      onClick={() => toggleSelectTask(t.id)}
                      className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between gap-2 transition-all ${
                        isChecked 
                          ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' 
                          : 'bg-slate-900/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="truncate flex-1">
                        <p className="font-medium text-slate-200 truncate">{t.title}</p>
                        <span className="text-[10px] text-slate-500 font-mono">{formatTime12(t.startTime)}</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={() => {}} 
                        className="rounded accent-amber-500 cursor-pointer"
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <p className="text-[11px] text-slate-400">
            Night review reminder scheduled at {user?.nightReminderTime || '21:00'} daily.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              Done Reviewing
            </button>

            {pendingTasks.length > 0 && (
              <button
                onClick={handleRollover}
                disabled={selectedTaskIds.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Move {selectedTaskIds.length} Unfinished to Tomorrow</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
