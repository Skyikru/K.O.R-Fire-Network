import React, { useState } from 'react';
import { InstallmentLoan, ExpenseCategory } from '../types';
import { formatCurrency } from '../utils/storage';
import {
  CreditCard,
  Plus,
  Trash2,
  CheckCircle,
  Calculator,
  X,
  AlertCircle,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface InstallmentLoansManagerProps {
  installments: InstallmentLoan[];
  onAddInstallment: (inst: Omit<InstallmentLoan, 'id'>) => void;
  onPayInstallment: (id: string) => void;
  onDeleteInstallment: (id: string) => void;
  monthlyFreeBudget?: number;
}

const CATEGORIES: ExpenseCategory[] = [
  'Giyim & Alışveriş',
  'Market & Gıda',
  'Fatura & Abonelik',
  'Kira & Konut',
  'Ulaşım & Yakıt',
  'Sağlık & Bakım',
  'Eğlence & Sosyal',
  'Eğitim',
  'Zorunlu Ödeme',
  'Diğer',
];

export const InstallmentLoansManager: React.FC<InstallmentLoansManagerProps> = ({
  installments,
  onAddInstallment,
  onPayInstallment,
  onDeleteInstallment,
  monthlyFreeBudget = 0,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

  // Add form state
  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('12');
  const [remainingInstallments, setRemainingInstallments] = useState('12');
  const [dueDateDay, setDueDateDay] = useState('15');
  const [category, setCategory] = useState<ExpenseCategory>('Giyim & Alışveriş');
  const [bankOrVendor, setBankOrVendor] = useState('');
  const [note, setNote] = useState('');

  // Simulator state
  const [simProductPrice, setSimProductPrice] = useState('18000');
  const [simMonths, setSimMonths] = useState(6);

  // Calculations
  const activeInstallments = installments.filter((i) => i.remainingInstallments > 0);
  const totalMonthlyLoad = activeInstallments.reduce((sum, i) => sum + i.monthlyAmount, 0);
  const totalRemainingDebt = activeInstallments.reduce(
    (sum, i) => sum + i.monthlyAmount * i.remainingInstallments,
    0
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTotal = parseFloat(totalAmount);
    const parsedTotalInst = parseInt(totalInstallments) || 1;
    const parsedRemInst = parseInt(remainingInstallments) || parsedTotalInst;
    const monthly = Math.round(parsedTotal / parsedTotalInst);

    if (!title || isNaN(parsedTotal) || parsedTotal <= 0) return;

    onAddInstallment({
      title,
      totalAmount: parsedTotal,
      monthlyAmount: monthly,
      remainingInstallments: parsedRemInst,
      totalInstallments: parsedTotalInst,
      dueDateDay: parseInt(dueDateDay) || 1,
      category,
      bankOrVendor: bankOrVendor.trim() || undefined,
      startDate: new Date().toISOString().split('T')[0],
      note: note.trim() || undefined,
    });

    // Reset form
    setTitle('');
    setTotalAmount('');
    setTotalInstallments('12');
    setRemainingInstallments('12');
    setBankOrVendor('');
    setNote('');
    setShowAddModal(false);
  };

  // Simulator calculations
  const simPriceNum = parseFloat(simProductPrice) || 0;
  const simMonthlyPayment = simMonths > 0 ? Math.round(simPriceNum / simMonths) : 0;
  const budgetAfterSim = monthlyFreeBudget - simMonthlyPayment;

  return (
    <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
              Taksit & Kredi Düzenli Borç Takibi
            </h2>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400">
              Kart dışı taksitler, tüketici kredileri ve vadesi gelen ödemeler
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowSimulator((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-200 border border-[#E2E8F0] dark:border-slate-700 transition active:scale-95"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Taksit Simülatörü</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Taksit Ekle</span>
          </button>
        </div>
      </div>

      {/* Simulator Panel (Toggleable) */}
      {showSimulator && (
        <div className="p-4 mb-5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-xs font-bold text-[#0F172A] dark:text-white">
                Alışveriş Öncesi Taksit Simülatörü
              </h3>
            </div>
            <button
              onClick={() => setShowSimulator(false)}
              className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-[#64748B] dark:text-slate-400">
            Yeni bir ürün almayı planlıyorsanız, bütçenize getireceği aylık yükü önceden test edin.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 block mb-1">
                Ürün / Hizmet Fiyatı (TL)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={simProductPrice}
                onChange={(e) => setSimProductPrice(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 block mb-1">
                Taksit Sayısı
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[3, 6, 9, 12].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSimMonths(m)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                      simMonths === m
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white dark:bg-slate-800 text-[#64748B] border-[#E2E8F0] dark:border-slate-700'
                    }`}
                  >
                    {m} Ay
                  </button>
                ))}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/50 flex flex-col justify-center">
              <span className="text-[10px] text-[#64748B] dark:text-slate-400 uppercase font-semibold">
                Aylık Ek Taksit
              </span>
              <span className="text-base font-extrabold text-purple-600 dark:text-purple-400">
                {formatCurrency(simMonthlyPayment)}
              </span>
              <span className="text-[10px] text-[#64748B] dark:text-slate-400">
                {budgetAfterSim >= 0
                  ? `Bütçede serbest kalacak: ${formatCurrency(budgetAfterSim)}`
                  : `⚠️ Serbest bütçeyi ${formatCurrency(Math.abs(budgetAfterSim))} aşıyor!`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800">
          <span className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 block mb-0.5">
            Bu Ayki Toplam Taksit Yükü
          </span>
          <span className="text-base font-bold text-amber-600 dark:text-amber-400 tracking-tight">
            {formatCurrency(totalMonthlyLoad)}
          </span>
          <span className="text-[10px] text-[#64748B] dark:text-slate-500 block mt-0.5">
            Aylık düzenli nakit çıkışı
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800">
          <span className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 block mb-0.5">
            Kalan Toplam Taksit Borcu
          </span>
          <span className="text-base font-bold text-[#0F172A] dark:text-white tracking-tight">
            {formatCurrency(totalRemainingDebt)}
          </span>
          <span className="text-[10px] text-[#64748B] dark:text-slate-500 block mt-0.5">
            Gelecek vadelere ait toplam
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800">
          <span className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 block mb-0.5">
            Aktif Taksit Sayısı
          </span>
          <span className="text-base font-bold text-[#0F172A] dark:text-white tracking-tight">
            {activeInstallments.length} Taksitli İşlem
          </span>
          <span className="text-[10px] text-[#64748B] dark:text-slate-500 block mt-0.5">
            Devam eden ödemeler
          </span>
        </div>
      </div>

      {/* Installments List */}
      <div className="space-y-3">
        {installments.map((inst) => {
          const completedInst = inst.totalInstallments - inst.remainingInstallments;
          const progressPercent = Math.round(
            (completedInst / inst.totalInstallments) * 100
          );
          const isFinished = inst.remainingInstallments <= 0;

          return (
            <div
              key={inst.id}
              className={`p-3.5 rounded-xl border transition ${
                isFinished
                  ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/50 opacity-60'
                  : 'bg-white dark:bg-slate-900/80 border-[#E2E8F0] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[#0F172A] dark:text-white">
                      {inst.title}
                    </h4>
                    {inst.bankOrVendor && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-slate-400 font-medium">
                        {inst.bankOrVendor}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                    Her ayın {inst.dueDateDay}. günü • Kategori: {inst.category}
                    {inst.note && ` • ${inst.note}`}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-xs font-black text-[#0F172A] dark:text-white block">
                      {formatCurrency(inst.monthlyAmount)} / ay
                    </span>
                    <span className="text-[10px] text-[#64748B] dark:text-slate-400">
                      Kalan: {inst.remainingInstallments} / {inst.totalInstallments} ay
                    </span>
                  </div>

                  {!isFinished && (
                    <button
                      onClick={() => onPayInstallment(inst.id)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition active:scale-95 shadow-2xs"
                      title="1 Taksit Ödendi Olarak İşle"
                    >
                      Öde (-1)
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteInstallment(inst.id)}
                    className="p-1.5 text-[#64748B] hover:text-rose-500 transition"
                    title="Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-2.5">
                <div className="flex items-center justify-between text-[10px] text-[#64748B] dark:text-slate-400 mb-1">
                  <span>Ödenen: {completedInst} taksit</span>
                  <span>%{progressPercent} tamamlandı</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {installments.length === 0 && (
          <div className="text-center py-6 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Kayıtlı taksit veya kredi ödemesi bulunmuyor.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Yeni Taksit Ekle
            </button>
          </div>
        )}
      </div>

      {/* Add Installment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-[#0F172A] dark:text-white">
                  Yeni Taksit veya Kredi Ekle
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
                  Açıklama / Ürün Adı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Telefon Taksiti, Beyaz Eşya, İhtiyaç Kredisi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-[#0F172A] dark:text-slate-300 block mb-1">
                    Toplam Tutar (TL) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Örn: 24000"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#0F172A] dark:text-slate-300 block mb-1">
                    Toplam Taksit Sayısı
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={totalInstallments}
                    onChange={(e) => {
                      setTotalInstallments(e.target.value);
                      setRemainingInstallments(e.target.value);
                    }}
                    className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-[#0F172A] dark:text-slate-300 block mb-1">
                    Kalan Taksit Sayısı
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={remainingInstallments}
                    onChange={(e) => setRemainingInstallments(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#0F172A] dark:text-slate-300 block mb-1">
                    Aylık Ödeme Günü (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dueDateDay}
                    onChange={(e) => setDueDateDay(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-[#0F172A] dark:text-slate-300 block mb-1">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#0F172A] dark:text-slate-300 block mb-1">
                    Banka veya Mağaza
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Garanti, Vatan, Trendyol"
                    value={bankOrVendor}
                    onChange={(e) => setBankOrVendor(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#0F172A] dark:text-slate-300 block mb-1">
                  Ek Not
                </label>
                <input
                  type="text"
                  placeholder="İsteğe bağlı not..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-emerald-500"
                />
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
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
