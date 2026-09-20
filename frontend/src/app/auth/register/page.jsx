'use client';

import React, { useState } from 'react';
import { authService } from '../../../services/api';
import { useNotification } from '../../../context/notification';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, User, Mail, Key, Shield } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member');
  const [isChild, setIsChild] = useState(false);
  const [loading, setLoading] = useState(false);

  const { loginUser, showNotification } = useNotification();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      showNotification('Todos los campos son obligatorios.', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.register({
        username,
        email,
        password,
        role,
        is_child: isChild,
      });

      loginUser(data.user, data.access_token);
      showNotification('Registro completado exitosamente.', 'success');
      
      if (data.user.role === 'administrator' || data.user.role === 'contributor') {
        router.push('/board');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      showNotification(
        err.response?.data?.error || 'Error al registrar el usuario.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="glass-panel p-8 rounded-3xl space-y-6 border border-white/10 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[var(--c1)]/20 border border-white/20 mx-auto flex items-center justify-center text-[var(--c1)]">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white">Crear Cuenta</h1>
          <p className="text-xs text-slate-400">Registra un nuevo integrante del hogar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[var(--c1)]" />
              <span>Nombre de Usuario</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej. Carlos"
              className="w-full px-4 py-2.5 rounded-xl bg-transparent border border-white/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[var(--c1)]" />
              <span>Correo Electrónico</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="carlos@casa.com"
              className="w-full px-4 py-2.5 rounded-xl bg-transparent border border-white/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[var(--c1)]" />
              <span>Contraseña</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-transparent border border-white/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[var(--c1)]" />
                <span>Rol en el Hogar</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-transparent border border-white/20 text-white text-xs focus:outline-none focus:border-white/20"
              >
                <option value="member">Miembro</option>
                <option value="contributor">Colaborador</option>
                <option value="administrator">Administrador</option>
              </select>
            </div>

            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-transparent border border-white/20 cursor-pointer hover:bg-transparent transition-colors">
                <input
                  type="checkbox"
                  checked={isChild}
                  onChange={(e) => setIsChild(e.target.checked)}
                  className="rounded border-white/20 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-xs text-slate-200 font-medium">¿Es Menor/Niño?</span>
              </label>
            </div>
          </div>

          {isChild && (
            <p className="text-[11px] text-amber-400/90 bg-amber-950/40 p-2.5 rounded-lg border border-amber-500/20">
              ⚠️ Los usuarios marcados como menores tienen bloqueada la asignación de preparar comidas.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold bg-[var(--c1)]/10 hover:bg-[var(--c1)]/20 border border-[var(--c1)] text-[var(--c1)] backdrop-blur-md transition-all text-sm disabled:opacity-50 mt-2"
          >
            {loading ? 'Registrando...' : 'Registrar Cuenta'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="text-[var(--c1)] hover:underline font-medium">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
