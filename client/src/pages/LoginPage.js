// src/pages/LoginPage.js - Login form
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/api';

const LoginPage = ({ onNavigate }) => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginApi(form);
      login(res.data); // Save user to context + localStorage
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Quick demo login
  const demoLogin = (email) => {
    setForm({ email, password: '1234' });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>Dev<span>Pro</span></h1>
          <p>Workforce Automation Platform</p>
        </div>

        <h2>Sign In</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="admin@test.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo account quick-fill buttons */}
        <div style={{ marginTop: 20, padding: 14, background: '#f8fafc', borderRadius: 8 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>
            DEMO ACCOUNTS (password: 1234)
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[
              { label: 'Admin', email: 'admin@test.com' },
              { label: 'Developer', email: 'dev@test.com' },
              { label: 'QA', email: 'qa@test.com' },
              { label: 'DevOps', email: 'devops@test.com' },
            ].map(acc => (
              <button
                key={acc.email}
                className="btn btn-outline btn-sm"
                type="button"
                onClick={() => demoLogin(acc.email)}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        <div className="auth-link">
          New employee?{' '}
          <button onClick={() => onNavigate('register')}>Register here</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
