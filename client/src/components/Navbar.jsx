import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Moon, 
  Volume2, 
  VolumeX, 
  LogOut, 
  Sparkles,
  CheckCircle,
  Bell,
  ChevronDown
} from 'lucide-react';
import { formatTime12, isNightTime } from '../utils/helpers';

export default function Navbar({ 
  user, 
  onLogout, 
  onOpenHistory, 
  onOpenNightReview,
  soundEnabled, 
  onToggleSound,
  pendingCount = 0
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userDropdown, setUserDropdown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const nightActive = isNightTime(user?.nightReminderTime || '21:00');

  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-md shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Clock className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                FinishToday
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full uppercase">
                Smart Day Planner
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden md:block">
              {dateString} • {timeString}
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute chimes & reminder audio' : 'Enable chimes & reminder audio'}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Past History / Archive */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Past Archives</span>
          </button>

          {/* Night Reflection Button */}
          <button
            onClick={onOpenNightReview}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              nightActive 
                ? 'bg-gradient-to-r from-indigo-950 to-purple-950 border-purple-500/40 text-purple-200 shadow-sm shadow-purple-500/20 animate-soft-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            <Moon className={`w-4 h-4 ${nightActive ? 'text-amber-300 fill-amber-300/30' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Night Review</span>
            {pendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserDropdown(!userDropdown)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-inner">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-medium text-slate-200 leading-tight truncate max-w-[120px]">
                  {user?.name || 'User'}
                </p>
                <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[120px]">
                  {user?.phone ? `+91 ${user.phone}` : user?.email}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userDropdown && (
              <div 
                className="absolute right-0 mt-2 w-56 p-2 rounded-xl glass-panel border border-slate-700/80 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setUserDropdown(false)}
              >
                <div className="p-2 border-b border-slate-800 mb-1">
                  <p className="text-xs font-semibold text-slate-200">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  <p className="text-[11px] text-indigo-400 font-mono mt-0.5">Phone: {user?.phone}</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Night Reminder: {user?.nightReminderTime || '21:00'} (9:00 PM)
                  </p>
                </div>

                <button
                  onClick={onOpenNightReview}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
                >
                  <Moon className="w-4 h-4 text-purple-400" />
                  <span>Check Night Review</span>
                </button>

                <button
                  onClick={onOpenHistory}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>View Past Todo Lists</span>
                </button>

                <div className="my-1 border-t border-slate-800" />

                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
