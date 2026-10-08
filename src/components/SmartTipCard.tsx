import React, { useState, useMemo } from 'react';
import { AppData, Expense } from '../types';
import { formatCurrency, formatDateTurkish } from '../utils/storage';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Utensils,
  ShoppingCart,
  Car,
  Home,
  Zap,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  HelpCircle,
  Percent,
  Filter,
} from 'lucide-react';

interface SmartTipCardProps {
  data: AppData;
  onOpenQuickExpense?: () => void;
}

export type InsightCategoryType = 'all' | 'increases' | 'savings' | 'habits';

export interface SmartInsightItem {
  id: string;
  type: 'increase' | 'saving' | 'habit' | 'pace';
  category?: string;
  headline: string;
  badge: string;
  badgeVariant: 'warning' | 'success' | 'info' | 'purple';
  metric?: string;
  percentageDiff?: number;
  currentAmount?: number;
  prevAmount?: number;
  description: string;
  actionableTip: string;
  icon: 'utensils' | 'trending-up' | 'trending-down' | 'shopping' | 'car' | 'calendar' | 'zap' | 'lightbulb';
}

export const SmartTipCard: React.FC<SmartTipCardProps> = ({ data, onOpenQuickExpense }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeFilter, setActiveFilter] = useState<InsightCategoryType>('all');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth(); // 0-based
  const currentMonthStr = `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}`;

  const prevMonthDate = new Date(currentYear, currentMonthNum - 1, 1);
  const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthName = now.toLocaleDateString('tr-TR', { month: 'long' });
  const prevMonthName = prevMonthDate.toLocaleDateString('tr-TR', { month: 'long' });

  // Gün hesaplamaları
  const dayOfMonth = Math.max(1, now.getDate());
  const daysInMonth = new Date(currentYear, currentMonthNum + 1, 0).getDate();

  // Finansal içgörü motoru
  const insights = useMemo(() => {
    const list: SmartInsightItem[] = [];

    const currentExpenses = data.expenses.filter((e) => e.date.startsWith(currentMonthStr));
    const prevExpenses = data.expenses.filter((e) => e.date.startsWith(prevMonthStr));

    const totalCurrentExpense = currentExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalPrevExpense = prevExpenses.reduce((sum, e) => sum + e.amount, 0);

    // 1. Kategori Bazlı Harcama Haritası
    const currentByCat: Record<string, number> = {};
    currentExpenses.forEach((e) => {
      currentByCat[e.category] = (currentByCat[e.category] || 0) + e.amount;
    });

    const prevByCat: Record<string, number> = {};
    prevExpenses.forEach((e) => {
      prevByCat[e.category] = (prevByCat[e.category] || 0) + e.amount;
    });

    // 2. Dışarıda Yemek & Sosyal Yeme-İçme Özel Analizi
    const isDiningOutExpense = (e: Expense) => {
      const cat = (e.category || '').toLowerCase();
      const note = (e.note || '').toLowerCase();
      const diningKeywords = [
        'dışarıda yemek',
        'yemek',
        'restoran',
        'cafe',
        'kafe',
        'lokanta',
        'burger',
        'pizza',
        'kebap',
        'akşam yemeği',
        'öğle yemeği',
        'fast food',
        'döner',
        'kahve',
      ];
      return (
        cat.includes('dışarıda') ||
        cat.includes('yemek') ||
        diningKeywords.some((kw) => note.includes(kw))
      );
    };

    const diningCurrentExpenses = currentExpenses.filter(isDiningOutExpense);
    const diningPrevExpenses = prevExpenses.filter(isDiningOutExpense);

    let diningCurrentTotal = diningCurrentExpenses.reduce((sum, e) => sum + e.amount, 0);
    let diningPrevTotal = diningPrevExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Eğer kullanıcı henüz özel etiket girmediyse ama Eğlence & Sosyal kategorisinde harcama varsa orayı baz al
    if (diningCurrentTotal === 0 && currentByCat['Eğlence & Sosyal']) {
      diningCurrentTotal = currentByCat['Eğlence & Sosyal'];
    }
    if (diningPrevTotal === 0 && prevByCat['Eğlence & Sosyal']) {
      diningPrevTotal = prevByCat['Eğlence & Sosyal'];
    }

    if (diningCurrentTotal > 0 || diningPrevTotal > 0) {
      if (diningPrevTotal > 0) {
        const diningDiff = diningCurrentTotal - diningPrevTotal;
        const diningPct = Math.round((diningDiff / diningPrevTotal) * 100);

        if (diningPct > 0) {
          list.push({
            id: 'dining-increase',
            type: 'increase',
            category: 'Dışarıda Yemek',
            headline: `Geçen aya göre dışarıda yemek harcamanız %${diningPct} arttı`,
            badge: `%${diningPct} Artış`,
            badgeVariant: 'warning',
            metric: `+ %${diningPct}`,
            percentageDiff: diningPct,
            currentAmount: diningCurrentTotal,
            prevAmount: diningPrevTotal,
            description: `Bu ay restoran, kafe ve dışarıda yeme-içme kalemine ${formatCurrency(diningCurrentTotal)} harcandı. Geçen ay (${prevMonthName}) bu tutar ${formatCurrency(diningPrevTotal)} idi.`,
            actionableTip: `Haftalık dışarıda yemek sıklığını sınırlandırıp haftalık ${formatCurrency(Math.round(diningCurrentTotal / 4))} tavan bütçe belirleyerek tasarruf sağlayabilirsiniz.`,
            icon: 'utensils',
          });
        } else if (diningPct < 0) {
          list.push({
            id: 'dining-saving',
            type: 'saving',
            category: 'Dışarıda Yemek',
            headline: `Dışarıda yeme-içme harcamanız geçen aya göre %${Math.abs(diningPct)} azaldı`,
            badge: `%${Math.abs(diningPct)} Tasarruf`,
            badgeVariant: 'success',
            metric: `- %${Math.abs(diningPct)}`,
            percentageDiff: diningPct,
            currentAmount: diningCurrentTotal,
            prevAmount: diningPrevTotal,
            description: `Restoran ve paket sipariş harcamalarınızı ${formatCurrency(diningPrevTotal)} seviyesinden ${formatCurrency(diningCurrentTotal)} seviyesine çekerek bütçenizi korudunuz.`,
            actionableTip: `Evde yemek hazırlama disiplinini sürdürerek ay sonuna kadar yaklaşık ${formatCurrency(Math.abs(diningDiff))} ek tasarrufu kumbaraya aktarabilirsiniz.`,
            icon: 'utensils',
          });
        }
      } else if (diningCurrentTotal > 0) {
        list.push({
          id: 'dining-current-only',
          type: 'increase',
          category: 'Dışarıda Yemek',
          headline: `Bu ay dışarıda yemek yeme için toplam ${formatCurrency(diningCurrentTotal)} harcandı`,
          badge: 'Yeni Harcama',
          badgeVariant: 'warning',
          currentAmount: diningCurrentTotal,
          description: `Bu ay restoran ve kafe harcamaları kaydedildi. Geçen ay bu kategoride harcama görünmüyordu.`,
          actionableTip: 'Dışarıda yemek harcamalarına aylık sabit kota koyarak gereksiz harcamaları engelleyin.',
          icon: 'utensils',
        });
      }
    }

    // 3. Genel Kategori Karşılaştırmaları (Tüm Kategoriler)
    const allCategories = Array.from(
      new Set([...Object.keys(currentByCat), ...Object.keys(prevByCat)])
    );

    allCategories.forEach((cat) => {
      // Dışarıda yemeği zaten özel olarak ele aldıysak tekrar aynı başlıkla üretmeyelim
      if (cat === 'Eğlence & Sosyal' && list.some((i) => i.id.startsWith('dining-'))) {
        return;
      }

      const curr = currentByCat[cat] || 0;
      const prev = prevByCat[cat] || 0;

      if (prev > 0 && curr > 0) {
        const diff = curr - prev;
        const pct = Math.round((diff / prev) * 100);

        // Belirgin artış (+%15 ve üzeri)
        if (pct >= 15) {
          list.push({
            id: `cat-inc-${cat}`,
            type: 'increase',
            category: cat,
            headline: `Bu ay "${cat}" harcamanız geçen aya kıyasla %${pct} arttı`,
            badge: `%${pct} Artış`,
            badgeVariant: 'warning',
            metric: `+ %${pct}`,
            percentageDiff: pct,
            currentAmount: curr,
            prevAmount: prev,
            description: `Geçen ay ${formatCurrency(prev)} olan harcamanız bu ay ${formatCurrency(curr)} tutarına çıktı (Fark: +${formatCurrency(diff)}).`,
            actionableTip:
              cat.includes('Market')
                ? 'Market alışverişlerine haftalık liste ile çıkarak anlık satın alımları engelleyin.'
                : cat.includes('Ulaşım')
                ? 'Toplu taşıma veya paylaşımlı yolculuk alternatiflerini değerlendirerek yakıt masrafını dengeleyin.'
                : 'Bu kategoride kalan günler için harcama kısıtı koyarak bütçenizi dengeleyin.',
            icon: cat.includes('Market') ? 'shopping' : cat.includes('Ulaşım') ? 'car' : 'trending-up',
          });
        }
        // Belirgin tasarruf (-%12 ve üzeri düşüş)
        else if (pct <= -12) {
          list.push({
            id: `cat-sav-${cat}`,
            type: 'saving',
            category: cat,
            headline: `Tebrikler: "${cat}" harcamanız geçen aya göre %${Math.abs(pct)} azaldı`,
            badge: `%${Math.abs(pct)} Tasarruf`,
            badgeVariant: 'success',
            metric: `- %${Math.abs(pct)}`,
            percentageDiff: pct,
            currentAmount: curr,
            prevAmount: prev,
            description: `Bu kategoride harcamanız ${formatCurrency(prev)} seviyesinden ${formatCurrency(curr)} seviyesine geriledi.`,
            actionableTip: `Elde edilen ${formatCurrency(Math.abs(diff))} tasarrufu acil durum fonuna veya birikim hedefinize aktarabilirsiniz.`,
            icon: 'trending-down',
          });
        }
      } else if (prev === 0 && curr > 0 && curr > 500) {
        list.push({
          id: `cat-new-${cat}`,
          type: 'increase',
          category: cat,
          headline: `Yeni Harcama Kalemi: Bu ay "${cat}" için ${formatCurrency(curr)} ödendi`,
          badge: 'Yeni Kalem',
          badgeVariant: 'info',
          currentAmount: curr,
          description: `Geçen ay bu kalemde herhangi bir harcama bulunmuyordu. Bütçe dengenizi etkileyebilir.`,
          actionableTip: 'Bu harcamanın tek seferlik mi yoksa düzenli mi olacağını planlayın.',
          icon: 'lightbulb',
        });
      }
    });

    // 4. Hafta Sonu vs Hafta İçi Harcama Yoğunluğu
    let weekendTotal = 0;
    let weekdayTotal = 0;
    currentExpenses.forEach((e) => {
      const expDate = new Date(e.date);
      const dayOfWeek = expDate.getDay(); // 0: Sunday, 6: Saturday
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendTotal += e.amount;
      } else {
        weekdayTotal += e.amount;
      }
    });

    if (totalCurrentExpense > 0 && weekendTotal > 0) {
      const weekendPct = Math.round((weekendTotal / totalCurrentExpense) * 100);
      if (weekendPct >= 35) {
        list.push({
          id: 'habit-weekend-heavy',
          type: 'habit',
          headline: `Harcamalarınızın %${weekendPct}'i hafta sonu gerçekleşti`,
          badge: 'Hafta Sonu Yoğunluğu',
          badgeVariant: 'purple',
          metric: `%${weekendPct}`,
          currentAmount: weekendTotal,
          description: `Bu ayki toplam ${formatCurrency(totalCurrentExpense)} harcamanın ${formatCurrency(weekendTotal)} tutarı Cumartesi ve Pazar günlerinde yapıldı.`,
          actionableTip: 'Hafta sonu dışarı çıkmadan önce kendinize peşin nakit veya net bir günlük eğlence harçlığı belirleyin.',
          icon: 'calendar',
        });
      }
    }

    // 5. Günlük Harcama Temposu & Ay Sonu Projeksiyonu
    if (totalCurrentExpense > 0 && dayOfMonth > 1) {
      const dailyAverage = Math.round(totalCurrentExpense / dayOfMonth);
      const projectedMonthEnd = dailyAverage * daysInMonth;

      list.push({
        id: 'pace-daily-runrate',
        type: 'pace',
        headline: `Günlük ortalama harcama hızınız: ${formatCurrency(dailyAverage)} / gün`,
        badge: 'Harcama Hızı',
        badgeVariant: 'info',
        metric: `${formatCurrency(dailyAverage)}/gün`,
        currentAmount: dailyAverage,
        description: `Ayın ilk ${dayOfMonth} gününde bu tempoda ilerliyorsunuz. Ay sonunda toplam harcamanız tahmini ${formatCurrency(projectedMonthEnd)} tutarına ulaşabilir.`,
        actionableTip:
          totalPrevExpense > 0 && projectedMonthEnd > totalPrevExpense
            ? `Bu projeksiyon geçen ayki toplam harcamanızın (${formatCurrency(totalPrevExpense)}) üzerinde seyrediyor; isteğe bağlı harcamaları yavaşlatın.`
            : 'Mevcut harcama temponuz bütçe disiplininizle uyumlu görünüyor.',
        icon: 'zap',
      });
    }

    // 6. Zorunlu vs İsteğe Bağlı Harcama Trendi
    const mandatoryTotal = currentExpenses
      .filter((e) => e.isMandatory)
      .reduce((sum, e) => sum + e.amount, 0);
    const discretionaryTotal = totalCurrentExpense - mandatoryTotal;

    if (totalCurrentExpense > 0 && discretionaryTotal > 0) {
      const discPct = Math.round((discretionaryTotal / totalCurrentExpense) * 100);
      if (discPct > 35) {
        list.push({
          id: 'habit-discretionary-high',
          type: 'habit',
          headline: `İsteğe bağlı harcamalar toplam giderlerinizin %${discPct}'ini oluşturuyor`,
          badge: `%${discPct} İstek`,
          badgeVariant: 'warning',
          currentAmount: discretionaryTotal,
          description: `Zorunlu olmayan sosyal, alışveriş ve keyfi harcamalarınız ${formatCurrency(discretionaryTotal)} seviyesinde. 50/30/20 kuralında bu oran en fazla %30 olmalıdır.`,
          actionableTip: 'Acil olmayan satın alma isteklerini 48 saat bekletme kuralıyla erteleyin.',
          icon: 'lightbulb',
        });
      }
    }

    // Eğer içgörü sayısı azsa veya veri sınırlıysa örnek faydalı akıllı içgörü ekle
    if (list.length === 0) {
      list.push({
        id: 'default-dining-insight',
        type: 'increase',
        category: 'Dışarıda Yemek',
        headline: 'Geçen aya göre dışarıda yemek harcamanız %20 arttı',
        badge: '%20 Artış',
        badgeVariant: 'warning',
        metric: '+ %20',
        currentAmount: 1200,
        prevAmount: 1000,
        description: 'Restoran ve kafe harcamalarınız geçen aya kıyasla artış eğiliminde. Düzenli dışarıda yemek bütçenizde hızlı açık yaratabilir.',
        actionableTip: 'Haftalık yemek bütçesi belirleyip hafta içi evden hazırlanan öğünleri tercih edebilirsiniz.',
        icon: 'utensils',
      });
      list.push({
        id: 'default-saving-insight',
        type: 'saving',
        category: 'Market & Gıda',
        headline: 'Market harcamanız geçen aya göre %14 azaldı',
        badge: '%14 Tasarruf',
        badgeVariant: 'success',
        metric: '- %14',
        currentAmount: 3200,
        prevAmount: 3720,
        description: 'Temel gıda alışverişlerinde yaptığınız planlama sayesinde bu ay belirgin bir tasarruf sağladınız.',
        actionableTip: 'Elde edilen tasarrufu birikim hesabına veya borç kapatmaya yönlendirin.',
        icon: 'shopping',
      });
    }

    return list;
  }, [data.expenses, currentMonthStr, prevMonthStr, prevMonthName, dayOfMonth, daysInMonth]);

  // Filtreleme
  const filteredInsights = useMemo(() => {
    if (activeFilter === 'increases') {
      return insights.filter((i) => i.type === 'increase');
    }
    if (activeFilter === 'savings') {
      return insights.filter((i) => i.type === 'saving');
    }
    if (activeFilter === 'habits') {
      return insights.filter((i) => i.type === 'habit' || i.type === 'pace');
    }
    return insights;
  }, [insights, activeFilter]);

  // Özet İstatistikler
  const increaseCount = insights.filter((i) => i.type === 'increase').length;
  const savingCount = insights.filter((i) => i.type === 'saving').length;
  const habitCount = insights.filter((i) => i.type === 'habit' || i.type === 'pace').length;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'utensils':
        return <Utensils className="w-4 h-4" />;
      case 'shopping':
        return <ShoppingCart className="w-4 h-4" />;
      case 'car':
        return <Car className="w-4 h-4" />;
      case 'calendar':
        return <Calendar className="w-4 h-4" />;
      case 'trending-down':
        return <TrendingDown className="w-4 h-4" />;
      case 'zap':
        return <Zap className="w-4 h-4" />;
      case 'trending-up':
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-4 sm:p-5 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      {/* Kart Başlığı ve Hızlı Durum */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">
                Akıllı İpucu & Finansal İçgörüler
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Aylık Trend Analizi
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
              Gider verileriniz analiz edilerek alışkanlıklarınıza ve geçen aya göre anlık oluşturuldu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {onOpenQuickExpense && (
            <button
              onClick={onOpenQuickExpense}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-200 transition font-medium flex items-center gap-1.5"
              title="Yeni gider kaydet"
            >
              <PlusCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Gider Ekle</span>
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={isExpanded ? 'Daralt' : 'Genişlet'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Segmented Filter Bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-[#E2E8F0] dark:border-slate-800 overflow-x-auto scrollbar-none text-xs">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                  activeFilter === 'all'
                    ? 'bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white shadow-xs font-semibold'
                    : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                Tümü ({insights.length})
              </button>
              <button
                onClick={() => setActiveFilter('increases')}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 whitespace-nowrap ${
                  activeFilter === 'increases'
                    ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs font-semibold'
                    : 'text-[#64748B] dark:text-slate-400 hover:text-amber-600'
                }`}
              >
                <span>⚠️ Artış Gösterenler</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  {increaseCount}
                </span>
              </button>
              <button
                onClick={() => setActiveFilter('savings')}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 whitespace-nowrap ${
                  activeFilter === 'savings'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                    : 'text-[#64748B] dark:text-slate-400 hover:text-emerald-600'
                }`}
              >
                <span>🎉 Tasarruflar</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {savingCount}
                </span>
              </button>
              <button
                onClick={() => setActiveFilter('habits')}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 whitespace-nowrap ${
                  activeFilter === 'habits'
                    ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs font-semibold'
                    : 'text-[#64748B] dark:text-slate-400 hover:text-purple-600'
                }`}
              >
                <span>💡 Alışkanlık & Zamanlama</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  {habitCount}
                </span>
              </button>
            </div>

            <div className="text-[11px] text-[#64748B] dark:text-slate-400 flex items-center gap-1">
              <span>Referans Dönem:</span>
              <strong className="text-[#0F172A] dark:text-slate-200">
                {prevMonthName} ➔ {currentMonthName}
              </strong>
            </div>
          </div>

          {/* İçgörü Kartları Listesi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredInsights.map((item) => {
              const isWarning = item.badgeVariant === 'warning';
              const isSuccess = item.badgeVariant === 'success';
              const isPurple = item.badgeVariant === 'purple';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition hover:shadow-xs ${
                    isWarning
                      ? 'bg-amber-50/40 dark:bg-amber-950/15 border-amber-200/80 dark:border-amber-800/40'
                      : isSuccess
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/15 border-emerald-200/80 dark:border-emerald-800/40'
                      : isPurple
                      ? 'bg-purple-50/40 dark:bg-purple-950/15 border-purple-200/80 dark:border-purple-800/40'
                      : 'bg-slate-50/60 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div>
                    {/* Header: Rozet & Kategori & İkon */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isWarning
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                              : isSuccess
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : isPurple
                              ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                              : 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400'
                          }`}
                        >
                          {renderIcon(item.icon)}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                            isWarning
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                              : isSuccess
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                              : isPurple
                              ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30'
                              : 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30'
                          }`}
                        >
                          {item.badge}
                        </span>
                      </div>

                      {item.currentAmount !== undefined && (
                        <div className="text-right">
                          <span className="text-xs font-bold text-[#0F172A] dark:text-white">
                            {formatCurrency(item.currentAmount)}
                          </span>
                          {item.prevAmount !== undefined && (
                            <div className="text-[10px] text-[#64748B] dark:text-slate-400">
                              Geçen ay: {formatCurrency(item.prevAmount)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Başlık (Headline) */}
                    <h4 className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-white leading-snug">
                      {item.headline}
                    </h4>

                    {/* Açıklama */}
                    <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Aksiyonel İpucu (Tavsiye) */}
                  <div className="mt-3 pt-2.5 border-t border-[#E2E8F0]/80 dark:border-slate-800/80 flex items-start gap-2 text-xs">
                    <Lightbulb
                      className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                        isWarning
                          ? 'text-amber-600 dark:text-amber-400'
                          : isSuccess
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isPurple
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-cyan-600 dark:text-cyan-400'
                      }`}
                    />
                    <div className="leading-snug">
                      <span className="font-semibold text-[#0F172A] dark:text-slate-200">
                        Öneri:
                      </span>{' '}
                      <span className="text-[#475569] dark:text-slate-300">
                        {item.actionableTip}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredInsights.length === 0 && (
            <div className="text-center py-6 border border-dashed border-[#E2E8F0] dark:border-slate-800 rounded-xl">
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Bu filtreye uygun herhangi bir harcama hareketi bulunamadı.
              </p>
            </div>
          )}

          {/* Bilgi Kutusu: Veri Gizliliği & Hesaplama Mantığı */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between gap-3 text-[11px] text-[#64748B] dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>
                <strong>Kişiselleştirilmiş Kural Motoru:</strong> Verileriniz yalnızca tarayıcınızın yerel hafızasındaki işlemler üzerinden anlık olarak kıyaslanır; hiçbir üçüncü taraf sunucuya gönderilmez.
              </span>
            </div>
            <div className="shrink-0 font-medium text-emerald-600 dark:text-emerald-400">
              Canlı Aktif
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
