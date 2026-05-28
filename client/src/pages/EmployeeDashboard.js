// src/pages/EmployeeDashboard.js - Dashboard for developers, QA, DevOps roles
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyTasks, getMyProjects } from '../services/api';
import TaskCard from '../components/TaskCard';

const EmployeeDashboard = () => {
  const { user, socket } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveMessage, setLiveMessage] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        getMyTasks(user._id),
        getMyProjects(user._id)
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user._id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ===== SOCKET.IO: Real-time task updates =====
  useEffect(() => {
    if (!socket) return;

    socket.on('task:created', () => {
      setLiveMessage('🆕 A new task was assigned to you!');
      setTimeout(() => setLiveMessage(''), 4000);
      loadData();
    });

    socket.on('task:updated', (task) => {
      setLiveMessage(`🔄 Task "${task.title}" was updated`);
      setTimeout(() => setLiveMessage(''), 4000);
      loadData();
    });

    return () => {
      socket.off('task:created');
      socket.off('task:updated');
    };
  }, [socket, loadData]);

  // Task stats
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const blocked = tasks.filter(t => t.status === 'blocked').length;

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
      Loading your workspace...
    </div>
  );

  return (
    <div>
      {liveMessage && (
        <div className="alert alert-info" style={{ margin: '12px 28px 0' }}>
          🔴 Live: {liveMessage}
        </div>
      )}

      <div className="page-header">
        <h1>My Workspace</h1>
        <p>Welcome, {user?.name}! Here are your assignments.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{tasks.length}</div>
          <div className="stat-label">My Tasks</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon">🚫</div>
          <div className="stat-value">{blocked}</div>
          <div className="stat-label">Blocked</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">📁</div>
          <div className="stat-value">{projects.length}</div>
          <div className="stat-label">My Projects</div>
        </div>
      </div>

      <div className="content-grid two-col">
        {/* My Tasks */}
        <div className="card">
          <div className="section-header">
            <h2>🎯 My Tasks</h2>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pending} pending</span>
          </div>

          {/* Progress */}
          {tasks.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span>Overall progress</span>
                <span>{tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill green"
                  style={{ width: `${tasks.length > 0 ? (completed / tasks.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎉</div>
                <p>No tasks assigned yet. Check back later!</p>
              </div>
            ) : (
              tasks.map(task => (
                <TaskCard key={task._id} task={task} onUpdated={loadData} />
              ))
            )}
          </div>
        </div>

        {/* My Projects */}
        <div className="card">
          <div className="section-header">
            <h2>📁 My Projects</h2>
          </div>
          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <p>You haven't been added to any projects yet.</p>
            </div>
          ) : (
            projects.map(proj => (
              <div key={proj._id} style={{
                padding: '12px 0',
                borderBottom: '1px solid var(--border)'
              }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{proj.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0' }}>{proj.description}</div>
                <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {proj.techStack?.split(',').map(t => (
                    <span key={t} className="tech-tag">{t.trim()}</span>
                  ))}
                </div>
                {proj.deadline && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    📅 Due: {new Date(proj.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
