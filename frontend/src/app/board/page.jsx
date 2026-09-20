'use client';

import React, { useState, useEffect } from 'react';
import { taskService, authService, settingsService } from '../../services/api';
import { useNotification } from '../../context/notification';
import { subscribeToTaskEvents } from '../../utils/socket';
import Accordion from '../../components/accordion';
import { Kanban, Plus, User, Clock, Trash2, Edit3, ShieldAlert, CheckCircle2, AlertCircle, X, Megaphone } from 'lucide-react';

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function GeneralBoardPage() {
  const { user, showNotification } = useNotification();
  
  const [tasks, setTasks] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state for creating / editing tasks
  const [selectedCatalogId, setSelectedCatalogId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDuration, setTaskDuration] = useState(30);
  const [assignedToId, setAssignedToId] = useState('');
  const todayStr = new Date().toISOString().split('T')[0];
  const [dateAssigned, setDateAssigned] = useState(todayStr);
  const [dayAssigned, setDayAssigned] = useState('Lunes');
  const [timeAssigned, setTimeAssigned] = useState('09:00');

  useEffect(() => {
    if (dateAssigned) {
      // Create date object adjusting for timezone issues with string parse
      const dateObj = new Date(dateAssigned + 'T12:00:00');
      const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      setDayAssigned(days[dateObj.getDay()]);
    }
  }, [dateAssigned]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Motivational message state
  const [motivationalMessageInput, setMotivationalMessageInput] = useState('');
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);

  // Modal catalog state
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [newCatalogTitle, setNewCatalogTitle] = useState('');
  const [newCatalogDuration, setNewCatalogDuration] = useState(30);
  const [isSubmittingCatalog, setIsSubmittingCatalog] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, catalogData, usersData, msgData] = await Promise.all([
        taskService.getTasks(true), // get all household tasks
        taskService.getCatalog(),
        authService.getUsers().catch(() => []),
        settingsService.getMotivationalMessage().catch(() => ({ message: '' }))
      ]);
      setTasks(tasksData);
      setCatalog(catalogData);
      setUsers(usersData);
      setMotivationalMessageInput(msgData.message || '');
    } catch (err) {
      showNotification('Error al cargar datos del tablero.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const unsubscribe = subscribeToTaskEvents(
      () => loadData(),
      () => loadData(),
      () => loadData()
    );

    return () => unsubscribe();
  }, []);

  const handleCatalogSelect = (e) => {
    const catId = e.target.value;
    setSelectedCatalogId(catId);
    if (!catId) return;

    const item = catalog.find((c) => c.id === parseInt(catId));
    if (item) {
      setTaskTitle(item.title);
      setTaskDuration(item.default_duration);
    }
  };

  const handleCreateCatalogItem = async (e) => {
    e.preventDefault();
    if (!newCatalogTitle) return;
    setIsSubmittingCatalog(true);
    try {
      await taskService.createCatalogItem({
        title: newCatalogTitle,
        default_duration: parseInt(newCatalogDuration),
        category: 'Hogar'
      });
      showNotification('Nuevo tipo de tarea añadido al catálogo.', 'success');
      setShowCatalogModal(false);
      setNewCatalogTitle('');
      setNewCatalogDuration(30);
      const catalogData = await taskService.getCatalog();
      setCatalog(catalogData);
    } catch (err) {
      showNotification(err.response?.data?.error || 'Error al agregar al catálogo', 'error');
    } finally {
      setIsSubmittingCatalog(false);
    }
  };

  const handleCreateOrUpdateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle) {
      showNotification('El título de la tarea es obligatorio.', 'error');
      return;
    }

    // Client-side quick check for child restriction (Gabriela)
    const targetUser = users.find((u) => u.id === parseInt(assignedToId));
    const restrictedCooking = ['preparar desayuno', 'preparar almuerzo', 'preparar cena'];
    const isCooking = restrictedCooking.some((r) => taskTitle.lowerCase?.includes(r) || taskTitle.toLowerCase().includes(r));

    if (targetUser && (targetUser.is_child || targetUser.username.toLowerCase() === 'gabriela') && isCooking) {
      showNotification(
        ` Restricción de Seguridad: La tarea '${taskTitle}' no puede ser asignada al usuario infantil Gabriela.`,
        'error'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTaskId) {
        await taskService.updateTask(editingTaskId, {
          title: taskTitle,
          duration: parseInt(taskDuration),
          assigned_to_id: assignedToId ? parseInt(assignedToId) : null,
          date_assigned: dateAssigned,
          day_assigned: dayAssigned,
          time_assigned: timeAssigned,
        });
        showNotification('Tarea actualizada correctamente.', 'success');
      } else {
        await taskService.createTask({
          title: taskTitle,
          duration: parseInt(taskDuration),
          assigned_to_id: assignedToId ? parseInt(assignedToId) : null,
          date_assigned: dateAssigned,
          day_assigned: dayAssigned,
          time_assigned: timeAssigned,
        });
        showNotification('Tarea agregada al Tablero General.', 'success');
      }

      // Reset Form
      setEditingTaskId(null);
      setSelectedCatalogId('');
      setTaskTitle('');
      setTaskDuration(30);
      setAssignedToId('');
      loadData();
    } catch (err) {
      showNotification(
        err.response?.data?.error || 'Error al procesar la tarea.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMotivationalMessage = async (e) => {
    e.preventDefault();
    if (!motivationalMessageInput) return;
    setIsSubmittingMessage(true);
    try {
      await settingsService.updateMotivationalMessage(motivationalMessageInput);
      showNotification('Mensaje motivacional actualizado.', 'success');
    } catch (err) {
      showNotification('Error al actualizar el mensaje.', 'error');
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  const handleEditClick = (task) => {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDuration(task.duration);
    setAssignedToId(task.assigned_to_id || '');
    if (task.date_assigned) setDateAssigned(task.date_assigned);
    setDayAssigned(task.day_assigned);
    setTimeAssigned(task.time_assigned);
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('¿Desea eliminar esta tarea del Tablero General?')) return;
    try {
      await taskService.deleteTask(taskId);
      showNotification('Tarea eliminada.', 'info');
      loadData();
    } catch (err) {
      showNotification('Error al eliminar la tarea.', 'error');
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Banner */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-[var(--c1)]/30 via-purple-500/30 to-[var(--c5)]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
            <Kanban className="w-7 h-7 text-[var(--c1)]" />
            <span>Tablero General de Administración</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-200 mt-1">
            Panel central para subir tareas, asignarlas a integrantes del hogar y gestionar su horario.
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-indigo-950/60 border border-white/20 text-[var(--c5)] text-xs font-semibold">
          Rol: {user ? user.role : 'Administrador'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Task Creation Form */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-5 h-fit">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-[var(--c1)]" />
            <span>{editingTaskId ? 'Editar Tarea' : 'Asignar Nueva Tarea'}</span>
          </h2>

          <form onSubmit={handleCreateOrUpdateTask} className="space-y-4">
            {/* Catalog Preset Selector */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-slate-400">Seleccionar del Catálogo de Tareas</label>
                {(user?.role === 'administrator' || user?.role === 'contributor') && (
                  <button 
                    type="button" 
                    onClick={() => setShowCatalogModal(true)}
                    className="text-[10px] text-[var(--c1)] flex items-center gap-1 hover:text-[var(--c5)] transition-colors bg-[var(--c1)]/10 px-2 py-1 rounded-md border border-white/10"
                  >
                    <Plus className="w-3 h-3" /> Nuevo
                  </button>
                )}
              </div>
              <select
                value={selectedCatalogId}
                onChange={handleCatalogSelect}
                className="w-full px-3 py-2 rounded-xl bg-transparent border border-white/20 text-white text-xs focus:outline-none focus:border-white/20"
              >
                <option value="">-- Escoger del Catálogo predefinido --</option>
                {catalog.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title} ({cat.default_duration} min) {cat.is_restricted_for_children ? '🔒' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Task Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-200">Nombre de la Tarea</label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Ej. Barrer y fregar el suelo"
                className="w-full px-3.5 py-2.5 rounded-xl bg-transparent border border-white/20 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-white/20"
              />
            </div>

            {/* Assign User */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-200 flex items-center justify-between">
                <span>Asignar a</span>
                <span className="text-[10px] text-[var(--c1)]">Lainneker, Anyeline, Gabriela...</span>
              </label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-transparent border border-white/20 text-white text-xs focus:outline-none focus:border-white/20"
              >
                <option value="">-- Seleccionar Integrante --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username} ({u.role}) {u.is_child ? '👧 [Menor]' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration, Date, Time */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-400">Minutos</label>
                <input
                  type="number"
                  value={taskDuration}
                  onChange={(e) => setTaskDuration(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-transparent border border-white/20 text-white text-xs focus:outline-none focus:border-white/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-400">Fecha</label>
                <input
                  type="date"
                  value={dateAssigned}
                  onChange={(e) => setDateAssigned(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl bg-transparent border border-white/20 text-white text-[11px] focus:outline-none focus:border-white/20"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-400">Hora</label>
                <input
                  type="time"
                  value={timeAssigned}
                  onChange={(e) => setTimeAssigned(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl bg-transparent border border-white/20 text-white text-xs focus:outline-none focus:border-white/20"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl font-semibold bg-[var(--c1)]/10 hover:bg-[var(--c1)]/20 border border-[var(--c1)] text-[var(--c1)] backdrop-blur-md text-xs transition-all disabled:opacity-50"
              >
                {isSubmitting
                  ? 'Procesando...'
                  : editingTaskId
                  ? 'Guardar Cambios'
                  : 'Publicar en Tablero'}
              </button>

              {editingTaskId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingTaskId(null);
                    setTaskTitle('');
                  }}
                  className="px-3 py-3 rounded-xl font-semibold bg-transparent hover:bg-transparent text-slate-200 text-xs"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Motivational Message Form */}
        {(user?.role === 'administrator' || user?.role === 'contributor') && (
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-5 h-fit mt-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[var(--c1)]" />
              <span>Banner Motivacional</span>
            </h2>
            <form onSubmit={handleUpdateMotivationalMessage} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Texto del Top Bar</label>
                <textarea
                  value={motivationalMessageInput}
                  onChange={(e) => setMotivationalMessageInput(e.target.value)}
                  placeholder="Ej. ¡Vamos equipo! Hoy es un gran día..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-transparent border border-white/20 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-white/20 min-h-[80px]"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmittingMessage}
                className="w-full py-3 rounded-xl font-semibold bg-[var(--c1)]/10 hover:bg-[var(--c1)]/20 border border-[var(--c1)] text-[var(--c1)] backdrop-blur-md text-xs transition-all disabled:opacity-50"
              >
                {isSubmittingMessage ? 'Guardando...' : 'Actualizar Banner'}
              </button>
            </form>
          </div>
        )}
      </div>

        {/* Household Task List by Day */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white">
            Tareas Globales del Hogar ({tasks.length})
          </h2>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs glass-card rounded-2xl">
              Cargando Tablero General...
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs glass-card rounded-2xl border border-white/10">
              No hay tareas publicadas aún en el Tablero General. Usa el formulario para crear las primeras tareas.
            </div>
          ) : (
            DAYS_OF_WEEK.map((day) => {
              const dayTasks = tasks.filter((t) => t.day_assigned === day);
              if (dayTasks.length === 0) return null;

              return (
                <Accordion key={day} title={`Tareas del ${day}`} count={dayTasks.length} icon={Kanban}>
                  <div className="space-y-3">
                    {dayTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-4 rounded-2xl bg-transparent/80 border transition-all flex items-center justify-between gap-4 ${
                          task.status === 'completed'
                            ? 'border-white/20 bg-[var(--c5)]/20/10'
                            : 'border-white/10'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950 text-[var(--c5)] border border-white/20">
                              {task.time_assigned}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[var(--c1)]" />
                              {task.duration} min
                            </span>
                            {task.status === 'completed' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--c5)]/20 text-emerald-300 border border-white/20 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Completada
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-white text-sm">{task.title}</h4>

                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span>
                              Asignado a:{' '}
                              <strong className="text-slate-200">
                                {task.assigned_to_username || 'Sin asignar'}
                              </strong>
                            </span>

                            {task.is_restricted_for_children && (
                              <span className="text-[10px] text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
                                🔒 Tarea restringida para menores
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(task)}
                            className="p-2 rounded-xl text-slate-400 hover:text-[var(--c1)] hover:bg-transparent transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Accordion>
              );
            })
          )}
        </div>
      </div>
      {/* Modal Add Catalog */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-transparent border border-white/20 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setShowCatalogModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[var(--c1)]" />
              Añadir al Catálogo
            </h2>
            <form onSubmit={handleCreateCatalogItem} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-200">Nombre de la Tarea</label>
                <input
                  type="text"
                  value={newCatalogTitle}
                  onChange={(e) => setNewCatalogTitle(e.target.value)}
                  placeholder="Ej. Limpiar ventanas"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-transparent border border-white/20 text-white text-xs focus:outline-none focus:border-white/20"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-200">Duración por Defecto (minutos)</label>
                <input
                  type="number"
                  value={newCatalogDuration}
                  onChange={(e) => setNewCatalogDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-transparent border border-white/20 text-white text-xs focus:outline-none focus:border-white/20"
                  required
                  min="1"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCatalogModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-semibold bg-transparent hover:bg-transparent text-slate-200 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCatalog}
                  className="flex-1 py-2.5 rounded-xl font-semibold bg-[var(--c1)]/10 hover:bg-[var(--c1)]/20 border border-[var(--c1)] text-[var(--c1)] backdrop-blur-md text-xs disabled:opacity-50"
                >
                  {isSubmittingCatalog ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
