import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  X, 
  History, 
  ChevronRight,
  Copy,
  Clock
} from 'lucide-react';
import { formatDateDisplay, formatTime12, getTodayDateString } from '../utils/helpers';
import { api } from '../utils/api';

export default function HistoryModal({ 
  user, 
  onClose, 
  onSelectDate, 
  onCopyUnfinishedToToday 
}) {
  const [datesSummary, setDatesSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = getTodayDateString();

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await api.getDates(user.id);
        // Exclude today or keep only past dates / all dates
        setDatesSummary(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [user.id]);

  const pastDates = datesSummary.filter(d => d.date < today);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl p-6 sm:p-8 overflow-hidden rounded-2xl glass-panel glass-panel-glow border border-indigo-500/20 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Past Todo Lists & Historical Archive
            </h2>
            <p className="text-xs text-slate-400">
              Browse previous days, track your completion record, and revive pending items.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading historical archives...</span>
          </div>
        ) : pastDates.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">No past archives recorded yet</p>
            <p className="text-slate-500 mt-1">
              Your daily achievements and to-do records will automatically appear here tomorrow.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {pastDates.map((item) => {
              const percent = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;
              return (
                <div 
                  key={item.date}
                  className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">
                        {formatDateDisplay(item.date)}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ({item.date})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>Total: <strong className="text-slate-200">{item.total}</strong></span>
                      <span>•</span>
                      <span className="text-emerald-400">Done: <strong>{item.completed}</strong></span>
                      {item.pending > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400">Unfinished: <strong>{item.pending}</strong></span>
                        </>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {item.pending > 0 && (
                      <button
                        onClick={() => {
                          onCopyUnfinishedToToday(item.date);
                          onClose();
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-indigo-300 hover:text-indigo-200 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
                        title="Copy unfinished tasks to today"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Move to Today</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onSelectDate(item.date);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold border border-indigo-500/30 transition-all cursor-pointer"
                    >
                      <span>View Tasks</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-4 border-t border-slate-800 mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
