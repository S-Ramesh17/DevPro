// src/pages/NotificationsPage.js - Real-time notifications
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';

// Icons per notification type
const typeIcon = {
  task_assigned: '📌',
  task_completed: '✅',
  deadline_alert: '⚠️',
  project_update: '📁'
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const NotificationsPage = () => {
  const { user, socket } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await getNotifications(user._id);
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user._id]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Listen for real-time notifications via Socket.IO
  useEffect(() => {
    if (!socket) return;
    // Any task event might generate new notifications
    socket.on('task:created', loadNotifications);
    socket.on('task:updated', loadNotifications);
    return () => {
      socket.off('task:created', loadNotifications);
      socket.off('task:updated', loadNotifications);
    };
  }, [socket, loadNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead(user._id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const unread = notifications.filter(n => !n.read).length;

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading notifications...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 28 }}>
        <div>
          <h1>🔔 Notifications</h1>
          <p>{unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}</p>
        </div>
        {unread > 0 && (
          <button className="btn btn-outline" onClick={handleMarkAllRead}>
            ✓ Mark all as read
          </button>
        )}
      </div>

      <div style={{ padding: '0 28px 28px' }}>
        <div className="card">
          {notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <p>No notifications yet. They will appear here when tasks are assigned or updated.</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif._id}
                className={`notif-item ${!notif.read ? 'unread' : ''}`}
                onClick={() => !notif.read && handleMarkRead(notif._id)}
                style={{ cursor: notif.read ? 'default' : 'pointer' }}
              >
                <div className="notif-icon">{typeIcon[notif.type] || '🔔'}</div>
                <div className="notif-content">
                  <div className="notif-msg">{notif.message}</div>
                  <div className="notif-time">{timeAgo(notif.createdAt)}</div>
                </div>
                {!notif.read && (
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--primary)', flexShrink: 0, marginTop: 6
                  }} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
