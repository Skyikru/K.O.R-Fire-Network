import React, { useState } from 'react';
import {
  AppData,
  Income,
  Expense,
  CreditCardDebt,
  IncomeSource,
  ExpenseCategory,
} from '../types';
import {
  formatCurrency,
  calculateMinCardPayment,
  getTodayString,
  formatDateTurkish,
} from '../utils/storage';
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Calculator,
  CheckCircle,
  Tag,
  AlertCircle,
  FileSpreadsheet,
  Search,
  X,
  FileText,
  Layers,
  Scale,
  Umbrella,
  Zap,
  PiggyBank,
  CalendarClock,
  Smartphone,
} from 'lucide-react';
import {
  CategoryBudget,
  EmergencyFund,
  InstallmentLoan,
  DailyRoutineExpense,
  SavingsGoal,
  SubscriptionItem,
  FixedExpenseItem,
} from '../types';
import { InstallmentLoansManager } from './InstallmentLoansManager';
import { CategoryBudgetCard } from './CategoryBudgetCard';
import { BudgetStatusCard } from './BudgetStatusCard';
import { EmergencyFundCard } from './EmergencyFundCard';
import { DailyRoutineExpensesCard } from './DailyRoutineExpensesCard';
import { SavingsGoalsManager } from './SavingsGoalsManager';
import { YearlySavingsProgressCard } from './YearlySavingsProgressCard';
import { SubscriptionsManager } from './SubscriptionsManager';
import { FixedExpensesManager } from './FixedExpensesManager';
import { SafeToSpendCard } from './SafeToSpendCard';
import { SmartTipCard } from './SmartTipCard';

interface FinanceViewProps {
  data: AppData;
  onAddIncome: (income: Omit<Income, 'id'>) => void;
  onDeleteIncome: (id: string) => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
  onAddCard: (card: Omit<CreditCardDebt, 'id'>) => void;
  onUpdateCardDebt: (cardId: string, newTotalDebt: number) => void;
  onDeleteCard: (id: string) => void;
  onSaveBudgets?: (budgets: CategoryBudget[]) => void;
  onUpdateEmergencyFund?: (fund: EmergencyFund) => void;
  onAddInstallment?: (inst: Omit<InstallmentLoan, 'id'>) => void;
  onPayInstallment?: (id: string) => void;
  onDeleteInstallment?: (id: string) => void;
  onOpenReportModal?: () => void;
  onOpenBankSmsModal?: () => void;
  onLogRoutineExpense?: (routine: DailyRoutineExpense) => void;
  onRewardAvoidedHabit?: (routine: DailyRoutineExpense) => void;
  onSaveRoutines?: (newRoutines: DailyRoutineExpense[]) => void;
  onSaveGoals?: (newGoals: SavingsGoal[]) => void;
  onSaveSubscriptions?: (newSubs: SubscriptionItem[]) => void;
  onSaveFixedExpenses?: (newFixed: FixedExpenseItem[]) => void;
}

const INCOME_SOURCES: IncomeSource[] = [
  'Maaş',
  'Ek Gelir',
  'Serbest Meslek',
  'Yatırım / Getiri',
  'Satış',
  'Diğer',
];

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
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

