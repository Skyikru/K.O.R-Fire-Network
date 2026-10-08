import React from 'react';
import { AppData } from '../types';
import { formatCurrency, calculateMinCardPayment, getTodayString } from '../utils/storage';
import { ShieldCheck, AlertCircle, CheckCircle, Flame, ArrowUpRight, Clock, Coffee } from 'lucide-react';

interface SafeToSpendCardProps {
  data: AppData;
  onOpenQuickExpense?: () => void;
}

export const SafeToSpendCard: React.FC<SafeToSpendCardProps> = ({
  data,
  onOpenQuickExpense,
}) => {
  const todayStr = getTodayString();
  const currentMonthKey = todayStr.slice(0, 7);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const currentDay = now.getDate();
  const daysRemaining = Math.max(1, totalDaysInMonth - currentDay + 1);

  // 1. Monthly Total Income
  const monthlyIncomes = data.incomes.filter(
    (i) => i.date && i.date.startsWith(currentMonthKey)
  );
  const totalIncome = monthlyIncomes.reduce((sum, i) => sum + i.amount, 0);

  // 2. Mandatory Monthly Obligations
  const monthlyExpenses = data.expenses.filter(
    (e) => e.date && e.date.startsWith(currentMonthKey)
  );

  const mandatoryExpenses = monthlyExpenses
    .filter((e) => e.isMandatory)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalCardsMin = data.cards.reduce((sum, c) => sum + calculateMinCardPayment(c), 0);

  const totalInstallmentsMonthly = (data.installments || []).reduce(
    (sum, inst) => (inst.remainingInstallments > 0 ? sum + inst.monthlyAmount : sum),
    0
  );

  const totalSubscriptionsMonthly = (data.subscriptions || []).reduce(
    (sum, s) => (s.status === 'active' ? sum + s.amount : sum),
    0
  );

  const totalObligations =
    mandatoryExpenses + totalCardsMin + totalInstallmentsMonthly + totalSubscriptionsMonthly;

  // Past expenses this month (excluding today and excluding mandatory)
  const pastDiscretionaryExpenses = monthlyExpenses
    .filter((e) => !e.isMandatory && e.date < todayStr)
    .reduce((sum, e) => sum + e.amount, 0);

  // Net remaining free pool for the rest of the month
  const netRemainingPool = Math.max(
    0,
    totalIncome - totalObligations - pastDiscretionaryExpenses
  );

  // Daily Allowance Target for today
  const dailyTargetAllowance = Math.round(netRemainingPool / daysRemaining);

  // Today's total spending (all expenses logged today)
  const todayExpenses = monthlyExpenses.filter((e) => e.date === todayStr);
  const todaySpentTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Remaining Safe to Spend for Today
  const remainingTodayAllowance = dailyTargetAllowance - todaySpentTotal;
  const isOverToday = remainingTodayAllowance < 0;
  const isClose = !isOverToday && remainingTodayAllowance <= dailyTargetAllowance * 0.25;

  // Progress percentage of today's limit
  const todayProgressPercent =
    dailyTargetAllowance > 0
      ? Math.round((todaySpentTotal / dailyTargetAllowance) * 100)
      : todaySpentTotal > 0
      ? 100
      : 0;

  return (
    <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isOverToday
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                : isClose
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                Bugünkü Güvenli Harçlığım (Safe-to-Spend)
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isOverToday
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20'
                    : isClose
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                }`}
              >
                {isOverToday
                  ? `Limit Aşıldı`
                  : isClose
                  ? `Limite Yaklaşıldı`
                  : `Güvendesiniz`}
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400">
              Kira ve borçlar ayrıldıktan sonra ayın kalan {daysRemaining} günü için günlük serbest harcama hakkınız
            </p>
          </div>
        </div>

        {onOpenQuickExpense && (
          <button
            onClick={onOpenQuickExpense}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-200 border border-[#E2E8F0] dark:border-slate-700 transition active:scale-95 self-start sm:self-auto"
          >
            <span>Harcama Yaz</span>
          </button>
        )}
      </div>

      {/* Main Metric Banner */}
      <div
        className={`p-4 rounded-xl border mb-4 transition-all ${
          isOverToday
            ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
            : isClose
            ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
            : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400 block mb-0.5">
              Bugün Kalan Güvenli Harçlık
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl sm:text-3xl font-black tracking-tight ${
                  isOverToday
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {formatCurrency(remainingTodayAllowance)}
              </span>
              <span className="text-xs font-medium text-[#64748B]">
                / {formatCurrency(dailyTargetAllowance)} günlük limit
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] text-[#64748B] dark:text-slate-400 block">
              Bugün Harcanan Tutar:
            </span>
            <span className="text-base font-bold text-[#0F172A] dark:text-white">
              {formatCurrency(todaySpentTotal)}
            </span>
            <span className="text-[10px] text-[#64748B] block mt-0.5">
              {todayExpenses.length} işlem
            </span>
          </div>
        </div>

        {/* Daily Progress Bar */}
        <div className="mt-3">
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverToday
                  ? 'bg-rose-500'
                  : isClose
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(todayProgressPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Insight & Tomorrow's Projection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800 flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#0F172A] dark:text-white block">
              Ay Sonuna Kalan: {daysRemaining} Gün
            </span>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5 leading-snug">
              Kalan toplam serbest bütçe: {formatCurrency(netRemainingPool)}.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800 flex items-start gap-2.5">
          <Coffee className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#0F172A] dark:text-white block">
              Tasarruf Projeksiyonu
            </span>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5 leading-snug">
              {isOverToday
                ? `Bugün aşım yaptığınız tutar yarından itibaren günlük harçlığınızı yaklaşık ${formatCurrency(Math.round(Math.abs(remainingTodayAllowance) / (daysRemaining - 1 || 1)))} azaltabilir.`
                : `Bugün kalan ${formatCurrency(remainingTodayAllowance)} harcanmazsa, yarınki harçlığınıza aktarılır.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
