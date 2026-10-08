import React from 'react';
import { Expense, Income } from '../types';
import { formatCurrency } from '../utils/storage';
import { PieChart, CheckCircle2, AlertTriangle, Info, ArrowUpRight } from 'lucide-react';

interface FiftyThirtyTwentyCardProps {
  incomes: Income[];
  expenses: Expense[];
}

export const FiftyThirtyTwentyCard: React.FC<FiftyThirtyTwentyCardProps> = ({
  incomes,
  expenses,
}) => {
  const currentMonthKey = new Date().toISOString().slice(0, 7);

  const monthlyIncomes = incomes.filter(
    (i) => i.date && i.date.startsWith(currentMonthKey)
  );
  const totalIncome = monthlyIncomes.reduce((sum, i) => sum + i.amount, 0);

  const monthlyExpenses = expenses.filter(
    (e) => e.date && e.date.startsWith(currentMonthKey)
  );

  // Group into Needs (İhtiyaçlar) vs Wants (İstekler)
  // Needs: isMandatory || Kira & Konut || Fatura & Abonelik || Sağlık & Bakım || Zorunlu Ödeme
  let needsAmount = 0;
  let wantsAmount = 0;

  monthlyExpenses.forEach((exp) => {
    const isNeed =
      exp.isMandatory ||
      exp.category === 'Kira & Konut' ||
      exp.category === 'Fatura & Abonelik' ||
      exp.category === 'Sağlık & Bakım' ||
      exp.category === 'Zorunlu Ödeme';

    if (isNeed) {
      needsAmount += exp.amount;
    } else {
      wantsAmount += exp.amount;
    }
  });

  const totalExpense = needsAmount + wantsAmount;
  const savingsAmount = Math.max(0, totalIncome - totalExpense);

  // Percentages relative to income (or total outlays if income is 0)
  const baseForPercent = totalIncome > 0 ? totalIncome : Math.max(1, totalExpense);

  const needsPercent = Math.round((needsAmount / baseForPercent) * 100);
  const wantsPercent = Math.round((wantsAmount / baseForPercent) * 100);
  const savingsPercent = Math.round((savingsAmount / baseForPercent) * 100);

  // Target amounts
  const targetNeeds = Math.round(totalIncome * 0.5);
  const targetWants = Math.round(totalIncome * 0.3);
  const targetSavings = Math.round(totalIncome * 0.2);

  return (
    <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
              50/30/20 Kuralı Bütçe Dengesi
            </h2>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400">
              Gelirinizin İhtiyaçlar (%50), İstekler (%30) ve Birikim (%20) dağılımı
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-slate-300 border border-[#E2E8F0] dark:border-slate-700">
          Altın Oran
        </span>
      </div>

      {/* Comparison Visual Bars */}
      <div className="space-y-3 mb-5">
        {/* Ideal Target Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400 mb-1">
            <span className="font-medium">İdeal 50 / 30 / 20 Dağılımı</span>
            <span className="text-[11px] font-mono">%50 • %30 • %20</span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800">
            <div
              style={{ width: '50%' }}
              className="bg-blue-500 h-full"
              title="İhtiyaçlar: %50"
            />
            <div
              style={{ width: '30%' }}
              className="bg-amber-500 h-full"
              title="İstekler: %30"
            />
            <div
              style={{ width: '20%' }}
              className="bg-emerald-500 h-full"
              title="Birikim: %20"
            />
          </div>
        </div>

        {/* Current Reality Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400 mb-1">
            <span className="font-medium text-[#0F172A] dark:text-white">
              Sizin Bu Ayki Dağılımınız
            </span>
            <span className="text-[11px] font-mono font-semibold text-[#0F172A] dark:text-slate-200">
              %{needsPercent} • %{wantsPercent} • %{savingsPercent}
            </span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800">
            <div
              style={{ width: `${Math.min(needsPercent, 100)}%` }}
              className="bg-blue-500 h-full transition-all duration-500"
              title={`İhtiyaçlar: %${needsPercent}`}
            />
            <div
              style={{ width: `${Math.min(wantsPercent, 100 - needsPercent)}%` }}
              className="bg-amber-500 h-full transition-all duration-500"
              title={`İstekler: %${wantsPercent}`}
            />
            <div
              style={{
                width: `${Math.max(
                  0,
                  Math.min(savingsPercent, 100 - needsPercent - wantsPercent)
                )}%`,
              }}
              className="bg-emerald-500 h-full transition-all duration-500"
              title={`Birikim: %${savingsPercent}`}
            />
          </div>
        </div>
      </div>

      {/* 3 Detail Segment Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Needs (%50) */}
        <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
              1. İhtiyaçlar (%50)
            </span>
            <span className="text-xs font-mono font-extrabold text-blue-800 dark:text-blue-200">
              %{needsPercent}
            </span>
          </div>
          <p className="text-base font-black text-[#0F172A] dark:text-white">
            {formatCurrency(needsAmount)}
          </p>
          <div className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Hedef Tavan:</span>
            <span className="font-semibold">{formatCurrency(targetNeeds)}</span>
          </div>
          <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1.5 font-medium">
            {needsPercent <= 50
              ? '✓ İdeal tavanın altında, çok dengeli.'
              : '⚠️ %50 sınırını aştı, sabit giderleri inceleyin.'}
          </p>
        </div>

        {/* Wants (%30) */}
        <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
              2. İstekler (%30)
            </span>
            <span className="text-xs font-mono font-extrabold text-amber-800 dark:text-amber-200">
              %{wantsPercent}
            </span>
          </div>
          <p className="text-base font-black text-[#0F172A] dark:text-white">
            {formatCurrency(wantsAmount)}
          </p>
          <div className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Hedef Tavan:</span>
            <span className="font-semibold">{formatCurrency(targetWants)}</span>
          </div>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1.5 font-medium">
            {wantsPercent <= 30
              ? '✓ Kontrollü keyfi harcama.'
              : '⚠️ İstekler %30 sınırını aşıyor, tasarruf potansiyeli var.'}
          </p>
        </div>

        {/* Savings (%20) */}
        <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
              3. Birikim (%20)
            </span>
            <span className="text-xs font-mono font-extrabold text-emerald-800 dark:text-emerald-200">
              %{savingsPercent}
            </span>
          </div>
          <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(savingsAmount)}
          </p>
          <div className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Hedef Taban:</span>
            <span className="font-semibold">{formatCurrency(targetSavings)}</span>
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium">
            {savingsPercent >= 20
              ? '✓ Tebrikler! %20 birikim hedefi yakalandı.'
              : '⚠️ Birikim hedefi olan %20\'nin altında.'}
          </p>
        </div>
      </div>
    </div>
  );
};
