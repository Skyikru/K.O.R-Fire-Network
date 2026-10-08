import React, { useState } from 'react';
import { Expense, CategoryBudget, ExpenseCategory } from '../types';
import { formatCurrency } from '../utils/storage';
import { Scale, AlertTriangle, AlertOctagon, CheckCircle, CheckCircle2, Plus, Edit2, X, Sparkles, TrendingUp } from 'lucide-react';

interface CategoryBudgetCardProps {
  expenses: Expense[];
  budgets: CategoryBudget[];
  onSaveBudgets: (newBudgets: CategoryBudget[]) => void;
  onOpenQuickExpense?: () => void;
}

const ALL_CATEGORIES: ExpenseCategory[] = [
  'Market & Gıda',
  'Fatura & Abonelik',
  'Kira & Konut',
  'Ulaşım & Yakıt',
  'Sağlık & Bakım',
  'Eğlence & Sosyal',
  'Giyim & Alışveriş',
  'Eğitim',
  'Zorunlu Ödeme',
  'Diğer',
];

export const CategoryBudgetCard: React.FC<CategoryBudgetCardProps> = ({
  expenses,
  budgets,
  onSaveBudgets,
  onOpenQuickExpense,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBudgets, setEditingBudgets] = useState<CategoryBudget[]>([]);

  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const monthlyExpenses = expenses.filter(
    (e) => e.date && e.date.startsWith(currentMonthKey)
  );

  // Group current month spending by category
  const spendingByCategory: Record<string, number> = {};
  monthlyExpenses.forEach((exp) => {
    spendingByCategory[exp.category] =
      (spendingByCategory[exp.category] || 0) + exp.amount;
  });

  // Calculate totals
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalBudgetedSpent = budgets.reduce((sum, b) => {
    return sum + (spendingByCategory[b.category] || 0);
  }, 0);
  const overallRatio =
    totalBudgetLimit > 0
      ? Math.round((totalBudgetedSpent / totalBudgetLimit) * 100)
      : 0;

  // Find exceeded budgets (>= 100%) and warning budgets (>= 80%)
  const exceededCount = budgets.filter((b) => {
    const spent = spendingByCategory[b.category] || 0;
    return spent >= b.monthlyLimit;
  }).length;

  const warning80Count = budgets.filter((b) => {
    const spent = spendingByCategory[b.category] || 0;
    const ratio = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
    return ratio >= 80 && spent < b.monthlyLimit;
  }).length;

  const handleOpenEdit = () => {
    // Clone current budgets
    setEditingBudgets([...budgets]);
    setShowEditModal(true);
  };

  const handleLimitChange = (category: string, newLimit: number) => {
    setEditingBudgets((prev) => {
      const existing = prev.find((b) => b.category === category);
      if (existing) {
        return prev.map((b) =>
          b.category === category ? { ...b, monthlyLimit: Math.max(0, newLimit) } : b
        );
      } else {
        return [...prev, { category, monthlyLimit: Math.max(0, newLimit) }];
      }
    });
  };

  const handleApplyPresets = () => {
    const recommended: CategoryBudget[] = [
      { category: 'Market & Gıda', monthlyLimit: 8000 },
      { category: 'Fatura & Abonelik', monthlyLimit: 2500 },
      { category: 'Kira & Konut', monthlyLimit: 15000 },
      { category: 'Ulaşım & Yakıt', monthlyLimit: 2500 },
      { category: 'Eğlence & Sosyal', monthlyLimit: 2000 },
      { category: 'Sağlık & Bakım', monthlyLimit: 1500 },
      { category: 'Giyim & Alışveriş', monthlyLimit: 3000 },
    ];
    setEditingBudgets(recommended);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBudgets(editingBudgets.filter((b) => b.monthlyLimit > 0));
    setShowEditModal(false);
  };

  return (
    <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                Kategori Bazlı Bütçe & Limit Takibi
              </h2>
              {exceededCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                  {exceededCount} Kategori Aşıldı (%100+)
                </span>
              ) : warning80Count > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  {warning80Count} Kategori %80 Eşiğinde
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle className="w-3 h-3" />
                  Bütçede (&lt;%80)
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400">
              Bu ayki harcamalarınızın belirlediğiniz kategori tavanlarına oranı
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-200 border border-[#E2E8F0] dark:border-slate-700 transition active:scale-95 self-start sm:self-auto"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Limitleri Düzenle</span>
        </button>
      </div>

      {/* Overall Progress Bar */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800 mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-medium text-[#64748B] dark:text-slate-400">
            Toplam Bütçe Tüketimi
          </span>
          <span className="font-bold text-[#0F172A] dark:text-white">
            {formatCurrency(totalBudgetedSpent)} / {formatCurrency(totalBudgetLimit)} (%{overallRatio})
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallRatio >= 100
                ? 'bg-rose-500'
                : overallRatio >= 75
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(overallRatio, 100)}%` }}
          />
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-3">
        {budgets.map((b) => {
          const spent = spendingByCategory[b.category] || 0;
          const ratio = Math.round((spent / b.monthlyLimit) * 100);
          const isOver = spent >= b.monthlyLimit; // %100+
          const isWarning80 = !isOver && ratio >= 80; // %80 - %99
          const remaining = b.monthlyLimit - spent;

          return (
            <div
              key={b.category}
              className={`p-3 rounded-xl border transition ${
                isOver
                  ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 ring-2 ring-rose-500/25'
                  : isWarning80
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 ring-2 ring-amber-500/20'
                  : 'bg-white dark:bg-slate-900/80 border-[#E2E8F0] dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-[#0F172A] dark:text-white block">
                      {b.category}
                    </span>
                    {isOver && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-white bg-rose-600 px-1.5 py-0.2 rounded shadow-xs">
                        <AlertOctagon className="w-3 h-3 text-white" />
                        %100+ Aşıldı
                      </span>
                    )}
                    {isWarning80 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-amber-500 px-1.5 py-0.2 rounded shadow-xs">
                        <AlertTriangle className="w-3 h-3 text-white" />
                        %80+ Eşiğinde
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#64748B] dark:text-slate-400">
                    {formatCurrency(spent)} / {formatCurrency(b.monthlyLimit)}
                  </span>
                </div>

                <div className="text-right">
                  {isOver ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-600 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-500/20 px-2 py-0.5 rounded-lg">
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
                      Aşım: +{formatCurrency(Math.abs(remaining))}
                    </span>
                  ) : isWarning80 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-lg">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      %{ratio} (Kalan: {formatCurrency(remaining)})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      %{ratio} (Kalan: {formatCurrency(remaining)})
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar with %80 and %100 indicators */}
              <div className="space-y-1">
                <div className="relative w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  {/* 80% threshold marker line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-10 opacity-80"
                    style={{ left: '80%' }}
                    title="%80 Uyarı Çizgisi"
                  />
                  {/* 100% threshold marker line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10 opacity-80"
                    style={{ left: '100%' }}
                    title="%100 Aşım Sınırı"
                  />
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver ? 'bg-rose-500' : isWarning80 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(ratio, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[9px] text-[#64748B] dark:text-slate-500 font-mono">
                  <span>%0</span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">| %80 Eşik</span>
                  <span className="text-rose-600 dark:text-rose-400 font-semibold">| %100 Sınır</span>
                  <span className={isOver ? 'text-rose-600 font-bold' : isWarning80 ? 'text-amber-600 font-bold' : ''}>%{ratio}</span>
                </div>
              </div>
            </div>
          );
        })}

        {budgets.length === 0 && (
          <div className="text-center py-6 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Henüz kategori bütçe limiti belirlenmedi.
            </p>
            <button
              onClick={handleOpenEdit}
              className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Bütçe Limitleri Ekle
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-[#0F172A] dark:text-white">
                  Kategori Harcama Limitlerini Belirle
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-4 space-y-4 overflow-y-auto flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#64748B] dark:text-slate-400">
                  Her ay için hedeflediğiniz azami harcama tutarlarını girin.
                </p>
                <button
                  type="button"
                  onClick={handleApplyPresets}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline shrink-0"
                >
                  <Sparkles className="w-3 h-3" />
                  Örnek Limitler
                </button>
              </div>

              <div className="space-y-3">
                {ALL_CATEGORIES.map((cat) => {
                  const currentObj = editingBudgets.find((b) => b.category === cat);
                  const limitVal = currentObj ? currentObj.monthlyLimit : 0;

                  return (
                    <div
                      key={cat}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800"
                    >
                      <label className="text-xs font-medium text-[#0F172A] dark:text-slate-200">
                        {cat}
                      </label>
                      <div className="flex items-center gap-1.5 w-36">
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={limitVal || ''}
                          placeholder="Limit (TL)"
                          onChange={(e) =>
                            handleLimitChange(cat, parseInt(e.target.value) || 0)
                          }
                          className="w-full text-xs p-1.5 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-amber-500 text-right"
                        />
                        <span className="text-xs text-[#64748B]">₺</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#64748B] hover:text-[#0F172A] dark:hover:text-white rounded-xl"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition"
                >
                  Kaydet & Uygula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
