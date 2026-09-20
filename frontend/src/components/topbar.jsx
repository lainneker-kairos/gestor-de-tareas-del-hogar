'use client';

import React, { useState } from 'react';
import { useNotification } from '../context/notification';
import { Shield, User, Wifi, WifiOff, LogOut, Camera, Key, Megaphone } from 'lucide-react';
import Link from 'next/link';
import ProfileModal from './profileModal';
import { socket } from '../utils/socket';
import { settingsService } from '../services/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Topbar() {
  const { user, logoutUser, isConnected } = useNotification();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState('¡Bienvenido al sistema de tareas! Que tengas un excelente día.');

  React.useEffect(() => {
    const fetchMessage = async () => {
      try {
        const res = await settingsService.getMotivationalMessage();
        setMotivationalMessage(res.message);
      } catch (err) {
        console.error('Error fetching motivational message', err);
      }
    };
    fetchMessage();

    const handleNewMessage = (data) => {
      if (data && data.message) {
        setMotivationalMessage(data.message);
      }
    };

    socket.on('new_motivational_message', handleNewMessage);
    return () => {
      socket.off('new_motivational_message', handleNewMessage);
    };
  }, []);

  const userAvatar = user?.avatar_url;
  const isCustomImage = userAvatar && (userAvatar.startsWith('/api/') || userAvatar.startsWith('http'));

  return (
    <>
      <header className="h-16 border-b border-white/10 bg-transparent/80 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-[var(--c1)] font-bold text-lg tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-[var(--c1)]/30 border border-white/30 flex items-center justify-center">
              🏠
            </div>
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent hidden sm:inline">
              Distribución Hogar
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Connection Status Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium glass-card">
            {isConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-[var(--c1)] animate-pulse" />
                <span className="text-[var(--c1)]">En Vivo</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">Desconectado</span>
              </>
            )}
          </div>

          {/* User profile & actions */}
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                title="Configuración de Perfil"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-transparent/80 border border-white/20 hover:border-white/20/50 hover:bg-transparent transition-all text-left group"
              >
                <div className="w-6 h-6 rounded-full bg-[var(--c1)]/30 border border-white/30 flex items-center justify-center overflow-hidden shrink-0 text-xs">
                  {isCustomImage ? (
                    <img src={`${API_BASE_URL}${userAvatar}`} alt={user.username} className="w-full h-full object-cover" />
                  ) : userAvatar ? (
                    <span>{userAvatar}</span>
                  ) : (
                    <User className="w-3.5 h-3.5 text-[var(--c1)]" />
                  )}
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-slate-200 block leading-tight group-hover:text-[var(--c5)] transition-colors">
                    {user.username}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                    {user.role === 'administrator' && <Shield className="w-2.5 h-2.5 text-[var(--c1)]" />}
                    {user.role} {user.is_child && '(Niño)'}
                  </span>
                </div>
              </button>

              <button
                onClick={() => setIsProfileModalOpen(true)}
                title="Editar Perfil y Contraseña"
                className="p-2 rounded-lg text-slate-400 hover:text-[var(--c1)] hover:bg-indigo-950/30 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>

              <button
                onClick={logoutUser}
                title="Cerrar Sesión"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/register"
                className="px-3.5 py-1.5 text-xs font-medium bg-[var(--c1)]/10 hover:bg-[var(--c1)]/20 border border-[var(--c1)] text-[var(--c1)] backdrop-blur-md rounded-lg transition-colors "
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Motivational Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-medium text-xs py-2 px-4 overflow-hidden flex items-center shadow-lg border-b border-white/10">
        <Megaphone className="w-4 h-4 mr-3 shrink-0 text-amber-300" />
        <div className="flex-1 overflow-hidden whitespace-nowrap">
          <div className="inline-block animate-[marquee_20s_linear_infinite]">
            {motivationalMessage}
          </div>
        </div>
      </div>

      {/* Profile & Security Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
}

