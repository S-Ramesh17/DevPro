// src/App.js - Main app entry point with page routing
import React, { useState } from 'react';
import './styles/App.css';

import Sidebar from './components/Sidebar';

import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ProjectsPage from './pages/ProjectsPage';
import TasksPage from './pages/TasksPage';
import NotificationsPage from './pages/NotificationsPage';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import { useAuth } from './context/AuthContext';

function App() {

  const { user } = useAuth();

  const [showRegister, setShowRegister] = useState(false);

  const [currentPage, setCurrentPage] = useState(
    user?.role === 'admin'
      ? 'dashboard'
      : 'my-dashboard'
  );

  // ===== MOBILE SIDEBAR =====
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ===== LOGIN / REGISTER =====
  if (!user) {
    return showRegister ? (
      <RegisterPage
        onBack={() => setShowRegister(false)}
      />
    ) : (
      <LoginPage
        onRegister={() => setShowRegister(true)}
      />
    );
  }

  // ===== PAGE RENDER =====
  const renderPage = () => {

    switch (currentPage) {

      case 'dashboard':
        return <AdminDashboard />;

      case 'my-dashboard':
        return <EmployeeDashboard />;

      case 'projects':
        return <ProjectsPage />;

      case 'tasks':
        return <TasksPage />;

      case 'notifications':
        return <NotificationsPage />;

      default:
        return user?.role === 'admin'
          ? <AdminDashboard />
          : <EmployeeDashboard />;
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
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          setSidebarOpen(false);
        }}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* ===== MAIN CONTENT ===== */}
      <div className="main-content with-sidebar">

        {/* ===== MOBILE TOPBAR ===== */}
        <div className="mobile-topbar">

          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          <h2>DevPro</h2>

        </div>

        {/* ===== PAGE CONTENT ===== */}
        {renderPage()}

      </div>

    </div>
  );
}

export default App;
