// src/context/AuthContext.js - Global auth + Socket.IO connection
import React, { createContext, useState, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';

const AuthContext = createContext();

// Socket server URL
const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  // Load saved user from localStorage (persists on page refresh)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('devops_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Socket.IO instance stored in state
  const [socket, setSocket] = useState(null);

  // ===== SOCKET.IO SETUP =====
  // When user logs in, connect to socket and join their personal room
  useEffect(() => {
    if (user) {
      // Connect to the socket server
      const newSocket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
      setSocket(newSocket);

      // Tell server which user this is (join their room for targeted notifications)
      newSocket.emit('join', user._id);

      // Cleanup: disconnect socket on logout or unmount
      return () => newSocket.disconnect();
    }
  }, [user?._id]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('devops_user', JSON.stringify(userData));
  };

  const logout = () => {
    if (socket) socket.disconnect();
    setSocket(null);
    setUser(null);
    localStorage.removeItem('devops_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, socket }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => useContext(AuthContext);
