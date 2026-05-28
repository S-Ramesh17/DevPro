// src/pages/AdminDashboard.js - Admin overview with analytics and Socket.IO
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAnalytics, getEmployees, getSuggestedEmployees, getAllTasks } from '../services/api';

const AdminDashboard = () => {
  const { user, socket } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveMessage, setLiveMessage] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [analyticsRes, empRes, suggestedRes, tasksRes] = await Promise.all([
        getAnalytics(),
        getEmployees(),
        getSuggestedEmployees(),
        getAllTasks()
      ]);
      setAnalytics(analyticsRes.data);
      setEmployees(empRes.data);
      setSuggested(suggestedRes.data.slice(0, 4)); // Top 4 least busy
      setRecentTasks(tasksRes.data.slice(0, 5)); // Last 5 tasks
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ===== SOCKET.IO: Listen for real-time task updates =====
  useEffect(() => {
    if (!socket) return;

    const handleTaskUpdate = (task) => {
      // Show a live notification banner
      setLiveMessage(`🔄 Task "${task.title}" updated to "${task.status}"`);
      setTimeout(() => setLiveMessage(''), 4000);
      loadData(); // Refresh analytics
    };

    const handleTaskCreated = () => {
      loadData();
    };

    socket.on('task:updated', handleTaskUpdate);
    socket.on('task:created', handleTaskCreated);
    socket.on('task:deleted', loadData);

    return () => {
      socket.off('task:updated', handleTaskUpdate);
      socket.off('task:created', handleTaskCreated);
      socket.off('task:deleted', loadData);
    };
  }, [socket, loadData]);

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
      Loading dashboard...
    </div>
  );

  const completionRate = analytics?.total > 0
    ? Math.round((analytics.completed / analytics.total) * 100)
    : 0;

  return (
    <div>
      {/* Live Socket update banner */}
      {liveMessage && (
        <div className="alert alert-info" style={{ margin: '12px 28px 0', borderRadius: 8 }}>
          🔴 Live: {liveMessage}
        </div>
      )}

      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.name}! Here's your team overview.</p>
      </div>

      {/* ===== STAT WIDGETS ===== */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{analytics?.total || 0}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{analytics?.completed || 0}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{analytics?.inProgress || 0}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon">🚫</div>
          <div className="stat-value">{analytics?.blocked || 0}</div>
          <div className="stat-label">Blocked</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{employees.length}</div>
          <div className="stat-label">Team Members</div>
        </div>
      </div>

      <div className="content-grid two-col">
        {/* ===== COMPLETION PROGRESS ===== */}
        <div className="card">
          <div className="section-header">
            <h2>📊 Team Progress</h2>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{completionRate}% complete</span>
          </div>
          <div className="progress-bar" style={{ height: 10, marginBottom: 16 }}>
            <div
              className="progress-fill green"
              style={{ width: `${completionRate}%` }}
            />
          </div>

          {/* Per-employee performance */}
          {analytics?.empStats?.map(emp => (
            <div key={emp.name} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>{emp.name} <span className={`badge badge-role-${emp.role}`} style={{ fontSize: 10 }}>{emp.role}</span></span>
                <span style={{ color: 'var(--text-muted)' }}>{emp.completed}/{emp.total} tasks</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: emp.total > 0 ? `${Math.round((emp.completed / emp.total) * 100)}%` : '0%' }}
                />
              </div>
            </div>
          ))}

          {(!analytics?.empStats?.length) && (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <p>No employee data yet</p>
            </div>
          )}
        </div>

        {/* ===== WORKLOAD BALANCING (Smart Feature) ===== */}
        <div className="card">
          <div className="section-header">
            <h2>⚖️ Workload Balance</h2>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Smart suggestions</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
            Employees sorted by active task count — assign tasks to the least busy.
          </p>
          {suggested.map((emp, i) => (
            <div key={emp._id} className="employee-card">
              <div
                className="avatar"
                style={{ background: emp.avatarColor || '#2563eb' }}
              >
                {emp.name.charAt(0)}
              </div>
              <div className="employee-info">
                <div className="employee-name">
                  {i === 0 && <span>🟢 </span>}{emp.name}
                </div>
                <div className="employee-email">{emp.email}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`badge badge-role-${emp.role}`}>{emp.role}</span>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {emp.activeTasks} active task{emp.activeTasks !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          ))}
          {!suggested.length && (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <p>No employees found</p>
            </div>
          )}
        </div>

        {/* ===== RECENT TASKS ===== */}
        <div className="card">
          <div className="section-header">
            <h2>🕐 Recent Tasks</h2>
          </div>
          {recentTasks.map(task => (
            <div key={task._id} style={{
              padding: '10px 0',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{task.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {task.projectId?.title}
                </div>
              </div>
              <span className={`badge badge-${task.status}`}>{task.status}</span>
              <span className={`badge badge-${task.priority}`}>{task.priority}</span>
            </div>
          ))}
          {!recentTasks.length && (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <p>No tasks yet. Create one in the Tasks page.</p>
            </div>
          )}
        </div>

        {/* ===== TASK STATUS BREAKDOWN ===== */}
        <div className="card">
          <div className="section-header">
            <h2>📈 Task Breakdown</h2>
          </div>
          {[
            { label: 'Completed', value: analytics?.completed, color: 'var(--success)', bg: 'var(--success-light)' },
            { label: 'In Progress', value: analytics?.inProgress, color: 'var(--primary)', bg: 'var(--primary-light)' },
            { label: 'Pending',    value: analytics?.pending,    color: 'var(--secondary)', bg: '#f1f5f9' },
            { label: 'Blocked',   value: analytics?.blocked,    color: 'var(--danger)', bg: 'var(--danger-light)' },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>{item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{item.value || 0}</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: analytics?.total > 0 ? `${((item.value || 0) / analytics.total) * 100}%` : '0%',
                    background: item.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
