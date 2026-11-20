import React, { useRef, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Info, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';

export const NotificationsDrawer: React.FC = () => {
  const {
    notifications,
    notificationsDrawerOpen,
    setNotificationsDrawerOpen,
    markNotificationRead,
    clearNotifications,
  } = useUIStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setNotificationsDrawerOpen(false);
      }
    };
    if (notificationsDrawerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsDrawerOpen, setNotificationsDrawerOpen]);

  return (
    <div className="relative" ref={drawerRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setNotificationsDrawerOpen(!notificationsDrawerOpen)}
        className="relative p-2 rounded-sm-card text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Popover */}
      {notificationsDrawerOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface/95 backdrop-blur-xl border border-border rounded-card shadow-elevated z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-secondary/40">
            <div className="flex items-center gap-2">
              <span className="font-heading font-semibold text-sm text-text-primary">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono bg-primary/20 text-primary-light px-2 py-0.5 rounded-pill">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearNotifications}
                title="Mark all as read"
                className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
              <button
                onClick={() => setNotificationsDrawerOpen(false)}
                className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification Items */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-text-muted text-xs">
                No notifications right now
              </div>
            ) : (
              notifications.map((item) => {
                return (
                  <div
                    key={item.id}
                    onClick={() => markNotificationRead(item.id)}
                    className={`p-3.5 flex gap-3 transition-colors cursor-pointer hover:bg-surface-secondary/50 ${
                      !item.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {item.type === 'success' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                      {item.type === 'warning' && (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                      {item.type === 'info' && <Info className="w-4 h-4 text-sky-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="font-heading font-medium text-xs text-text-primary truncate">
                          {item.title}
                        </h5>
                        <span className="text-[10px] font-mono text-text-muted shrink-0 ml-2">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
