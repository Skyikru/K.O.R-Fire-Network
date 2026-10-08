import React, { useState } from 'react';
import {
  AppData,
  NavTab,
  CategoryBudget,
  EmergencyFund,
  InstallmentLoan,
  DailyRoutineExpense,
  SavingsGoal,
  SubscriptionItem,
  FixedExpenseItem,
} from '../types';
import {
  formatCurrency,
  calculateMinCardPayment,
  formatDateTurkish,
  getBudgetCycleDates,
  isDateInBudgetCycle,
} from '../utils/storage';
import { FinancialTipsCard } from './FinancialTipsCard';
import { SmartTipCard } from './SmartTipCard';
import { BudgetStatusCard } from './BudgetStatusCard';
import { ExpensePieChart } from './ExpensePieChart';
import { MonthlyTrendChart } from './MonthlyTrendChart';
import { NextMonthForecastCard } from './NextMonthForecastCard';
import { FinancialHealthScoreCard } from './FinancialHealthScoreCard';
import { CategoryBudgetCard } from './CategoryBudgetCard';
import { FiftyThirtyTwentyCard } from './FiftyThirtyTwentyCard';
import { EmergencyFundCard } from './EmergencyFundCard';
import { InstallmentLoansManager } from './InstallmentLoansManager';
import { SafeToSpendCard } from './SafeToSpendCard';
import { DailyRoutineExpensesCard } from './DailyRoutineExpensesCard';
import { SavingsGoalsManager } from './SavingsGoalsManager';
import { YearlySavingsProgressCard } from './YearlySavingsProgressCard';
import { SubscriptionsManager } from './SubscriptionsManager';
import { FixedExpensesManager } from './FixedExpensesManager';
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Flame,
  PlusCircle,
  Mic,
  Search,
  FileText,
  Smartphone,
  BarChart3,
  Target,
  Layers,
  Zap,
} from 'lucide-react';

