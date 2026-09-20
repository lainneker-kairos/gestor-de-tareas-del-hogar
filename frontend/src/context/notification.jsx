'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { socket, initSocket } from '../utils/socket';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [toast, setToast] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Cargar sesión persistida
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse stored user", e);
        }
      }
    }

    // Conectar socket y registrar listeners
    initSocket();
    setIsConnected(socket.connected);

    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const showNotification = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loginUser = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    showNotification(`¡Bienvenido de nuevo, ${userData.username}!`, 'success');
  };

  const updateUser = (updatedUserData) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedUserData };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showNotification('Has cerrado sesión.', 'info');
  };

  return (
    <NotificationContext.Provider
      value={{
        user,
        token,
        loginUser,
        logoutUser,
        updateUser,
        showNotification,
        isConnected,
      }}
    >
      {children}

      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 transition-all duration-300 transform translate-y-0">
          <div
            className={`px-5 py-3.5 rounded-xl shadow-2xl backdrop-blur-md border flex items-center gap-3 text-sm font-medium ${toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200 shadow-rose-950/50'
                : toast.type === 'success'
                  ? 'bg-[var(--c5)]/20/90 border-white/20/50 text-emerald-200 shadow-emerald-950/50'
                  : 'bg-transparent/90 border-white/20/50 text-white shadow-indigo-950/50'
              }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);