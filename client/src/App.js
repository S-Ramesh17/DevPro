// src/App.js - Main app entry point with responsive mobile sidebar

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

  // ===== MOBILE SIDEBAR =====
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Determine which page to show
  const getPage = () => {

    if (!user) return page;

    return page === 'login' || page === 'register'
      ? (user.role === 'admin'
          ? 'dashboard'
          : 'my-dashboard')
      : page;
  };

  const currentPage = getPage();

  const renderPage = () => {

    if (!user) {

      if (currentPage === 'register') {
        return <RegisterPage onNavigate={setPage} />;
      }

      return <LoginPage onNavigate={setPage} />;
    }

    // ===== ADMIN PAGES =====
    if (user.role === 'admin') {

      switch (currentPage) {

        case 'dashboard':
          return <AdminDashboard />;

        case 'projects':
          return <ProjectsPage />;

        case 'tasks':
          return <TasksPage />;

        case 'notifications':
          return <NotificationsPage />;

        default:
          return <AdminDashboard />;
      }
    }

    // ===== EMPLOYEE PAGES =====
    switch (currentPage) {

      case 'my-dashboard':
        return <EmployeeDashboard />;

      case 'projects':
        return <ProjectsPage />;

      case 'tasks':
        return <TasksPage />;

      case 'notifications':
        return <NotificationsPage />;

      default:
        return <EmployeeDashboard />;
    }
  };

  return (

    <div className="app">

      {/* ===== MOBILE OVERLAY ===== */}
      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      {user && (
        <Sidebar
          currentPage={currentPage}
          onNavigate={(newPage) => {
            setPage(newPage);
            setSidebarOpen(false);
          }}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      )}

      {/* ===== MAIN CONTENT ===== */}
      <main
        className={
          user
            ? 'main-content with-sidebar'
            : 'main-content'
        }
      >

        {/* ===== MOBILE TOPBAR ===== */}
        {user && (
          <div className="mobile-topbar">

            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>

            <h2>DevPro</h2>

          </div>
        )}

        {/* ===== PAGE CONTENT ===== */}
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
