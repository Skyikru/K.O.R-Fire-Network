import React, { useState, useMemo } from 'react';
import { AppData, ExpenseCategory } from '../types';
import { formatCurrency, calculateMinCardPayment } from '../utils/storage';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  Repeat,
  Flame,
  Info,
  CheckCircle2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
} from 'lucide-react';

interface NextMonthForecastCardProps {
  data: AppData;
  onOpenQuickExpense?: () => void;
}

type ForecastScenario = 'baseline' | 'frugal' | 'cautious';

export const NextMonthForecastCard: React.FC<NextMonthForecastCardProps> = ({
  data,
  onOpenQuickExpense,
}) => {
  const [scenario, setScenario] = useState<ForecastScenario>('baseline');
  const [showDetailBreakdown, setShowDetailBreakdown] = useState(false);

  // Calculate target next month date & name in Turkish
  const { currentMonthKey, nextMonthName, daysInCurrentMonth, currentDay } = useMemo(() => {
    const now = new Date();
    const currKey = now.toISOString().slice(0, 7); // YYYY-MM
    const nextDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthName = nextDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
    const daysInCurr = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const cDay = Math.max(1, now.getDate());

    return {
      currentMonthKey: currKey,
      nextMonthName: monthName,
      daysInCurrentMonth: daysInCurr,
      currentDay: cDay,
    };
  }, []);

  // Forecast Engine Calculations
  const forecast = useMemo(() => {
    // 1. Current month expenses so far
    const currentMonthExpenses = data.expenses.filter(
      (e) => e.date && e.date.startsWith(currentMonthKey)
    );
    const currentMonthSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Current daily spending velocity (run-rate)
    const dailyVelocity = currentMonthSpent / currentDay;
    const projectedCurrentMonthSpend = Math.round(dailyVelocity * daysInCurrentMonth);

    // 2. Previous months expenses (last 1-3 months for moving averages)
    const now = new Date();
    const prevMonthKeys = [1, 2, 3].map((offset) => {
      const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });

    const pastMonthsSpends = prevMonthKeys.map((key) => {
      const exps = data.expenses.filter((e) => e.date && e.date.startsWith(key));
      return exps.reduce((sum, e) => sum + e.amount, 0);
    }).filter((amount) => amount > 0);

    const prevMonthSpend = pastMonthsSpends[0] || currentMonthSpent;

    // 3. Known Fixed Commitments for Next Month:
    // a) Subscriptions
    const subscriptionsTotal = (data.subscriptions || [])
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => sum + s.amount, 0);

    // b) Card minimum payments
    const cardsMinTotal = data.cards.reduce(
      (sum, card) => sum + calculateMinCardPayment(card),
      0
    );

    // c) Installments (check installments active next month)
    const activeInstallments = (data.installments || []).filter(
      (inst) => inst.remainingInstallments > 0
    );
    const installmentsTotal = activeInstallments.reduce((sum, inst) => sum + inst.monthlyAmount, 0);

    // Count installments ending next month
    const endingInstallments = activeInstallments.filter((inst) => inst.remainingInstallments === 1);

    // d) Daily Routines (e.g. coffee, bus, habits * 30 days)
    const routinesDailySum = (data.dailyRoutines || []).reduce((sum, r) => sum + r.amount, 0);
    const routinesMonthlyTotal = routinesDailySum * 30;

    // Total fixed unavoidable commitments
    const totalFixedCommitments =
      subscriptionsTotal + cardsMinTotal + installmentsTotal + routinesMonthlyTotal;

    // 4. Variable spending estimation:
    // Historical variable spending = total spend - fixed commitments
    let estimatedVariableBase = 0;

    if (pastMonthsSpends.length > 0) {
      // Weighted moving average: 50% current projected, 35% last month, 15% older
      const weightedTotal =
        projectedCurrentMonthSpend * 0.5 +
        (pastMonthsSpends[0] || projectedCurrentMonthSpend) * 0.35 +
        (pastMonthsSpends[1] || pastMonthsSpends[0] || projectedCurrentMonthSpend) * 0.15;
      
      estimatedVariableBase = Math.max(0, weightedTotal - totalFixedCommitments);
    } else {
      // Fallback based on current month velocity
      estimatedVariableBase = Math.max(0, projectedCurrentMonthSpend - totalFixedCommitments);
      if (estimatedVariableBase === 0 && currentMonthSpent > 0) {
        estimatedVariableBase = currentMonthSpent * 0.7;
      }
    }

    // Apply scenario adjustment:
    // baseline = 100% of trend
    // frugal = -15% variable spending (active savings)
    // cautious = +12% variable spending (inflation & buffer)
    let scenarioMultiplier = 1;
    if (scenario === 'frugal') scenarioMultiplier = 0.85;
    if (scenario === 'cautious') scenarioMultiplier = 1.12;

    const adjustedVariableSpend = Math.round(estimatedVariableBase * scenarioMultiplier);
    const totalEstimatedSpend = Math.round(totalFixedCommitments + adjustedVariableSpend);

    // 5. Comparison & Trend
    const compareBase = projectedCurrentMonthSpend > 0 ? projectedCurrentMonthSpend : prevMonthSpend;
    const diffAmount = totalEstimatedSpend - compareBase;
    const diffPercent = compareBase > 0 ? Math.round((diffAmount / compareBase) * 100) : 0;
    const isIncrease = diffAmount > 0;

    // 6. Expected Incomes for Next Month (based on salary & recurring incomes)
    const currentMonthIncomes = data.incomes.filter(
      (i) => i.date && i.date.startsWith(currentMonthKey)
    );
    const totalCurrentIncome = currentMonthIncomes.reduce((sum, i) => sum + i.amount, 0);
    const expectedIncome = totalCurrentIncome > 0 ? totalCurrentIncome : 45000;
    const expectedRemainingBudget = expectedIncome - totalEstimatedSpend;

    // 7. Top Spending Categories projection
    const categoryTotals: Record<string, number> = {};
    const relevantExpenses = data.expenses.slice(0, 150);
    relevantExpenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const totalTracked = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([cat, amt]) => {
        const share = totalTracked > 0 ? amt / totalTracked : 0.25;
        const predictedAmount = Math.round(totalEstimatedSpend * share);
        return {
          category: cat as ExpenseCategory,
          sharePercent: Math.round(share * 100),
          predictedAmount,
        };
      });

    return {
      currentMonthSpent,
      projectedCurrentMonthSpend,
      dailyVelocity,
      totalFixedCommitments,
      subscriptionsTotal,
      cardsMinTotal,
      installmentsTotal,
      routinesMonthlyTotal,
      endingInstallments,
      adjustedVariableSpend,
      totalEstimatedSpend,
      diffAmount,
      diffPercent,
      isIncrease,
      expectedIncome,
      expectedRemainingBudget,
      topCategories,
    };
  }, [data, currentMonthKey, currentDay, daysInCurrentMonth, scenario]);

  // Fixed vs Variable Ratio
  const fixedRatio =
    forecast.totalEstimatedSpend > 0
      ? Math.min(100, Math.round((forecast.totalFixedCommitments / forecast.totalEstimatedSpend) * 100))
      : 40;
  const variableRatio = Math.max(0, 100 - fixedRatio);

  return (
    <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                Gelecek Ay Tahmini
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
                AI / Trend Projeksiyonu
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400 capitalize">
              {nextMonthName} • Harcama hızı ve sabit yükümlülük analizleri
            </p>
          </div>
        </div>

        {/* Scenario Toggle Buttons */}
        <div className="bg-slate-100 dark:bg-slate-900/80 p-0.5 rounded-xl border border-[#E2E8F0] dark:border-slate-800 flex items-center gap-1 self-start sm:self-center text-xs">
          <button
            onClick={() => setScenario('frugal')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              scenario === 'frugal'
                ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Değişken harcamalarda %15 tasarruf hedefi"
          >
            Tasarruflu
          </button>
          <button
            onClick={() => setScenario('baseline')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              scenario === 'baseline'
                ? 'bg-white dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Mevcut trend hızına dayalı gerçekçi beklenti"
          >
            Standart Trend
          </button>
          <button
            onClick={() => setScenario('cautious')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              scenario === 'cautious'
                ? 'bg-white dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Beklenmedik harcamalar için %12 güvenlik tamponu"
          >
            Tedbirli (+%12)
          </button>
        </div>
      </div>

      {/* Main Metric Spotlight Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-900/20 border border-[#E2E8F0] dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Big Forecast Amount */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
              Tahmini Toplam Harcama
            </span>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium capitalize">
              ({nextMonthName})
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
              {formatCurrency(forecast.totalEstimatedSpend)}
            </span>

            {/* Trend Badge */}
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                forecast.isIncrease
                  ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/40'
                  : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
              }`}
            >
              {forecast.isIncrease ? (
                <>
                  <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
                  <span>+%{forecast.diffPercent} artış eğilimi</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3.5 h-3.5 text-emerald-500" />
                  <span>-%{Math.abs(forecast.diffPercent)} tasarruf sinyali</span>
                </>
              )}
            </div>
          </div>

          <p className="text-xs text-[#64748B] dark:text-slate-400 pt-0.5">
            Bu ayki günlük ortalama ({formatCurrency(Math.round(forecast.dailyVelocity))}/gün) ve kayıtlı sabit ödemelerine göre hesaplandı.
          </p>
        </div>

        {/* Right: Net Expected Free Cash */}
        <div className="md:text-right border-t md:border-t-0 md:border-l border-[#E2E8F0] dark:border-slate-800 pt-3 md:pt-0 md:pl-5 space-y-1 shrink-0">
          <span className="text-xs font-medium text-[#64748B] dark:text-slate-400 block">
            Önümüzdeki Ay Beklenen Net Kalan
          </span>
          <div
            className={`text-lg sm:text-xl font-bold tracking-tight ${
              forecast.expectedRemainingBudget >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {forecast.expectedRemainingBudget >= 0 ? '+' : ''}
            {formatCurrency(forecast.expectedRemainingBudget)}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
            {forecast.expectedRemainingBudget >= 0
              ? 'Tasarruf ve birikime ayrılabilecek serbest pay'
              : 'Dikkat: Tahmin geliri aşıyor, tasarruf önerilir'}
          </span>
        </div>
      </div>

      {/* Visual Composition Bar: Fixed vs Variable */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-[#0F172A] dark:text-slate-300 flex items-center gap-1.5">
            <Repeat className="w-3.5 h-3.5 text-amber-500" />
            Sabit & Kaçınılmaz: <strong className="font-bold">{formatCurrency(forecast.totalFixedCommitments)}</strong> (%{fixedRatio})
          </span>
          <span className="text-[#0F172A] dark:text-slate-300 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-purple-500" />
            Tahmini Değişken: <strong className="font-bold">{formatCurrency(forecast.adjustedVariableSpend)}</strong> (%{variableRatio})
          </span>
        </div>

        {/* Dual Progress Bar */}
        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-amber-500 dark:bg-amber-400 transition-all duration-300"
            style={{ width: `${fixedRatio}%` }}
            title={`Sabit Giderler: ${formatCurrency(forecast.totalFixedCommitments)}`}
          />
          <div
            className="h-full bg-purple-500 dark:bg-purple-400 transition-all duration-300"
            style={{ width: `${variableRatio}%` }}
            title={`Değişken Giderler: ${formatCurrency(forecast.adjustedVariableSpend)}`}
          />
        </div>
      </div>

      {/* Breakdown Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        {/* 1. Kredi Kartı Asgarileri */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800 space-y-1">
          <span className="text-[11px] text-[#64748B] dark:text-slate-400 block">Kart Asgarileri</span>
          <div className="font-bold text-[#0F172A] dark:text-white text-sm">
            {formatCurrency(forecast.cardsMinTotal)}
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            {data.cards.length} kart borcu
          </span>
        </div>

        {/* 2. Taksitli Borçlar */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800 space-y-1">
          <span className="text-[11px] text-[#64748B] dark:text-slate-400 block">Kredili Taksitler</span>
          <div className="font-bold text-[#0F172A] dark:text-white text-sm">
            {formatCurrency(forecast.installmentsTotal)}
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            {(data.installments || []).filter((i) => i.remainingInstallments > 0).length} aktif taksit
          </span>
        </div>

        {/* 3. Dijital Abonelikler */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800 space-y-1">
          <span className="text-[11px] text-[#64748B] dark:text-slate-400 block">Abonelikler</span>
          <div className="font-bold text-[#0F172A] dark:text-white text-sm">
            {formatCurrency(forecast.subscriptionsTotal)}
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            {(data.subscriptions || []).filter((s) => s.status === 'active').length} dijital servis
          </span>
        </div>

        {/* 4. Günlük Rutinler (Otobüs / Sigara vb) */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800 space-y-1">
          <span className="text-[11px] text-[#64748B] dark:text-slate-400 block">Günlük Rutinler (30g)</span>
          <div className="font-bold text-[#0F172A] dark:text-white text-sm">
            {formatCurrency(forecast.routinesMonthlyTotal)}
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            {(data.dailyRoutines || []).length} kayıtlı rutin
          </span>
        </div>
      </div>

      {/* Top Predicted Categories Preview */}
      {forecast.topCategories.length > 0 && (
        <div className="pt-2 border-t border-[#E2E8F0] dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#0F172A] dark:text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Gelecek Ay En Yüksek Harcanması Beklenen Alanlar
            </span>
            <button
              onClick={() => setShowDetailBreakdown(!showDetailBreakdown)}
              className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline font-medium"
            >
              {showDetailBreakdown ? 'Gizle' : 'Kategori Dağılımını Göster'}
            </button>
          </div>

          {showDetailBreakdown && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 animate-fadeIn">
              {forecast.topCategories.map((item) => (
                <div
                  key={item.category}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                    <span className="font-medium text-[#0F172A] dark:text-white truncate">
                      {item.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#0F172A] dark:text-white">
                      {formatCurrency(item.predictedAmount)}
                    </span>
                    <span className="text-[10px] text-[#64748B] dark:text-slate-400 block">
                      ~%{item.sharePercent} pay
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Smart Predictive Advice Callout */}
      <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
        <div className="text-[#1E293B] dark:text-purple-200 space-y-1">
          <p className="font-semibold text-purple-950 dark:text-purple-100">
            💡 Gelecek Ay İçin Akıllı Bütçe Tavsiyesi
          </p>
          <p className="text-[11px] leading-relaxed text-purple-900/90 dark:text-purple-300">
            {forecast.endingInstallments.length > 0 ? (
              <span>
                Önümüzdeki ay biten <strong>{forecast.endingInstallments.length} adet</strong> taksitiniz bulunuyor. Bir sonraki ay aylık bütçeniz{' '}
                <strong>{formatCurrency(forecast.endingInstallments.reduce((sum, i) => sum + i.monthlyAmount, 0))}</strong> rahatlayacak!
              </span>
            ) : forecast.expectedRemainingBudget < 0 ? (
              <span>
                Mevcut harcama hızı devam ederse önümüzdeki ay yaklaşık{' '}
                <strong>{formatCurrency(Math.abs(forecast.expectedRemainingBudget))}</strong> açık verebilirsiniz. Değişken harcamalarınızı %10-15 kısarak bütçenizi dengeleyebilirsiniz.
              </span>
            ) : (
              <span>
                Mevcut harcama temponuz bütçenizle uyumlu. Gelecek ay beklenen yaklaşık{' '}
                <strong>{formatCurrency(forecast.expectedRemainingBudget)}</strong> serbest nakdi birikim hedeflerinize veya acil durum fonunuza aktarabilirsiniz.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
