'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-slate-950 py-6 px-4 md:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">Distribución de Tareas del Hogar</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <span>Desarrollado con Next.js, React, Tailwind & Flask</span>
          <span>•</span>
          <span>Sincronización en Tiempo Real</span>
        </div>
      </div>
    </footer>
  );
}
