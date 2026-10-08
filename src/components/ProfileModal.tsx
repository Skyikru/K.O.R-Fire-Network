import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Users, Plus, Trash2, Edit2, Check, X, Shield, Briefcase, Home } from 'lucide-react';

interface ProfileModalProps {
  profiles: UserProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onCreateProfile: (name: string, type: 'personal' | 'work' | 'shared', color: string) => void;
  onRenameProfile: (id: string, newName: string) => void;
  onDeleteProfile: (id: string) => void;
  onClose: () => void;
}

const PRESET_COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6'];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profiles,
  activeProfileId,
  onSelectProfile,
  onCreateProfile,
  onRenameProfile,
  onDeleteProfile,
  onClose,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'personal' | 'work' | 'shared'>('personal');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateProfile(newName.trim(), newType, newColor);
    setNewName('');
    setIsCreating(false);
  };

  const handleStartEdit = (profile: UserProfile) => {
    setEditingId(profile.id);
    setEditingName(profile.name);
  };

  const handleSaveEdit = (id: string) => {
    if (editingName.trim()) {
      onRenameProfile(id, editingName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Profil & Hesap Yönetimi</h3>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400">Verileri tamamen izole hesaplar arasında yönetin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profiles List */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {profiles.map((p) => {
            const isActive = p.id === activeProfileId;
            const isEditing = editingId === p.id;

            return (
              <div
                key={p.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                  isActive
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-500/40 text-emerald-900 dark:text-emerald-200 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div
                  onClick={() => !isEditing && onSelectProfile(p.id)}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: p.color }}
                  />

                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 w-full"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(p.id)}
                        className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold truncate text-slate-900 dark:text-white">{p.name}</span>
                        {isActive && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                        {p.type === 'personal' ? 'Kişisel Hesap' : p.type === 'work' ? 'İş & Meslek' : 'Ortak / Aile'}
                      </p>
                    </div>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleStartEdit(p)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                      title="Yeniden Adlandır"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {profiles.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`"${p.name}" profilini ve içindeki tüm verileri silmek istediğinize emin misiniz?`)) {
                            onDeleteProfile(p.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded"
                        title="Profili Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* New Profile Accordion / Form */}
        {isCreating ? (
          <form onSubmit={handleCreate} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Yeni Profil Ekle</h4>
            <div>
              <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Profil Adı *</label>
              <input
                type="text"
                placeholder="Örn: Ev Bütçesi veya Yan Proje"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'personal', label: 'Kişisel' },
                { type: 'work', label: 'İş' },
                { type: 'shared', label: 'Ortak' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setNewType(item.type as any)}
                  className={`py-1.5 text-xs rounded-lg border font-medium transition ${
                    newType === item.type
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Renk Rozeti</label>
              <div className="flex items-center gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewColor(c)}
                    className={`w-6 h-6 rounded-full transition transform ${
                      newColor === c ? 'ring-2 ring-emerald-500 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg"
              >
                Oluştur
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full py-2.5 flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Profil Ekle</span>
          </button>
        )}
      </div>
    </div>
  );
};
