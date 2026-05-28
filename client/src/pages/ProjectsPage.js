// src/pages/ProjectsPage.js - View and manage projects
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getProjects, getMyProjects, createProject,
  deleteProject, getEmployees
} from '../services/api';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '—';

const ProjectsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // New project form state
  const [form, setForm] = useState({
    title: '', description: '', techStack: '',
    deadline: '', teamMembers: [], userId: user?._id
  });

  const loadProjects = useCallback(async () => {
    try {
      const res = isAdmin
        ? await getProjects()
        : await getMyProjects(user._id);
      setProjects(res.data);
    } catch { showMsg('Failed to load projects', 'error'); }
    finally { setLoading(false); }
  }, [isAdmin, user._id]);

  useEffect(() => {
    loadProjects();
    if (isAdmin) {
      getEmployees().then(r => setEmployees(r.data)).catch(() => {});
    }
  }, [loadProjects, isAdmin]);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const toggleMember = (id) => {
    setForm(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(id)
        ? prev.teamMembers.filter(m => m !== id)
        : [...prev.teamMembers, id]
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createProject(form);
      showMsg('Project created!');
      setShowModal(false);
      setForm({ title: '', description: '', techStack: '', deadline: '', teamMembers: [], userId: user._id });
      loadProjects();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to create project', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await deleteProject(id);
      showMsg('Project deleted');
      loadProjects();
    } catch { showMsg('Failed to delete', 'error'); }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading projects...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 28 }}>
        <div>
          <h1>📁 Projects</h1>
          <p>{isAdmin ? 'Manage all software projects' : 'Your assigned projects'}</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + New Project
          </button>
        )}
      </div>

      <div className="content-grid" style={{ padding: '0 28px 28px' }}>
        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

        {projects.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <p>No projects yet. {isAdmin ? 'Create your first project!' : 'You have no assigned projects.'}</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {projects.map(proj => (
              <div key={proj._id} className="project-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3>{proj.title}</h3>
                  <span className={`badge badge-${proj.status === 'active' ? 'in-progress' : proj.status === 'completed' ? 'completed' : 'blocked'}`}>
                    {proj.status}
                  </span>
                </div>
                <p className="project-desc">{proj.description}</p>

                {/* Tech stack tags */}
                <div style={{ marginBottom: 10 }}>
                  {proj.techStack?.split(',').map(t => (
                    <span key={t} className="tech-tag">{t.trim()}</span>
                  ))}
                </div>

                {/* Team member avatars */}
                {proj.teamMembers?.length > 0 && (
                  <div className="member-avatars" style={{ marginBottom: 10 }}>
                    {proj.teamMembers.slice(0, 5).map(m => (
                      <div
                        key={m._id}
                        className="member-avatar"
                        style={{ background: m.avatarColor || '#2563eb' }}
                        title={m.name}
                      >
                        {m.name?.charAt(0)}
                      </div>
                    ))}
                    {proj.teamMembers.length > 5 && (
                      <div className="member-avatar" style={{ background: '#64748b' }}>
                        +{proj.teamMembers.length - 5}
                      </div>
                    )}
                  </div>
                )}

                <div className="project-footer">
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    📅 {fmtDate(proj.deadline)}
                  </span>
                  {isAdmin && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(proj._id)}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== CREATE PROJECT MODAL ===== */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Project</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Title *</label>
                <input
                  placeholder="e.g. CI/CD Dashboard"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="What does this project do?"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Tech Stack (comma separated)</label>
                <input
                  placeholder="React, Node.js, MongoDB, Docker"
                  value={form.techStack}
                  onChange={e => setForm({ ...form, techStack: e.target.value })}
                />
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
                <label>Team Members</label>
                <div className="multi-select">
                  {employees.map(emp => (
                    <div
                      key={emp._id}
                      className={`multi-option ${form.teamMembers.includes(emp._id) ? 'selected' : ''}`}
                      onClick={() => toggleMember(emp._id)}
                    >
                      <span
                        className="avatar"
                        style={{ width: 18, height: 18, fontSize: 9, background: emp.avatarColor }}
                      >{emp.name.charAt(0)}</span>
                      {emp.name} ({emp.role})
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
