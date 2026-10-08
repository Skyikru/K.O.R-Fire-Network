import React, { useState } from 'react';
import { AppData, Expense } from '../types';
import { formatCurrency } from '../utils/storage';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Percent,
  Wallet,
} from 'lucide-react';

interface FinancialTipsCardProps {
  data: AppData;
}

export const FinancialTipsCard: React.FC<FinancialTipsCardProps> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const currentMonth = new Date().toISOString().slice(0, 7);

  // Bu ayki gelirler ve giderler
  const monthlyIncomes = data.incomes.filter((item) => item.date.startsWith(currentMonth));
  const totalIncome = monthlyIncomes.reduce((sum, item) => sum + item.amount, 0);

  const monthlyExpenses = data.expenses.filter((item) => item.date.startsWith(currentMonth));
  const totalExpense = monthlyExpenses.reduce((sum, item) => sum + item.amount, 0);

  const totalCardDebt = data.cards.reduce((sum, c) => sum + c.totalDebt, 0);

  // Kategori bazlı harcama dağılımı
  const categoryTotals: Record<string, number> = {};
  monthlyExpenses.forEach((exp) => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const highestCategory = sortedCategories[0]; // [categoryName, amount]

  // Tasarruf Oranı Hesaplama
  const netSavings = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Harcama Oranı (Expense Rate)
  const expenseRate = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0;

  // Zorunlu vs İsteğe Bağlı
  const mandatoryExpenses = monthlyExpenses
    .filter((e) => e.isMandatory)
    .reduce((s, e) => s + e.amount, 0);
  const discretionaryExpenses = totalExpense - mandatoryExpenses;

  // Dinamik Karar ve Öneri Üretimi
  interface TipItem {
    badge: 'Tasarruf oranını koru' | 'Daha az harca' | 'Dikkatli Harca' | 'Borç Yönetimi' | 'Bütçeyi Dengele';
    badgeColor: 'emerald' | 'amber' | 'rose' | 'cyan';
    title: string;
    description: string;
    impact: string;
  }

  const tips: TipItem[] = [];

  // 1. Ana Karar (Tasarruf oranını koru vs Daha az harca)
  let mainDecision: {
    label: 'Tasarruf oranını koru' | 'Daha az harca' | 'Bütçeni Dengele';
    color: 'emerald' | 'amber' | 'rose';
    headline: string;
    subtext: string;
  };

  if (totalIncome === 0 && totalExpense === 0) {
    mainDecision = {
      label: 'Bütçeni Dengele',
      color: 'amber',
      headline: 'Harcama verisi bekleniyor',
      subtext: 'Gelir ve giderlerini girdikçe yapay kural motoru alışkanlıklarını analiz ederek kişisel öneriler sunacak.',
    };
  } else if (savingsRate >= 25) {
    mainDecision = {
      label: 'Tasarruf oranını koru',
      color: 'emerald',
      headline: `Tasarruf Oranını Koru: Gelirinin %${savingsRate}'ini cebinde tutuyorsun!`,
      subtext: `Ay başında hedeflenen tasarruf disiplinine harika uyuyorsun. Artan serbest nakdi acil durum fonuna veya birikim hesabına aktararak bu oranı koru.`,
    };
  } else if (savingsRate >= 10 && savingsRate < 25) {
    mainDecision = {
      label: 'Tasarruf oranını koru',
      color: 'emerald',
      headline: `Tasarruf Oranını Koru ve %25'e Yükselt`,
      subtext: `Mevcut tasarruf oranın %${savingsRate}. Küçük, gereksiz harcamaları budayarak tasarruf oranını %25 seviyesine çıkarabilirsin.`,
    };
  } else if (savingsRate >= 0 && savingsRate < 10) {
    mainDecision = {
      label: 'Daha az harca',
      color: 'amber',
      headline: `Daha Az Harca: Tasarruf payın %${savingsRate} ile kritik seviyede!`,
      subtext: `Gelirinin neredeyse tamamı (%${expenseRate}) harcamalara gidiyor. Ay sonuna kadar isteğe bağlı harcamaları durdurarak tasarruf tamponu oluştur.`,
    };
  } else {
    mainDecision = {
      label: 'Daha az harca',
      color: 'rose',
      headline: `Acil Durum: Hemen 'Daha az harca' moduna geç!`,
      subtext: `Harcamaların gelirini %${Math.abs(savingsRate)} aştı. Bu ay yeni harcama yapmaktan kaçın ve kredi kartı limitlerini tüketme.`,
    };
  }

  // 2. Kategori Bazlı İpucu
  if (highestCategory && totalExpense > 0) {
    const highestCatPercent = Math.round((highestCategory[1] / totalExpense) * 100);
    if (highestCatPercent >= 30) {
      tips.push({
        badge: highestCatPercent > 45 ? 'Daha az harca' : 'Dikkatli Harca',
        badgeColor: highestCatPercent > 45 ? 'rose' : 'amber',
        title: `En Yüksek Harcama: "${highestCategory[0]}" (%${highestCatPercent})`,
        description: `Bu ayki toplam harcamalarının %${highestCatPercent}'i (${formatCurrency(highestCategory[1])}) bu kategoride gerçekleşti. Bu kalemde alternatifleri değerlendirerek haftalık kota koy.`,
        impact: `Haftalık %15 kısıntı ayda yaklaşık ${formatCurrency(Math.round(highestCategory[1] * 0.15))} tasarruf sağlar.`,
      });
    }
  }

  // 3. İsteğe Bağlı Harcamalar İpucu
  if (discretionaryExpenses > 0 && totalIncome > 0) {
    const discPercentOfIncome = Math.round((discretionaryExpenses / totalIncome) * 100);
    if (discPercentOfIncome > 30) {
      tips.push({
        badge: 'Daha az harca',
        badgeColor: 'amber',
        title: `İsteğe Bağlı Harcamalar Gelirin %${discPercentOfIncome}'ine Ulaştı`,
        description: `Zorunlu olmayan sosyal, eğlence veya alışveriş harcamaların ${formatCurrency(discretionaryExpenses)} tutarında. 50/30/20 kuralına göre bu oranın %30'u aşmaması önerilir.`,
        impact: `Zorunlu olmayan harcamaları 48 saat kuralıyla (satın almadan önce 2 gün bekle) ertele.`,
      });
    } else if (savingsRate >= 20) {
      tips.push({
        badge: 'Tasarruf oranını koru',
        badgeColor: 'emerald',
        title: `İdeal İstek/İhtiyaç Dengesi`,
        description: `Zorunlu olmayan harcamaların kontrol altında tutuluyor. Bu istikrarı ay sonuna kadar sürdürerek ay başında belirlediğin birikim hedefini yakala.`,
        impact: `Birikimini korumak için ay sonu kalan parayı doğrudan vadeli/tasarruf hesabına aktar.`,
      });
    }
  }

  // 4. Kredi Kartı Borcu İpucu
  if (totalCardDebt > 0 && totalIncome > 0) {
    const debtRatio = Math.round((totalCardDebt / totalIncome) * 100);
    if (debtRatio >= 50) {
      tips.push({
        badge: 'Borç Yönetimi',
        badgeColor: 'rose',
        title: `Kredi Kartı Borç Yükü Gelirin %${debtRatio}'si Seviyesinde`,
        description: `Toplam kart borcun (${formatCurrency(totalCardDebt)}) aylık gelirinin yarısını geçti. Sadece asgari tutarı ödemek faiz maliyetini katlar; yeni taksit yapmaktan kaçın.`,
        impact: `Borç çığı veya kartopu yöntemiyle en yüksek faizli kartı öncelikle kapat.`,
      });
    } else {
      tips.push({
        badge: 'Tasarruf oranını koru',
        badgeColor: 'emerald',
        title: `Kontrollü Kart Kullanımı`,
        description: `Kredi kartı borcun gelirine oranla makul seviyede (%${debtRatio}). Asgari tutarın üzerinde ödeme yaparak ek faiz maliyetlerinden tamamen kaçın.`,
        impact: `Her ekstre döneminde borcun tamamını kapatmaya çalışarak kredi puanını yükselt.`,
      });
    }
  }

  // Eğer yeterli veri yoksa varsayılan akıllı ipuçları ekle
  if (tips.length === 0) {
    tips.push({
      badge: 'Tasarruf oranını koru',
      badgeColor: 'emerald',
      title: '50/30/20 Bütçe Prensibi',
      description: 'Gelirinin %50\'sini zorunlu ihtiyaçlara (kira, fatura, temel gıda), %30\'unu isteklere, %20\'sini ise birikim ve borç eritmeye ayır.',
      impact: 'Bu dağılım uzun vadeli finansal güvence sağlar.',
    });
    tips.push({
      badge: 'Daha az harca',
      badgeColor: 'amber',
      title: 'Küçük Harcama Kaçakları',
      description: 'Günlük kahve, atıştırmalık veya abonelik gibi küçük görünen harcamalar ay sonunda bütçede büyük bir delik oluşturabilir.',
      impact: 'Gereksiz abonelikleri iptal ederek ayda yüzlerce lira tasarruf edebilirsin.',
    });
  }

  return (
    <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-4 sm:p-5 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      {/* Header with Title & Collapse Toggle */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white flex items-center gap-2">
              Finansal İpuçları & Akıllı Öneriler
              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Canlı Analiz
              </span>
            </h3>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400">
              Harcama ve gelir alışkanlıklarına göre anlık üretilen tavsiyeler
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={isExpanded ? 'Daralt' : 'Genişlet'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Recommendation Badge & Headline */}
      <div className="mt-4 pt-4 border-t border-[#E2E8F0] dark:border-slate-800/80">
        <div
          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            mainDecision.color === 'emerald'
              ? 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-800/50 text-emerald-950 dark:text-emerald-200'
              : mainDecision.color === 'amber'
              ? 'bg-amber-50/70 dark:bg-amber-950/25 border-amber-200 dark:border-amber-800/50 text-amber-950 dark:text-amber-200'
              : 'bg-rose-50/70 dark:bg-rose-950/25 border-rose-200 dark:border-rose-800/50 text-rose-950 dark:text-rose-200'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold tracking-wide uppercase border ${
                  mainDecision.color === 'emerald'
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                    : mainDecision.color === 'amber'
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40'
                }`}
              >
                {mainDecision.label}
              </span>
              <span className="text-xs font-semibold text-[#0F172A] dark:text-white">
                {mainDecision.headline}
              </span>
            </div>
            <p className="text-xs opacity-90 leading-relaxed max-w-2xl">
              {mainDecision.subtext}
            </p>
          </div>

          {/* Quick Metrics Tag */}
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center bg-white dark:bg-slate-900/80 px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-slate-800 text-xs text-[#0F172A] dark:text-slate-300 shadow-xs">
            <div className="flex items-center gap-1">
              <PiggyBank className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Tasarruf:</span>
              <strong className={savingsRate >= 20 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                %{savingsRate}
              </strong>
            </div>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <div className="flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
              <span>Harcama:</span>
              <strong className="text-[#0F172A] dark:text-white">%{expenseRate}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Section: Concrete Tailored Advice Cards */}
      {isExpanded && (
        <div className="mt-3.5 space-y-2.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tips.map((tip, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 transition space-y-2 flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        tip.badgeColor === 'emerald'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                          : tip.badgeColor === 'amber'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                          : tip.badgeColor === 'rose'
                          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                          : 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30'
                      }`}
                    >
                      {tip.badge}
                    </span>
                    <Lightbulb className="w-3.5 h-3.5 text-[#64748B] dark:text-slate-500" />
                  </div>
                  <h4 className="text-xs font-semibold text-[#0F172A] dark:text-white leading-snug">
                    {tip.title}
                  </h4>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1 leading-relaxed">
                    {tip.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E2E8F0] dark:border-slate-800/80 flex items-start gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-tight">{tip.impact}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Mini 50/30/20 Savings Bar Indicator */}
          {totalIncome > 0 && (
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900/40 border border-[#E2E8F0] dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B] dark:text-slate-400 shadow-2xs">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  <strong>Aylık Bütçe Dağılımın:</strong> Zorunlu Giderler (%{Math.round((mandatoryExpenses / totalIncome) * 100)}), İsteğe Bağlı (%{Math.round((discretionaryExpenses / totalIncome) * 100)}), Kalan Net Tasarruf (%{savingsRate})
                </span>
              </div>
              <div className="text-[11px] text-[#64748B] dark:text-slate-500 shrink-0">
                Hedef Kural: 50 / 30 / 20
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
