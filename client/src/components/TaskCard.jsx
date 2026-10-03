import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Circle, 
  Play, 
  Pause, 
  AlertCircle, 
  Bell, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Zap, 
  Coffee,
  Calendar,
  Check
} from 'lucide-react';
import { formatTime12, getTaskEndTime, getCurrentTimeHHMM, timeToMinutes } from '../utils/helpers';

export default function TaskCard({ 
  task, 
  onToggleComplete, 
  onStartTask, 
  onEditTask, 
  onDeleteTask,
  onRequestEarlyComplete,
  isToday
}) {
  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in_progress';
  const endTime = getTaskEndTime(task.startTime, task.durationMinutes);

  // Check if completing right now would be earlier than scheduled end
  const handleCheckClick = () => {
    if (isCompleted) {
      // Un-complete
      onToggleComplete(task.id, 'pending');
      return;
    }

    if (isToday && task.startTime) {
      const currentMin = timeToMinutes(getCurrentTimeHHMM());
      const endMin = timeToMinutes(endTime);

      // If completing before scheduled end time
      if (currentMin < endMin) {
        onRequestEarlyComplete(task);
        return;
      }
    }

    // Standard completion
    onToggleComplete(task.id, 'completed');
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'low':
      default:
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'work': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'development': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'meeting': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'health': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'study': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className={`group relative p-4 rounded-2xl transition-all duration-200 border ${
      isCompleted 
        ? 'bg-slate-900/40 border-slate-800/60 opacity-75' 
        : isInProgress
          ? 'bg-gradient-to-r from-indigo-950/40 to-slate-900/90 border-indigo-500/40 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30'
          : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700/80 shadow-md'
    }`}>
      <div className="flex items-start justify-between gap-3">
        {/* Left: Checkbox + Info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            onClick={handleCheckClick}
            className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              isCompleted
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                : isInProgress
                  ? 'border-2 border-indigo-400 text-indigo-400 hover:bg-indigo-500/20'
                  : 'border-2 border-slate-600 hover:border-indigo-400 text-transparent hover:text-indigo-400'
            }`}
            title={isCompleted ? 'Mark as incomplete' : 'Complete task'}
          >
            <Check className="w-4 h-4 stroke-[3]" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className={`font-semibold text-sm tracking-tight truncate ${
                isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
              }`}>
                {task.title}
              </h3>

              {/* Priority badge */}
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getPriorityStyle(task.priority)}`}>
                {task.priority || 'medium'}
              </span>

              {/* Category */}
              {task.category && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getCategoryColor(task.category)}`}>
                  {task.category}
                </span>
              )}

              {/* Early finish badge */}
              {task.completedEarly && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-300" /> Finished Early
                </span>
              )}
            </div>

            {task.description && (
              <p className={`text-xs mb-2 line-clamp-2 ${isCompleted ? 'text-slate-500' : 'text-slate-400'}`}>
                {task.description}
              </p>
            )}

            {/* Time schedule & reminder lead tags */}
            <div className="flex items-center gap-3 flex-wrap text-xs text-slate-400 font-mono">
              {task.startTime && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/70 border border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    {formatTime12(task.startTime)} - {formatTime12(endTime)}
                  </span>
                  <span className="text-slate-500">({task.durationMinutes || 30}m)</span>
                </div>
              )}

              {task.reminderLeadMinutes > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950/40 border border-slate-800 text-slate-400 text-[11px]">
                  <Bell className="w-3 h-3 text-amber-400" />
                  <span>{task.reminderLeadMinutes}m reminder</span>
                </div>
              )}

              {isInProgress && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Running Now
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-1 shrink-0">
          {!isCompleted && isToday && (
            <button
              onClick={() => onStartTask(task.id, isInProgress ? 'pending' : 'in_progress')}
              className={`p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                isInProgress
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-600 hover:text-white'
              }`}
              title={isInProgress ? 'Pause Task' : 'Start Task Now'}
            >
              {isInProgress ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          )}

          {!isCompleted && isToday && (
            <button
              onClick={() => onRequestEarlyComplete(task)}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 text-xs transition-all cursor-pointer"
              title="Mark as completed early and shift subsequent schedule or take rest"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Finish Early</span>
            </button>
          )}

          <button
            onClick={() => onEditTask(task)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all cursor-pointer"
            title="Edit Task"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDeleteTask(task.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
            title="Delete Task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
