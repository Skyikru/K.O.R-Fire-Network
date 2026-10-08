import React, { useState } from 'react';
import { SubscriptionItem, ExpenseCategory } from '../types';
import { formatCurrency } from '../utils/storage';
import {
  CalendarClock,
  Plus,
  Trash2,
  CheckCircle,
  PauseCircle,
  PlayCircle,
  X,
  CreditCard,
  Sparkles,
} from 'lucide-react';

interface SubscriptionsManagerProps {
  subscriptions: SubscriptionItem[];
  onSaveSubscriptions: (newSubs: SubscriptionItem[]) => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Fatura & Abonelik',
  'Eğlence & Sosyal',
  'Sağlık & Bakım',
  'Eğitim',
  'Diğer',
];

export const SubscriptionsManager: React.FC<SubscriptionsManagerProps> = ({
  subscriptions,
  onSaveSubscriptions,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [renewalDay, setRenewalDay] = useState('15');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [category, setCategory] = useState<ExpenseCategory>('Fatura & Abonelik');
  const [note, setNote] = useState('');

  // Calculations
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const monthlyTotal = activeSubs.reduce((sum, s) => {
    return s.billingCycle === 'monthly' ? sum + s.amount : sum + Math.round(s.amount / 12);
  }, 0);
  const yearlyTotal = monthlyTotal * 12;

  // Next upcoming renewal based on today's day of month
  const todayDay = new Date().getDate();
  const sortedUpcoming = [...activeSubs].sort((a, b) => {
    const diffA = (a.renewalDay - todayDay + 31) % 31;
    const diffB = (b.renewalDay - todayDay + 31) % 31;
    return diffA - diffB;
  });
  const nextSub = sortedUpcoming[0];

  const handleToggleStatus = (id: string) => {
    const updated = subscriptions.map((s) =>
      s.id === id
        ? { ...s, status: (s.status === 'active' ? 'paused' : 'active') as 'active' | 'paused' }
        : s
    );
    onSaveSubscriptions(updated);
  };

  const handleDelete = (id: string) => {
    onSaveSubscriptions(subscriptions.filter((s) => s.id !== id));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    const parsedDay = parseInt(renewalDay) || 1;
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    const newSub: SubscriptionItem = {
      id: `sub-${Date.now()}`,
      title: title.trim(),
      amount: parsedAmount,
      billingCycle,
      renewalDay: Math.min(31, Math.max(1, parsedDay)),
      category,
      status: 'active',
      note: note.trim() || undefined,
    };

    onSaveSubscriptions([...subscriptions, newSub]);
    setTitle('');
    setAmount('');
    setNote('');
    setShowAddModal(false);
  };

  return (
    <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                Düzenli Abonelikler & Dijital Hizmetler
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {activeSubs.length} Aktif
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400">
              Spotify, Netflix, internet gibi her ay otomatik çekilen sabit servisler
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Abonelik Ekle</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800">
          <span className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 block mb-0.5">
            Aylık Toplam Abonelik
          </span>
          <span className="text-base font-bold text-[#0F172A] dark:text-white tracking-tight">
            {formatCurrency(monthlyTotal)}
          </span>
          <span className="text-[10px] text-[#64748B] dark:text-slate-500 block mt-0.5">
            Her ay çekilen sabit tutar
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800">
          <span className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 block mb-0.5">
            Yıllık Toplam Maliyet
          </span>
          <span className="text-base font-bold text-amber-600 dark:text-amber-400 tracking-tight">
            {formatCurrency(yearlyTotal)}
          </span>
          <span className="text-[10px] text-[#64748B] dark:text-slate-500 block mt-0.5">
            12 aylık kümülatif yük
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800">
          <span className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 block mb-0.5">
            En Yakın Yenileme
          </span>
          <span className="text-base font-bold text-blue-600 dark:text-blue-400 tracking-tight truncate block">
            {nextSub ? nextSub.title : '-'}
          </span>
          <span className="text-[10px] text-[#64748B] dark:text-slate-500 block mt-0.5">
            {nextSub ? `Ayın ${nextSub.renewalDay}. günü (${formatCurrency(nextSub.amount)})` : 'Kayıtlı yok'}
          </span>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="space-y-2.5">
        {subscriptions.map((sub) => {
          const isActive = sub.status === 'active';

          return (
            <div
              key={sub.id}
              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition ${
                isActive
                  ? 'bg-white dark:bg-slate-900/80 border-[#E2E8F0] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleStatus(sub.id)}
                  className={`p-1.5 rounded-lg transition ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                      : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                  title={isActive ? 'Aboneliği Duraklat' : 'Aboneliği Aktif Et'}
                >
                  {isActive ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <PauseCircle className="w-4 h-4" />
                  )}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[#0F172A] dark:text-white">
                      {sub.title}
                    </h4>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-slate-400">
                      Her ayın {sub.renewalDay}. günü
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                    {sub.category}
                    {sub.note && ` • ${sub.note}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 self-stretch sm:self-auto pl-9 sm:pl-0">
                <span className="text-xs font-black text-[#0F172A] dark:text-white">
                  {formatCurrency(sub.amount)}{' '}
                  <span className="text-[10px] font-normal text-[#64748B]">
                    / {sub.billingCycle === 'monthly' ? 'ay' : 'yıl'}
                  </span>
                </span>

                <button
                  onClick={() => handleDelete(sub.id)}
                  className="text-slate-400 hover:text-rose-500 p-1 transition"
                  title="Aboneliği Sil"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {subscriptions.length === 0 && (
          <div className="text-center py-6 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Kayıtlı düzenli abonelik bulunmuyor.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Abonelik Ekle (Spotify, Netflix vb.)
            </button>
          </div>
        )}
      </div>

      {/* Add Subscription Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-blue-500" />
                <h3 className="font-bold text-sm text-[#0F172A] dark:text-white">
                  Yeni Abonelik Ekle
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 pt-3">
              <div>
                <label className="text-[11px] font-medium text-[#0F172A] dark:text-slate-300 block mb-1">
                  Hizmet / Servis Adı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Spotify, Netflix, YouTube, Gym"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-[#0F172A] dark:text-slate-300 block mb-1">
                    Tutar (TL) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    placeholder="Örn: 65"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#0F172A] dark:text-slate-300 block mb-1">
                    Çekim Günü (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={renewalDay}
                    onChange={(e) => setRenewalDay(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-[#0F172A] dark:text-slate-300 block mb-1">
                    Ödeme Periyodu
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as 'monthly' | 'yearly')}
                    className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="monthly">Aylık</option>
                    <option value="yearly">Yıllık</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#0F172A] dark:text-slate-300 block mb-1">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
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
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs transition"
                >
                  Aboneliği Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
