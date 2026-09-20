'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, CheckCircle2, Users, Calendar, Sparkles, ArrowRight, LogIn } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden glass-panel p-8 md:p-12 border border-white/10 bg-gradient-to-br from-transparent via-white/5/40 to-transparent">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-[var(--c1)]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[var(--c1)]/10 border border-white/20 text-[var(--c5)]">
            <Sparkles className="w-4 h-4 text-[var(--c1)]" />
            <span>Sistema Inteligente de Gestión Doméstica</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Organiza y distribuye las tareas de tu hogar{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              en tiempo real
            </span>
          </h1>

          <p className="text-slate-200 text-base md:text-lg leading-relaxed">
            Asigna responsabilidades equilibradas, gestiona horarios semanales y mantén a toda la familia en sintonía con controles de seguridad para menores e integración con Google Calendar.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/board"
              className="px-6 py-3 rounded-xl font-semibold bg-[var(--c1)]/10 hover:bg-[var(--c1)]/20 border border-[var(--c1)] text-[var(--c1)] backdrop-blur-md flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>Ir al Tablero General</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl font-semibold glass-card text-slate-200 hover:bg-transparent transition-all border border-white/20 hover:border-slate-600"
            >
              Mi Dashboard Individual
            </Link>
          </div>
        </div>
      </div>

      {/* User Selection Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--c1)]" />
            <span>Selecciona tu Usuario para Iniciar Sesión</span>
          </h2>
          <span className="text-xs text-slate-400">Haz clic en tu usuario para ingresar sus credenciales</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lainneker */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-white/30 transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[var(--c1)]/20 border border-white/20 flex items-center justify-center text-[var(--c1)] font-bold text-xl">
                  👨‍💼
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-950 text-[var(--c5)] border border-white/20">
                  Administrador
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Lainneker</h3>
                <p className="text-xs text-slate-400 mt-1">Adulto • Control Total del Tablero General</p>
              </div>
            </div>

            <Link
              href="/auth/login?username=Lainneker"
              className="w-full py-3 rounded-xl font-semibold bg-[var(--c1)]/10 hover:bg-[var(--c1)]/20 border border-[var(--c1)] text-[var(--c1)] backdrop-blur-md transition-all text-xs flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión como Lainneker</span>
            </Link>
          </div>

          {/* Anyeline */}
          <div className="glass-card p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xl">
                  👩‍💼
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-950 text-purple-300 border border-purple-500/30">
                  Colaborador / Admin
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Anyeline</h3>
                <p className="text-xs text-slate-400 mt-1">Adulto • Asignación e Inspección de Tareas</p>
              </div>
            </div>

            <Link
              href="/auth/login?username=Anyeline"
              className="w-full py-3 rounded-xl font-semibold bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500 text-purple-400 backdrop-blur-md transition-all text-xs flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión como Anyeline</span>
            </Link>
          </div>

          {/* Gabriela */}
          <div className="glass-card p-6 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xl">
                  👧
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-500/30">
                  Miembro (Niña)
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Gabriela</h3>
                <p className="text-xs text-slate-400 mt-1">Menor • Bloqueo de Cocina Activo</p>
              </div>
            </div>

            <Link
              href="/auth/login?username=Gabriela"
              className="w-full py-3 rounded-xl font-semibold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500 text-amber-400 backdrop-blur-md transition-all text-xs flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión como Gabriela</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="glass-card p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--c1)]/10 border border-white/20 flex items-center justify-center text-[var(--c1)]">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-200">Restricciones para Menores</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            El backend bloquea automáticamente la asignación de preparar desayuno, almuerzo o cena a Gabriela o usuarios marcados como niños.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-white/20 flex items-center justify-center text-[var(--c1)]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-200">Sincronización Socket.IO</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Cada cambio en el estado de una tarea o en el tablero se notifica al instante a todos los miembros conectados sin recargar.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-200">Google Calendar & Horarios</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Exporta tus tareas semanales directamente a Google Calendar o descarga el archivo .ics para mantener organizada tu agenda.
          </p>
        </div>
      </div>
    </div>
  );
}


