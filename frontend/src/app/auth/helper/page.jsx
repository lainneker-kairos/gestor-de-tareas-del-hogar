'use client';

import React, { useState, useEffect } from 'react';
import { scheduleService } from '../../../services/api';
import { useNotification } from '../../../context/notification';
import { subscribeToScheduleEvents } from '../../../utils/socket';
import Accordion from '../../../components/accordion';
import { Clock, Upload, Trash2, Calendar, FileText, Plus, Check } from 'lucide-react';

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function ScheduleHelperPage() {
  const { user, showNotification } = useNotification();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [dayOfWeek, setDayOfWeek] = useState('Lunes');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await scheduleService.getSchedules(user?.role === 'administrator');
      setSchedules(data);
    } catch (err) {
      showNotification('Error al cargar la lista de horarios.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadSchedules();
    }

    const unsubscribe = subscribeToScheduleEvents(
      () => loadSchedules(),
      () => loadSchedules()
    );

    return () => unsubscribe();
  }, [user]);

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!user) {
      showNotification('Debe iniciar sesión para guardar horarios.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await scheduleService.createSchedule({
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        note: note || 'Disponibilidad agregada',
      });
      showNotification('Horario agregado correctamente.', 'success');
      setNote('');
      loadSchedules();
    } catch (err) {
      showNotification('Error al agregar el horario.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showNotification('Seleccione un archivo primero.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('day_of_week', dayOfWeek);
      formData.append('note', note || `Horario subido: ${selectedFile.name}`);

      await scheduleService.uploadScheduleFile(formData);
      showNotification('Archivo de horario subido exitosamente.', 'success');
      setSelectedFile(null);
      loadSchedules();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Error al subir el archivo.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await scheduleService.deleteSchedule(id);
      showNotification('Horario eliminado.', 'info');
      loadSchedules();
    } catch (err) {
      showNotification('Error al eliminar el horario.', 'error');
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-[var(--c1)]" />
            <span>Gestión de Horarios Semanales</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configura tu disponibilidad horaria o sube imágenes/documentos para coordinar las tareas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form & File Upload */}
        <div className="space-y-6">
          {/* Manual Entry Form */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[var(--c1)]" />
              <span>Agregar Horario Manualmente</span>
            </h2>

            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Día de la semana</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-transparent border border-white/20 text-white text-xs focus:outline-none focus:border-white/20"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Hora Inicio</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-transparent border border-white/20 text-white text-xs focus:outline-none focus:border-white/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Hora Fin</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-transparent border border-white/20 text-white text-xs focus:outline-none focus:border-white/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Nota u Ocupación</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ej. Clases / Trabajo / Gimnasio"
                  className="w-full px-3 py-2 rounded-xl bg-transparent border border-white/20 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-white/20"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl font-semibold bg-[var(--c1)]/10 hover:bg-[var(--c1)]/20 border border-[var(--c1)] text-[var(--c1)] backdrop-blur-md text-xs transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Horario'}
              </button>
            </form>
          </div>

          {/* Document / Image Upload Form */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Upload className="w-4 h-4 text-purple-400" />
              <span>Subir Documento de Horario</span>
            </h2>

            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center bg-transparent/50 hover:border-purple-500/50 transition-colors">
                <input
                  type="file"
                  id="schedule-file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />
                <label htmlFor="schedule-file" className="cursor-pointer space-y-2 block">
                  <FileText className="w-8 h-8 text-purple-400 mx-auto" />
                  <span className="text-xs text-slate-200 block font-medium">
                    {selectedFile ? selectedFile.name : 'Haz clic para seleccionar imagen o PDF'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Soporta PNG, JPG, PDF, DOCX (Máx 10MB)
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="w-full py-2.5 rounded-xl font-semibold bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500 text-purple-400 backdrop-blur-md text-xs transition-all disabled:opacity-50"
              >
                {isUploading ? 'Subiendo...' : 'Subir Archivo de Horario'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Weekly Schedule Display */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--c1)]" />
            <span>Horarios Registrados ({schedules.length})</span>
          </h2>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs glass-card rounded-2xl">
              Cargando horarios...
            </div>
          ) : schedules.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs glass-card rounded-2xl border border-white/10">
              No hay horarios registrados aún. Agrega tus bloques de disponibilidad en el panel izquierdo.
            </div>
          ) : (
            DAYS_OF_WEEK.map((day) => {
              const daySchedules = schedules.filter((s) => s.day_of_week === day);
              if (daySchedules.length === 0) return null;

              return (
                <Accordion key={day} title={day} count={daySchedules.length} icon={Calendar}>
                  <div className="space-y-3">
                    {daySchedules.map((s) => (
                      <div
                        key={s.id}
                        className="p-3.5 rounded-xl bg-transparent/80 border border-white/10 flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[var(--c1)]">
                              {s.start_time} - {s.end_time}
                            </span>
                            {s.username && (
                              <span className="px-2 py-0.5 rounded bg-transparent text-slate-200 text-[10px]">
                                {s.username}
                              </span>
                            )}
                          </div>
                          {s.note && <p className="text-slate-200">{s.note}</p>}
                          {s.file_url && (
                            <a
                              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${s.file_url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-purple-400 hover:underline flex items-center gap-1 text-[11px] font-medium"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Ver archivo ({s.file_name || 'Documento'})</span>
                            </a>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteSchedule(s.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </Accordion>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
