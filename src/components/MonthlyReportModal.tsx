import React, { useState, useMemo } from 'react';
import { AppData } from '../types';
import { formatCurrency, calculateMinCardPayment } from '../utils/storage';
import {
  FileText,
  Printer,
  Download,
  Copy,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface MonthlyReportModalProps {
  data: AppData;
  isOpen: boolean;
  onClose: () => void;
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  data,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  // Month selector: list of available months (last 6 months)
  const availableMonths = useMemo(() => {
    const list: { key: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
      list.push({ key, label });
    }
    return list;
  }, []);

  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(
    availableMonths[0]?.key || new Date().toISOString().slice(0, 7)
  );

  if (!isOpen) return null;

  const currentMonthObj =
    availableMonths.find((m) => m.key === selectedMonthKey) || availableMonths[0];

  // Incomes of selected month
  const monthIncomes = data.incomes.filter(
    (i) => i.date && i.date.startsWith(selectedMonthKey)
  );
  const totalIncome = monthIncomes.reduce((sum, i) => sum + i.amount, 0);

  // Expenses of selected month
  const monthExpenses = data.expenses.filter(
    (e) => e.date && e.date.startsWith(selectedMonthKey)
  );
  const totalExpense = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  monthExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount]) => ({
      name: cat,
      amount,
      percent: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    }));

  // Top 3 categories
  const topCategories = sortedCategories.slice(0, 3);

  // Mandatory vs Discretionary
  const mandatoryTotal = monthExpenses
    .filter((e) => e.isMandatory)
    .reduce((sum, e) => sum + e.amount, 0);
  const discretionaryTotal = totalExpense - mandatoryTotal;

  // Cards summary
  const totalCardDebts = data.cards.reduce((sum, c) => sum + c.totalDebt, 0);
  const totalMinCardPay = data.cards.reduce(
    (sum, c) => sum + calculateMinCardPayment(c),
    0
  );

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Download CSV
  const handleDownloadCSV = () => {
    const BOM = '\uFEFF';
    let csv = `${BOM}Kategori / Tip;Tarih;Açıklama;Tutar (TL)\n`;

    // Incomes
    monthIncomes.forEach((i) => {
      csv += `Gelir: ${i.source};${i.date};"${(i.note || '').replace(/"/g, '""')}";+${i.amount}\n`;
    });

    // Expenses
    monthExpenses.forEach((e) => {
      csv += `Gider: ${e.category};${e.date};"${(e.note || '').replace(/"/g, '""')}";-${e.amount}\n`;
    });

    // Summary line
    csv += `\nÖZET;;;\n`;
    csv += `Toplam Gelir;;;+${totalIncome}\n`;
    csv += `Toplam Gider;;;-${totalExpense}\n`;
    csv += `Net Tasarruf;;;${netSavings}\n`;
    csv += `Tasarruf Oranı;;;%${savingsRate}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Finans_Raporu_${selectedMonthKey}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Copy Summary to Clipboard
  const handleCopySummary = async () => {
    const text = `📊 *${currentMonthObj.label} Finansal Bütçe Özeti*
💰 Toplam Gelir: ${formatCurrency(totalIncome)}
💸 Toplam Gider: ${formatCurrency(totalExpense)}
🌱 Net Birikim: ${formatCurrency(netSavings)} (%${savingsRate})
🔥 En Çok Harcananlar:
${topCategories.map((c) => `  • ${c.name}: ${formatCurrency(c.amount)} (%${c.percent})`).join('\n')}
💳 Kredi Kartı Asgari Yükü: ${formatCurrency(totalMinCardPay)}
_Yaşam & Finans uygulamasıyla oluşturuldu._`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Panoya kopyalama başarısız:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E2E8F0] dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-tight">
                Aylık Finansal Bütçe Karnesi & Ekstre
              </h2>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                Tek sayfalık detaylı nakit akışı ve tasarruf dökümü
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Month Selector Bar & Action Controls */}
        <div className="p-3 sm:p-4 border-b border-[#E2E8F0] dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-[#111827]">
          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#64748B]" />
            <select
              value={selectedMonthKey}
              onChange={(e) => setSelectedMonthKey(e.target.value)}
              className="text-xs font-semibold p-1.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0F172A] dark:text-white focus:outline-hidden focus:border-emerald-500"
            >
              {availableMonths.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-200 border border-[#E2E8F0] dark:border-slate-700 transition active:scale-95"
              title="Özeti Panoya Kopyala"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Kopyala</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-200 border border-[#E2E8F0] dark:border-slate-700 transition active:scale-95"
              title="Excel / CSV Olarak İndir"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CSV İndir</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition active:scale-95"
              title="Yazdır veya PDF Kaydet"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır / PDF</span>
            </button>
          </div>
        </div>

        {/* Printable Statement Body */}
        <div id="printable-financial-report" className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Executive Summary Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/70 dark:from-slate-900 dark:to-slate-900/60 border border-[#E2E8F0] dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                  Dönem Raporu
                </span>
                <h3 className="text-base font-extrabold text-[#0F172A] dark:text-white capitalize">
                  {currentMonthObj.label} Bütçe Ekstresi
                </h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  netSavings >= 0
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20'
                }`}
              >
                {netSavings >= 0 ? `+${formatCurrency(netSavings)} Birikim` : `${formatCurrency(netSavings)} Açık`}
              </span>
            </div>

            {/* 3 Main Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-3">
              <div>
                <span className="text-[11px] text-[#64748B] dark:text-slate-400 block">
                  Toplam Gelir
                </span>
                <span className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalIncome)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#64748B] dark:text-slate-400 block">
                  Toplam Gider
                </span>
                <span className="text-sm sm:text-base font-extrabold text-rose-600 dark:text-rose-400">
                  {formatCurrency(totalExpense)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#64748B] dark:text-slate-400 block">
                  Tasarruf Oranı
                </span>
                <span className="text-sm sm:text-base font-extrabold text-purple-600 dark:text-purple-400">
                  %{savingsRate}
                </span>
              </div>
            </div>
          </div>

          {/* Top 3 Spends */}
          {topCategories.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 mb-2.5">
                En Yüksek Harcama Kalemleri
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {topCategories.map((cat, idx) => (
                  <div
                    key={cat.name}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-[#0F172A] dark:text-white truncate">
                        {idx + 1}. {cat.name}
                      </span>
                      <span className="font-mono text-[11px] text-[#64748B]">
                        %{cat.percent}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-rose-600 dark:text-rose-400 block">
                      {formatCurrency(cat.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mandatory vs Discretionary Breakdown */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800">
            <h4 className="text-xs font-bold text-[#0F172A] dark:text-white mb-2">
              Harcama Türü Dağılımı
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#64748B] dark:text-slate-400 block">
                  Zorunlu Giderler (Kira, Fatura, Temel):
                </span>
                <span className="text-sm font-bold text-[#0F172A] dark:text-white">
                  {formatCurrency(mandatoryTotal)}{' '}
                  <span className="text-[11px] font-normal text-[#64748B]">
                    (%{totalExpense > 0 ? Math.round((mandatoryTotal / totalExpense) * 100) : 0})
                  </span>
                </span>
              </div>
              <div>
                <span className="text-[#64748B] dark:text-slate-400 block">
                  İsteğe Bağlı / Keyfi Harcamalar:
                </span>
                <span className="text-sm font-bold text-[#0F172A] dark:text-white">
                  {formatCurrency(discretionaryTotal)}{' '}
                  <span className="text-[11px] font-normal text-[#64748B]">
                    (%{totalExpense > 0 ? Math.round((discretionaryTotal / totalExpense) * 100) : 0})
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* All Categories Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 mb-2">
              Kategori Dökümü ({sortedCategories.length} Kategori)
            </h4>
            <div className="border border-[#E2E8F0] dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-[#E2E8F0] dark:divide-slate-800 text-xs">
              {sortedCategories.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900/60"
                >
                  <span className="font-medium text-[#0F172A] dark:text-slate-200">
                    {c.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#64748B] font-mono text-[11px]">
                      %{c.percent}
                    </span>
                    <span className="font-bold text-[#0F172A] dark:text-white">
                      {formatCurrency(c.amount)}
                    </span>
                  </div>
                </div>
              ))}
              {sortedCategories.length === 0 && (
                <p className="p-4 text-center text-xs text-[#64748B]">
                  Bu ay için harcama kaydı bulunmuyor.
                </p>
              )}
            </div>
          </div>

          {/* Debt & Obligations Status */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800 text-xs">
            <h4 className="font-bold text-[#0F172A] dark:text-white mb-1.5">
              Borç & Finansal Yük Durumu
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div>
                <span className="text-[#64748B]">Toplam Kart Borcu:</span>
                <p className="font-bold text-[#0F172A] dark:text-white">
                  {formatCurrency(totalCardDebts)}
                </p>
              </div>
              <div>
                <span className="text-[#64748B]">Aylık Asgari Yük:</span>
                <p className="font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(totalMinCardPay)}
                </p>
              </div>
              <div>
                <span className="text-[#64748B]">Kayıtlı Kart Sayısı:</span>
                <p className="font-bold text-[#0F172A] dark:text-white">
                  {data.cards.length} Adet
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-[#E2E8F0] dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs">
          <span className="text-[#64748B] dark:text-slate-500">
            Yaşam & Finans • Yerel & Güvenli
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-white transition"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
