import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ComposedChart,
} from 'recharts';
import { Income, Expense } from '../types';
import { formatCurrency } from '../utils/storage';
import { TrendingUp, TrendingDown, PiggyBank, Calendar, BarChart3 } from 'lucide-react';

interface MonthlyTrendChartProps {
  incomes: Income[];
  expenses: Expense[];
}

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ incomes, expenses }) => {
  const [timeframe, setTimeframe] = useState<6 | 12>(6);

  // Calculate monthly stats for the selected timeframe
  const chartData = useMemo(() => {
    const months: {
      key: string;
      label: string;
      gelir: number;
      gider: number;
      tasarruf: number;
      tasarrufOrani: number;
    }[] = [];

    const now = new Date();
    const count = timeframe;

    // Collect months backwards, then reverse so oldest is first
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });

      // Income in month
      const monthIncomes = incomes.filter((item) => item.date && item.date.startsWith(key));
      const incTotal = monthIncomes.reduce((sum, item) => sum + item.amount, 0);

      // Expense in month
      const monthExpenses = expenses.filter((item) => item.date && item.date.startsWith(key));
      const expTotal = monthExpenses.reduce((sum, item) => sum + item.amount, 0);

      const netSavings = incTotal - expTotal;
      const rate = incTotal > 0 ? Math.round((netSavings / incTotal) * 100) : 0;

      months.push({
        key,
        label,
        gelir: incTotal,
        gider: expTotal,
        tasarruf: netSavings,
        tasarrufOrani: rate,
      });
    }

    return months;
  }, [incomes, expenses, timeframe]);

  // Aggregate stats
  const totalIncome = chartData.reduce((sum, m) => sum + m.gelir, 0);
  const totalExpense = chartData.reduce((sum, m) => sum + m.gider, 0);
  const totalSavings = totalIncome - totalExpense;
  const avgMonthlySavings = Math.round(totalSavings / chartData.length);
  const avgSavingsRate = totalIncome > 0 ? Math.round((totalSavings / totalIncome) * 100) : 0;

  // Best savings month
  const bestMonth = [...chartData].sort((a, b) => b.tasarruf - a.tasarruf)[0];

  return (
    <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                Aylık Gelir - Gider & Birikim Trendi
              </h2>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                Son {timeframe} ayın nakit akışı ve net tasarruf performansı
              </p>
            </div>
          </div>
        </div>

        {/* 6 vs 12 Month Toggle */}
        <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-[#E2E8F0] dark:border-slate-700 self-start sm:self-auto">
          <button
            onClick={() => setTimeframe(6)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
              timeframe === 6
                ? 'bg-white dark:bg-slate-700 text-[#0F172A] dark:text-white shadow-xs'
                : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            Son 6 Ay
          </button>
          <button
            onClick={() => setTimeframe(12)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
              timeframe === 12
                ? 'bg-white dark:bg-slate-700 text-[#0F172A] dark:text-white shadow-xs'
                : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            Son 12 Ay
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800">
          <span className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 block mb-1">
            Toplam Birikim
          </span>
          <span
            className={`text-base font-bold tracking-tight ${
              totalSavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(totalSavings)}
          </span>
          <span className="text-[10px] text-[#64748B] dark:text-slate-500 block mt-0.5">
            Son {timeframe} ay net
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800">
          <span className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 block mb-1">
            Aylık Ort. Tasarruf
          </span>
          <span className="text-base font-bold text-[#0F172A] dark:text-white tracking-tight">
            {formatCurrency(avgMonthlySavings)}
          </span>
          <span className="text-[10px] text-[#64748B] dark:text-slate-500 block mt-0.5">
            Aylık net ortalama
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800">
          <span className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 block mb-1">
            Ort. Tasarruf Oranı
          </span>
          <span
            className={`text-base font-bold tracking-tight ${
              avgSavingsRate >= 20
                ? 'text-emerald-600 dark:text-emerald-400'
                : avgSavingsRate > 0
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            %{avgSavingsRate}
          </span>
          <span className="text-[10px] text-[#64748B] dark:text-slate-500 block mt-0.5">
            Gelirin birikim payı
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800">
          <span className="text-[11px] font-medium text-[#64748B] dark:text-slate-400 block mb-1">
            En İyi Ay
          </span>
          <span className="text-base font-bold text-[#0F172A] dark:text-white tracking-tight truncate block">
            {bestMonth ? bestMonth.label : '-'}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-medium">
            {bestMonth ? `+${formatCurrency(bestMonth.tasarruf)}` : ''}
          </span>
        </div>
      </div>

      {/* Chart Section */}
      <div className="h-[280px] sm:h-[320px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              opacity={0.2}
              vertical={false}
            />
            <XAxis
              dataKey="label"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155', opacity: 0.2 }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                value >= 1000 ? `${Math.round(value / 1000)}k` : `${value}`
              }
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-md">
                      <p className="font-bold text-slate-200 mb-1.5 pb-1 border-b border-slate-800">
                        {label}
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Gelir:
                          </span>
                          <span className="font-semibold">{formatCurrency(data.gelir)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-rose-400">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            Gider:
                          </span>
                          <span className="font-semibold">{formatCurrency(data.gider)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800">
                          <span className="flex items-center gap-1.5 text-purple-300">
                            <span className="w-2 h-2 rounded-full bg-purple-500" />
                            Net Tasarruf:
                          </span>
                          <span
                            className={`font-bold ${
                              data.tasarruf >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {formatCurrency(data.tasarruf)} (%{data.tasarrufOrani})
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              formatter={(value) => {
                if (value === 'gelir') return 'Gelir';
                if (value === 'gider') return 'Gider';
                if (value === 'tasarruf') return 'Net Tasarruf';
                return value;
              }}
            />
            <Bar
              dataKey="gelir"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="gider"
              fill="#f43f5e"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Line
              type="monotone"
              dataKey="tasarruf"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#8b5cf6' }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