interface DashboardViewProps {
  data: AppData;
  onNavigate: (tab: NavTab) => void;
  onOpenQuickIncome: () => void;
  onOpenQuickExpense: () => void;
  onToggleTask: (taskId: string) => void;
  onToggleHabitToday: (habitId: string) => void;
  onOpenVoiceModal?: () => void;
  onOpenBankSmsModal?: () => void;
  onOpenSearch?: () => void;
  onOpenReportModal?: () => void;
  onSaveBudgets?: (budgets: CategoryBudget[]) => void;
  onUpdateEmergencyFund?: (fund: EmergencyFund) => void;
  onAddInstallment?: (inst: Omit<InstallmentLoan, 'id'>) => void;
  onPayInstallment?: (id: string) => void;
  onDeleteInstallment?: (id: string) => void;
  onLogRoutineExpense?: (routine: DailyRoutineExpense) => void;
  onRewardAvoidedHabit?: (routine: DailyRoutineExpense) => void;
  onSaveRoutines?: (newRoutines: DailyRoutineExpense[]) => void;
  onSaveGoals?: (newGoals: SavingsGoal[]) => void;
  onSaveSubscriptions?: (newSubs: SubscriptionItem[]) => void;
  onSaveFixedExpenses?: (newFixed: FixedExpenseItem[]) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  onNavigate,
  onOpenQuickIncome,
  onOpenQuickExpense,
  onToggleTask,
  onToggleHabitToday,
  onOpenVoiceModal,
  onOpenBankSmsModal,
  onOpenSearch,
  onOpenReportModal,
  onSaveBudgets,
  onUpdateEmergencyFund,
  onAddInstallment,
  onPayInstallment,
  onDeleteInstallment,
  onLogRoutineExpense,
  onRewardAvoidedHabit,
  onSaveRoutines,
  onSaveGoals,
  onSaveSubscriptions,
  onSaveFixedExpenses,
}) => {
  const [dashboardSection, setDashboardSection] = useState<'daily' | 'analytics' | 'goals' | 'all'>('daily');
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const todayStr = new Date().toISOString().split('T')[0];

  const payday = data.settings.paydayDay || 1;
  const cycleInfo = getBudgetCycleDates(payday);

  // 1. Bu Dönem Cebine Giren (Aylık / Maaş Döngüsü toplam gelir)
  const monthlyIncomes = data.incomes.filter((item) =>
    payday > 1
      ? isDateInBudgetCycle(item.date, payday)
      : item.date.startsWith(currentMonth)
  );
  const totalIncome = monthlyIncomes.reduce((sum, item) => sum + item.amount, 0);

  // 2. Bu Dönem Cebinden Çıkan (Aylık / Maaş Döngüsü gerçekleşen toplam gider)
  const monthlyExpenses = data.expenses.filter((item) =>
    payday > 1
      ? isDateInBudgetCycle(item.date, payday)
      : item.date.startsWith(currentMonth)
  );
  const totalExpense = monthlyExpenses.reduce((sum, item) => sum + item.amount, 0);

  // Zorunlu giderler (kiralar, faturalar vs.)
  const mandatoryExpenses = monthlyExpenses
    .filter((item) => item.isMandatory)
    .reduce((sum, item) => sum + item.amount, 0);

  // 3. Borçların asgari ödemeleri
  const totalCardsMinPayment = data.cards.reduce((sum, card) => {
    return sum + calculateMinCardPayment(card);
  }, 0);

  // 'Bu Ay Minimum Ödemen Gereken': Vadesi bu ay dolan zorunlu giderler + borçların asgari ödemeleri toplamı
  const minRequiredPayment = mandatoryExpenses + totalCardsMinPayment;

  // 'Kalan Net Bütçe': Gelir - (Minimum Zorunlu Ödemeler + Güncel Harcamalar)
  const remainingNetBudget = totalIncome - (totalExpense + totalCardsMinPayment);

  // Görevler İlerleme Oranı
  const todayTasks = data.tasks;
  const completedTasksCount = todayTasks.filter((t) => t.completed).length;
  const taskProgressPercent =
    todayTasks.length > 0 ? Math.round((completedTasksCount / todayTasks.length) * 100) : 0;

  // Kategori bütçesi %80 ve %100 limit kontrolleri
  const currentMonthPrefix = new Date().toISOString().slice(0, 7);
  const currentMonthExpenses = data.expenses.filter(
    (e) => e.date && e.date.startsWith(currentMonthPrefix)
  );
  const catSpentMap: Record<string, number> = {};
  currentMonthExpenses.forEach((e) => {
    catSpentMap[e.category] = (catSpentMap[e.category] || 0) + e.amount;
  });

  const categoryBudgetAlerts = (data.categoryBudgets || []).map((b) => {
    const spent = catSpentMap[b.category] || 0;
    const ratio = b.monthlyLimit > 0 ? Math.round((spent / b.monthlyLimit) * 100) : 0;
    const isExceeded = spent >= b.monthlyLimit; // %100 ve üzeri
    const isWarning80 = !isExceeded && ratio >= 80; // %80 - %99
    return {
      category: b.category,
      monthlyLimit: b.monthlyLimit,
      spent,
      ratio,
      isExceeded,
      isWarning80,
      remaining: b.monthlyLimit - spent,
    };
  });

  const categoriesExceeded100 = categoryBudgetAlerts.filter((b) => b.isExceeded);
  const categoriesWarning80 = categoryBudgetAlerts.filter((b) => b.isWarning80);

  // Akıllı Finansal Durum Mesajı
  const getFinancialInsight = () => {
    if (totalIncome === 0 && totalExpense === 0 && data.cards.length === 0) {
      return {
        type: 'info' as const,
        title: 'Veri Girişine Hazır',
        message:
          'Henüz bu aya ait bir gelir veya harcama girilmedi. Finans sekmesinden ilk kayıtlarınızı ekleyerek anlık analizi başlatabilirsiniz.',
      };
    }

    // 1. Kritik: Kategori Limiti %100 ve üzeri aşıldıysa
    if (categoriesExceeded100.length > 0) {
      const topExceeded = categoriesExceeded100[0];
      return {
        type: 'danger' as const,
        title: `Kritik Bütçe Aşımı (%100+): "${topExceeded.category}" Limiti Aşıldı!`,
        message: `${topExceeded.category} harcamanız (${formatCurrency(topExceeded.spent)}) aylık tavanı (${formatCurrency(topExceeded.monthlyLimit)}) +${formatCurrency(Math.abs(topExceeded.remaining))} aştı.${categoriesExceeded100.length > 1 ? ` Toplam ${categoriesExceeded100.length} kategoride bütçe aşıldı.` : ''} Bu kategoride yeni harcamaları durdurmanız önerilir.`,
      };
    }

    if (minRequiredPayment > totalIncome && totalIncome > 0) {
      return {
        type: 'danger' as const,
        title: 'Kritik Uyarı: Minimum Ödemeler Geliri Aşıyor!',
        message: `Bu ayki asgari borç ve zorunlu giderler toplamı (${formatCurrency(minRequiredPayment)}) toplam gelirini (${formatCurrency(totalIncome)}) aşıyor. Ek kaynak veya borç yapılandırması gerekebilir.`,
      };
    }

    // 2. Uyarı: Kategori Limiti %80 ve üzeri eşiğe ulaştıysa
    if (categoriesWarning80.length > 0) {
      const topWarning = categoriesWarning80[0];
      return {
        type: 'warning' as const,
        title: `Bütçe Uyarı Eşiği (%80+): "${topWarning.category}" %${topWarning.ratio} Doluluğa Ulaştı!`,
        message: `${topWarning.category} harcamalarınız kritik %80 sınırını geçti. Ay sonuna kadar kalan harcama payınız ${formatCurrency(topWarning.remaining)}.${categoriesWarning80.length > 1 ? ` (${categoriesWarning80.length} kategori %80 eşiğinde)` : ''}`,
      };
    }

    if (remainingNetBudget < 0) {
      return {
        type: 'warning' as const,
        title: 'Dikkat: Harcamalar Bütçe Sınırında',
        message: `Bu ay harcamalar ve kart asgarileri geliri ${formatCurrency(Math.abs(remainingNetBudget))} aştı. Ay sonuna kadar acil olmayan harcamaları ertelemen tavsiye edilir.`,
      };
    }

    return {
      type: 'success' as const,
      title: 'Bütçe Dengede',
      message: `Bu ay zorunlu giderler ve kart asgari ödemelerini yaptıktan sonra cebinde yaklaşık ${formatCurrency(remainingNetBudget)} net serbest bütçe kalacak.`,
    };
  };

  const insight = getFinancialInsight();

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* ⚡ Hızlı Eylem Araç Çubuğu (Quick Action Toolbar) */}
      <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Hızlı Eylemler
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Sık kullanılan işlemler
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* 1. Hızlı Gelir Ekle */}
          <button
            type="button"
            onClick={onOpenQuickIncome}
            className="group relative flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100 transition-all hover:scale-[1.01] active:scale-[0.99] text-left"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/30 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="min-w-0 text-center sm:text-left">
              <div className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100 truncate">
                Hızlı Gelir Ekle
              </div>
              <div className="hidden sm:block text-[11px] text-emerald-700 dark:text-emerald-300/80 truncate">
                Maaş, prim veya tahsilat
              </div>
            </div>
          </button>

          {/* 2. Hızlı Gider Ekle */}
          <button
            type="button"
            onClick={onOpenQuickExpense}
            className="group relative flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/70 dark:hover:bg-rose-900/40 text-rose-900 dark:text-rose-100 transition-all hover:scale-[1.01] active:scale-[0.99] text-left"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-500/30 group-hover:scale-105 transition-transform">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div className="min-w-0 text-center sm:text-left">
              <div className="text-xs sm:text-sm font-bold text-rose-950 dark:text-rose-100 truncate">
                Hızlı Gider Ekle
              </div>
              <div className="hidden sm:block text-[11px] text-rose-700 dark:text-rose-300/80 truncate">
                Market, fatura veya harcama
              </div>
            </div>
          </button>

          {/* 3. Raporu Aç */}
          <button
            type="button"
            onClick={onOpenReportModal}
            className="group relative flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/40 text-indigo-900 dark:text-indigo-100 transition-all hover:scale-[1.01] active:scale-[0.99] text-left"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0 text-center sm:text-left">
              <div className="text-xs sm:text-sm font-bold text-indigo-950 dark:text-indigo-100 truncate">
                Raporu Aç
              </div>
              <div className="hidden sm:block text-[11px] text-indigo-700 dark:text-indigo-300/80 truncate">
                Aylık özet & dışa aktar
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Smart Status Message Banner */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all ${
          insight.type === 'danger'
            ? 'bg-rose-50/70 dark:bg-rose-950/25 border-rose-300 dark:border-rose-900/60 ring-2 ring-rose-500/20 text-rose-950 dark:text-rose-200'
            : insight.type === 'warning'
            ? 'bg-amber-50/70 dark:bg-amber-950/25 border-amber-300 dark:border-amber-900/60 ring-2 ring-amber-500/20 text-amber-950 dark:text-amber-200'
            : insight.type === 'success'
            ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-200'
            : 'bg-white dark:bg-[#111827] border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-slate-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            {insight.type === 'danger' && <AlertOctagon className="w-5 h-5 text-rose-500 animate-pulse" />}
            {insight.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
            {insight.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            {insight.type === 'info' && <ShieldCheck className="w-5 h-5 text-[#64748B]" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold tracking-tight leading-snug">{insight.title}</h3>
              {categoriesExceeded100.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-xs">
                  <AlertOctagon className="w-3 h-3 text-white" />
                  %100 Aşım
                </span>
              )}
              {categoriesExceeded100.length === 0 && categoriesWarning80.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                  <AlertTriangle className="w-3 h-3 text-white" />
                  %80 Eşik
                </span>
              )}
            </div>
            <p className="mt-1 text-xs opacity-90 leading-relaxed">{insight.message}</p>
          </div>
        </div>
      </div>

      {/* Görsel 'Bütçe Durumu' Bildirim Kartı (%80 ve %100 Aşım Bildirimleri) */}
      {data.categoryBudgets && data.categoryBudgets.length > 0 && (
        <BudgetStatusCard
          expenses={data.expenses}
          budgets={data.categoryBudgets}
          onSaveBudgets={onSaveBudgets}
          onOpenQuickExpense={onOpenQuickExpense}
        />
      )}

      {/* Quick Search & Filter Bar */}
      {onOpenSearch && (
        <div
          onClick={onOpenSearch}
          className="flex items-center justify-between p-3 sm:p-3.5 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] cursor-pointer hover:border-emerald-500/50 dark:hover:border-emerald-500/40 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenSearch();
            }
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-[#0F172A] dark:text-white">
                Tüm geçmiş işlemlerde ve görevlerde hızlı ara...
              </p>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                Market, fatura, maaş, acil görevler veya tutar ile anında filtrele
              </p>
            </div>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-slate-400 border border-[#E2E8F0] dark:border-slate-700 rounded-lg shadow-2xs group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:border-emerald-500/40 transition">
            Ctrl K
          </kbd>
        </div>
      )}

      {/* Main 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Cebine Giren */}
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0 pr-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 block truncate">
                Cebine Giren
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-none mt-0.5">
                {payday > 1 ? cycleInfo.label : 'Bu Ay Toplam'}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
              {formatCurrency(totalIncome)}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">
                {monthlyIncomes.length} kayıtlı tahsilat
              </p>
            </div>
          </div>
        </div>

        {/* 2. Cebinden Çıkan */}
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0 pr-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 block truncate">
                Cebinden Çıkan
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-none mt-0.5">
                {payday > 1 ? cycleInfo.label : 'Bu Ay Toplam'}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-xs shrink-0">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
              {formatCurrency(totalExpense)}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">
                {mandatoryExpenses > 0 ? `${formatCurrency(mandatoryExpenses)} zorunlu` : `${monthlyExpenses.length} harcama`}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Minimum Ödemen Gereken (Proper spacing between icon & text) */}
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0 pr-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 block truncate">
                Asgari & Zorunlu
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-none mt-0.5">
                Minimum Ödeme
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
              {formatCurrency(minRequiredPayment)}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">
                Kart asgarileri: {formatCurrency(totalCardsMinPayment)}
              </p>
            </div>
          </div>
        </div>

        {/* 4. Kalan Net Bütçe */}
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0 pr-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 block truncate">
                Kalan Net Bütçe
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-none mt-0.5">
                Serbest Bakiye
              </span>
            </div>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${
              remainingNetBudget >= 0
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/20'
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
              remainingNetBudget >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {formatCurrency(remainingNetBudget)}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${remainingNetBudget >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium truncate">
                {remainingNetBudget >= 0 ? 'Serbest bütçe' : 'Aylık bütçe açığı'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 Safe to Spend (Bugünkü Güvenli Harçlığım) */}
      <SafeToSpendCard
        data={data}
        onOpenQuickExpense={onOpenQuickExpense}
      />

      {/* Quick Action Floating Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {onOpenVoiceModal && (
          <button
            onClick={onOpenVoiceModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition shadow-xs active:scale-95"
            title="Sesli Komut ile Ekle (Web Speech API)"
          >
            <Mic className="w-4 h-4" />
            <span>Sesle Ekle</span>
          </button>
        )}
        {onOpenBankSmsModal && (
          <button
            onClick={onOpenBankSmsModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-semibold transition shadow-xs active:scale-95 border border-purple-500/30"
            title="Banka SMS veya Bildirim Metni Yapıştır (Akıllı Ayrıştırıcı)"
          >
            <Smartphone className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>SMS / Bildirim</span>
          </button>
        )}
        <button
          onClick={onOpenQuickIncome}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition shadow-xs active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Gelir Ekle</span>
        </button>
        <button
          onClick={onOpenQuickExpense}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-[#0F172A] dark:text-slate-200 rounded-xl text-xs font-medium transition active:scale-95 border border-[#E2E8F0] dark:border-slate-800 shadow-xs"
        >
          <PlusCircle className="w-4 h-4 text-rose-500" />
          <span>Gider Ekle</span>
        </button>
        {onOpenReportModal && (
          <button
            onClick={onOpenReportModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-[#0F172A] dark:text-slate-200 rounded-xl text-xs font-medium transition active:scale-95 border border-[#E2E8F0] dark:border-slate-800 shadow-xs"
            title="Aylık Finansal Bütçe Karnesi & Ekstre"
          >
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Ekstre / Rapor</span>
          </button>
        )}
        <button
          onClick={() => onNavigate('tasks')}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-[#0F172A] dark:text-slate-200 rounded-xl text-xs font-medium transition active:scale-95 border border-[#E2E8F0] dark:border-slate-800 shadow-xs"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Görev Ekle</span>
        </button>
        <button
          onClick={() => onNavigate('calendar')}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-[#0F172A] dark:text-slate-200 rounded-xl text-xs font-medium transition active:scale-95 border border-[#E2E8F0] dark:border-slate-800 shadow-xs"
        >
          <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Takvim</span>
        </button>
      </div>

      {/* Dashboard Section Segmented Filter Switcher */}
      <div className="bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 flex items-center gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setDashboardSection('daily')}
          className={`flex-1 min-w-fit px-3 py-2 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
            dashboardSection === 'daily'
              ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/30 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <span>⚡ Günlük Rutin & Takip</span>
        </button>

        <button
          onClick={() => setDashboardSection('analytics')}
          className={`flex-1 min-w-fit px-3 py-2 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
            dashboardSection === 'analytics'
              ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/30 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>📊 Analiz & Gelecek Ay Tahmini</span>
        </button>

        <button
          onClick={() => setDashboardSection('goals')}
          className={`flex-1 min-w-fit px-3 py-2 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
            dashboardSection === 'goals'
              ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/30 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
          <span>🎯 Hedefler & Borçlar</span>
        </button>

        <button
          onClick={() => setDashboardSection('all')}
          className={`px-3 py-2 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
            dashboardSection === 'all'
              ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/30 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span>Tümü</span>
        </button>
      </div>

      {/* SECTION 1: GÜNLÜK RUTİN & OPERASYON */}
      {(dashboardSection === 'daily' || dashboardSection === 'all') && (
        <div className="space-y-6">
          {/* ⚡ Günlük Sabit Harcamalar & Rutinler (Otobüs, Sigara vb.) */}
          <DailyRoutineExpensesCard
            routines={data.dailyRoutines || []}
            expenses={data.expenses}
            onLogRoutineExpense={onLogRoutineExpense || (() => {})}
            onSaveRoutines={onSaveRoutines || (() => {})}
            onRewardAvoidedHabit={onRewardAvoidedHabit}
          />

          {/* Two Column Layout: Tasks & Daily Habits vs Card Debts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: Görevler & İlerleme */}
            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-sm font-semibold text-[#0F172A] dark:text-white">Gündelik Görev Durumu</h2>
                </div>
                <button
                  onClick={() => onNavigate('tasks')}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                >
                  Tümünü Gör <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400 mb-1.5">
                  <span>Tamamlanma Oranı</span>
                  <span className="font-semibold text-[#0F172A] dark:text-white">
                    {completedTasksCount} / {todayTasks.length} (%{taskProgressPercent})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${taskProgressPercent}%` }}
                  />
                </div>
              </div>

              {/* Task Mini List */}
              <div className="space-y-2 pt-1">
                {todayTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onToggleTask(task.id)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition ${
                      task.completed
                        ? 'bg-slate-50 dark:bg-slate-900/40 border-[#E2E8F0] dark:border-slate-800/60 opacity-60'
                        : 'bg-white dark:bg-slate-900/80 border-[#E2E8F0] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => onToggleTask(task.id)}
                      className="rounded text-emerald-600 focus:ring-0 focus:ring-offset-0 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 w-4 h-4 cursor-pointer"
                    />
                    <span
                      className={`text-xs flex-1 truncate ${
                        task.completed ? 'line-through text-[#64748B] dark:text-slate-500' : 'text-[#0F172A] dark:text-slate-200'
                      }`}
                    >
                      {task.title}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        task.priority === 'high'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : task.priority === 'medium'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-slate-400 border border-[#E2E8F0] dark:border-slate-700'
                      }`}
                    >
                      {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
                    </span>
                  </div>
                ))}
                {todayTasks.length === 0 && (
                  <p className="text-xs text-[#64748B] dark:text-slate-500 text-center py-3">Kayıtlı görev bulunmuyor.</p>
                )}
              </div>

              {/* Quick Habits Preview */}
              <div className="pt-2 border-t border-[#E2E8F0] dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[#64748B] dark:text-slate-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    Alışkanlık Serileri (Bugün)
                  </span>
                </div>
                <div className="space-y-1.5">
                  {data.habits.slice(0, 2).map((habit) => {
                    const doneToday = habit.completedDates.includes(todayStr);
                    return (
                      <div
                        key={habit.id}
                        onClick={() => onToggleHabitToday(habit.id)}
                        className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition text-xs shadow-2xs"
                      >
                        <span className="text-[#0F172A] dark:text-slate-300 truncate max-w-[200px]">{habit.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium text-orange-500 flex items-center gap-1">
                            <Flame className="w-3 h-3 fill-orange-500/20" /> {habit.streak} gün
                          </span>
                          <button
                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                              doneToday
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
                            }`}
                          >
                            {doneToday ? '✓ Yapıldı' : 'Yap'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Kredi Kartları & Borç Durumu */}
            <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-sm font-semibold text-[#0F172A] dark:text-white">Borç & Kredi Kartı Takibi</h2>
                </div>
                <button
                  onClick={() => onNavigate('finance')}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                >
                  Yönet <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-3">
                {data.cards.map((card) => {
                  const minPay = calculateMinCardPayment(card);
                  return (
                    <div
                      key={card.id}
                      className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-2xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-semibold text-[#0F172A] dark:text-white">{card.name}</h4>
                          <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                            Son Ödeme: {formatDateTurkish(card.dueDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-[#0F172A] dark:text-white">
                            {formatCurrency(card.totalDebt)}
                          </div>
                          <span className="text-[10px] text-[#64748B]">toplam borç</span>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-[#E2E8F0] dark:border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-[#64748B] dark:text-slate-400">
                          Asgari Tutar (%{card.minPaymentRate}):
                        </span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          {formatCurrency(minPay)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {data.cards.length === 0 && (
                  <p className="text-xs text-[#64748B] dark:text-slate-500 text-center py-4">Kayıtlı borç veya kredi kartı yok.</p>
                )}
              </div>

              {/* Privacy Note */}
              <div className="pt-2 border-t border-[#E2E8F0] dark:border-slate-800/80 text-[11px] text-[#64748B] dark:text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Tüm finansal veriler cihazınızın yerel hafızasında tutulur; banka bağlantısı gerektirmez.</span>
              </div>
            </div>
          </div>

          {/* Akıllı İpucu Kartı (Kişiselleştirilmiş Harcama & Alışkanlık Analizi) */}
          <SmartTipCard
            data={data}
            onOpenQuickExpense={onOpenQuickExpense}
          />

          {/* Smart Financial Tips Card */}
          <FinancialTipsCard data={data} />
        </div>
      )}

      {/* SECTION 2: FİNANSAL ANALİZ & GRAFİKLER */}
      {(dashboardSection === 'analytics' || dashboardSection === 'all') && (
        <div className="space-y-6">
          {/* Akıllı İpucu Kartı (Yalnızca Analiz sekmesi seçildiğinde üstte göster) */}
          {dashboardSection === 'analytics' && (
            <SmartTipCard
              data={data}
              onOpenQuickExpense={onOpenQuickExpense}
            />
          )}

          {/* 1. Smart Financial Health Score Card */}
          <FinancialHealthScoreCard
            data={data}
            onOpenReportModal={onOpenReportModal}
          />

          {/* 2. Gelecek Ay Tahmini (Mevcut Harcama Trendleri & Sabit Yükümlülükler Projeksiyonu) */}
          <NextMonthForecastCard
            data={data}
            onOpenQuickExpense={onOpenQuickExpense}
          />

          {/* 3. Monthly Cash Flow & Trend Chart (6/12 Months) */}
          <MonthlyTrendChart
            incomes={data.incomes}
            expenses={data.expenses}
          />

          {/* 3. 30-Day Expense Category Pie Chart Analysis */}
          <ExpensePieChart
            expenses={data.expenses}
            onAddExpense={onOpenQuickExpense}
          />

          {/* 4. 50/30/20 Rule Budget Balance Card */}
          <FiftyThirtyTwentyCard
            incomes={data.incomes}
            expenses={data.expenses}
          />

          {/* 5. Category Budget & Spending Limits */}
          <CategoryBudgetCard
            expenses={data.expenses}
            budgets={data.categoryBudgets || []}
            onSaveBudgets={onSaveBudgets || (() => {})}
            onOpenQuickExpense={onOpenQuickExpense}
          />
        </div>
      )}

      {/* SECTION 3: HEDEFLER, BİRİKİM & BORÇLAR */}
      {(dashboardSection === 'goals' || dashboardSection === 'all') && (
        <div className="space-y-6">
          {/* Yıllık İlerleme Çubuğu Kartı */}
          <YearlySavingsProgressCard
            goals={data.savingsGoals || []}
            onSaveGoals={onSaveGoals}
          />

          {/* 1. Birikim Hedefleri & Hayal Kumbarası */}
          <SavingsGoalsManager
            goals={data.savingsGoals || []}
            onSaveGoals={onSaveGoals || (() => {})}
          />

          {/* 1.5 Sabit Giderlerim (Kira, Fatura, Aidat, Abonelikler) */}
          <FixedExpensesManager
            fixedExpenses={data.fixedExpenses || []}
            onSaveFixedExpenses={onSaveFixedExpenses || (() => {})}
            onRecordAsExpense={(item) =>
              onOpenQuickExpense()
            }
          />

          {/* 2. Düzenli Abonelikler & Dijital Hizmetler */}
          <SubscriptionsManager
            subscriptions={data.subscriptions || []}
            onSaveSubscriptions={onSaveSubscriptions || (() => {})}
          />

          {/* 3. Installments & Regular Loan Obligations */}
          <InstallmentLoansManager
            installments={data.installments || []}
            onAddInstallment={onAddInstallment || (() => {})}
            onPayInstallment={onPayInstallment || (() => {})}
            onDeleteInstallment={onDeleteInstallment || (() => {})}
            monthlyFreeBudget={remainingNetBudget}
          />

          {/* 4. Emergency Fund & Runway Assurance Card */}
          <EmergencyFundCard
            data={data}
            onUpdateEmergencyFund={onUpdateEmergencyFund || (() => {})}
          />
        </div>
      )}
    </div>
  );
};
