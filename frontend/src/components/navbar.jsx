'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNotification } from '../context/notification';
import { LayoutDashboard, Kanban, Calendar, Clock, Home } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useNotification();

  const navItems = [
    { name: 'Inicio', href: '/', icon: Home },
    { name: 'Mi Dashboard', href: '/dashboard', icon: LayoutDashboard },
    {
      name: 'Tablero General',
      href: '/board',
      icon: Kanban,
      adminOnly: true,
    },
    { name: 'Mis Horarios', href: '/auth/helper', icon: Clock },
    { name: 'Calendario', href: '/calendar', icon: Calendar },
  ];

  return (
    <nav className="w-full bg-transparent/60 border-b border-white/10/80 px-4 md:px-8 py-2.5 overflow-x-auto">
      <div className="max-w-7xl mx-auto flex items-center justify-between min-w-max md:min-w-0">
        <div className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            // Hide admin board for standard members unless they are contributors/admins
            if (item.adminOnly && user && user.role === 'member') {
              return null;
            }

            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--c1)]/20 text-[var(--c1)] border border-white/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-transparent/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--c1)]' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
