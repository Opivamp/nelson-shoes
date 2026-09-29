import React, { useState } from 'react';
import { Bell, Check, Sparkles, Package, ExternalLink, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { INITIAL_NOTIFICATIONS, type AtelierNotification } from '../../data/notifications';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<AtelierNotification[]>(INITIAL_NOTIFICATIONS);

  if (!isOpen) return null;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markSingleAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div 
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#121212] border border-[#B89B5E]/30 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn font-sans"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-4 border-b border-[#D8CBB8]/15 flex items-center justify-between bg-[#161616]">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-[#B89B5E]" />
          <h3 className="font-serif text-sm text-[#F5F1E8] font-medium">Atelier Updates</h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-[#B89B5E] text-[#0A0A0A] text-[10px] font-mono font-bold">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[11px] text-[#B89B5E] hover:underline font-mono"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-[#D8CBB8]/60 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-[#D8CBB8]/10 no-scrollbar">
        {notifications.map((notif) => (
          <Link
            key={notif.id}
            to={notif.link || '#'}
            onClick={() => {
              markSingleAsRead(notif.id);
              onClose();
            }}
            className={`block p-3.5 transition-colors hover:bg-[#1A1A1A] ${
              !notif.read ? 'bg-[#B89B5E]/5' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded border ${
                notif.type === 'drop'
                  ? 'border-[#B89B5E]/40 text-[#B89B5E] bg-[#B89B5E]/10'
                  : notif.type === 'workbench'
                    ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30'
                    : 'border-blue-500/40 text-blue-400 bg-blue-950/30'
              }`}>
                {notif.badge || 'Atelier'}
              </span>
              <span className="text-[10px] font-mono text-[#D8CBB8]/40">{notif.time}</span>
            </div>

            <h4 className="text-xs font-medium text-[#F5F1E8] mt-1 line-clamp-1">
              {notif.title}
            </h4>

            <p className="text-[11px] text-[#D8CBB8]/70 mt-0.5 line-clamp-2 leading-relaxed">
              {notif.message}
            </p>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-[#0E0E0E] border-t border-[#D8CBB8]/10 text-center">
        <Link
          to="/track"
          onClick={onClose}
          className="text-[11px] font-mono text-[#B89B5E] hover:underline"
        >
          Check Client Workbench Log →
        </Link>
      </div>
    </div>
  );
};
