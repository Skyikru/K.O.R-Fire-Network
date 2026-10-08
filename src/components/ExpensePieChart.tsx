import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Expense } from '../types';
import { formatCurrency, formatDateTurkish } from '../utils/storage';
import {
  PieChart as PieChartIcon,
  TrendingDown,
  Plus,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tag,
  Calendar,
  AlertCircle,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

interface ExpensePieChartProps {
  expenses: Expense[];
  onAddExpense?: () => void;
}

// Consistent, accessible, and high-contrast palette for categories
const CATEGORY_COLORS: Record<string, string> = {
  'Market & Gıda': '#10B981',       // Emerald
  'Fatura & Abonelik': '#3B82F6',   // Blue
  'Kira & Konut': '#8B5CF6',        // Violet
  'Ulaşım & Yakıt': '#F59E0B',      // Amber
  'Sağlık & Bakım': '#EC4899',      // Pink
  'Eğlence & Sosyal': '#06B6D4',    // Cyan
  'Giyim & Alışveriş': '#D946EF',   // Fuchsia
  'Eğitim': '#0284C7',              // Sky
  'Zorunlu Ödeme': '#EF4444',       // Red
  'Diğer': '#64748B',               // Slate
};

const DEFAULT_COLOR = '#94A3B8';

export const ExpensePieChart: React.FC<ExpensePieChartProps> = ({
  expenses,
  onAddExpense,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'30days' | 'thisMonth' | '7days'>('30days');

  // Compute cutoff strings based on selected timeframe
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (timeframe === 'thisMonth') {
      const monthPrefix = now.toISOString().slice(0, 7);
      return expenses.filter((e) => e.date.startsWith(monthPrefix));
    }

    const pastDate = new Date();
    if (timeframe === '7days') {
      pastDate.setDate(now.getDate() - 7);
    } else {
      // 30 days default
      pastDate.setDate(now.getDate() - 30);
    }
    const cutoffStr = pastDate.toISOString().split('T')[0];
    return expenses.filter((e) => e.date >= cutoffStr && e.date <= todayStr);
  }, [expenses, timeframe]);

  // Aggregate by category
  const { chartData, totalAmount, topCategory, dailyAverage } = useMemo(() => {
    const categoryTotals: Record<
      string,
      { total: number; count: number; items: Expense[] }
    > = {};
    let sum = 0;

    filteredExpenses.forEach((exp) => {
      const cat = exp.category || 'Diğer';
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = { total: 0, count: 0, items: [] };
      }
      categoryTotals[cat].total += exp.amount;
      categoryTotals[cat].count += 1;
      categoryTotals[cat].items.push(exp);
      sum += exp.amount;
    });

    const data = Object.entries(categoryTotals)
      .map(([category, { total, count, items }]) => {
        const percentage = sum > 0 ? Math.round((total / sum) * 100) : 0;
        return {
          name: category,
          value: total,
          count,
          percentage,
          items,
          color: CATEGORY_COLORS[category] || DEFAULT_COLOR,
        };
      })
      .sort((a, b) => b.value - a.value);

    const top = data.length > 0 ? data[0] : null;
    const daysCount = timeframe === '7days' ? 7 : 30;
    const avg = daysCount > 0 ? Math.round(sum / daysCount) : 0;

    return {
      chartData: data,
      totalAmount: sum,
      topCategory: top,
      dailyAverage: avg,
    };
  }, [filteredExpenses, timeframe]);

  // Currently active or hovered slice data for dynamic center display
  const activeData = activeIndex !== null && chartData[activeIndex]
    ? chartData[activeIndex]
    : null;

  // Selected category items for drill-down view
  const drilldownData = useMemo(() => {
    if (!selectedCategory) return null;
    return chartData.find((c) => c.name === selectedCategory) || null;
  }, [selectedCategory, chartData]);

  // Custom Tooltip component for Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-800 rounded-xl p-3 shadow-xl text-xs space-y-1 z-50 pointer-events-none">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-bold text-[#0F172A] dark:text-white">
              {data.name}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 text-[#64748B] dark:text-slate-400 pt-0.5">
            <span>Tutar:</span>
            <strong className="text-rose-600 dark:text-rose-400 font-bold">
              {formatCurrency(data.value)}
            </strong>
          </div>
          <div className="flex items-center justify-between gap-4 text-[#64748B] dark:text-slate-400">
            <span>Pay:</span>
            <span className="font-semibold text-[#0F172A] dark:text-slate-200">
              %{data.percentage} ({data.count} işlem)
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#E2E8F0] dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0 shadow-2xs">
            <PieChartIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white flex items-center gap-2">
              Kategori Bazında Gider Analizi
              <span className="hidden sm:inline-block text-[11px] font-normal text-rose-500 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-2 py-0.5 rounded-full">
                Son 30 Gün
              </span>
            </h3>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400">
              Hangi kategoride ne kadar harcadığınızı ve bütçe dağılımınızı inceleyin
            </p>
          </div>
        </div>

        {/* Timeframe pill tabs & Add button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-[#E2E8F0] dark:border-slate-700/60 text-[11px]">
            <button
              onClick={() => setTimeframe('30days')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                timeframe === '30days'
                  ? 'bg-white dark:bg-[#111827] text-[#0F172A] dark:text-white shadow-2xs'
                  : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              Son 30 Gün
            </button>
            <button
              onClick={() => setTimeframe('thisMonth')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                timeframe === 'thisMonth'
                  ? 'bg-white dark:bg-[#111827] text-[#0F172A] dark:text-white shadow-2xs'
                  : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              Bu Ay
            </button>
            <button
              onClick={() => setTimeframe('7days')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                timeframe === '7days'
                  ? 'bg-white dark:bg-[#111827] text-[#0F172A] dark:text-white shadow-2xs'
                  : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              Son 7 Gün
            </button>
          </div>

          {onAddExpense && (
            <button
              onClick={onAddExpense}
              className="p-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition border border-rose-200/60 dark:border-rose-900/40"
              title="Yeni Gider Ekle"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="space-y-4">
          {/* Top Spending Category & Analytical Insight Banner */}
          {topCategory && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: topCategory.color }}
                />
                <span className="text-[#64748B] dark:text-slate-400">
                  En Çok Harcanan Kategori:
                </span>
                <span className="font-bold text-[#0F172A] dark:text-white">
                  {topCategory.name}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  %{topCategory.percentage} ({formatCurrency(topCategory.value)})
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-[#64748B] dark:text-slate-400 shrink-0">
                <span>
                  Günlük Ort: <strong className="text-[#0F172A] dark:text-slate-200">{formatCurrency(dailyAverage)}</strong>/gün
                </span>
                <span>•</span>
                <span>
                  Toplam: <strong className="text-rose-600 dark:text-rose-400">{formatCurrency(totalAmount)}</strong>
                </span>
              </div>
            </div>
          )}

          {/* Chart & Category List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Recharts Donut Pie Chart with Dynamic Center Badge */}
            <div className="md:col-span-5 relative flex items-center justify-center min-h-[240px]">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={92}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={600}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    onClick={(entry: any) =>
                      setSelectedCategory((prev) =>
                        entry?.name && prev === entry.name ? null : (entry?.name || null)
                      )
                    }
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="transparent"
                        className="transition-all duration-200 cursor-pointer"
                        style={{
                          filter:
                            activeIndex === index || selectedCategory === entry.name
                              ? 'brightness(1.15) drop-shadow(0 2px 8px rgba(0,0,0,0.25))'
                              : 'none',
                          transform:
                            activeIndex === index || selectedCategory === entry.name
                              ? 'scale(1.04)'
                              : 'scale(1)',
                          transformOrigin: 'center center',
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Dynamic Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                {activeData ? (
                  <>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider truncate max-w-[110px]"
                      style={{ color: activeData.color }}
                    >
                      {activeData.name}
                    </span>
                    <span className="text-sm font-extrabold text-[#0F172A] dark:text-white mt-0.5">
                      {formatCurrency(activeData.value)}
                    </span>
                    <span className="text-[10px] text-[#64748B] dark:text-slate-400">
                      %{activeData.percentage} • {activeData.count} işlem
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                      Toplam Gider
                    </span>
                    <span className="text-sm font-extrabold text-[#0F172A] dark:text-white mt-0.5">
                      {formatCurrency(totalAmount)}
                    </span>
                    <span className="text-[10px] text-[#64748B] dark:text-slate-500">
                      {filteredExpenses.length} Harcama
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Category Cards Breakdown */}
            <div className="md:col-span-7 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
                {chartData.map((item, idx) => {
                  const isHovered = activeIndex === idx;
                  const isSelected = selectedCategory === item.name;

                  return (
                    <div
                      key={item.name}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onMouseLeave={() => setActiveIndex(null)}
                      onClick={() =>
                        setSelectedCategory((prev) =>
                          prev === item.name ? null : item.name
                        )
                      }
                      className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800 shadow-2xs'
                          : isHovered
                          ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 shadow-2xs'
                          : 'bg-white dark:bg-slate-900/60 border-[#E2E8F0] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#0F172A] dark:text-white truncate">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-[#64748B] dark:text-slate-400">
                            {item.count} işlem • %{item.percentage}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-[#0F172A] dark:text-slate-200">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Proportional Segmented Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex mt-2 shadow-2xs">
                {chartData.map((item) => (
                  <div
                    key={item.name}
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                    title={`${item.name}: %${item.percentage} (${formatCurrency(item.value)})`}
                    className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full hover:opacity-80"
                  />
                ))}
              </div>

              <p className="text-[10px] text-[#64748B] dark:text-slate-500 text-center pt-0.5">
                Kategori detaylarını ve işlemlerini görmek için kutulara tıklayabilirsiniz.
              </p>
            </div>
          </div>

          {/* Drilldown Category Transactions (When category is selected) */}
          {drilldownData && (
            <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-800 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: drilldownData.color }}
                  />
                  <h4 className="text-xs font-bold text-[#0F172A] dark:text-white">
                    {drilldownData.name} İşlemleri ({drilldownData.count})
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-[11px] text-[#64748B] dark:text-slate-400 hover:text-rose-500 font-medium"
                >
                  Kapat ✕
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-48 overflow-y-auto">
                {drilldownData.items.map((exp) => (
                  <div
                    key={exp.id}
                    className="py-1.5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-medium text-[#0F172A] dark:text-slate-200">
                        {exp.note || exp.category}
                      </span>
                      <p className="text-[10px] text-[#64748B] dark:text-slate-400">
                        {formatDateTurkish(exp.date)}
                        {exp.isMandatory && ' • Zorunlu'}
                      </p>
                    </div>
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      -{formatCurrency(exp.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="py-10 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#0F172A] dark:text-white">
              Seçilen Dönemde Harcama Kaydı Bulunmuyor
            </h4>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1 max-w-sm">
              Harcama ekledikçe kategori bazında Recharts pasta grafiği, yüzdelik paylar ve bütçe analizi otomatik olarak burada gösterilecektir.
            </p>
          </div>
          {onAddExpense && (
            <button
              onClick={onAddExpense}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition active:scale-95 shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Harcama Ekle</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
