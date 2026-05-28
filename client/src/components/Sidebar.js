// src/components/Sidebar.js

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotifications } from '../services/api';

const Sidebar = ({
  currentPage,
  onNavigate,
  sidebarOpen,
  setSidebarOpen
}) => {

  const { user, logout } = useAuth();

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      getNotifications(user._id)
        .then((res) => {
          const unread = res.data.filter(
            (n) => !n.read
          ).length;

          setUnreadCount(unread);
        })
        .catch(() => {});
    }
  }, [user]);

  const navItems = [
    {
      id:
        user?.role === 'admin'
          ? 'dashboard'
          : 'my-dashboard',

      label: 'Dashboard',
    },

    {
      id: 'projects',
      label: 'Projects',
    },

    {
      id: 'tasks',
      label: 'Tasks',
    },

    {
      id: 'notifications',
      label: 'Notifications',
      badge: unreadCount,
    },
  ];

  const roleLabel = {
    admin: 'Administrator',
    developer: 'Developer',
    qa: 'QA Tester',
    devops: 'DevOps Engineer',
  }[user?.role] || user?.role;

  return (
    <>

      {/* OVERLAY */}
      <div
        className={`sidebar-overlay ${
          sidebarOpen ? 'active' : ''
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`sidebar ${
          sidebarOpen ? 'sidebar-open' : ''
        }`}
      >

        {/* LOGO */}
        <div className="sidebar-logo">
          <h2>
            DevOps<span>Pro</span>
          </h2>

          <p>Workforce Platform</p>
        </div>

        {/* NAVIGATION */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${
                currentPage === item.id
                  ? 'active'
                  : ''
              }`}
              onClick={() => {

                onNavigate(item.id);

                // CLOSE ON MOBILE
                if (window.innerWidth <= 768) {
                  setSidebarOpen(false);
                }
              }}
            >

              {item.label}

              {item.badge > 0 && (
                <span className="nav-badge">
                  {item.badge}
                </span>
              )}

            </button>
          ))}
        </nav>

        {/* FOOTER */}
        <div className="sidebar-footer">

          <div className="user-info">

            <div
              className="avatar"
              style={{
                background:
                  user?.avatarColor || '#2563eb',
              }}
            >
              {user?.name
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <div className="user-info-text">

              <div className="user-name">
                {user?.name}
              </div>

              <div className="user-role">
                {roleLabel}
              </div>

            </div>

          </div>

          <button
            className="btn-logout"
            onClick={logout}
          >
            🚪 Logout
          </button>

        </div>

      </aside>
    </>
  );
};

export default Sidebar;
