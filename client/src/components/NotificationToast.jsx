import React from 'react';
import { Bell, Moon, Zap, CheckCircle2, X, Clock } from 'lucide-react';

export default function NotificationToast({ 
  notification, 
  onClose, 
  onAction 
}) {
  if (!notification) return null;

  const { title, message, type, task, actionLabel } = notification;

  const getIcon = () => {
    switch (type) {
      case 'night_reminder':
        return <Moon className="w-5 h-5 text-purple-400 fill-purple-400/20" />;
      case 'lead_reminder':
        return <Clock className="w-5 h-5 text-amber-400" />;
      case 'start_reminder':
        return <Bell className="w-5 h-5 text-indigo-400 animate-bounce" />;
      case 'early_finish':
        return <Zap className="w-5 h-5 text-emerald-400" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 rounded-2xl glass-panel glass-panel-glow border border-indigo-500/30 shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-white tracking-tight">
            {title}
          </h4>
          <p className="text-[11px] text-slate-300 mt-0.5 leading-normal">
            {message}
          </p>

          {actionLabel && (
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  if (onAction) onAction(notification);
                  onClose();
                }}
                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] shadow-sm transition-all cursor-pointer"
              >
                {actionLabel}
              </button>
              <button
                onClick={onClose}
                className="px-2 py-1 rounded-lg text-slate-400 hover:text-white text-[11px] transition-all cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
