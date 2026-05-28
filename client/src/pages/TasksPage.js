// src/pages/TasksPage.js - Full task management with smart assignment suggestions
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAllTasks, getMyTasks, createTask, deleteTask,
  getProjects, getMyProjects, getSuggestedEmployees, getEmployees
} from '../services/api';
import TaskCard from '../components/TaskCard';

const TasksPage = () => {
  const { user, socket } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all | pending | in-progress | completed | blocked
  const [msg, setMsg] = useState({ text: '', type: '' });

  const [form, setForm] = useState({
    title: '', description: '', projectId: '',
    assignedTo: [], deadline: '', priority: 'medium', createdBy: user?._id
  });

  const loadData = useCallback(async () => {
    try {
      const tasksRes = isAdmin
        ? await getAllTasks()
        : await getMyTasks(user._id);
      setTasks(tasksRes.data);

      const projRes = isAdmin ? await getProjects() : await getMyProjects(user._id);
      setProjects(projRes.data);

      if (isAdmin) {
        const [empRes, sugRes] = await Promise.all([getEmployees(), getSuggestedEmployees()]);
        setEmployees(empRes.data);
        setSuggested(sugRes.data.slice(0, 3));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, user._id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time updates via Socket.IO
  useEffect(() => {
    if (!socket) return;
    socket.on('task:created', loadData);
    socket.on('task:updated', loadData);
    socket.on('task:deleted', loadData);
    return () => {
      socket.off('task:created', loadData);
      socket.off('task:updated', loadData);
      socket.off('task:deleted', loadData);
    };
  }, [socket, loadData]);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const toggleAssignee = (id) => {
    setForm(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(id)
        ? prev.assignedTo.filter(x => x !== id)
        : [...prev.assignedTo, id]
    }));
  };

  // Auto-suggest least busy employee for selected project role
  const handleSuggest = (emp) => {
    if (!form.assignedTo.includes(emp._id)) {
      setForm(prev => ({ ...prev, assignedTo: [...prev.assignedTo, emp._id] }));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.projectId) return showMsg('Please select a project', 'error');
    try {
      await createTask(form);
      showMsg('Task created and team notified!');
      setShowModal(false);
      setForm({ title: '', description: '', projectId: '', assignedTo: [], deadline: '', priority: 'medium', createdBy: user._id });
      loadData();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to create task', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      showMsg('Task deleted');
      loadData();
    } catch { showMsg('Failed to delete', 'error'); }
  };

  // Filter tasks by status
  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading tasks...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 28 }}>
        <div>
          <h1>✅ Tasks</h1>
          <p>{isAdmin ? 'Manage and assign team tasks' : 'Your assigned work items'}</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + New Task
          </button>
        )}
      </div>

      <div style={{ padding: '0 28px' }}>
        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        {/* Smart Suggestions (admin only) */}
        {isAdmin && suggested.length > 0 && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="section-header">
              <h2>🤖 Smart Assignment Suggestions</h2>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Least busy employees</span>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {suggested.map((emp, i) => (
                <div key={emp._id} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px',
                  background: i === 0 ? 'var(--success-light)' : 'var(--bg)',
                  borderRadius: 8, border: '1px solid var(--border)'
                }}>
                  <div className="avatar" style={{ width: 28, height: 28, fontSize: 12, background: emp.avatarColor }}>
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{emp.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp.activeTasks} active tasks</div>
                  </div>
                  <span className={`badge badge-role-${emp.role}`}>{emp.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="tabs">
          {['all', 'pending', 'in-progress', 'completed', 'blocked'].map(f => (
            <button
              key={f}
              className={`tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? `All (${tasks.length})` : `${f} (${tasks.filter(t => t.status === f).length})`}
            </button>
          ))}
        </div>

        {/* Tasks grid */}
        {filtered.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <p>No tasks {filter !== 'all' ? `with status "${filter}"` : 'found'}.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12, paddingBottom: 28 }}>
            {filtered.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                onUpdated={loadData}
                onDeleted={isAdmin ? handleDelete : null}
              />
            ))}
          </div>
        )}
      </div>

      {/* ===== CREATE TASK MODAL ===== */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Task</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            {/* Smart suggestion hint */}
            {suggested.length > 0 && (
              <div style={{ background: 'var(--success-light)', borderRadius: 8, padding: '8px 12px', marginBottom: 14 }}>
                <strong style={{ fontSize: 12 }}>💡 Suggested:</strong>
                {suggested.slice(0, 2).map(emp => (
                  <button
                    key={emp._id}
                    type="button"
                    className="btn btn-sm btn-outline"
                    style={{ marginLeft: 8 }}
                    onClick={() => handleSuggest(emp)}
                  >
                    + {emp.name} ({emp.activeTasks} tasks)
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  placeholder="e.g. Set up CI/CD pipeline"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="What needs to be done?"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Project *</label>
                  <select
                    value={form.projectId}
                    onChange={e => setForm({ ...form, projectId: e.target.value })}
                    required
                  >
                    <option value="">Select project...</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🟠 High</option>
                    <option value="critical">🔴 Critical</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Assign To (select multiple)</label>
                <div className="multi-select">
                  {employees.map(emp => (
                    <div
                      key={emp._id}
                      className={`multi-option ${form.assignedTo.includes(emp._id) ? 'selected' : ''}`}
                      onClick={() => toggleAssignee(emp._id)}
                    >
                      <span className="avatar" style={{ width: 18, height: 18, fontSize: 9, background: emp.avatarColor }}>
                        {emp.name.charAt(0)}
                      </span>
                      {emp.name}
                      <span className={`badge badge-role-${emp.role}`} style={{ fontSize: 9 }}>{emp.role}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create & Notify Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
