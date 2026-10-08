import React, { useState } from 'react';
import { AppData, EmergencyFund } from '../types';
import { formatCurrency, calculateMinCardPayment } from '../utils/storage';
import { ShieldCheck, Target, Edit3, X, Check, ArrowRight, Umbrella } from 'lucide-react';

interface EmergencyFundCardProps {
  data: AppData;
  onUpdateEmergencyFund: (fund: EmergencyFund) => void;
}

export const EmergencyFundCard: React.FC<EmergencyFundCardProps> = ({
  data,
  onUpdateEmergencyFund,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [savingsInput, setSavingsInput] = useState(
    data.emergencyFund?.currentAmount ? String(data.emergencyFund.currentAmount) : '0'
  );
  const [targetMonthsInput, setTargetMonthsInput] = useState<number>(
    data.emergencyFund?.targetMonths || 3
  );

  const currentMonthKey = new Date().toISOString().slice(0, 7);

  // 1. Mandatory expenses this month
  const mandatoryExpenses = data.expenses
    .filter((e) => e.date && e.date.startsWith(currentMonthKey) && e.isMandatory)
    .reduce((sum, e) => sum + e.amount, 0);

  // 2. Card minimum payments
  const totalCardsMinPayment = data.cards.reduce((sum, c) => {
    return sum + calculateMinCardPayment(c);
  }, 0);

  // 3. Installments monthly
  const totalInstallmentsMonthly = (data.installments || []).reduce((sum, inst) => {
    return inst.remainingInstallments > 0 ? sum + inst.monthlyAmount : sum;
  }, 0);

  // Monthly survival baseline (Aylık taban yaşam gideri)
  const monthlySurvivalBaseline = Math.max(
    1000,
    mandatoryExpenses + totalCardsMinPayment + totalInstallmentsMonthly
  );

  const currentSavings = data.emergencyFund?.currentAmount || 0;
  const targetMonths = data.emergencyFund?.targetMonths || 3;
  const targetTotalFund = Math.round(monthlySurvivalBaseline * targetMonths);

  // Current runway (kaç ay çalışmadan yaşanabilir)
  const currentRunwayMonths = Number(
    (currentSavings / monthlySurvivalBaseline).toFixed(1)
  );
  const progressPercent = Math.min(
    100,
    Math.round((currentSavings / targetTotalFund) * 100)
  );
  const remainingToGoal = Math.max(0, targetTotalFund - currentSavings);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Math.max(0, parseFloat(savingsInput) || 0);
    onUpdateEmergencyFund({
      currentAmount: parsedAmount,
      targetMonths: targetMonthsInput,
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Umbrella className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                Acil Durum Fonu & Runway Güvencesi
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {currentRunwayMonths} Ay Güvence
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400">
              Beklenmedik durumlara karşı hayatta kalma kalkanı ve birikim hedefi
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setSavingsInput(String(currentSavings));
            setTargetMonthsInput(targetMonths);
            setIsEditing((prev) => !prev);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-200 border border-[#E2E8F0] dark:border-slate-700 transition active:scale-95 self-start sm:self-auto"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Kapat' : 'Fonu Güncelle'}</span>
        </button>
      </div>

      {/* Editing Form Inline */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="p-4 mb-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-800 space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#0F172A] dark:text-slate-300 block mb-1">
                Mevcut Acil Fon Birikiminiz (TL)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={savingsInput}
                onChange={(e) => setSavingsInput(e.target.value)}
                placeholder="Örn: 50000"
                className="w-full text-xs p-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#0F172A] dark:text-slate-300 block mb-1">
                Hedeflenen Güvence Süresi
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[3, 6, 12].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTargetMonthsInput(m)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                      targetMonthsInput === m
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-[#64748B] dark:text-slate-300 border-[#E2E8F0] dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {m} Ay
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0] dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-xs font-medium text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition"
            >
              Kaydet
            </button>
          </div>
        </form>
      )}

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Aylık Taban Gider */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800">
          <span className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 block mb-0.5">
            Aylık Taban Yaşam Gideri
          </span>
          <span className="text-base font-bold text-[#0F172A] dark:text-white tracking-tight">
            {formatCurrency(monthlySurvivalBaseline)}
          </span>
          <span className="text-[10px] text-[#64748B] dark:text-slate-500 block mt-0.5">
            Zorunlu fatura, kira & asgariler
          </span>
        </div>

        {/* Mevcut Birikim */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800">
          <span className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 block mb-0.5">
            Mevcut Acil Fon
          </span>
          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatCurrency(currentSavings)}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-500 block mt-0.5 font-medium">
            ≈ {currentRunwayMonths} ay güvence
          </span>
        </div>

        {/* Hedef Fon */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800">
          <span className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 block mb-0.5">
            Hedeflenen {targetMonths} Aylık Fon
          </span>
          <span className="text-base font-bold text-[#0F172A] dark:text-white tracking-tight">
            {formatCurrency(targetTotalFund)}
          </span>
          <span className="text-[10px] text-[#64748B] dark:text-slate-500 block mt-0.5">
            {remainingToGoal > 0 ? `Kalan: ${formatCurrency(remainingToGoal)}` : '✓ Hedefe ulaşıldı!'}
          </span>
        </div>
      </div>

      {/* Progress Bar & Goal Status */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-[#0F172A] dark:text-slate-200">
            Hedefe Ulaşma İlerlemesi
          </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            %{progressPercent}
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-2 leading-relaxed">
          💡 <strong className="text-[#0F172A] dark:text-slate-300">Tavsiye:</strong> Acil durum fonunuzu günlük nemalanan para piyasası fonu veya günlük vadeli mevduatta tutarak hem enflasyona karşı koruyabilir hem de dilediğiniz an çekebilirsiniz.
        </p>
      </div>
    </div>
  );
};
