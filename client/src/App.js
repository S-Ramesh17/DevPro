// src/App.js

import React, { useState } from 'react';

import {
  AuthProvider,
  useAuth
} from './context/AuthContext';

import Sidebar from './components/Sidebar';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

import ProjectsPage from './pages/ProjectsPage';
import TasksPage from './pages/TasksPage';
import NotificationsPage from './pages/NotificationsPage';

import './styles/App.css';

const AppContent = () => {

  const { user } = useAuth();

  const [page, setPage] = useState('login');

  // MOBILE SIDEBAR
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  // CURRENT PAGE
  const getPage = () => {

    if (!user) return page;

    return (
      page === 'login' ||
      page === 'register'
    )
      ? (
          user.role === 'admin'
            ? 'dashboard'
            : 'my-dashboard'
        )
      : page;
  };

  const currentPage = getPage();

  // NAVIGATION
  const handleNavigate = (newPage) => {

    setPage(newPage);

    // AUTO CLOSE MOBILE SIDEBAR
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  // PAGE RENDERER
  const renderPage = () => {

    // AUTH PAGES
    if (!user) {

      if (currentPage === 'register') {
        return (
          <RegisterPage
            onNavigate={setPage}
          />
        );
      }

      return (
        <LoginPage
          onNavigate={setPage}
        />
      );
    }

    // ADMIN PAGES
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

    // EMPLOYEE PAGES
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

      {/* ===== HAMBURGER BUTTON ===== */}

      {user && (
        <button
          className="hamburger-btn"
          onClick={() =>
            setSidebarOpen(true)
          }
        >
          ☰
        </button>
      )}

      {/* ===== SIDEBAR ===== */}

      {user && (
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
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
