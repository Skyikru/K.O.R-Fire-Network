import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Filter,
  Calendar,
  CheckSquare,
  TrendingDown,
  TrendingUp,
  CreditCard,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Trash2,
  Tag,
  Clock,
  Sparkles,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { AppData, Task, Income, Expense, CreditCardDebt, NavTab } from '../types';
import { formatCurrency, formatDateTurkish } from '../utils/storage';

export type SearchTabFilter = 'all' | 'expense' | 'income' | 'task' | 'card';
export type DateRangeFilter = 'all' | 'today' | 'last7' | 'last30' | 'thisMonth';
export type TaskStatusFilter = 'all' | 'pending' | 'completed';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
  onNavigate: (tab: NavTab) => void;
  onToggleTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onDeleteExpense?: (id: string) => void;
  onDeleteIncome?: (id: string) => void;
  initialQuery?: string;
  initialTab?: SearchTabFilter;
}

// Turkish string normalizer for search matching (handles i/İ, ı/I, etc.)
function normalizeText(text: string | number | undefined | null): string {
  if (text === undefined || text === null) return '';
  return String(text)
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  data,
  onNavigate,
  onToggleTask,
  onDeleteTask,
  onDeleteExpense,
  onDeleteIncome,
  initialQuery = '',
  initialTab = 'all',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchTabFilter>(initialTab);
  const [dateRange, setDateRange] = useState<DateRangeFilter>('all');
  const [taskStatus, setTaskStatus] = useState<TaskStatusFilter>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial query when opened
  useEffect(() => {
    if (isOpen) {
      if (initialQuery) setQuery(initialQuery);
      if (initialTab) setActiveTab(initialTab);
      setDeleteConfirmId(null);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, initialQuery, initialTab]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Helper date calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.slice(0, 7);

  const sevenDaysAgoStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  }, []);

  const thirtyDaysAgoStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  }, []);

  // Filter checker for dates
  const isDateInRange = (dateStr: string) => {
    if (dateRange === 'all') return true;
    if (dateRange === 'today') return dateStr === todayStr;
    if (dateRange === 'last7') return dateStr >= sevenDaysAgoStr;
    if (dateRange === 'last30') return dateStr >= thirtyDaysAgoStr;
    if (dateRange === 'thisMonth') return dateStr.startsWith(currentMonthStr);
    return true;
  };

  const normalizedQuery = normalizeText(query);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return data.expenses
      .filter((exp) => {
        if (!isDateInRange(exp.date)) return false;
        if (!normalizedQuery) return true;

        const catNorm = normalizeText(exp.category);
        const noteNorm = normalizeText(exp.note);
        const amountNorm = String(exp.amount);
        const dateNorm = normalizeText(exp.date);
        const mandatoryNorm = exp.isMandatory ? 'zorunlu' : '';

        return (
          catNorm.includes(normalizedQuery) ||
          noteNorm.includes(normalizedQuery) ||
          amountNorm.includes(normalizedQuery) ||
          dateNorm.includes(normalizedQuery) ||
          mandatoryNorm.includes(normalizedQuery)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [data.expenses, normalizedQuery, dateRange]);

  // Filtered Incomes
  const filteredIncomes = useMemo(() => {
    return data.incomes
      .filter((inc) => {
        if (!isDateInRange(inc.date)) return false;
        if (!normalizedQuery) return true;

        const srcNorm = normalizeText(inc.source);
        const noteNorm = normalizeText(inc.note);
        const amountNorm = String(inc.amount);
        const dateNorm = normalizeText(inc.date);

        return (
          srcNorm.includes(normalizedQuery) ||
          noteNorm.includes(normalizedQuery) ||
          amountNorm.includes(normalizedQuery) ||
          dateNorm.includes(normalizedQuery)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [data.incomes, normalizedQuery, dateRange]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return data.tasks
      .filter((task) => {
        if (taskStatus === 'pending' && task.completed) return false;
        if (taskStatus === 'completed' && !task.completed) return false;
        if (task.dueDate && !isDateInRange(task.dueDate)) return false;
        if (!normalizedQuery) return true;

        const titleNorm = normalizeText(task.title);
        const priorityNorm =
          task.priority === 'high'
            ? 'acil yuksek'
            : task.priority === 'medium'
            ? 'orta'
            : 'dusuk';
        const statusNorm = task.completed ? 'tamamlandi' : 'bekleyen';
        const dateNorm = normalizeText(task.dueDate);

        return (
          titleNorm.includes(normalizedQuery) ||
          priorityNorm.includes(normalizedQuery) ||
          statusNorm.includes(normalizedQuery) ||
          dateNorm.includes(normalizedQuery)
        );
      })
      .sort((a, b) => {
        // Uncompleted first, then due date
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      });
  }, [data.tasks, normalizedQuery, taskStatus, dateRange]);

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return data.cards.filter((card) => {
      if (!normalizedQuery) return true;

      const nameNorm = normalizeText(card.name);
      const noteNorm = normalizeText(card.note);
      const debtNorm = String(card.totalDebt);

      return (
        nameNorm.includes(normalizedQuery) ||
        noteNorm.includes(normalizedQuery) ||
        debtNorm.includes(normalizedQuery)
      );
    });
  }, [data.cards, normalizedQuery]);

  // Counts & Totals
  const totalExpenseSum = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + e.amount, 0),
    [filteredExpenses]
  );
  const totalIncomeSum = useMemo(
    () => filteredIncomes.reduce((sum, i) => sum + i.amount, 0),
    [filteredIncomes]
  );
  const pendingTasksCount = useMemo(
    () => filteredTasks.filter((t) => !t.completed).length,
    [filteredTasks]
  );

  const totalResultsCount =
    (activeTab === 'all' || activeTab === 'expense' ? filteredExpenses.length : 0) +
    (activeTab === 'all' || activeTab === 'income' ? filteredIncomes.length : 0) +
    (activeTab === 'all' || activeTab === 'task' ? filteredTasks.length : 0) +
    (activeTab === 'all' || activeTab === 'card' ? filteredCards.length : 0);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden my-4 sm:my-8 flex flex-col max-h-[90vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="p-3 sm:p-4 border-b border-[#E2E8F0] dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tüm geçmiş işlem ve görevlerde ara (örn: Market, 250 TL, Fatura, Acil)..."
              className="w-full pl-11 pr-24 py-2.5 sm:py-3 rounded-xl bg-white dark:bg-[#0A0F1D] border border-[#E2E8F0] dark:border-slate-700/80 text-sm sm:text-base text-[#0F172A] dark:text-white placeholder:text-[#64748B] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
            />
            <div className="absolute right-2.5 flex items-center gap-1.5">
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 rounded-lg text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Aramayı Temizle"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-slate-400 border border-[#E2E8F0] dark:border-slate-700 rounded shadow-2xs">
                ESC
              </kbd>
            </div>
          </div>

          {/* Tab Filter Chips */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                activeTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#0A0F1D] text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white border border-[#E2E8F0] dark:border-slate-800'
              }`}
            >
              Tümü ({data.expenses.length + data.incomes.length + data.tasks.length + data.cards.length})
            </button>

            <button
              onClick={() => setActiveTab('expense')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                activeTab === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#0A0F1D] text-[#64748B] dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-[#E2E8F0] dark:border-slate-800'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
              <span>Giderler ({filteredExpenses.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('income')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                activeTab === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#0A0F1D] text-[#64748B] dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-[#E2E8F0] dark:border-slate-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Gelirler ({filteredIncomes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('task')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                activeTab === 'task'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#0A0F1D] text-[#64748B] dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-[#E2E8F0] dark:border-slate-800'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
              <span>Görevler ({filteredTasks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('card')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                activeTab === 'card'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#0A0F1D] text-[#64748B] dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 border border-[#E2E8F0] dark:border-slate-800'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-purple-500" />
              <span>Kartlar ({filteredCards.length})</span>
            </button>
          </div>

          {/* Secondary Filters: Date & Task Status */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 pt-2 border-t border-[#E2E8F0]/80 dark:border-slate-800/60 text-xs">
            {/* Date Range Selection */}
            <div className="flex items-center gap-1 text-[#64748B] dark:text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium mr-1">Tarih:</span>
              {(
                [
                  { id: 'all', label: 'Tümü' },
                  { id: 'today', label: 'Bugün' },
                  { id: 'last7', label: 'Son 7 Gün' },
                  { id: 'last30', label: 'Son 30 Gün' },
                  { id: 'thisMonth', label: 'Bu Ay' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setDateRange(f.id)}
                  className={`px-2 py-0.5 rounded text-[11px] transition ${
                    dateRange === f.id
                      ? 'bg-slate-200 dark:bg-slate-700 text-[#0F172A] dark:text-white font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-[#64748B] dark:text-slate-400'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Task Status Filters (Visible when all or task tab active) */}
            {(activeTab === 'all' || activeTab === 'task') && (
              <div className="flex items-center gap-1 text-[#64748B] dark:text-slate-400">
                <span className="text-[11px] font-medium mr-1">Görev Durumu:</span>
                {(
                  [
                    { id: 'all', label: 'Hepsi' },
                    { id: 'pending', label: 'Bekleyen' },
                    { id: 'completed', label: 'Tamamlanan' },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setTaskStatus(s.id)}
                    className={`px-2 py-0.5 rounded text-[11px] transition ${
                      taskStatus === s.id
                        ? 'bg-slate-200 dark:bg-slate-700 text-[#0F172A] dark:text-white font-semibold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-[#64748B] dark:text-slate-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Summary Pill Bar when filtered */}
        {query && (
          <div className="px-4 py-2 bg-slate-100/60 dark:bg-slate-900/60 border-b border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400">
            <span>
              "{query}" için <strong className="text-[#0F172A] dark:text-white">{totalResultsCount}</strong> sonuç bulundu
            </span>
            <div className="flex items-center gap-3">
              {filteredExpenses.length > 0 && (
                <span className="text-rose-600 dark:text-rose-400 font-medium">
                  Gider: -{formatCurrency(totalExpenseSum)}
                </span>
              )}
              {filteredIncomes.length > 0 && (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Gelir: +{formatCurrency(totalIncomeSum)}
                </span>
              )}
              {filteredTasks.length > 0 && (
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {pendingTasksCount} bekleyen görev
                </span>
              )}
            </div>
          </div>
        )}

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800/60">
          {totalResultsCount === 0 ? (
            /* Empty State */
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center mx-auto mb-3 text-[#64748B] dark:text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-[#0F172A] dark:text-white">
                Sonuç Bulunamadı
              </h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-sm mx-auto mt-1">
                {query
                  ? `"${query}" ile eşleşen bir işlem veya görev kaydı yok. Arama kelimesini değiştirebilir veya tarih filtrelerini sıfırlayabilirsiniz.`
                  : 'Henüz bu kriterlere uygun bir kayıt bulunmuyor.'}
              </p>
              {(query || dateRange !== 'all' || taskStatus !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setDateRange('all');
                    setTaskStatus('all');
                    setActiveTab('all');
                  }}
                  className="mt-4 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium text-[#0F172A] dark:text-slate-200 transition"
                >
                  Filtreleri Temizle
                </button>
              )}

              {/* Suggestions */}
              <div className="mt-8 pt-6 border-t border-[#E2E8F0] dark:border-slate-800 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-[#64748B] dark:text-slate-400 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Hızlı Arama Önerileri</span>
                </div>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {[
                    'Market & Gıda',
                    'Fatura & Abonelik',
                    'Maaş',
                    'Kira',
                    'Ulaşım',
                    'Acil',
                    'Yakıt',
                  ].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setQuery(sug)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 text-xs text-[#0F172A] dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 border border-[#E2E8F0] dark:border-slate-700 transition"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* 1. EXPENSES SECTION */}
              {(activeTab === 'all' || activeTab === 'expense') && filteredExpenses.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <TrendingDown className="w-3.5 h-3.5" />
                      Gider İşlemleri ({filteredExpenses.length})
                    </span>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigate('finance');
                      }}
                      className="text-[11px] text-[#64748B] hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-0.5"
                    >
                      Finans'a Git
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {filteredExpenses.map((exp) => (
                      <div
                        key={exp.id}
                        className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0A0F1D]/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-800 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                            <TrendingDown className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-white truncate">
                                {exp.category}
                              </span>
                              {exp.isMandatory && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                                  Zorunlu
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                              <span>{formatDateTurkish(exp.date)}</span>
                              {exp.note && (
                                <>
                                  <span>•</span>
                                  <span className="truncate italic max-w-[200px] sm:max-w-xs">{exp.note}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400">
                            -{formatCurrency(exp.amount)}
                          </span>

                          {onDeleteExpense && (
                            deleteConfirmId === exp.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeleteExpense(exp.id);
                                    setDeleteConfirmId(null);
                                  }}
                                  className="px-2 py-1 rounded bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700 transition"
                                >
                                  Sil
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-1.5 py-1 rounded bg-slate-200 dark:bg-slate-700 text-[10px]"
                                >
                                  İptal
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(exp.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-[#64748B] hover:text-rose-600 transition"
                                title="İşlemi Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. INCOMES SECTION */}
              {(activeTab === 'all' || activeTab === 'income') && filteredIncomes.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Gelir İşlemleri ({filteredIncomes.length})
                    </span>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigate('finance');
                      }}
                      className="text-[11px] text-[#64748B] hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-0.5"
                    >
                      Finans'a Git
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {filteredIncomes.map((inc) => (
                      <div
                        key={inc.id}
                        className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0A0F1D]/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-800 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-white truncate">
                                {inc.source}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                              <span>{formatDateTurkish(inc.date)}</span>
                              {inc.note && (
                                <>
                                  <span>•</span>
                                  <span className="truncate italic max-w-[200px] sm:max-w-xs">{inc.note}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            +{formatCurrency(inc.amount)}
                          </span>

                          {onDeleteIncome && (
                            deleteConfirmId === inc.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeleteIncome(inc.id);
                                    setDeleteConfirmId(null);
                                  }}
                                  className="px-2 py-1 rounded bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700 transition"
                                >
                                  Sil
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-1.5 py-1 rounded bg-slate-200 dark:bg-slate-700 text-[10px]"
                                >
                                  İptal
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(inc.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-[#64748B] hover:text-rose-600 transition"
                                title="İşlemi Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. TASKS SECTION */}
              {(activeTab === 'all' || activeTab === 'task') && filteredTasks.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5" />
                      Görevler ({filteredTasks.length})
                    </span>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigate('tasks');
                      }}
                      className="text-[11px] text-[#64748B] hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-0.5"
                    >
                      Görevler'e Git
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {filteredTasks.map((task) => {
                      const priorityColor =
                        task.priority === 'high'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                          : task.priority === 'medium'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                          : 'bg-slate-100 text-[#64748B] dark:bg-slate-800 dark:text-slate-400 border-[#E2E8F0] dark:border-slate-700';

                      const priorityLabel =
                        task.priority === 'high' ? 'Acil' : task.priority === 'medium' ? 'Orta' : 'Düşük';

                      return (
                        <div
                          key={task.id}
                          className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0A0F1D]/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-800 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {onToggleTask ? (
                              <button
                                type="button"
                                onClick={() => onToggleTask(task.id)}
                                className="shrink-0 text-emerald-600 dark:text-emerald-400 hover:scale-110 transition active:scale-95"
                                title={task.completed ? 'Tamamlanmadı olarak işaretle' : 'Tamamlandı olarak işaretle'}
                              >
                                {task.completed ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <Circle className="w-5 h-5 text-slate-400 hover:text-emerald-600" />
                                )}
                              </button>
                            ) : (
                              <div className="shrink-0">
                                {task.completed ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <Circle className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                            )}

                            <div className="min-w-0">
                              <span
                                className={`text-xs sm:text-sm font-medium block truncate ${
                                  task.completed
                                    ? 'line-through text-[#64748B] dark:text-slate-500'
                                    : 'text-[#0F172A] dark:text-white'
                                }`}
                              >
                                {task.title}
                              </span>
                              <div className="flex items-center gap-2 text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                                {task.dueDate && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDateTurkish(task.dueDate)}
                                  </span>
                                )}
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${priorityColor}`}>
                                  {priorityLabel}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {onDeleteTask && (
                              deleteConfirmId === task.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onDeleteTask(task.id);
                                      setDeleteConfirmId(null);
                                    }}
                                    className="px-2 py-1 rounded bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700 transition"
                                  >
                                    Sil
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="px-1.5 py-1 rounded bg-slate-200 dark:bg-slate-700 text-[10px]"
                                  >
                                    İptal
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(task.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-[#64748B] hover:text-rose-600 transition"
                                  title="Görevi Sil"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. CARDS SECTION */}
              {(activeTab === 'all' || activeTab === 'card') && filteredCards.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      Kredi Kartları ({filteredCards.length})
                    </span>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigate('finance');
                      }}
                      className="text-[11px] text-[#64748B] hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-0.5"
                    >
                      Finans'a Git
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {filteredCards.map((card) => (
                      <div
                        key={card.id}
                        className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0A0F1D]/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-800 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-white truncate block">
                              {card.name}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                              <span>Kesim: {card.statementDate}. gün</span>
                              <span>•</span>
                              <span>Son Ödeme: {formatDateTurkish(card.dueDate)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400">
                            {formatCurrency(card.totalDebt)}
                          </span>
                          <span className="block text-[10px] text-[#64748B] dark:text-slate-400">
                            Güncel Borç
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400">
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-[10px] font-mono">
              ESC
            </kbd>
            <span>Kapat</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Toplam:</span>
            <strong className="text-[#0F172A] dark:text-white">
              {data.expenses.length} Gider, {data.incomes.length} Gelir, {data.tasks.length} Görev
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
