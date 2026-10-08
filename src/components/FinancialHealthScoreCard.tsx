import React from 'react';
import { AppData } from '../types';
import { formatCurrency, calculateMinCardPayment } from '../utils/storage';
import {
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  FileText,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

interface FinancialHealthScoreCardProps {
  data: AppData;
  onOpenReportModal?: () => void;
}

export const FinancialHealthScoreCard: React.FC<FinancialHealthScoreCardProps> = ({
  data,
  onOpenReportModal,
}) => {
  const currentMonthKey = new Date().toISOString().slice(0, 7);

  // 1. Incomes this month
  const monthlyIncomes = data.incomes.filter(
    (i) => i.date && i.date.startsWith(currentMonthKey)
  );
  const totalIncome = monthlyIncomes.reduce((sum, i) => sum + i.amount, 0);

  // 2. Expenses this month
  const monthlyExpenses = data.expenses.filter(
    (e) => e.date && e.date.startsWith(currentMonthKey)
  );
  const totalExpense = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  // 3. Debt minimum payments
  const totalCardsMinPayment = data.cards.reduce((sum, card) => {
    return sum + calculateMinCardPayment(card);
  }, 0);

  // Installments monthly payment
  const totalInstallmentsMonthly = (data.installments || []).reduce((sum, inst) => {
    return inst.remainingInstallments > 0 ? sum + inst.monthlyAmount : sum;
  }, 0);

  const totalMonthlyDebtPayments = totalCardsMinPayment + totalInstallmentsMonthly;

  // Net Savings
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Debt to income ratio
  const debtRatio = totalIncome > 0 ? (totalMonthlyDebtPayments / totalIncome) * 100 : 0;

  // Budget discipline
  const budgets = data.categoryBudgets || [];
  let exceededBudgetsCount = 0;
  if (budgets.length > 0) {
    const spendingByCategory: Record<string, number> = {};
    monthlyExpenses.forEach((exp) => {
      spendingByCategory[exp.category] =
        (spendingByCategory[exp.category] || 0) + exp.amount;
    });
    exceededBudgetsCount = budgets.filter(
      (b) => (spendingByCategory[b.category] || 0) > b.monthlyLimit
    ).length;
  }

  // Emergency runway
  const mandatoryExpenses = monthlyExpenses
    .filter((e) => e.isMandatory)
    .reduce((sum, e) => sum + e.amount, 0);
  const monthlyBaseline = Math.max(1, mandatoryExpenses + totalMonthlyDebtPayments);
  const currentEmergencySavings = data.emergencyFund?.currentAmount || 0;
  const runwayMonths = currentEmergencySavings / monthlyBaseline;

  // SCORING LOGIC (100 Max)
  // 1. Savings Rate (35 pts)
  let savingsScore = 0;
  if (savingsRate >= 25) savingsScore = 35;
  else if (savingsRate >= 15) savingsScore = 28;
  else if (savingsRate >= 5) savingsScore = 18;
  else if (savingsRate >= 0) savingsScore = 10;
  else savingsScore = 0;

  // 2. Debt to Income Ratio (25 pts)
  let debtScore = 0;
  if (debtRatio <= 15) debtScore = 25;
  else if (debtRatio <= 30) debtScore = 20;
  else if (debtRatio <= 50) debtScore = 12;
  else debtScore = 4;

  // 3. Budget Discipline (20 pts)
  let budgetScore = 20;
  if (budgets.length === 0) budgetScore = 15;
  else if (exceededBudgetsCount === 0) budgetScore = 20;
  else if (exceededBudgetsCount === 1) budgetScore = 13;
  else if (exceededBudgetsCount === 2) budgetScore = 8;
  else budgetScore = 3;

  // 4. Emergency Runway (20 pts)
  let runwayScore = 0;
  if (runwayMonths >= 6) runwayScore = 20;
  else if (runwayMonths >= 3) runwayScore = 16;
  else if (runwayMonths >= 1) runwayScore = 10;
  else if (runwayMonths > 0) runwayScore = 5;
  else runwayScore = 0;

  const totalScore = Math.min(100, savingsScore + debtScore + budgetScore + runwayScore);

  // Grade determination
  let gradeText = 'Mükemmel';
  let gradeBadge = 'A+';
  let scoreColorClass = 'text-emerald-500';
  let badgeColorClass =
    'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';

  if (totalScore >= 85) {
    gradeText = 'Mükemmel Finansal Sağlık';
    gradeBadge = 'A+';
    scoreColorClass = 'text-emerald-500';
    badgeColorClass =
      'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  } else if (totalScore >= 70) {
    gradeText = 'Sağlam ve Dengeli Bütçe';
    gradeBadge = 'A';
    scoreColorClass = 'text-blue-500';
    badgeColorClass =
      'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20';
  } else if (totalScore >= 50) {
    gradeText = 'Orta Düzey / İyileştirilmeli';
    gradeBadge = 'B';
    scoreColorClass = 'text-amber-500';
    badgeColorClass =
      'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20';
  } else {
    gradeText = 'Yüksek Risk / Acil Tedbir Gerekli';
    gradeBadge = 'C';
    scoreColorClass = 'text-rose-500';
    badgeColorClass =
      'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20';
  }

  // Dynamic Personalized Action Tips
  const tips: string[] = [];
  if (savingsRate >= 20) {
    tips.push(
      `Bu ay gelirinizin %${Math.round(savingsRate)}'sini biriktiriyorsunuz, tasarruf oranınız altın standartta!`
    );
  } else if (savingsRate < 0) {
    tips.push(
      `Bu ay harcamalar geliri ${formatCurrency(Math.abs(netSavings))} aştı. Kredi kartı kullanımını ve istek harcamalarını sınırlayın.`
    );
  } else {
    tips.push(
      `Tasarruf oranınız %${Math.round(savingsRate)}. İdeal %20 oranına ulaşmak için istek harcamalarını gözden geçirin.`
    );
  }

  if (exceededBudgetsCount > 0) {
    tips.push(
      `${exceededBudgetsCount} kategoride belirlenen harcama limiti aşıldı. Bu kategorilerde ay sonuna kadar yeni harcama yapmamaya özen gösterin.`
    );
  }

  if (debtRatio > 35) {
    tips.push(
      `Aylık asgari borç ve taksitler gelirinizin %${Math.round(debtRatio)}'sini oluşturuyor. Borç kartopu yöntemiyle yüksek faizli kartı öncelikle kapatın.`
    );
  } else if (runwayMonths < 3) {
    tips.push(
      `Mevcut acil durum fonunuz yaklaşık ${runwayMonths.toFixed(1)} aylık gideri karşılıyor. 3 aya tamamlamak finansal huzurunuzu artıracaktır.`
    );
  }

  return (
    <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                Akıllı Finansal Sağlık Skoru
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold border ${badgeColorClass}`}
              >
                {gradeBadge} • {gradeText}
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
              Gelir dengesi, borç yükü, bütçe disiplini ve acil fon güvencesi analizi
            </p>
          </div>
        </div>

        {/* Action: Generate Monthly Report Modal */}
        {onOpenReportModal && (
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition active:scale-95 self-start sm:self-auto"
          >
            <FileText className="w-4 h-4" />
            <span>Aylık Ekstre / Rapor Üret</span>
          </button>
        )}
      </div>

      {/* Main Score & Sub-scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-4">
        {/* Score Dial / Visual Metric */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400 mb-1">
            Genel Finans Notu
          </span>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-4xl sm:text-5xl font-black tracking-tight ${scoreColorClass}`}
            >
              {totalScore}
            </span>
            <span className="text-sm font-semibold text-[#64748B]">/100</span>
          </div>

          <div className="w-full max-w-[180px] h-2 rounded-full bg-slate-200 dark:bg-slate-800 mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                totalScore >= 75
                  ? 'bg-emerald-500'
                  : totalScore >= 50
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${totalScore}%` }}
            />
          </div>

          <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-2">
            {totalScore >= 75
              ? 'Tasarruf ve harcama dengeniz mükemmel seviyede.'
              : totalScore >= 50
              ? 'Genel bütçeniz dengeli ancak tasarruf artırılabilir.'
              : 'Acil bütçe tedbirleri ve borç yapılandırması önerilir.'}
          </p>
        </div>

        {/* Breakdown of 4 Pillars */}
        <div className="md:col-span-8 flex flex-col justify-between space-y-3">
          <div className="space-y-2.5">
            {/* 1. Tasarruf Oranı */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-[#0F172A] dark:text-slate-200">
                  Tasarruf Oranı (%{Math.round(savingsRate)})
                </span>
                <span className="font-bold text-[#64748B] dark:text-slate-400">
                  {savingsScore} / 35 Puan
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(savingsScore / 35) * 100}%` }}
                />
              </div>
            </div>

            {/* 2. Borç / Gelir Yükü */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-[#0F172A] dark:text-slate-200">
                  Borç & Asgari Yükü (%{Math.round(debtRatio)})
                </span>
                <span className="font-bold text-[#64748B] dark:text-slate-400">
                  {debtScore} / 25 Puan
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(debtScore / 25) * 100}%` }}
                />
              </div>
            </div>

            {/* 3. Kategori Bütçe Uyumu */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-[#0F172A] dark:text-slate-200">
                  Bütçe Disiplini ({exceededBudgetsCount === 0 ? 'Tam Uyum' : `${exceededBudgetsCount} Aşım`})
                </span>
                <span className="font-bold text-[#64748B] dark:text-slate-400">
                  {budgetScore} / 20 Puan
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(budgetScore / 20) * 100}%` }}
                />
              </div>
            </div>

            {/* 4. Acil Fon Güvencesi */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-[#0F172A] dark:text-slate-200">
                  Acil Durum Fonu Güvencesi ({runwayMonths.toFixed(1)} Ay Runway)
                </span>
                <span className="font-bold text-[#64748B] dark:text-slate-400">
                  {runwayScore} / 20 Puan
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${(runwayScore / 20) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Actionable Tips Box */}
          <div className="pt-2 border-t border-[#E2E8F0] dark:border-slate-800/80 space-y-1.5">
            {tips.slice(0, 2).map((tip, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-xs text-[#0F172A] dark:text-slate-300"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
