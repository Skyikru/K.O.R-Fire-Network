import React, { useState } from 'react';
import { SavingsGoal } from '../types';
import { formatCurrency, formatDateTurkish } from '../utils/storage';
import {
  Target,
  Plus,
  Trash2,
  TrendingUp,
  Sparkles,
  Calendar,
  X,
  Check,
  ArrowRight,
  PiggyBank,
} from 'lucide-react';

interface SavingsGoalsManagerProps {
  goals: SavingsGoal[];
  onSaveGoals: (newGoals: SavingsGoal[]) => void;
}

export const SavingsGoalsManager: React.FC<SavingsGoalsManagerProps> = ({
  goals,
  onSaveGoals,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeDepositGoal, setActiveDepositGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('500');

  // Form State
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('Genel');
  const [color, setColor] = useState('#10b981');
  const [note, setNote] = useState('');

  // Calculations
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallPercent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseFloat(targetAmount);
    const parsedInit = parseFloat(initialAmount) || 0;
    if (!title.trim() || isNaN(parsedTarget) || parsedTarget <= 0) return;

    const newGoal: SavingsGoal = {
      id: `goal-${Date.now()}`,
      title: title.trim(),
      targetAmount: parsedTarget,
      currentAmount: parsedInit,
      targetDate: targetDate || undefined,
      category,
      color,
      note: note.trim() || undefined,
    };

    onSaveGoals([...goals, newGoal]);
    setTitle('');
    setTargetAmount('');
    setInitialAmount('');
    setTargetDate('');
    setNote('');
    setShowAddModal(false);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDepositGoal) return;
    const addVal = parseFloat(depositAmount);
    if (isNaN(addVal) || addVal <= 0) return;

    const updated = goals.map((g) =>
      g.id === activeDepositGoal.id
        ? { ...g, currentAmount: g.currentAmount + addVal }
        : g
    );
    onSaveGoals(updated);
    setActiveDepositGoal(null);
  };

  const handleDeleteGoal = (id: string) => {
    onSaveGoals(goals.filter((g) => g.id !== id));
  };

  return (
    <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <PiggyBank className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                Birikim Hedefleri & Hayal Kumbarası
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                %{overallPercent} Tamamlandı
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400">
              Telefon, tatil veya özel hedefleriniz için ayrı kumbaralar ve ilerleme takibi
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Yeni Hedef Ekle</span>
        </button>
      </div>

      {/* Summary KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800">
          <span className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 block mb-0.5">
            Toplam Biriktirilen
          </span>
          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatCurrency(totalSaved)}
          </span>
          <span className="text-[10px] text-[#64748B] dark:text-slate-500 block mt-0.5">
            Mevcut kumbaralar toplamı
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800">
          <span className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 block mb-0.5">
            Hedeflenen Toplam
          </span>
          <span className="text-base font-bold text-[#0F172A] dark:text-white tracking-tight">
            {formatCurrency(totalTarget)}
          </span>
          <span className="text-[10px] text-[#64748B] dark:text-slate-500 block mt-0.5">
            Tüm hayallerin tutarı
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800">
          <span className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 block mb-0.5">
            Hedefe Kalan Tutar
          </span>
          <span className="text-base font-bold text-purple-600 dark:text-purple-400 tracking-tight">
            {formatCurrency(Math.max(0, totalTarget - totalSaved))}
          </span>
          <span className="text-[10px] text-[#64748B] dark:text-slate-500 block mt-0.5 font-medium">
            %{100 - overallPercent} yol kaldı
          </span>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="space-y-3">
        {goals.map((goal) => {
          const percent = Math.min(
            100,
            Math.round((goal.currentAmount / goal.targetAmount) * 100)
          );
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div
              key={goal.id}
              className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: goal.color || '#10b981' }}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A] dark:text-white">
                      {goal.title}
                    </h4>
                    <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                      {goal.category || 'Genel'}
                      {goal.targetDate && ` • Hedef: ${formatDateTurkish(goal.targetDate)}`}
                      {goal.note && ` • ${goal.note}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-xs font-black text-[#0F172A] dark:text-white block">
                      {formatCurrency(goal.currentAmount)}
                    </span>
                    <span className="text-[10px] text-[#64748B]">
                      / {formatCurrency(goal.targetAmount)} (%{percent})
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setActiveDepositGoal(goal);
                      setDepositAmount('500');
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition active:scale-95 shadow-2xs"
                  >
                    + Para Ekle
                  </button>

                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 transition"
                    title="Hedefi Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-2.5">
                <div className="flex items-center justify-between text-[10px] text-[#64748B] dark:text-slate-400 mb-1">
                  <span>
                    {remaining > 0 ? `Kalan: ${formatCurrency(remaining)}` : '✓ Hedefe Ulaşıldı!'}
                  </span>
                  <span>%{percent}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: goal.color || '#10b981',
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="text-center py-6 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Henüz birikim hedefi veya kumbara oluşturulmadı.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> İlk Hayal Kumbarasını Aç
            </button>
          </div>
        )}
      </div>

      {/* Deposit to Goal Modal */}
      {activeDepositGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-[#0F172A] dark:text-white">
                  "{activeDepositGoal.title}" Kumbarasına Para At
                </h3>
              </div>
              <button
                onClick={() => setActiveDepositGoal(null)}
                className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-3 pt-3">
              <div>
                <label className="text-[11px] font-medium text-[#0F172A] dark:text-slate-300 block mb-1">
                  Eklenecek Tutar (TL)
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-emerald-500 font-bold"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[100, 250, 500, 1000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDepositAmount(String(preset))}
                    className="py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-200"
                  >
                    +{preset} ₺
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveDepositGoal(null)}
                  className="px-4 py-2 text-xs font-medium text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition"
                >
                  Kumbaraya Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-[#0F172A] dark:text-white">
                  Yeni Birikim Hedefi Ekle
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 pt-3">
              <div>
                <label className="text-[11px] font-medium text-[#0F172A] dark:text-slate-300 block mb-1">
                  Hedef Adı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Yeni Telefon, Yaz Tatili"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-[#0F172A] dark:text-slate-300 block mb-1">
                    Hedef Tutar (TL) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Örn: 25000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#0F172A] dark:text-slate-300 block mb-1">
                    Başlangıç Birikimi (TL)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#0F172A] dark:text-slate-300 block mb-1">
                  Hedef Bitiş Tarihi (Opsiyonel)
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition"
                >
                  Kumbarayı Başlat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
