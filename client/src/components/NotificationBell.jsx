import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (notification_id) => {
    try {
      await api.patch(`/notifications/${notification_id}/read`);
      setNotifications(prev =>
        prev.map(n => n.notification_id === notification_id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = () => {
    setOpen(!open);
    if (!open) fetchNotifications(); // refresh when opening
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative text-gray-300 hover:text-white transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 
               6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 
               8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 
               0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white 
                           text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-card border border-border-c 
                        rounded-2xl shadow-xl z-50 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-c">
            <h3 className="text-dark font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-mustard-dark text-xs hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-muted text-sm text-center py-6">
                No notifications
              </p>
            ) : (
              notifications.map(n => (
                <div
                  key={n.notification_id}
                  onClick={() => handleMarkRead(n.notification_id)}
                  className={`px-4 py-3 border-b border-border-c cursor-pointer 
                              hover:bg-cream transition ${!n.is_read ? 'bg-mustard/5' : ''}`}
                >
                  <p className="text-sm text-dark">{n.message}</p>
                  <p className="text-xs text-muted mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                  {!n.is_read && (
                    <span className="inline-block w-2 h-2 bg-mustard rounded-full mt-1" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}