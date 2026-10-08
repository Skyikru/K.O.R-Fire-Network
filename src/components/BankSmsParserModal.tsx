import React, { useState, useEffect } from 'react';
import { ExpenseCategory } from '../types';
import { parseBankSms, formatCurrency, getTodayString } from '../utils/storage';
import {
  Smartphone,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Copy,
  Plus,
} from 'lucide-react';

interface BankSmsParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: {
    amount: number;
    category: ExpenseCategory | string;
    date: string;
    isMandatory?: boolean;
    note?: string;
  }) => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Market & Gıda',
  'Ulaşım & Yakıt',
  'Fatura & Abonelik',
  'Kira & Konut',
  'Sağlık & Bakım',
  'Eğlence & Sosyal',
  'Giyim & Alışveriş',
  'Eğitim',
  'Zorunlu Ödeme',
  'Diğer',
];

const SAMPLE_SMS_LIST = [
  {
    label: 'Garanti (Market)',
    text: 'Garanti BBVA: 4123 ile biten Bonus kartınızla 08.10.2026 tarihinde MIGROS TICARET A.S. firmasından 345,50 TL tutarında harcama yapılmıştır.',
  },
  {
    label: 'İş Bankası (Yakıt)',
    text: 'Sayin Musterimiz, Maximum kartiniz ile 12.10.2026 gunu OPET PETROL firmasinda 1.250,00 TL harcama yapilmistir. Bilginize.',
  },
  {
    label: 'Ziraat (Yemek / Türkçe Tarih)',
    text: 'Bankkartiniz ile YEMEKSEPETI uzerinden 15 Ekim 2026 saat 19:40\'ta 185,00 TL tutarindaki alisverisiniz onaylanmistir.',
  },
  {
    label: 'Yapı Kredi (Fatura)',
    text: 'Worldcard: TURKCELL ILETISIM faturasi icin 420 TL otomatik odeme gerceklestirilmistir.',
  },
  {
    label: 'Akbank (Giyim / E-Ticaret)',
    text: 'Axess: TRENDYOL firmasından 850 TL tutarındaki alışverişiniz 05/10/2026 tarihinde gerçekleşmiştir.',
  },
  {
    label: 'Enpara (Kira)',
    text: 'Enpara.com: Ev Kirası ve Aidat ödemesi için 14.000 TL tutarındaki transferiniz başarıyla tamamlandı.',
  },
  {
    label: 'Papara (Kahve / Kafe)',
    text: 'Papara Card ile STARBUCKS KAHVE noktasinda 115,00 TL harcama yapildi.',
  },
  {
    label: 'QNB (Sağlık / Eczane)',
    text: 'CardFinans: MERKEZ ECZANESI firmasından 260,00 TL harcama yapılmıştır.',
  },
];

export const BankSmsParserModal: React.FC<BankSmsParserModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
}) => {
  const [smsText, setSmsText] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [merchant, setMerchant] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('Market & Gıda');
  const [date, setDate] = useState<string>(getTodayString());
  const [isMandatory, setIsMandatory] = useState<boolean>(false);
  const [isParsed, setIsParsed] = useState<boolean>(false);
  const [bankName, setBankName] = useState<string>('');
  const [rawAmountStr, setRawAmountStr] = useState<string>('');

  // Parse SMS text whenever it changes
  useEffect(() => {
    if (!smsText.trim()) {
      setIsParsed(false);
      setBankName('');
      setRawAmountStr('');
      return;
    }
    const result = parseBankSms(smsText);
    if (result.amount !== null) {
      setAmount(result.amount.toString());
      setMerchant(result.merchant);
      setCategory(result.category);
      setDate(result.date);
      setIsMandatory(result.isMandatory);
      setBankName(result.bankName || '');
      setRawAmountStr(result.rawAmountStr || '');
      setIsParsed(true);
    } else {
      setIsParsed(false);
      setBankName(result.bankName || '');
    }
  }, [smsText]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    onAddExpense({
      amount: num,
      category,
      date: date || getTodayString(),
      isMandatory,
      note: merchant.trim() || 'Banka SMS Harcaması',
    });

    setSmsText('');
    setAmount('');
    setMerchant('');
    onClose();
  };

  const handleUseSample = (sample: string) => {
    setSmsText(sample);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E2E8F0] dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                  Banka SMS / Bildirim Ayrıştırıcı
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  Akıllı
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                Gelen harcama mesajını yapıştırın; tutar, mağaza ve kategori anında dolsun.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Quick Samples Chips */}
          <div>
            <span className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 block mb-1.5">
              Hızlı Deneme Örnekleri (Dokunun):
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {SAMPLE_SMS_LIST.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleUseSample(sample.text)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-500/15 hover:text-purple-600 dark:hover:text-purple-400 border border-slate-200 dark:border-slate-700 transition active:scale-95"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* SMS Paste Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#0F172A] dark:text-slate-200">
                Banka SMS veya Bildirim Metni
              </label>
              {smsText && (
                <button
                  type="button"
                  onClick={() => setSmsText('')}
                  className="text-[10px] text-rose-500 hover:underline"
                >
                  Metni Temizle
                </button>
              )}
            </div>
            <textarea
              rows={3}
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              placeholder="Örn: Garanti BBVA: 1234 ile biten kartınızla MIGROS firmasından 345,50 TL harcama yapılmıştır."
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-xs text-[#0F172A] dark:text-white placeholder:text-[#64748B] focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-mono"
            />
          </div>

          {/* Auto Extraction Feedback Banner */}
          {isParsed && (
            <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 text-xs space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span className="text-purple-900 dark:text-purple-200 font-bold">
                    Akıllı Regex ile Başarıyla Ayrıştırıldı
                  </span>
                </div>
                <span className="font-extrabold text-sm text-purple-700 dark:text-purple-300">
                  {amount ? formatCurrency(parseFloat(amount)) : ''}
                </span>
              </div>

              {/* Parsed Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-[11px]">
                {bankName && (
                  <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 font-semibold border border-purple-300/40">
                    🏦 {bankName}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-300/40">
                  💰 {formatCurrency(parseFloat(amount))}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-semibold border border-blue-300/40">
                  📅 {date}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-semibold border border-amber-300/40">
                  🏷️ {category}
                </span>
                {merchant && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border border-slate-300/40">
                    🏪 {merchant}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Parsed Fields Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Tutar */}
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] dark:text-slate-300 mb-1">
                  Harcama Tutarı (TL) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 text-sm font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] dark:text-slate-300 mb-1">
                  Kategori *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 text-xs text-[#0F172A] dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Mağaza / Not */}
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] dark:text-slate-300 mb-1">
                  Mağaza / Açıklama
                </label>
                <input
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="Örn: Migros, Opet..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 text-xs text-[#0F172A] dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Tarih */}
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] dark:text-slate-300 mb-1">
                  İşlem Tarihi
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 text-xs text-[#0F172A] dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Zorunlu Gider Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isMandatory}
                onChange={(e) => setIsMandatory(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-0 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
              <span className="text-xs text-[#64748B] dark:text-slate-400">
                Bu zorunlu bir gider (fatura, kira, taksit vb.)
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0] dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={!amount || parseFloat(amount) <= 0}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Harcamayı Kaydet</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
