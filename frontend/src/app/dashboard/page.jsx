'use client';

import React, { useState, useEffect } from 'react';
import { taskService } from '../../services/api';
import { useNotification } from '../../context/notification';
import { subscribeToTaskEvents } from '../../utils/socket';
import { CheckSquare, Square, Clock, CheckCircle2, AlertCircle, Sparkles, Filter } from 'lucide-react';

export default function UserDashboardPage() {
  const { user, showNotification } = useNotification();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDay, setFilterDay] = useState('Todos');
  const [flashingTaskId, setFlashingTaskId] = useState(null);

  const loadUserTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getTasks(false); // only tasks for logged in user
      setTasks(data);
    } catch (err) {
      showNotification('Error al cargar sus tareas asignadas.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserTasks();
    }

    const unsubscribe = subscribeToTaskEvents(
      () => loadUserTasks(),
      () => loadUserTasks(),
      () => loadUserTasks()
    );

    return () => unsubscribe();
  }, [user]);

  const handleToggleTask = async (taskId) => {
    try {
      const taskToToggle = tasks.find((t) => t.id === taskId);
      if (taskToToggle && taskToToggle.status !== 'completed') {
        setFlashingTaskId(taskId);
        setTimeout(() => setFlashingTaskId(null), 600);
      }

      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
            : t
        )
      );

      await taskService.toggleTask(taskId);
      showNotification('Estado de la tarea actualizado.', 'success');
    } catch (err) {
      showNotification('No se pudo actualizar el estado de la tarea.', 'error');
      loadUserTasks();
    }
  };

  const filteredTasks = filterDay === 'Todos' ? tasks : tasks.filter((t) => t.day_assigned === filterDay);
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalDuration = tasks.reduce((sum, t) => sum + (t.duration || 0), 0);

  // Weekly Summary Calculation
  const isCurrentWeek = (dateStr) => {
    if (!dateStr) return true; // fallback for old tasks
    const taskDate = new Date(dateStr + 'T12:00:00');
    const now = new Date();
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);
    
    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);
    
    return taskDate >= monday && taskDate < nextMonday;
  };

  const weeklyTasks = tasks.filter(t => isCurrentWeek(t.date_assigned));
  const weeklyAssigned = weeklyTasks.length;
  const weeklyCompleted = weeklyTasks.filter((t) => t.status === 'completed').length;
  const weeklyProgressPercent = weeklyAssigned > 0 ? Math.round((weeklyCompleted / weeklyAssigned) * 100) : 0;

  return (
    <div className="space-y-8 py-4">
      {/* Header Banner */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-[var(--c1)]/30 via-purple-500/30 to-[var(--c5)]/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--c1)]/10 text-[var(--c5)] border border-white/20">
              Panel Individual
            </span>
            {user?.is_child && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                👧 Usuario Menor
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Hola, {user ? user.username : 'Integrante'} 👋
          </h1>
          <p className="text-xs md:text-sm text-slate-200">
            Aquí están tus tareas asignadas. Marca la casilla al completarlas.
          </p>
        </div>

        {/* Weekly Progress Card */}
        <div className="glass-card p-4 rounded-2xl border border-white/20 min-w-[240px] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Resumen Semanal</span>
            <span className="font-bold text-[var(--c1)]">{weeklyProgressPercent}%</span>
          </div>

          <div className="w-full h-2.5 bg-transparent rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--c1)] to-[var(--c5)] transition-all duration-500"
              style={{ width: `${weeklyProgressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>{weeklyCompleted} de {weeklyAssigned} completadas esta semana</span>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-4 overflow-x-auto py-1">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-200">Filtrar por día:</span>
          {['Todos', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => (
            <button
              key={day}
              onClick={() => setFilterDay(day)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filterDay === day
                  ? 'bg-[var(--c1)]/10 border border-[var(--c1)] text-[var(--c1)] backdrop-blur-md'
                  : 'bg-transparent border border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Task Checklist */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs glass-card rounded-2xl">
          Cargando tus tareas asignadas...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs glass-card rounded-3xl border border-white/10 space-y-3">
          <Sparkles className="w-8 h-8 text-[var(--c1)] mx-auto" />
          <h3 className="font-bold text-slate-200 text-sm">¡No tienes tareas pendientes para este filtro!</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            Disfruta tu tiempo libre o revisa si el Administrador te ha asignado nuevas actividades en el Tablero General.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => {
            const isDone = task.status === 'completed';

            return (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className={`glass-card p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 select-none ${
                  isDone
                    ? 'border-white/20 bg-[var(--c5)]/20/10 opacity-75'
                    : 'border-white/10 hover:border-white/30 hover:bg-transparent/80'
                }`}
              >
                <button
                  type="button"
                  className={`mt-0.5 transition-colors ${
                    flashingTaskId === task.id ? 'animate-burst ' : ''
                  }${
                    isDone ? 'text-[var(--c1)]' : 'text-slate-500 hover:text-[var(--c1)]'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Square className="w-6 h-6" />}
                </button>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`text-sm md:text-base font-bold truncate ${
                        task.status === 'completed'
                          ? 'text-coastal-sand line-through'
                          : 'text-white'
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className="text-[10px] md:text-xs text-slate-400 font-medium flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-[var(--c1)]" />
                      {task.day_assigned} • {task.date_assigned || 'Sin fecha'} • {task.time_assigned} • {task.duration}m
                    </span>
                  </div>

                  {task.is_restricted_for_children && (
                    <span className="inline-flex items-center gap-1 mt-2 text-[10px] text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <AlertCircle className="w-3 h-3" />
                      Requiere supervisión
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
