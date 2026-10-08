import React, { useState } from 'react';
import { FixedExpenseItem, ExpenseCategory } from '../types';
import { formatCurrency } from '../utils/storage';
import {
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Home,
  Zap,
  Wifi,
  CreditCard,
  Building,
  Film,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Bell,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';

interface FixedExpensesManagerProps {
  fixedExpenses: FixedExpenseItem[];
  onSaveFixedExpenses: (newExpenses: FixedExpenseItem[]) => void;
  onRecordAsExpense?: (item: FixedExpenseItem) => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Kira & Konut',
  'Fatura & Abonelik',
  'Zorunlu Ödeme',
  'Market & Gıda',
  'Ulaşım & Yakıt',
  'Sağlık & Bakım',
  'Eğitim',
  'Diğer',
];

const getTypeIcon = (type: FixedExpenseItem['type']) => {
  switch (type) {
    case 'rent':
      return <Home className="w-4 h-4 text-amber-500" />;
    case 'dues':
      return <Building className="w-4 h-4 text-emerald-500" />;
    case 'bill':
      return <Zap className="w-4 h-4 text-blue-500" />;
    case 'subscription':
      return <Film className="w-4 h-4 text-purple-500" />;
    case 'loan':
      return <CreditCard className="w-4 h-4 text-rose-500" />;
    default:
      return <Calendar className="w-4 h-4 text-slate-400" />;
  }
};

const getTypeName = (type: FixedExpenseItem['type']) => {
  switch (type) {
    case 'rent':
      return 'Kira';
    case 'dues':
      return 'Aidat';
    case 'bill':
      return 'Fatura';
    case 'subscription':
      return 'Abonelik';
    case 'loan':
      return 'Kredi / Taksit';
    default:
      return 'Düzenli Gider';
  }
};

export const FixedExpensesManager: React.FC<FixedExpensesManagerProps> = ({
  fixedExpenses,
  onSaveFixedExpenses,
  onRecordAsExpense,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'pending' | 'paid'>('all');

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('15');
  const [category, setCategory] = useState<ExpenseCategory>('Kira & Konut');
  const [type, setType] = useState<FixedExpenseItem['type']>('rent');
  const [autoPay, setAutoPay] = useState(false);
  const [note, setNote] = useState('');

  const today = new Date().getDate();

  // Sort items by dueDay (1 to 31)
  const sortedExpenses = [...fixedExpenses].sort((a, b) => a.dueDay - b.dueDay);

  // Calculations
  const totalMonthlyFixed = fixedExpenses.reduce((sum, item) => sum + item.amount, 0);
  const totalPaidThisMonth = fixedExpenses
    .filter((item) => item.isPaidThisMonth)
    .reduce((sum, item) => sum + item.amount, 0);
  const remainingToPay = Math.max(0, totalMonthlyFixed - totalPaidThisMonth);

  // Upcoming items in next 7 days
  const upcomingCount = fixedExpenses.filter((item) => {
    if (item.isPaidThisMonth) return false;
    const diff = item.dueDay - today;
    return diff >= 0 && diff <= 7;
  }).length;

  // Toggle paid status
  const handleTogglePaid = (id: string) => {
    const target = fixedExpenses.find((f) => f.id === id);
    const updated = fixedExpenses.map((f) =>
      f.id === id ? { ...f, isPaidThisMonth: !f.isPaidThisMonth } : f
    );
    onSaveFixedExpenses(updated);

    // If marked as paid, trigger optional expense record callback
    if (target && !target.isPaidThisMonth && onRecordAsExpense) {
      onRecordAsExpense(target);
    }
  };

  // Delete item
  const handleDelete = (id: string) => {
    onSaveFixedExpenses(fixedExpenses.filter((f) => f.id !== id));
  };

  // Add item form submission
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    const numDay = parseInt(dueDay, 10);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;

    const newItem: FixedExpenseItem = {
      id: `fix-${Date.now()}`,
      title: title.trim(),
      amount: numAmount,
      dueDay: Math.min(31, Math.max(1, numDay || 1)),
      category,
      type,
      autoPay,
      isPaidThisMonth: false,
      note: note.trim() || undefined,
    };

    onSaveFixedExpenses([...fixedExpenses, newItem]);
    setTitle('');
    setAmount('');
    setDueDay('15');
    setNote('');
    setAutoPay(false);
    setShowAddModal(false);
  };

  // Filtered list
  const filteredList = sortedExpenses.filter((item) => {
    if (filter === 'paid') return item.isPaidThisMonth;
    if (filter === 'pending') return !item.isPaidThisMonth;
    if (filter === 'upcoming') {
      if (item.isPaidThisMonth) return false;
      const diff = item.dueDay - today;
      return diff >= 0 && diff <= 7;
    }
    return true;
  });

  return (
    <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0 shadow-2xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                Sabit Giderlerim
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                {fixedExpenses.length} Düzenli Ödeme
              </span>
              {upcomingCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  <Bell className="w-3 h-3 text-amber-500" />
                  {upcomingCount} Yaklaşan Vade
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
              Kira, aidat, fatura ve abonelik gibi düzenli ödemelerin yaklaşan vade tarihleri
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Sabit Gider Ekle</span>
        </button>
      </div>

      {/* MACRO SUMMARY STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 text-xs">
        {/* 1. Toplam Sabit Gider */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-slate-400 block">
            Aylık Toplam Sabit
          </span>
          <span className="text-sm sm:text-base font-extrabold text-[#0F172A] dark:text-white block mt-0.5">
            {formatCurrency(totalMonthlyFixed)}
          </span>
          <span className="text-[10px] text-slate-400 block">
            {fixedExpenses.length} kalem düzenli harcama
          </span>
        </div>

        {/* 2. Bu Ay Ödenenler */}
        <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
          <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">
            Bu Ay Ödenen
          </span>
          <span className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 block mt-0.5">
            {formatCurrency(totalPaidThisMonth)}
          </span>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">
            Tamamlanan ödemeler
          </span>
        </div>

        {/* 3. Kalan Yaklaşan */}
        <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
          <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 block">
            Kalan Ödeme
          </span>
          <span className="text-sm sm:text-base font-extrabold text-amber-600 dark:text-amber-400 block mt-0.5">
            {formatCurrency(remainingToPay)}
          </span>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 block">
            Vadesi beklenen tutar
          </span>
        </div>

        {/* 4. Yaklaşan Vadeler */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-slate-400 block">
            7 Günlük Vade
          </span>
          <span className="text-sm sm:text-base font-extrabold text-indigo-600 dark:text-indigo-400 block mt-0.5">
            {upcomingCount} Adet
          </span>
          <span className="text-[10px] text-slate-400 block">
            Önümüzdeki hafta içinde
          </span>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center justify-between mb-3 pt-2 border-t border-[#E2E8F0] dark:border-slate-800">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
              filter === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white bg-slate-100/70 dark:bg-slate-800/60'
            }`}
          >
            Tümü ({fixedExpenses.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('upcoming')}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
              filter === 'upcoming'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Yaklaşanlar ({upcomingCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
              filter === 'pending'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-blue-700 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20'
            }`}
          >
            Bekleyenler ({fixedExpenses.filter((f) => !f.isPaidThisMonth).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('paid')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
              filter === 'paid'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
            }`}
          >
            Ödenenler ({fixedExpenses.filter((f) => f.isPaidThisMonth).length})
          </button>
        </div>

        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Vade gününe göre sıralıdır
        </span>
      </div>

      {/* LIST OF FIXED EXPENSES */}
      <div className="space-y-2.5">
        {filteredList.map((item) => {
          const isPaid = item.isPaidThisMonth;
          const diff = item.dueDay - today;
          const isToday = diff === 0;
          const isOverdue = diff < 0 && !isPaid;
          const isUrgent = diff > 0 && diff <= 3 && !isPaid;
          const isSoon = diff > 3 && diff <= 7 && !isPaid;

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isPaid
                  ? 'bg-slate-50/50 dark:bg-slate-900/40 border-[#E2E8F0] dark:border-slate-800 opacity-80'
                  : isToday
                  ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-500/20'
                  : isOverdue
                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                  : isUrgent
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 ring-1 ring-amber-500/20'
                  : isSoon
                  ? 'bg-amber-50/30 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/30'
                  : 'bg-white dark:bg-slate-900/70 border-[#E2E8F0] dark:border-slate-800'
              }`}
            >
              {/* Left Info: Icon, Title, Type, Category, Due date */}
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5 sm:mt-0">
                  {getTypeIcon(item.type)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs sm:text-sm font-bold ${
                        isPaid
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-[#0F172A] dark:text-white'
                      }`}
                    >
                      {item.title}
                    </span>

                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-slate-400">
                      {getTypeName(item.type)}
                    </span>

                    {item.autoPay && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        Otomatik Ödeme
                      </span>
                    )}

                    {/* Due Date Status Badge */}
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Bu Ay Ödendi
                      </span>
                    ) : isToday ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40 animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                        Vadesi Bugün!
                      </span>
                    ) : isOverdue ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                        {Math.abs(diff)} Gün Gecikti
                      </span>
                    ) : isUrgent ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40">
                        <Clock className="w-3 h-3 text-amber-500" />
                        {diff} Gün Kaldı (Acil)
                      </span>
                    ) : isSoon ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        <Clock className="w-3 h-3 text-amber-500" />
                        {diff} Gün Kaldı
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-slate-400">
                        {diff} Gün Sonra
                      </span>
                    )}
                  </div>

                  {/* Subtitle details */}
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#64748B] dark:text-slate-400">
                    <span>Her ayın {item.dueDay}. günü</span>
                    <span>•</span>
                    <span>{item.category}</span>
                    {item.note && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[180px]">{item.note}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Amount and Toggle / Delete Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E2E8F0] dark:border-slate-800">
                <div className="text-left sm:text-right">
                  <span className="text-sm sm:text-base font-extrabold text-[#0F172A] dark:text-white block">
                    {formatCurrency(item.amount)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Aylık sabit tutar
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleTogglePaid(item.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 ${
                      isPaid
                        ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#64748B] dark:text-slate-300'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isPaid ? 'Ödendi' : 'Öde'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
                    title="Sabit gideri kaldır"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredList.length === 0 && (
          <div className="text-center py-8 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Bu filtreye uygun sabit gider bulunamadı.
            </p>
          </div>
        )}
      </div>

      {/* ADD FIXED EXPENSE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-sm text-[#0F172A] dark:text-white">
                  Yeni Sabit Gider Ekle
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#0F172A] dark:text-slate-200 block mb-1">
                  Gider Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Ev Kirası, Fiber İnternet, Bina Aidatı"
                  className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#0F172A] dark:text-slate-200 block mb-1">
                    Aylık Tutar (TL) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1500"
                    className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#0F172A] dark:text-slate-200 block mb-1">
                    Vade Günü (1-31) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    placeholder="15"
                    className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#0F172A] dark:text-slate-200 block mb-1">
                    Gider Türü
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="rent">Kira</option>
                    <option value="dues">Aidat</option>
                    <option value="bill">Fatura</option>
                    <option value="subscription">Abonelik</option>
                    <option value="loan">Kredi / Taksit</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#0F172A] dark:text-slate-200 block mb-1">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-blue-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0F172A] dark:text-slate-200 block mb-1">
                  Açıklama / Not
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Opsiyonel detay..."
                  className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={autoPay}
                  onChange={(e) => setAutoPay(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
                <span className="text-xs text-[#64748B] dark:text-slate-400">
                  Bu gider için bankada otomatik ödeme talimatı var
                </span>
              </label>

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
                  Sabit Gideri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
