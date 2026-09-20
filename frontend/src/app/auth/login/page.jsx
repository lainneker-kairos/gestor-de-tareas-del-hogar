'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { authService } from '../../../services/api';
import { useNotification } from '../../../context/notification';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Key, User, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const searchParams = useSearchParams();
  const initialUsername = searchParams.get('username') || '';

  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { loginUser, showNotification } = useNotification();
  const router = useRouter();

  useEffect(() => {
    const userParam = searchParams.get('username');
    if (userParam) {
      setUsername(userParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      showNotification('Complete todos los campos.', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login(username, password);
      loginUser(data.user, data.access_token);

      if (data.user.role === 'administrator' || data.user.role === 'contributor') {
        router.push('/board');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      showNotification(
        err.response?.data?.error || 'No se pudo iniciar sesión. Verifique sus credenciales.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-8 rounded-3xl space-y-6 border border-white/10 shadow-2xl">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[var(--c1)]/20 border border-white/20 mx-auto flex items-center justify-center text-[var(--c1)]">
          <LogIn className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-white">Iniciar Sesión</h1>
        <p className="text-xs text-slate-400">
          {username ? `Ingresando como ${username}` : 'Ingrese sus credenciales de usuario'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[var(--c1)]" />
            <span>Usuario o Email</span>
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ej. Lainneker"
            required
            className="w-full px-4 py-2.5 rounded-xl bg-transparent border border-white/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-[var(--c1)]" />
            <span>Contraseña</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-transparent border border-white/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-white/20 transition-colors"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowPassword((prev) => !prev);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors z-10 flex items-center justify-center rounded-md"
              title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold bg-[var(--c1)]/10 hover:bg-[var(--c1)]/20 border border-[var(--c1)] text-[var(--c1)] backdrop-blur-md transition-all text-sm disabled:opacity-50 mt-2"
        >
          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
      </form>

      <div className="text-center text-xs text-slate-400 pt-2">
        ¿No tienes una cuenta aún?{' '}
        <Link href="/auth/register" className="text-[var(--c1)] hover:underline font-medium">
          Regístrate aquí
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto py-12">
      <Suspense fallback={<div className="text-center text-slate-400 text-xs">Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