export const FinanceView: React.FC<FinanceViewProps> = ({
  data,
  onAddIncome,
  onDeleteIncome,
  onAddExpense,
  onDeleteExpense,
  onAddCard,
  onUpdateCardDebt,
  onDeleteCard,
  onSaveBudgets,
  onUpdateEmergencyFund,
  onAddInstallment,
  onPayInstallment,
  onDeleteInstallment,
  onOpenReportModal,
  onOpenBankSmsModal,
  onLogRoutineExpense,
  onRewardAvoidedHabit,
  onSaveRoutines,
  onSaveGoals,
  onSaveSubscriptions,
  onSaveFixedExpenses,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    | 'cards'
    | 'fixed'
    | 'routines'
    | 'goals'
    | 'subscriptions'
    | 'installments'
    | 'budgets'
    | 'emergency'
    | 'expenses'
    | 'incomes'
    | 'calculator'
  >('cards');

  // Income form state
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeSource, setIncomeSource] = useState<string>('Maaş');
  const [incomeDate, setIncomeDate] = useState(getTodayString());
  const [incomeNote, setIncomeNote] = useState('');

  // Expense form state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<string>('Market & Gıda');
  const [expenseDate, setExpenseDate] = useState(getTodayString());
  const [expenseIsMandatory, setExpenseIsMandatory] = useState(false);
  const [expenseNote, setExpenseNote] = useState('');

  // Card form state
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardTotalDebt, setCardTotalDebt] = useState('');
  const [cardStatementDate, setCardStatementDate] = useState('15');
  const [cardDueDate, setCardDueDate] = useState(getTodayString());
  const [cardMinRate, setCardMinRate] = useState<number>(20);
  const [cardNote, setCardNote] = useState('');

  // Standalone Asgari Hesaplama Simülatörü state
  const [calcDebt, setCalcDebt] = useState('25000');
  const [calcRate, setCalcRate] = useState<number>(20);

  // Month filtering & Search state
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [financeSearchQuery, setFinanceSearchQuery] = useState('');

  const normalizedSearch = financeSearchQuery.toLocaleLowerCase('tr-TR').trim();

  const filteredIncomes = (selectedMonth === 'all'
    ? data.incomes
    : data.incomes.filter((i) => i.date.startsWith(selectedMonth))
  ).filter((i) => {
    if (!normalizedSearch) return true;
    return (
      i.source.toLocaleLowerCase('tr-TR').includes(normalizedSearch) ||
      (i.note && i.note.toLocaleLowerCase('tr-TR').includes(normalizedSearch)) ||
      String(i.amount).includes(normalizedSearch) ||
      i.date.includes(normalizedSearch)
    );
  });

  const filteredExpenses = (selectedMonth === 'all'
    ? data.expenses
    : data.expenses.filter((e) => e.date.startsWith(selectedMonth))
  ).filter((e) => {
    if (!normalizedSearch) return true;
    return (
      e.category.toLocaleLowerCase('tr-TR').includes(normalizedSearch) ||
      (e.note && e.note.toLocaleLowerCase('tr-TR').includes(normalizedSearch)) ||
      String(e.amount).includes(normalizedSearch) ||
      e.date.includes(normalizedSearch)
    );
  });

  const totalFilteredIncome = filteredIncomes.reduce((s, i) => s + i.amount, 0);
  const totalFilteredExpense = filteredExpenses.reduce((s, e) => s + e.amount, 0);

  // Handlers
  const handleSaveIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(incomeAmount);
    if (isNaN(num) || num <= 0) return;
    onAddIncome({
      amount: num,
      source: incomeSource,
      date: incomeDate || getTodayString(),
      note: incomeNote.trim() || undefined,
    });
    setIncomeAmount('');
    setIncomeNote('');
    setShowIncomeModal(false);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(expenseAmount);
    if (isNaN(num) || num <= 0) return;
    onAddExpense({
      amount: num,
      category: expenseCategory,
      date: expenseDate || getTodayString(),
      isMandatory: expenseIsMandatory,
      note: expenseNote.trim() || undefined,
    });
    setExpenseAmount('');
    setExpenseNote('');
    setExpenseIsMandatory(false);
    setShowExpenseModal(false);
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(cardTotalDebt);
    if (!cardName.trim() || isNaN(num) || num < 0) return;
    onAddCard({
      name: cardName.trim(),
      totalDebt: num,
      statementDate: parseInt(cardStatementDate) || 1,
      dueDate: cardDueDate || getTodayString(),
      minPaymentRate: cardMinRate,
      note: cardNote.trim() || undefined,
    });
    setCardName('');
    setCardTotalDebt('');
    setCardNote('');
    setShowCardModal(false);
  };

  // Asgari simülasyon hesaplaması
  const simDebtNum = parseFloat(calcDebt) || 0;
  const simMinPayment = Math.round((simDebtNum * calcRate) / 100);
  const simRemainingDebt = Math.max(0, simDebtNum - simMinPayment);

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Sub-Tabs & Actions Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('cards')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
              activeSubTab === 'cards'
                ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/30 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Kredi Kartları
          </button>
          <button
            onClick={() => setActiveSubTab('fixed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
              activeSubTab === 'fixed'
                ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/30 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            📌 Sabit Giderlerim
          </button>
          <button
            onClick={() => setActiveSubTab('routines')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
              activeSubTab === 'routines'
                ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/30 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            ⚡ Sabit Rutinler
          </button>
          <button
            onClick={() => setActiveSubTab('goals')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
              activeSubTab === 'goals'
                ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/30 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            🎯 Birikim Hedefleri
          </button>
          <button
            onClick={() => setActiveSubTab('subscriptions')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
              activeSubTab === 'subscriptions'
                ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/30 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            🔄 Abonelikler
          </button>
          <button
            onClick={() => setActiveSubTab('installments')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
              activeSubTab === 'installments'
                ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/30 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Taksit & Kredi
          </button>
          <button
            onClick={() => setActiveSubTab('budgets')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
              activeSubTab === 'budgets'
                ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/30 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Bütçe Limitleri
          </button>
          <button
            onClick={() => setActiveSubTab('emergency')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
              activeSubTab === 'emergency'
                ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/30 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Acil Fon
          </button>
          <button
            onClick={() => setActiveSubTab('expenses')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
              activeSubTab === 'expenses'
                ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/30 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Giderler
          </button>
          <button
            onClick={() => setActiveSubTab('incomes')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
              activeSubTab === 'incomes'
                ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/30 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Gelirler
          </button>
          <button
            onClick={() => setActiveSubTab('calculator')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
              activeSubTab === 'calculator'
                ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/30 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Hesaplayıcı
          </button>
        </div>

        {/* Action Button based on sub-tab */}
        <div className="flex items-center gap-2">
          {onOpenBankSmsModal && (
            <button
              onClick={onOpenBankSmsModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold transition active:scale-95 shadow-2xs"
              title="Banka SMS veya Bildirim Metni Yapıştır (Akıllı Ayrıştırıcı)"
            >
              <Smartphone className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="hidden sm:inline">SMS Ayrıştır</span>
            </button>
          )}
          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium transition active:scale-95 shadow-2xs"
              title="Aylık Finansal Bütçe Karnesi & Ekstre"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Ekstre / Rapor</span>
            </button>
          )}
          {activeSubTab === 'cards' && (
            <button
              onClick={() => setShowCardModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition active:scale-95 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Kart/Borç Ekle</span>
            </button>
          )}
          {activeSubTab === 'expenses' && (
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-medium transition active:scale-95 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Gider Girişi Yap</span>
            </button>
          )}
          {activeSubTab === 'incomes' && (
            <button
              onClick={() => setShowIncomeModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition active:scale-95 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Gelir Girişi Yap</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. KREDİ KARTLARI & BORÇ TAKİBİ */}
      {activeSubTab === 'cards' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3">
            <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-slate-200">Asgari Ödeme Kuralı:</strong> BDDK mevzuatına göre 25.000 TL ve altı limitli kredi kartlarında asgari ödeme oranı <strong>%20</strong>, 25.000 TL üzeri limitlerde <strong>%40</strong> olarak uygulanır. Her kart için dilediğiniz oranı seçebilirsiniz.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.cards.map((card) => {
              const minPayment = calculateMinCardPayment(card);
              const remainingAfterMin = Math.max(0, card.totalDebt - minPayment);
              return (
                <div
                  key={card.id}
                  className="bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 relative group shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{card.name}</h3>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Son Ödeme Tarihi: <strong className="text-slate-800 dark:text-slate-300">{formatDateTurkish(card.dueDate)}</strong>
                        {' '}(Kesim: Ayın {card.statementDate}. günü)
                      </p>
                    </div>
                    <button
                      onClick={() => onDeleteCard(card.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                      title="Kartı Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Debt numbers card */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Toplam Borç</span>
                      <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {formatCurrency(card.totalDebt)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        Asgari Tutar (%{card.minPaymentRate})
                      </span>
                      <div className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                        {formatCurrency(minPayment)}
                      </div>
                    </div>
                  </div>

                  {/* Remaining Debt info */}
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between px-1">
                    <span>Asgari ödenirse devreden borç:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{formatCurrency(remainingAfterMin)}</span>
                  </div>

                  {/* Update debt action */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        const newDebt = prompt(
                          `"${card.name}" için yeni güncel toplam borç tutarını girin:`,
                          card.totalDebt.toString()
                        );
                        if (newDebt !== null) {
                          const val = parseFloat(newDebt);
                          if (!isNaN(val) && val >= 0) {
                            onUpdateCardDebt(card.id, val);
                          }
                        }
                      }}
                      className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition"
                    >
                      Borç Tutarını Güncelle
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Asgari tutar olan ${formatCurrency(minPayment)} ödendi sayılsın ve borçtan düşülsün mü?`)) {
                          onUpdateCardDebt(card.id, remainingAfterMin);
                        }
                      }}
                      className="text-xs px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition"
                    >
                      Asgariyi Ödedim
                    </button>
                  </div>
                </div>
              );
            })}

            {data.cards.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                <CreditCard className="w-10 h-10 text-[#64748B] mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-[#0F172A] dark:text-white">Henüz Kayıtlı Kredi Kartı veya Borç Yok</h4>
                <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                  Kredi kartı ekstrelerinizi ve asgari ödeme tutarlarını otomatik hesaplamak için kart ekleyin.
                </p>
                <button
                  onClick={() => setShowCardModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium shadow-xs"
                >
                  Kart Ekle
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SABİT GİDERLERİM TAB (Kira, Fatura, Aidat, Abonelikler) */}
      {activeSubTab === 'fixed' && (
        <FixedExpensesManager
          fixedExpenses={data.fixedExpenses || []}
          onSaveFixedExpenses={onSaveFixedExpenses || (() => {})}
          onRecordAsExpense={(item) =>
            onAddExpense({
              amount: item.amount,
              category: item.category,
              date: getTodayString(),
              isMandatory: true,
              note: `${item.title} (Düzenli Sabit Gider)`,
            })
          }
        />
      )}

      {/* 1.1 GÜNLÜK SABİT HARCAMALAR & RUTİNLER TAB */}
      {activeSubTab === 'routines' && (
        <DailyRoutineExpensesCard
          routines={data.dailyRoutines || []}
          expenses={data.expenses}
          onLogRoutineExpense={onLogRoutineExpense || (() => {})}
          onSaveRoutines={onSaveRoutines || (() => {})}
          onRewardAvoidedHabit={onRewardAvoidedHabit}
        />
      )}

      {/* 1.2 BİRİKİM HEDEFLERİ TAB */}
      {activeSubTab === 'goals' && (
        <div className="space-y-6">
          <YearlySavingsProgressCard
            goals={data.savingsGoals || []}
            onSaveGoals={onSaveGoals}
          />
          <SavingsGoalsManager
            goals={data.savingsGoals || []}
            onSaveGoals={onSaveGoals || (() => {})}
          />
        </div>
      )}

      {/* 1.3 ABONELİKLER TAB */}
      {activeSubTab === 'subscriptions' && (
        <SubscriptionsManager
          subscriptions={data.subscriptions || []}
          onSaveSubscriptions={onSaveSubscriptions || (() => {})}
        />
      )}

      {/* 2. TAKSİT & KREDİLER TAB */}
      {activeSubTab === 'installments' && (
        <InstallmentLoansManager
          installments={data.installments || []}
          onAddInstallment={onAddInstallment || (() => {})}
          onPayInstallment={onPayInstallment || (() => {})}
          onDeleteInstallment={onDeleteInstallment || (() => {})}
        />
      )}

      {/* 3. BÜTÇE LİMİTLERİ TAB */}
      {activeSubTab === 'budgets' && (
        <div className="space-y-6">
          <SmartTipCard
            data={data}
            onOpenQuickExpense={() => setShowExpenseModal(true)}
          />
          <BudgetStatusCard
            expenses={data.expenses}
            budgets={data.categoryBudgets || []}
            onSaveBudgets={onSaveBudgets}
            onOpenQuickExpense={() => setShowExpenseModal(true)}
          />
          <CategoryBudgetCard
            expenses={data.expenses}
            budgets={data.categoryBudgets || []}
            onSaveBudgets={onSaveBudgets || (() => {})}
            onOpenQuickExpense={() => setShowExpenseModal(true)}
          />
        </div>
      )}

      {/* 4. ACİL DURUM FONU TAB */}
      {activeSubTab === 'emergency' && (
        <EmergencyFundCard
          data={data}
          onUpdateEmergencyFund={onUpdateEmergencyFund || (() => {})}
        />
      )}

      {/* 5. GİDERLER TAB */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-4">
          {/* Controls: Search & Total */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#64748B] dark:text-slate-400" />
              <input
                type="text"
                value={financeSearchQuery}
                onChange={(e) => setFinanceSearchQuery(e.target.value)}
                placeholder="Giderlerde ara (kategori, not, tutar, tarih)..."
                className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 text-xs text-[#0F172A] dark:text-white placeholder:text-[#64748B] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
              />
              {financeSearchQuery && (
                <button
                  type="button"
                  onClick={() => setFinanceSearchQuery('')}
                  className="absolute right-2.5 top-2 p-0.5 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#111827] px-3 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-slate-800 text-xs shadow-2xs shrink-0">
              <span className="text-[#64748B] dark:text-slate-400">Bu Liste Toplamı:</span>
              <span className="font-bold text-rose-500 text-sm">-{formatCurrency(totalFilteredExpense)}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {filteredExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                      <TrendingDown className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#0F172A] dark:text-white">{exp.category}</span>
                        {exp.isMandatory && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Zorunlu Gider
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                        {formatDateTurkish(exp.date)} {exp.note && `• ${exp.note}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs sm:text-sm font-bold text-rose-500">
                      -{formatCurrency(exp.amount)}
                    </span>
                    <button
                      onClick={() => onDeleteExpense(exp.id)}
                      className="p-1 rounded-lg text-[#64748B] hover:text-rose-500 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredExpenses.length === 0 && (
                <div className="py-10 text-center text-xs text-[#64748B] dark:text-slate-500">
                  Bu aya ait kayıtlı gider bulunmuyor.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. GELİRLER TAB */}
      {activeSubTab === 'incomes' && (
        <div className="space-y-4">
          {/* Controls: Search & Total */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#64748B] dark:text-slate-400" />
              <input
                type="text"
                value={financeSearchQuery}
                onChange={(e) => setFinanceSearchQuery(e.target.value)}
                placeholder="Gelirlerde ara (kaynak, not, tutar, tarih)..."
                className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 text-xs text-[#0F172A] dark:text-white placeholder:text-[#64748B] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
              />
              {financeSearchQuery && (
                <button
                  type="button"
                  onClick={() => setFinanceSearchQuery('')}
                  className="absolute right-2.5 top-2 p-0.5 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#111827] px-3 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-slate-800 text-xs shadow-2xs shrink-0">
              <span className="text-[#64748B] dark:text-slate-400">Bu Liste Toplamı:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">+{formatCurrency(totalFilteredIncome)}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {filteredIncomes.map((inc) => (
                <div
                  key={inc.id}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">{inc.source}</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {formatDateTurkish(inc.date)} {inc.note && `• ${inc.note}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(inc.amount)}
                    </span>
                    <button
                      onClick={() => onDeleteIncome(inc.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredIncomes.length === 0 && (
                <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
                  Bu aya ait kayıtlı gelir bulunmuyor.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. ASGARİ HESAPLAYICI SİMÜLATÖRÜ */}
      {activeSubTab === 'calculator' && (
        <div className="bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-xl mx-auto space-y-5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Kredi Kartı Asgari Ödeme Hesaplayıcı</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">İstediğiniz borç tutarına göre anlık asgari tutarı ve kalan borcu görün</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Güncel Toplam Ekstre Borcu (TL)
              </label>
              <input
                type="number"
                value={calcDebt}
                onChange={(e) => setCalcDebt(e.target.value)}
                placeholder="Örn: 20000"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Asgari Ödeme Oranı
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[20, 40].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setCalcRate(rate)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition ${
                      calcRate === rate
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    %{rate} {rate === 20 ? '(≤25.000 TL)' : '(>25.000 TL)'}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const custom = prompt('Özel oran giriniz (yüzde olarak):', '30');
                    if (custom) {
                      const cNum = parseInt(custom);
                      if (!isNaN(cNum) && cNum > 0 && cNum <= 100) setCalcRate(cNum);
                    }
                  }}
                  className={`py-2 rounded-xl text-xs font-semibold border transition ${
                    calcRate !== 20 && calcRate !== 40
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {calcRate !== 20 && calcRate !== 40 ? `%${calcRate} (Özel)` : 'Özel %'}
                </button>
              </div>
            </div>

            {/* Results card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Bu Ay Ödenmesi Gereken Asgari Tutar:</span>
                <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(simMinPayment)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Asgari Sonrası Kalan Devreden Borç:</span>
                <span className="text-slate-800 dark:text-slate-300 font-medium">
                  {formatCurrency(simRemainingDebt)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              💡 Asgari tutarın altında ödeme yapılması durumunda gecikme faizi ve kredi sicil puanı olumsuz etkilenir. Mümkün olduğunca borcun tamamını veya asgariden fazlasını ödemek faiz maliyetini azaltır.
            </p>
          </div>
        </div>
      )}

      {/* MODAL: Yeni Gelir Ekle */}
      {showIncomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-3.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Yeni Gelir Ekle
            </h3>
            <form onSubmit={handleSaveIncome} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Tutar (TL) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:border-emerald-500 focus:outline-none shadow-xs"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Gelir Kaynağı</label>
                <select
                  value={incomeSource}
                  onChange={(e) => setIncomeSource(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:border-emerald-500 focus:outline-none shadow-xs"
                >
                  {INCOME_SOURCES.map((src) => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Tarih</label>
                <input
                  type="date"
                  value={incomeDate}
                  onChange={(e) => setIncomeDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:border-emerald-500 focus:outline-none shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Not / Açıklama</label>
                <input
                  type="text"
                  placeholder="Örn: Prim veya kira geliri"
                  value={incomeNote}
                  onChange={(e) => setIncomeNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:border-emerald-500 focus:outline-none shadow-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIncomeModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition shadow-xs"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Yeni Gider Ekle */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-3.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-rose-500" />
              Yeni Gider Ekle
            </h3>
            <form onSubmit={handleSaveExpense} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Tutar (TL) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:border-rose-500 focus:outline-none shadow-xs"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Kategori</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:border-rose-500 focus:outline-none shadow-xs"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Tarih</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:border-rose-500 focus:outline-none shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Not / Açıklama</label>
                <input
                  type="text"
                  placeholder="Örn: Süpermarket veya fatura"
                  value={expenseNote}
                  onChange={(e) => setExpenseNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:border-rose-500 focus:outline-none shadow-xs"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="mandatoryCheck"
                  checked={expenseIsMandatory}
                  onChange={(e) => setExpenseIsMandatory(e.target.checked)}
                  className="rounded text-amber-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
                <label htmlFor="mandatoryCheck" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  Zorunlu / Vadesi Dolacak Ödeme (Minimum bütçeye dahil et)
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition shadow-xs"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Yeni Kredi Kartı / Borç Ekle */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-3.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Kredi Kartı / Borç Ekle
            </h3>
            <form onSubmit={handleSaveCard} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Kart / Borç Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Garanti Bonus Kart"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:border-emerald-500 focus:outline-none shadow-xs"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Toplam Güncel Borç (TL) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={cardTotalDebt}
                  onChange={(e) => setCardTotalDebt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:border-emerald-500 focus:outline-none shadow-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Hesap Kesim Günü</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={cardStatementDate}
                    onChange={(e) => setCardStatementDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:border-emerald-500 focus:outline-none shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Son Ödeme Tarihi</label>
                  <input
                    type="date"
                    value={cardDueDate}
                    onChange={(e) => setCardDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:border-emerald-500 focus:outline-none shadow-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Asgari Ödeme Oranı</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCardMinRate(20)}
                    className={`py-1.5 rounded-lg text-xs font-semibold border ${
                      cardMinRate === 20
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    %20 (Varsayılan)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardMinRate(40)}
                    className={`py-1.5 rounded-lg text-xs font-semibold border ${
                      cardMinRate === 40
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    %40 (Limit &gt;25k)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition shadow-xs"
                >
                  Kartı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
