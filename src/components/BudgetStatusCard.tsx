import React, { useState } from 'react';
import { Expense, CategoryBudget, ExpenseCategory } from '../types';
import { formatCurrency } from '../utils/storage';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Bell,
  ChevronDown,
  ChevronUp,
  Edit2,
  Plus,
  Home,
  ShoppingCart,
  Zap,
  Car,
  HeartPulse,
  Sparkles,
  Shirt,
  GraduationCap,
  CreditCard,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  X,
  Scale,
  SlidersHorizontal,
  AlertOctagon,
  ShieldAlert,
} from 'lucide-react';

interface BudgetStatusCardProps {
  expenses: Expense[];
  budgets: CategoryBudget[];
  onSaveBudgets?: (newBudgets: CategoryBudget[]) => void;
  onOpenEditBudgets?: () => void;
  onOpenQuickExpense?: () => void;
  className?: string;
  defaultExpanded?: boolean;
}

// Icon helper by category
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Kira & Konut':
      return <Home className="w-4 h-4 text-amber-500" />;
    case 'Market & Gıda':
      return <ShoppingCart className="w-4 h-4 text-emerald-500" />;
    case 'Fatura & Abonelik':
      return <Zap className="w-4 h-4 text-blue-500" />;
    case 'Ulaşım & Yakıt':
      return <Car className="w-4 h-4 text-orange-500" />;
    case 'Sağlık & Bakım':
      return <HeartPulse className="w-4 h-4 text-rose-500" />;
    case 'Eğlence & Sosyal':
      return <Sparkles className="w-4 h-4 text-purple-500" />;
    case 'Giyim & Alışveriş':
      return <Shirt className="w-4 h-4 text-pink-500" />;
    case 'Eğitim':
      return <GraduationCap className="w-4 h-4 text-indigo-500" />;
    case 'Zorunlu Ödeme':
      return <CreditCard className="w-4 h-4 text-red-500" />;
    default:
      return <HelpCircle className="w-4 h-4 text-slate-400" />;
  }
};

// Category-tailored advice when reaching 80% or exceeded (100%+)
const getCategoryWarningAdvice = (category: string, ratio: number, remaining: number): string => {
  if (ratio >= 100) {
    switch (category) {
      case 'Kira & Konut':
        return 'Kira ve aidat bütçeniz %100 limitini aştı! Bu ay konutla ilgili ek harcamaları erteleyin veya bütçenizi güncelleyin.';
      case 'Market & Gıda':
        return 'Market harcama tavanı %100 aşıldı! Kalan günlerde mevcut kiler stoğunu kullanıp sadece temel eksikleri alın.';
      case 'Eğlence & Sosyal':
        return 'Sosyal yaşam bütçesi %100 tükendi! Ay sonuna kadar evde vakit geçirme veya ücretsiz etkinlikleri tercih edin.';
      case 'Giyim & Alışveriş':
        return 'Alışveriş limiti %100 aşıldı! Zorunlu olmayan giyim ve keyfi siparişleri gelecek aya ertelemeniz önerilir.';
      case 'Ulaşım & Yakıt':
        return 'Ulaşım bütçesi %100 aşıldı! Mümkünse toplu taşıma veya ortak araç kullanarak masrafları dengeleyin.';
      default:
        return 'Bu kategoride belirlenen harcama limiti %100 aşıldı. Ay sonuna kadar yeni harcama yapmamaya özen gösterin.';
    }
  }

  // 80% - 99% Warning
  switch (category) {
    case 'Kira & Konut':
      return `Konut bütçenizin %${ratio}'i harcandı (%80 uyarı eşiğinde). Kalan ${formatCurrency(remaining)} tutarı beklenmedik aidat/tamirat için saklayın.`;
    case 'Market & Gıda':
      return `Market bütçeniz %${ratio} seviyesine ulaştı (%80 uyarı eşiğinde). Kalan ${formatCurrency(remaining)} ile haftalık mutfak listesine sadık kalın.`;
    case 'Eğlence & Sosyal':
      return `Sosyal harcamalarınız kritik %80 sınırını geçti (%${ratio}). Kalan ${formatCurrency(remaining)} limitini dışarıda yemek yerine küçük kahve buluşmalarına ayırın.`;
    case 'Giyim & Alışveriş':
      return `Alışveriş bütçenizin %${ratio}'si doldu (%80 eşiği). Kalan ${formatCurrency(remaining)} limiti aşmamak için ani indirim tuzaklarından kaçının.`;
    case 'Ulaşım & Yakıt':
      return `Ulaşım bütçeniz %${ratio} doluluğa ulaştı (%80 eşiği). Kalan ${formatCurrency(remaining)} limitini yalnızca zorunlu yolculuklara ayırın.`;
    case 'Fatura & Abonelik':
      return `Fatura bütçeniz %${ratio} doluluğa ulaştı (%80 eşiği). Kalan ${formatCurrency(remaining)} ile henüz gelmemiş son faturalarınızı karşılayabilirsiniz.`;
    default:
      return `Bu kategorideki harcamalarınız limitin %${ratio}'ine ulaştı (%80 uyarı eşiğinde). Kalan limitiniz ${formatCurrency(remaining)}.`;
  }
};

