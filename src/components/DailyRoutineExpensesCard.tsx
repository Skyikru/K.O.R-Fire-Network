import React, { useState } from 'react';
import { DailyRoutineExpense, Expense, ExpenseCategory } from '../types';
import { formatCurrency, getTodayString } from '../utils/storage';
import {
  Zap,
  Plus,
  Trash2,
  Check,
  TrendingDown,
  Sparkles,
  Flame,
  X,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

interface DailyRoutineExpensesCardProps {
  routines: DailyRoutineExpense[];
  expenses: Expense[];
  onLogRoutineExpense: (routine: DailyRoutineExpense) => void;
  onSaveRoutines: (newRoutines: DailyRoutineExpense[]) => void;
  onRewardAvoidedHabit?: (routine: DailyRoutineExpense) => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Ulaşım & Yakıt',
  'Market & Gıda',
  'Eğlence & Sosyal',
  'Fatura & Abonelik',
  'Kira & Konut',
  'Sağlık & Bakım',
  'Giyim & Alışveriş',
  'Diğer',
];

export const DailyRoutineExpensesCard: React.FC<DailyRoutineExpensesCardProps> = ({
  routines,
  expenses,
  onLogRoutineExpense,
  onSaveRoutines,
  onRewardAvoidedHabit,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showYearlyImpact, setShowYearlyImpact] = useState(false);
  const [justLoggedId, setJustLoggedId] = useState<string | null>(null);

  // New Routine Form State
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('Ulaşım & Yakıt');
  const [isAvoidable, setIsAvoidable] = useState(false);
  const [newNote, setNewNote] = useState('');

  const todayStr = getTodayString();

  // Filter today's expenses that match routines
  const todayExpenses = expenses.filter((e) => e.date === todayStr);

  // Calculate how many times each routine was logged today
  const routineCountsToday: Record<string, number> = {};
  routines.forEach((r) => {
    const matching = todayExpenses.filter(
      (e) =>
        e.category === r.category &&
        (e.note?.includes(r.title) || e.amount === r.amount)
    );
    routineCountsToday[r.id] = matching.length;
  });

  const todayRoutineTotal = todayExpenses
    .filter((e) =>
      routines.some(
        (r) =>
          r.category === e.category &&
          (e.note?.includes(r.title) || e.amount === r.amount)
      )
    )
    .reduce((sum, e) => sum + e.amount, 0);

  // Total daily baseline if all routines are spent once
  const dailyRoutinesSum = routines.reduce((sum, r) => sum + r.amount, 0);
  const monthlyRoutinesSum = dailyRoutinesSum * 30;
  const yearlyRoutinesSum = dailyRoutinesSum * 365;

  const handleQuickLog = (r: DailyRoutineExpense) => {
    onLogRoutineExpense(r);
    setJustLoggedId(r.id);
    setTimeout(() => setJustLoggedId(null), 1500);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(newAmount);
    if (!newTitle.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    const newRtn: DailyRoutineExpense = {
      id: `rtn-${Date.now()}`,
      title: newTitle.trim(),
      amount: parsedAmount,
      category: newCategory,
      isAvoidableHabit: isAvoidable,
      note: newNote.trim() || undefined,
    };

    onSaveRoutines([...routines, newRtn]);
    setNewTitle('');
    setNewAmount('');
    setIsAvoidable(false);
    setNewNote('');
    setShowAddModal(false);
  };

  const handleDeleteRoutine = (id: string) => {
    onSaveRoutines(routines.filter((r) => r.id !== id));
  };

  return (
    <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                Günlük Sabit Harcamalar & Rutinler
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                1-Tıkla Ekle
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400">
              Otobüs, sigara, öğle yemeği gibi her gün tekrarlanan mikro harcamalar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowYearlyImpact((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-200 border border-[#E2E8F0] dark:border-slate-700 transition active:scale-95"
            title="Yıllık kümülatif maliyet etkisi"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>Yıllık Etki</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Rutin Ekle</span>
          </button>
        </div>
      </div>

      {/* Latte Factor / Yearly Cumulative Impact Banner */}
      {showYearlyImpact && (
        <div className="p-4 mb-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-xs font-bold text-[#0F172A] dark:text-white">
                Mikro Harcamaların Yıllık Gücü (Latte Faktörü)
              </h3>
            </div>
            <button
              onClick={() => setShowYearlyImpact(false)}
              className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-[#64748B] dark:text-slate-400 leading-relaxed">
            Küçük görünen günlük alışkanlıklar bir yılda devasa bir bütçeye dönüşür:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/50">
              <span className="text-[10px] text-[#64748B] uppercase font-semibold block">
                Günlük Toplam Rutin
              </span>
              <span className="text-sm font-bold text-[#0F172A] dark:text-white">
                {formatCurrency(dailyRoutinesSum)} / gün
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/50">
              <span className="text-[10px] text-[#64748B] uppercase font-semibold block">
                Aylık Kümülatif Maliyet
              </span>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                ≈ {formatCurrency(monthlyRoutinesSum)} / ay
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/50">
              <span className="text-[10px] text-[#64748B] uppercase font-semibold block">
                Yıllık Kümülatif Maliyet
              </span>
              <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
                ≈ {formatCurrency(yearlyRoutinesSum)} / yıl
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Routine Quick Tap Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {routines.map((rtn) => {
          const count = routineCountsToday[rtn.id] || 0;
          const isJustLogged = justLoggedId === rtn.id;

          return (
            <div
              key={rtn.id}
              className={`p-3 rounded-xl border transition-all ${
                isJustLogged
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 scale-[1.02]'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-[#E2E8F0] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#0F172A] dark:text-white">
                      {rtn.title}
                    </span>
                    {rtn.isAvoidableHabit && (
                      <span
                        className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        title="Tasarruf potansiyeli yüksek alışkanlık"
                      >
                        Alışkanlık
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#64748B] dark:text-slate-400 block mt-0.5">
                    {rtn.category} • {formatCurrency(rtn.amount)}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteRoutine(rtn.id)}
                  className="text-slate-400 hover:text-rose-500 p-1 transition"
                  title="Rutini Sil"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  onClick={() => handleQuickLog(rtn)}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition active:scale-95 flex items-center justify-center gap-1.5 shadow-2xs ${
                    isJustLogged
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isJustLogged ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Eklendi!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Bugün Harcadım ({formatCurrency(rtn.amount)})</span>
                    </>
                  )}
                </button>

                {rtn.isAvoidableHabit && onRewardAvoidedHabit && (
                  <button
                    onClick={() => onRewardAvoidedHabit(rtn)}
                    className="py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 transition active:scale-95 shrink-0"
                    title="Bugün bu harcamayı yapmayıp tasarruf ettin! Kumbaraya aktar."
                  >
                    🎯 Pas Geçtim
                  </button>
                )}
              </div>

              {count > 0 && (
                <div className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Bugün {count} kez kaydedildi</span>
                </div>
              )}
            </div>
          );
        })}

        {routines.length === 0 && (
          <div className="col-span-full text-center py-6 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Kayıtlı günlük sabit rutin bulunmuyor.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> İlk Rutini Ekle (Otobüs, Sigara vb.)
            </button>
          </div>
        )}
      </div>

      {/* Today's Total Routine Spent Bar */}
      <div className="mt-3.5 pt-3 border-t border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-[#64748B] dark:text-slate-400">
          Bugün Kaydedilen Rutin Harcamalar:
        </span>
        <span className="font-bold text-[#0F172A] dark:text-white">
          {formatCurrency(todayRoutineTotal)}
        </span>
      </div>

      {/* Add Routine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-[#0F172A] dark:text-white">
                  Yeni Günlük Rutin Ekle
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
                  Rutin Adı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Otobüs / Ulaşım, Sigara, Kahve"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#0F172A] dark:text-slate-300 block mb-1">
                  Birim Tutar (TL) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="Örn: 25, 75, 180"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#0F172A] dark:text-slate-300 block mb-1">
                  Kategori
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ExpenseCategory)}
                  className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-emerald-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="avoidable"
                  checked={isAvoidable}
                  onChange={(e) => setIsAvoidable(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor="avoidable"
                  className="text-xs text-[#0F172A] dark:text-slate-300 cursor-pointer"
                >
                  Kötü / İstek Alışkanlığı (Tasarruf rozeti göster)
                </label>
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
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
