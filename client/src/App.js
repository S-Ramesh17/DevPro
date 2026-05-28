// src/App.js - Main app entry point with page routing
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ProjectsPage from './pages/ProjectsPage';
import TasksPage from './pages/TasksPage';
import NotificationsPage from './pages/NotificationsPage';
import './styles/App.css';

// Inner app that manages navigation
const AppContent = () => {
  const { user } = useAuth();
  const [page, setPage] = useState('login');

  // Determine which page to show
  const getPage = () => {
    if (!user) return page; // Not logged in: show login/register
    // Logged in: default to their dashboard
    return page === 'login' || page === 'register'
      ? (user.role === 'admin' ? 'dashboard' : 'my-dashboard')
      : page;
  };

  const currentPage = getPage();

  const renderPage = () => {
    if (!user) {
      if (currentPage === 'register') return <RegisterPage onNavigate={setPage} />;
      return <LoginPage onNavigate={setPage} />;
    }

    // Admin pages
    if (user.role === 'admin') {
      switch (currentPage) {
        case 'dashboard': return <AdminDashboard />;
        case 'projects':  return <ProjectsPage />;
        case 'tasks':     return <TasksPage />;
        case 'notifications': return <NotificationsPage />;
        default:          return <AdminDashboard />;
      }
    }

    // Employee pages (developer / qa / devops)
    switch (currentPage) {
      case 'my-dashboard': return <EmployeeDashboard />;
      case 'projects':     return <ProjectsPage />;
      case 'tasks':        return <TasksPage />;
      case 'notifications': return <NotificationsPage />;
      default:             return <EmployeeDashboard />;
    }
  };

  return (
    <div className="app">
      {/* Sidebar only visible when logged in */}
      {user && <Sidebar currentPage={currentPage} onNavigate={setPage} />}
      <main className={user ? 'main-content with-sidebar' : 'main-content'}>
        {renderPage()}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