export const BudgetStatusCard: React.FC<BudgetStatusCardProps> = ({
  expenses,
  budgets,
  onSaveBudgets,
  onOpenEditBudgets,
  onOpenQuickExpense,
  className = '',
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [filterMode, setFilterMode] = useState<'all' | 'alerts' | 'safe'>('all');
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingBudgets, setEditingBudgets] = useState<CategoryBudget[]>([]);

  const handleOpenEdit = () => {
    if (onOpenEditBudgets) {
      onOpenEditBudgets();
      return;
    }
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

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveBudgets) {
      onSaveBudgets(editingBudgets.filter((b) => b.monthlyLimit > 0));
    }
    setShowEditModal(false);
  };

  // Filter expenses for current month
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const monthlyExpenses = expenses.filter(
    (e) => e.date && e.date.startsWith(currentMonthKey)
  );

  // Group spending by category
  const spendingByCategory: Record<string, number> = {};
  monthlyExpenses.forEach((exp) => {
    spendingByCategory[exp.category] =
      (spendingByCategory[exp.category] || 0) + exp.amount;
  });

  // Calculate totals
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + (b.monthlyLimit || 0), 0);
  const totalBudgetedSpent = budgets.reduce((sum, b) => {
    return sum + (spendingByCategory[b.category] || 0);
  }, 0);
  const overallOccupancyRatio =
    totalBudgetLimit > 0
      ? Math.round((totalBudgetedSpent / totalBudgetLimit) * 100)
      : 0;

  // Analyze each defined budget
  const analyzedBudgets = budgets.map((b) => {
    const spent = spendingByCategory[b.category] || 0;
    const ratio = b.monthlyLimit > 0 ? Math.round((spent / b.monthlyLimit) * 100) : 0;
    const isExceeded = spent >= b.monthlyLimit; // %100 ve üzeri
    const isWarning80 = !isExceeded && ratio >= 80; // %80 - %99
    const isSafe = ratio < 80; // <%80
    const remaining = b.monthlyLimit - spent;
    return {
      category: b.category,
      monthlyLimit: b.monthlyLimit,
      spent,
      ratio,
      isExceeded,
      isWarning80,
      isSafe,
      remaining,
    };
  });

  // Filter lists
  const exceededCategories = analyzedBudgets.filter((b) => b.isExceeded);
  const warningCategories = analyzedBudgets.filter((b) => b.isWarning80);
  const alertCategories = [...exceededCategories, ...warningCategories];
  const safeCategories = analyzedBudgets.filter((b) => b.isSafe);

  // Categories to display based on tab filter
  const displayedCategories =
    filterMode === 'alerts'
      ? alertCategories
      : filterMode === 'safe'
      ? safeCategories
      : analyzedBudgets;

  const hasAlerts = alertCategories.length > 0;
  const hasBudgets = budgets && budgets.length > 0;

  // If no budgets defined yet
  if (!hasBudgets) {
    return (
      <div
        className={`bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] ${className}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
                Bütçe Durumu Bildirimi
              </h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Kategori harcama limitlerinizi belirlediğinizde, her kategorinin doluluk oranını gösteren ince ve şık ilerleme çubukları burada listelenir.
              </p>
            </div>
          </div>
          {(onOpenEditBudgets || onSaveBudgets) && (
            <button
              onClick={handleOpenEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Limit Belirle</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border transition-all shadow-[0_1px_3px_rgba(0,0,0,0.05)] ${
        exceededCategories.length > 0
          ? 'bg-white dark:bg-[#111827] border-rose-400 dark:border-rose-900 ring-2 ring-rose-500/25'
          : hasAlerts
          ? 'bg-white dark:bg-[#111827] border-amber-400 dark:border-amber-900 ring-2 ring-amber-500/25'
          : 'bg-white dark:bg-[#111827] border-[#E2E8F0] dark:border-slate-800'
      } ${className}`}
    >
      {/* CARD HEADER */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Title & Status Badge */}
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                exceededCategories.length > 0
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40'
                  : hasAlerts
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {exceededCategories.length > 0 ? (
                <AlertOctagon className="w-5 h-5 text-rose-500 animate-pulse" />
              ) : hasAlerts ? (
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                  Bütçe Durumu & Doluluk Oranları
                </h3>

                {exceededCategories.length > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
                    {exceededCategories.length} Kategori Limiti Aştı (%100+)
                  </span>
                ) : hasAlerts ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    {warningCategories.length} Kategori %80 Eşiğinde
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Tüm Limitler Güvenli (&lt;%80)
                  </span>
                )}
              </div>

              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5 leading-relaxed">
                Her harcama kategorisinin anlık doluluk oranı, kalan bütçesi ve kritik %80 - %100 eşik takibi
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {(onOpenEditBudgets || onSaveBudgets) && (
              <button
                type="button"
                onClick={handleOpenEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-200 border border-[#E2E8F0] dark:border-slate-700 transition active:scale-95"
                title="Bütçe limitlerini güncelle"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limitleri Düzenle</span>
                <span className="sm:hidden">Düzenle</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-xl text-[#64748B] hover:text-[#0F172A] dark:hover:text-white bg-slate-100/70 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
              title={isExpanded ? 'Detayları daralt' : 'Detayları göster'}
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

        {/* OVERALL BUDGET CONSUMPTION BAR (TOPLAM BÜTÇE DOLULUK ÇUBUĞU) */}
        <div className="mt-3.5 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-[#64748B] dark:text-slate-400">
              Toplam Bütçe Doluluk Oranı
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#0F172A] dark:text-white">
                {formatCurrency(totalBudgetedSpent)} / {formatCurrency(totalBudgetLimit)}
              </span>
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                  overallOccupancyRatio >= 100
                    ? 'bg-rose-500 text-white'
                    : overallOccupancyRatio >= 80
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                %{overallOccupancyRatio} Dolu
              </span>
            </div>
          </div>

          {/* Slim Overall Progress Bar with 80% and 100% Markers */}
          <div className="relative w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            {/* 80% threshold marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-10 opacity-80"
              style={{ left: '80%' }}
              title="%80 Uyarı Eşiği"
            />
            {/* 100% limit marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10 opacity-80"
              style={{ left: '100%' }}
              title="%100 Bütçe Tavanı"
            />
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallOccupancyRatio >= 100
                  ? 'bg-rose-500'
                  : overallOccupancyRatio >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(overallOccupancyRatio, 100)}%` }}
            />
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E2E8F0] dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
                filterMode === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white bg-slate-100/70 dark:bg-slate-800/60'
              }`}
            >
              Tümü ({analyzedBudgets.length})
            </button>

            {hasAlerts && (
              <button
                type="button"
                onClick={() => setFilterMode('alerts')}
                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
                  filterMode === 'alerts'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Kritik & Uyarı ({alertCategories.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setFilterMode('safe')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
                filterMode === 'safe'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
              }`}
            >
              Güvenli (&lt;%80) ({safeCategories.length})
            </button>
          </div>

          <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
            İnce çubuklar doluluk oranını gösterir
          </span>
        </div>
      </div>

      {/* EXPANDED CONTENT: CATEGORY LIST WITH SLIM PROGRESS BARS */}
      {isExpanded && (
        <div className="p-4 sm:p-5 pt-0 space-y-2.5 border-t border-[#E2E8F0] dark:border-slate-800">
          <div className="space-y-2.5 pt-1">
            {displayedCategories.map((item) => {
              const isOver = item.isExceeded; // %100+
              const isWarning80 = item.isWarning80; // %80 - %99
              const ratioClamped = Math.min(item.ratio, 100);

              // Progress bar fill color styling
              const barFillColor = isOver
                ? 'bg-rose-500 shadow-sm shadow-rose-500/40'
                : isWarning80
                ? 'bg-amber-500 shadow-sm shadow-amber-500/30'
                : 'bg-emerald-500';

              return (
                <div
                  key={item.category}
                  className={`p-3 rounded-xl border transition-all ${
                    isOver
                      ? 'bg-rose-50/60 dark:bg-rose-950/25 border-rose-300 dark:border-rose-900/60 ring-2 ring-rose-500/30'
                      : isWarning80
                      ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/50 ring-2 ring-amber-500/25'
                      : 'bg-slate-50/60 dark:bg-slate-900/50 border-[#E2E8F0] dark:border-slate-800'
                  }`}
                >
                  {/* Top Row: Category title, icon, and doluluk badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs border ${
                          isOver
                            ? 'bg-rose-500/15 border-rose-500/30 text-rose-500'
                            : isWarning80
                            ? 'bg-amber-500/15 border-amber-500/30 text-amber-500'
                            : 'bg-white dark:bg-slate-800 border-[#E2E8F0] dark:border-slate-700'
                        }`}
                      >
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-[#0F172A] dark:text-white truncate">
                            {item.category}
                          </span>

                          {/* Occupancy Rate Tag with distinct Icons & Colors */}
                          {isOver ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-600 text-white shadow-xs">
                              <AlertOctagon className="w-3 h-3 text-white animate-pulse" />
                              %{item.ratio} Dolu (AŞILDI)
                            </span>
                          ) : isWarning80 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-xs">
                              <AlertTriangle className="w-3 h-3 text-white" />
                              %{item.ratio} Dolu (%80+ UYARI)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              %{item.ratio} Dolu
                            </span>
                          )}

                          {isWarning80 && (
                            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                              (Limit Uyarısı)
                            </span>
                          )}
                          {isOver && (
                            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                              (Bütçe Sınırı Aşıldı!)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side: Amount info & remaining budget */}
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-[#0F172A] dark:text-white">
                        {formatCurrency(item.spent)}{' '}
                        <span className="text-[10px] font-normal text-[#64748B] dark:text-slate-400">
                          / {formatCurrency(item.monthlyLimit)}
                        </span>
                      </div>
                      <div className="text-[10px]">
                        {isOver ? (
                          <span className="font-extrabold text-rose-600 dark:text-rose-400">
                            Aşım: +{formatCurrency(Math.abs(item.remaining))}
                          </span>
                        ) : isWarning80 ? (
                          <span className="text-amber-700 dark:text-amber-300 font-semibold">
                            Kalan: <strong>{formatCurrency(item.remaining)}</strong>
                          </span>
                        ) : (
                          <span className="text-[#64748B] dark:text-slate-400">
                            Kalan: <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(item.remaining)}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SLIM, ELEGANT PROGRESS BAR WITH %80 AND %100 MARKERS */}
                  <div className="space-y-1">
                    <div className="relative w-full h-2 rounded-full bg-slate-200/90 dark:bg-slate-800 overflow-hidden">
                      {/* 80% threshold guide line */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-10 opacity-90"
                        style={{ left: '80%' }}
                        title="%80 Uyarı Eşiği"
                      />
                      {/* 100% limit guide line */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10 opacity-90"
                        style={{ left: '100%' }}
                        title="%100 Bütçe Sınırı"
                      />

                      {/* Filled Progress Bar */}
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barFillColor}`}
                        style={{ width: `${ratioClamped}%` }}
                      />
                    </div>

                    {/* Scale helper below bar */}
                    <div className="flex justify-between items-center text-[9px] text-[#64748B] dark:text-slate-500 font-mono">
                      <span>%0</span>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        | %80 Eşik
                      </span>
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">
                        | %100 Sınır
                      </span>
                      <span className={isOver ? 'text-rose-600 font-black' : isWarning80 ? 'text-amber-600 font-bold' : 'text-slate-500'}>
                        %{item.ratio}
                      </span>
                    </div>
                  </div>

                  {/* Smart Advice for Warning (%80+) or Exceeded (%100+) Categories */}
                  {(isOver || isWarning80) && (
                    <div
                      className={`mt-2 flex items-start gap-1.5 p-2 rounded-lg border text-[11px] leading-relaxed ${
                        isOver
                          ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200'
                          : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
                      }`}
                    >
                      {isOver ? (
                        <AlertOctagon className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                      )}
                      <p>
                        {getCategoryWarningAdvice(item.category, item.ratio, item.remaining)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E2E8F0] dark:border-slate-800">
            <span className="text-[11px] text-[#64748B] dark:text-slate-400">
              💡 Çubuklardaki dikey çizgi <strong>%90 kritik eşik</strong> sınırını temsil eder.
            </span>

            <div className="flex items-center gap-2">
              {onOpenQuickExpense && (
                <button
                  type="button"
                  onClick={onOpenQuickExpense}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Gider Ekle</span>
                </button>
              )}
              {(onOpenEditBudgets || onSaveBudgets) && (
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-200 border border-[#E2E8F0] dark:border-slate-700 transition"
                >
                  <span>Bütçe Limitlerini Düzenle</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT BUDGETS MODAL */}
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
                  Her ay için hedeflediğiniz azami harcama limitlerini belirleyin.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const samplePresets: CategoryBudget[] = [
                      { category: 'Market & Gıda', monthlyLimit: 8000 },
                      { category: 'Fatura & Abonelik', monthlyLimit: 2500 },
                      { category: 'Kira & Konut', monthlyLimit: 15000 },
                      { category: 'Ulaşım & Yakıt', monthlyLimit: 2500 },
                      { category: 'Eğlence & Sosyal', monthlyLimit: 2000 },
                      { category: 'Sağlık & Bakım', monthlyLimit: 1500 },
                      { category: 'Giyim & Alışveriş', monthlyLimit: 3000 },
                    ];
                    setEditingBudgets(samplePresets);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline shrink-0"
                >
                  <Sparkles className="w-3 h-3" />
                  Örnek Limitler
                </button>
              </div>

              <div className="space-y-2.5">
                {[
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
                ].map((cat) => {
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
