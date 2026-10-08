import React, { useState } from 'react';
import { SavingsGoal } from '../types';
import { formatCurrency } from '../utils/storage';
import {
  TrendingUp,
  Target,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  PiggyBank,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  X,
  Compass,
} from 'lucide-react';

interface YearlySavingsProgressCardProps {
  goals: SavingsGoal[];
  onSaveGoals?: (newGoals: SavingsGoal[]) => void;
  className?: string;
  defaultExpanded?: boolean;
}

export const YearlySavingsProgressCard: React.FC<YearlySavingsProgressCardProps> = ({
  goals,
  onSaveGoals,
  className = '',
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [showDepositModal, setShowDepositModal] = useState<boolean>(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState<string>('1000');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const remainingMonths = Math.max(1, 12 - currentMonth + 1);

  // Time elapsed in the current year as percentage (1-12)
  const yearElapsedPercent = Math.round((currentMonth / 12) * 100);

  // Aggregate totals
  const totalTarget = goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
  const totalSaved = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  const remainingAmount = Math.max(0, totalTarget - totalSaved);
  const overallPercent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const clampedPercent = Math.min(overallPercent, 100);

  // Required monthly savings to hit target by year end
  const monthlyRequired = remainingMonths > 0 ? Math.round(remainingAmount / remainingMonths) : 0;

  // Pace status compared to year timeline
  const isAheadOfSchedule = overallPercent >= yearElapsedPercent;

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSaveGoals || !selectedGoalId) return;
    const addVal = parseFloat(depositAmount);
    if (isNaN(addVal) || addVal <= 0) return;

    const updated = goals.map((g) =>
      g.id === selectedGoalId
        ? { ...g, currentAmount: (g.currentAmount || 0) + addVal }
        : g
    );
    onSaveGoals(updated);
    setShowDepositModal(false);
    setDepositAmount('1000');
  };

  return (
    <div
      className={`bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all ${className}`}
    >
      {/* CARD HEADER */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-2xs">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                  Yıllık İlerleme
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  %{overallPercent} Tamamlandı
                </span>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  ({currentYear} Yılı)
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                Yıllık toplam birikim hedeflerinize ulaşma oranınız ve kalan zaman analizi
              </p>
            </div>
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {onSaveGoals && goals.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedGoalId(goals[0]?.id || '');
                  setShowDepositModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Birikim Ekle</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-xl text-[#64748B] hover:text-[#0F172A] dark:hover:text-white bg-slate-100/70 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
              title={isExpanded ? 'Detayları daralt' : 'Detayları genişlet'}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* HERO PROGRESS BAR (YILLIK İLERLEME ÇUBUĞU) */}
        <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800/80 space-y-3">
          {/* Progress labels */}
          <div className="flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0F172A] dark:text-white">
                Toplam Birikim: {formatCurrency(totalSaved)}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                / {formatCurrency(totalTarget)}
              </span>
            </div>
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
              %{overallPercent} Hedef
            </span>
          </div>

          {/* Main Visual Progress Bar */}
          <div className="relative w-full h-3.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-inner">
            {/* Year Timeline Benchmark Line (Neredeyiz?) */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-500 z-10 opacity-70"
              style={{ left: `${yearElapsedPercent}%` }}
              title={`Yılın %${yearElapsedPercent}'i geride kaldı`}
            />

            {/* Filled Progress Bar */}
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                overallPercent >= 100
                  ? 'bg-emerald-500'
                  : overallPercent >= 75
                  ? 'bg-emerald-600'
                  : overallPercent >= 40
                  ? 'bg-teal-500'
                  : 'bg-indigo-500'
              }`}
              style={{ width: `${clampedPercent}%` }}
            />
          </div>

          {/* Scale Milestones Under Bar */}
          <div className="flex justify-between items-center text-[10px] text-[#64748B] dark:text-slate-500 font-mono pt-0.5">
            <span>₺0 (%0)</span>
            <span className="hidden sm:inline">%25 Çeyrek</span>
            <span>%50 Yarı Yol</span>
            <span className="hidden sm:inline">%75 Kritik</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {formatCurrency(totalTarget)} (%100)
            </span>
          </div>
        </div>

        {/* METRICS GRID: 4 KEY STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-[#E2E8F0] dark:border-slate-800 text-xs">
          {/* 1. Toplam Biriken */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-slate-400 block">
              Toplam Biriken
            </span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 block mt-0.5">
              {formatCurrency(totalSaved)}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {goals.length} aktif hedef
            </span>
          </div>

          {/* 2. Kalan Hedef */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-slate-400 block">
              Kalan Tutar
            </span>
            <span className="text-sm font-extrabold text-[#0F172A] dark:text-white block mt-0.5">
              {formatCurrency(remainingAmount)}
            </span>
            <span className="text-[10px] text-slate-400 block">
              Yıllık tavan için
            </span>
          </div>

          {/* 3. Gereken Aylık Hız */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-slate-400 block">
              Gereken Aylık Hız
            </span>
            <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 block mt-0.5">
              {formatCurrency(monthlyRequired)}
            </span>
            <span className="text-[10px] text-slate-400 block">
              Kalan {remainingMonths} ay için
            </span>
          </div>

          {/* 4. Yıl Takvimi Senkronu */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-slate-400 block">
              Zaman Senkronu
            </span>
            <span
              className={`text-sm font-extrabold block mt-0.5 ${
                isAheadOfSchedule
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {isAheadOfSchedule ? 'Öndesiniz 🚀' : 'Hızlanmalı ⏳'}
            </span>
            <span className="text-[10px] text-slate-400 block">
              Yılın %{yearElapsedPercent}'i geçti
            </span>
          </div>
        </div>
      </div>

      {/* EXPANDED SECTION: BREAKDOWN OF INDIVIDUAL GOALS */}
      {isExpanded && goals.length > 0 && (
        <div className="p-4 sm:p-5 pt-0 border-t border-[#E2E8F0] dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] dark:text-slate-400 pt-3">
            <span className="flex items-center gap-1.5">
              <PiggyBank className="w-3.5 h-3.5 text-emerald-500" />
              Yıllık Hedefi Oluşturan Birikim Kumbaraları ({goals.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Bireysel Hedef İlerlemeleri
            </span>
          </div>

          <div className="space-y-2.5">
            {goals.map((g) => {
              const gPercent =
                g.targetAmount > 0
                  ? Math.round((g.currentAmount / g.targetAmount) * 100)
                  : 0;
              const gClamped = Math.min(gPercent, 100);

              return (
                <div
                  key={g.id}
                  className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-[#E2E8F0] dark:border-slate-800 text-xs transition hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: g.color || '#10b981' }}
                      />
                      <span className="font-bold text-[#0F172A] dark:text-white">
                        {g.title}
                      </span>
                      {g.category && (
                        <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                          {g.category}
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-[#0F172A] dark:text-white">
                        {formatCurrency(g.currentAmount)}
                      </span>
                      <span className="text-[11px] text-[#64748B] dark:text-slate-400">
                        {' '}/ {formatCurrency(g.targetAmount)} (%{gPercent})
                      </span>
                    </div>
                  </div>

                  {/* Individual Goal Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${gClamped}%`,
                        backgroundColor: g.color || '#10b981',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Motivational Smart Insight Box */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 text-xs text-indigo-950 dark:text-indigo-200">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              <span className="font-bold mr-1">Akıllı Birikim Rotası:</span>
              Yıl sonuna kadar belirlenen hedeflere tam ulaşmak için aylık ortalama{' '}
              <strong className="font-extrabold text-indigo-700 dark:text-indigo-300">
                {formatCurrency(monthlyRequired)}
              </strong>{' '}
              tutarında tasarruf planlaması yapmanız yeterlidir.
            </div>
          </div>
        </div>
      )}

      {/* QUICK DEPOSIT MODAL */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-sm text-[#0F172A] dark:text-white">
                  Birikim Kumbarasına Para Ekle
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDepositModal(false)}
                className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#0F172A] dark:text-slate-200 block mb-1">
                  Hedef Seçin
                </label>
                <select
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-emerald-500"
                >
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title} ({formatCurrency(g.currentAmount)} / {formatCurrency(g.targetAmount)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0F172A] dark:text-slate-200 block mb-1">
                  Eklenecek Tutar (TL)
                </label>
                <input
                  type="number"
                  min="1"
                  step="50"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-emerald-500 font-mono"
                  placeholder="500"
                  required
                />
              </div>

              {/* Quick Amount Pills */}
              <div className="flex items-center gap-1.5 pt-1">
                {['250', '500', '1000', '2500'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className="flex-1 py-1 text-[11px] rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-200 font-medium transition"
                  >
                    +{amt}₺
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition"
                >
                  Kumbaraya Aktar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
