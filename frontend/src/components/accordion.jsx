'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function Accordion({ title, count, defaultOpen = true, children, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-white/10 bg-transparent/60 overflow-hidden mb-4 transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left bg-transparent/40 hover:bg-transparent/70 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-[var(--c1)]" />}
          <h3 className="font-semibold text-slate-200 text-sm md:text-base">{title}</h3>
          {count !== undefined && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950 text-[var(--c5)] border border-white/20">
              {count}
            </span>
          )}
        </div>
        <div className="text-slate-400">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {isOpen && <div className="p-5 border-t border-white/10/60">{children}</div>}
    </div>
  );
}
