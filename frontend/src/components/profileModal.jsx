'use client';

import React, { useState } from 'react';
import { authService } from '../services/api';
import { useNotification } from '../context/notification';
import { Key, Lock, Eye, EyeOff, X, AlertCircle, Loader2, Camera, Upload, User, Check, Shield } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const PRESET_AVATARS = [
  { label: 'Administrador', icon: '👨‍💼' },
  { label: 'Colaboradora', icon: '👩‍💼' },
  { label: 'Niña', icon: '👧' },
  { label: 'Mago', icon: '🧙‍♂️' },
  { label: 'Cohete', icon: '🚀' },
  { label: 'Gato', icon: '🐱' },
  { label: 'Zorro', icon: '🦊' },
  { label: 'Héroe', icon: '🦸' },
  { label: 'Chef', icon: '👨‍🍳' },
  { label: 'Artista', icon: '👩‍🎨' },
];

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateUser, showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('avatar'); // 'avatar' | 'password'

  // Avatar state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');

  if (!isOpen) return null;

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setSelectedPreset(null);
    setAvatarError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPwdError('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setAvatarError('La imagen debe pesar menos de 5 MB.');
        return;
      }
      setSelectedFile(file);
      setSelectedPreset(null);
      setAvatarError('');
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSelectPreset = (presetIcon) => {
    setSelectedPreset(presetIcon);
    setSelectedFile(null);
    setPreviewUrl(null);
    setAvatarError('');
  };

  const handleSaveAvatar = async () => {
    setAvatarError('');
    if (!selectedFile && !selectedPreset) {
      setAvatarError('Selecciona un archivo de imagen o un avatar prediseñado.');
      return;
    }

    try {
      setAvatarLoading(true);
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const res = await authService.uploadAvatar(formData);
        updateUser(res.user);
        showNotification(res.message || 'Foto de perfil actualizada con éxito.', 'success');
      } else if (selectedPreset) {
        const res = await authService.updateAvatarUrl(selectedPreset);
        updateUser(res.user);
        showNotification('Avatar actualizado con éxito.', 'success');
      }
      handleClose();
    } catch (err) {
      setAvatarError(err.response?.data?.error || 'Error al actualizar la foto de perfil.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPwdError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdError('Por favor completa todos los campos.');
      return;
    }

    if (newPassword.length < 6) {
      setPwdError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError('Las nuevas contraseñas no coinciden.');
      return;
    }

    if (currentPassword === newPassword) {
      setPwdError('La nueva contraseña debe ser diferente a la contraseña actual.');
      return;
    }

    try {
      setPwdLoading(true);
      const res = await authService.changePassword(currentPassword, newPassword);
      showNotification(res.message || '¡Contraseña actualizada con éxito!', 'success');
      handleClose();
    } catch (err) {
      setPwdError(err.response?.data?.error || 'Error al cambiar la contraseña. Verifique sus datos.');
    } finally {
      setPwdLoading(false);
    }
  };

  const userAvatar = user?.avatar_url;
  const isCustomImage = userAvatar && (userAvatar.startsWith('/api/') || userAvatar.startsWith('http'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-transparent border border-white/10 rounded-3xl shadow-2xl overflow-hidden glass-panel flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10/80 bg-transparent/80">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl bg-[var(--c1)]/20 border border-white/20 flex items-center justify-center text-[var(--c1)] overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : isCustomImage ? (
                <img src={`${API_BASE_URL}${userAvatar}`} alt={user.username} className="w-full h-full object-cover" />
              ) : userAvatar ? (
                <span className="text-xl">{userAvatar}</span>
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{user?.username}</span>
                {user?.role === 'administrator' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-950 text-[var(--c5)] border border-white/20 font-semibold">
                    Admin
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">Configuración de Perfil y Seguridad</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-transparent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10/80 bg-slate-950/40 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('avatar')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'avatar'
                ? 'border-white/20 text-[var(--c1)]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Foto de Perfil</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'password'
                ? 'border-white/20 text-[var(--c1)]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Cambiar Contraseña</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {activeTab === 'avatar' ? (
            <div className="space-y-5">
              {avatarError && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{avatarError}</span>
                </div>
              )}

              {/* Option A: Upload Local File */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-200">
                  Subir foto desde tu dispositivo
                </label>

                <div className="relative border-2 border-dashed border-white/20 hover:border-white/20/60 rounded-2xl p-4 text-center bg-slate-950/40 transition-all cursor-pointer group">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-[var(--c1)]/20 text-[var(--c1)] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    {selectedFile ? (
                      <span className="text-xs font-medium text-[var(--c5)]">{selectedFile.name}</span>
                    ) : (
                      <>
                        <p className="text-xs text-slate-200 font-medium">
                          Haz clic o arrastra una imagen aquí
                        </p>
                        <p className="text-[10px] text-slate-500">PNG, JPG, WEBP o SVG (máx 5MB)</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Option B: Preset Avatars */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-200">
                  O selecciona un avatar prediseñado
                </label>
                <div className="grid grid-cols-5 gap-2.5">
                  {PRESET_AVATARS.map((item) => {
                    const isSelected = selectedPreset === item.icon;
                    return (
                      <button
                        key={item.icon}
                        type="button"
                        onClick={() => handleSelectPreset(item.icon)}
                        className={`p-2.5 rounded-xl border text-xl flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[var(--c1)]/30 border-white/20 text-white scale-105'
                            : 'bg-slate-950/40 border-white/10 text-slate-200 hover:bg-transparent hover:border-white/20'
                        }`}
                        title={item.label}
                      >
                        <span>{item.icon}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10/80">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveAvatar}
                  disabled={avatarLoading || (!selectedFile && !selectedPreset)}
                  className="px-4 py-2 bg-[var(--c1)]/10 hover:bg-[var(--c1)]/20 border border-[var(--c1)] text-[var(--c1)] disabled:opacity-50 backdrop-blur-md rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
                >
                  {avatarLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{avatarLoading ? 'Guardando...' : 'Guardar Foto de Perfil'}</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSavePassword} className="space-y-4">
              {pwdError && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{pwdError}</span>
                </div>
              )}

              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña actual"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowCurrent((prev) => !prev);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors z-10 flex items-center justify-center rounded-md"
                    title={showCurrent ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowNew((prev) => !prev);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors z-10 flex items-center justify-center rounded-md"
                    title={showNew ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowConfirm((prev) => !prev);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors z-10 flex items-center justify-center rounded-md"
                    title={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10/80">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="px-4 py-2 bg-[var(--c1)]/10 hover:bg-[var(--c1)]/20 border border-[var(--c1)] text-[var(--c1)] disabled:opacity-50 backdrop-blur-md rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
                >
                  {pwdLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{pwdLoading ? 'Guardando...' : 'Cambiar Contraseña'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
