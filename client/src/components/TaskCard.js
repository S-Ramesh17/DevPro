// src/components/TaskCard.js - Displays a single task with status controls
import React from 'react';
import { updateTask } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Format date nicely
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric'
}) : '—';

const TaskCard = ({ task, onUpdated, onDeleted }) => {
  const { user } = useAuth();

  const handleStatusChange = async (e) => {
    try {
      await updateTask(task._id, { status: e.target.value });
      if (onUpdated) onUpdated();
    } catch {
      alert('Failed to update task');
    }
  };

  // Alert classes for overdue/urgent
  const alertClass = task.alertType === 'overdue' ? 'overdue'
    : task.alertType === 'urgent' ? 'urgent' : '';

  return (
    <div className={`task-card ${alertClass}`}>
      <div className="task-header">
        <div>
          <div className="task-title">{task.title}</div>
          {task.projectId && (
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>
              📁 {task.projectId.title}
            </div>
          )}
        </div>
        {/* Admin can delete */}
        {user?.role === 'admin' && onDeleted && (
          <button
            className="btn btn-sm"
            style={{ color: 'var(--danger)', background: 'none', padding: '2px' }}
            onClick={() => onDeleted(task._id)}
          >
            🗑
          </button>
        )}
      </div>

      {task.description && (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 8 }}>
          {task.description}
        </p>
      )}

      {/* Badges row */}
      <div className="task-meta">
        <span className={`badge badge-${task.status}`}>{task.status}</span>
        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
        {task.alertType && (
          <span className={`badge badge-${task.alertType}`}>
            {task.alertType === 'overdue' ? '🚨 Overdue' : '⚠️ Urgent'}
          </span>
        )}
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          📅 {fmtDate(task.deadline)}
        </span>
      </div>

      {/* Assigned members */}
      {task.assignedTo?.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {task.assignedTo.map(u => (
            <span key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span
                className="avatar"
                style={{
                  width: 22, height: 22, fontSize: 10,
                  background: u.avatarColor || '#2563eb'
                }}
              >
                {u.name?.charAt(0)}
              </span>
              <span style={{ fontSize: 12 }}>{u.name}</span>
            </span>
          ))}
        </div>
      )}

      {/* Status selector — employees and admin can change */}
      <div style={{ marginTop: 10 }}>
        <select
          value={task.status}
          onChange={handleStatusChange}
          style={{
            fontSize: 12, padding: '4px 8px',
            border: '1px solid var(--border)', borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>
    </div>
  );
};

export default TaskCard;
