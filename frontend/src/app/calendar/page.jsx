'use client';

import React, { useState, useEffect } from 'react';
import { taskService } from '../../services/api';
import { useNotification } from '../../context/notification';
import { Calendar, Download, ExternalLink, Clock, CheckCircle2 } from 'lucide-react';

export default function CalendarPage() {
  const { user, showNotification } = useNotification();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true);
        const data = await taskService.getTasks(user?.role === 'administrator');
        setTasks(data);
      } catch (err) {
        showNotification('Error al cargar las tareas para el calendario.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, [user]);

  const generateGoogleCalendarUrl = (task) => {
    const title = encodeURIComponent(`[Hogar] ${task.title}`);
    const details = encodeURIComponent(
      `Tarea asignada en la app de distribución del hogar.\nDuración estimada: ${task.duration} minutos.\nDía: ${task.day_assigned}\nHora: ${task.time_assigned}`
    );
    
    // Construct Google Calendar Link
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=Casa`;
  };

  const downloadIcsFile = (task) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Distribucion Tareas Hogar//ES
BEGIN:VEVENT
SUMMARY:[Hogar] ${task.title}
DESCRIPTION:Tarea doméstica asignada: ${task.title}. Duracion: ${task.duration} mins.
LOCATION:Casa
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${task.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Archivo .ics de '${task.title}' descargado.`, 'success');
  };

  return (
    <div className="space-y-8 py-4">
      {/* Page Header */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-2">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[var(--c1)]" />
          <span>Integración con Google Calendar</span>
        </h1>
        <p className="text-xs text-slate-400">
          Sincroniza tus tareas domésticas directamente con tu Google Calendar personal o exporta archivos de evento (.ics).
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs glass-card rounded-2xl">
          Cargando eventos...
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs glass-card rounded-2xl border border-white/10">
          No hay tareas programadas para exportar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="glass-card p-5 rounded-2xl border border-white/10 space-y-4 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950 text-[var(--c5)] border border-white/20">
                    {task.day_assigned} • {task.time_assigned}
                  </span>
                  <h3 className="font-bold text-white text-sm">{task.title}</h3>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-[var(--c1)]" />
                  <span>{task.duration} min</span>
                </div>
              </div>

              {task.assigned_to_username && (
                <div className="text-xs text-slate-400">
                  Asignado a: <span className="text-slate-200 font-medium">{task.assigned_to_username}</span>
                </div>
              )}

              <div className="pt-2 border-t border-white/10/80 flex items-center gap-2">
                <a
                  href={generateGoogleCalendarUrl(task)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-[var(--c1)]/30 hover:bg-[var(--c1)] text-indigo-200 hover:text-white border border-white/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Google Calendar</span>
                </a>

                <button
                  onClick={() => downloadIcsFile(task)}
                  title="Descargar evento .ics"
                  className="p-2 rounded-xl bg-transparent hover:bg-transparent text-slate-200 hover:text-white border border-white/20 text-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
