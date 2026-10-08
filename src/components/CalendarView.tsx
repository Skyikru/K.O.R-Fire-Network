import React, { useState } from 'react';
import { AppData, CalendarDayEvent, Priority } from '../types';
import { getCalendarEventsForMonth, formatCurrency, formatDateTurkish } from '../utils/storage';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  Plus,
  X,
  Sparkles,
  CalendarDays,
} from 'lucide-react';

interface CalendarViewProps {
  data: AppData;
  onToggleTask: (taskId: string) => void;
  onQuickAddTask: (title: string, priority: Priority, date: string) => void;
}

const WEEKDAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const SHORT_WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  data,
  onToggleTask,
  onQuickAddTask,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-12

  // Modal State for clicked day
  const [selectedDateModal, setSelectedDateModal] = useState<string | null>(null);

  // Quick add form state inside the modal
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
    setSelectedDateModal(now.toISOString().split('T')[0]);
  };

  // Events for this month
  const monthEvents = getCalendarEventsForMonth(data, currentYear, currentMonth);

  // Group events by YYYY-MM-DD
  const eventsByDate = monthEvents.reduce<Record<string, CalendarDayEvent[]>>((acc, ev) => {
    if (!acc[ev.date]) acc[ev.date] = [];
    acc[ev.date].push(ev);
    return acc;
  }, {});

  // Generate calendar grid days
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Monday = 0
  let startingDayIndex = firstDayOfMonth.getDay() - 1;
  if (startingDayIndex === -1) startingDayIndex = 6;

  const totalGridCells = Math.ceil((startingDayIndex + daysInMonth) / 7) * 7;

  const calendarDays: Array<{
    dayNumber: number | null;
    dateStr: string | null;
    isCurrentMonth: boolean;
    isToday: boolean;
  }> = [];

  for (let i = 0; i < totalGridCells; i++) {
    const dayNum = i - startingDayIndex + 1;
    if (dayNum > 0 && dayNum <= daysInMonth) {
      const dStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const isToday = dStr === today.toISOString().split('T')[0];
      calendarDays.push({
        dayNumber: dayNum,
        dateStr: dStr,
        isCurrentMonth: true,
        isToday,
      });
    } else {
      calendarDays.push({
        dayNumber: null,
        dateStr: null,
        isCurrentMonth: false,
        isToday: false,
      });
    }
  }

  const monthName = new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(
    new Date(currentYear, currentMonth - 1, 1)
  );

  const selectedEvents = selectedDateModal ? eventsByDate[selectedDateModal] || [] : [];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !selectedDateModal) return;
    onQuickAddTask(newTitle.trim(), newPriority, selectedDateModal);
    setNewTitle('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-4xl mx-auto">
      {/* Month Header & Controls */}
      <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-slate-100 capitalize tracking-tight">
              {monthName}
            </h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Güne tıklayarak görevleri ve ödeme vadelerini mini pencerede görüntüleyin
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={handleJumpToToday}
            className="px-3 py-1.5 text-xs font-semibold text-[#0F172A] dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition shadow-xs active:scale-95"
          >
            Bugün
          </button>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-[#64748B] dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition"
              title="Önceki Ay"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-[#64748B] dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition"
              title="Sonraki Ay"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Card with strict grid-cols-7 and aspect-square cells */}
      <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        {/* Weekday Names Header */}
        <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
          {WEEKDAYS.map((wd, i) => (
            <div
              key={wd}
              className={`text-xs font-bold py-1.5 rounded-lg tracking-wide ${
                i >= 5
                  ? 'text-rose-500 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20'
                  : 'text-[#64748B] dark:text-slate-400'
              }`}
            >
              <span className="hidden sm:inline">{wd}</span>
              <span className="sm:hidden">{SHORT_WEEKDAYS[i]}</span>
            </div>
          ))}
        </div>

        {/* Calendar Days: strict grid-cols-7 gap-1.5 with aspect-square cells */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((cell, idx) => {
            if (!cell.isCurrentMonth || !cell.dateStr) {
              return (
                <div
                  key={idx}
                  className="aspect-square rounded-xl bg-slate-100/30 dark:bg-slate-900/10 border border-dashed border-slate-200/40 dark:border-slate-800/20 opacity-30 pointer-events-none"
                />
              );
            }

            const dayEvents = eventsByDate[cell.dateStr] || [];
            const hasTask = dayEvents.some((e) => e.type === 'task');
            const hasDue = dayEvents.some((e) => e.type === 'due_date');
            const hasStmt = dayEvents.some((e) => e.type === 'statement');
            const hasIncome = dayEvents.some((e) => e.type === 'income');
            const totalEventsCount = dayEvents.length;

            return (
              <button
                key={cell.dateStr}
                onClick={() => {
                  setSelectedDateModal(cell.dateStr);
                  setShowAddForm(false);
                }}
                className={`group aspect-square flex flex-col items-center justify-center rounded-xl relative transition-all duration-150 cursor-pointer text-center p-1 ${
                  cell.isToday
                    ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-400/40 shadow-xs hover:bg-emerald-500'
                    : totalEventsCount > 0
                    ? 'bg-white dark:bg-[#131d2e] border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xs'
                    : 'bg-white/60 dark:bg-[#111827]/40 border border-[#E2E8F0]/80 dark:border-slate-800/60 text-[#0F172A] dark:text-slate-200 hover:bg-white dark:hover:bg-[#131d2e] hover:border-[#E2E8F0]'
                }`}
                title={cell.dateStr}
              >
                {/* Day Number */}
                <span
                  className={`text-xs sm:text-sm leading-none font-semibold ${
                    cell.isToday ? 'text-white font-extrabold' : 'text-[#0F172A] dark:text-slate-100'
                  }`}
                >
                  {cell.dayNumber}
                </span>

                {/* Event Status Dot Indicators */}
                <div className="flex items-center justify-center gap-1 mt-1.5 h-2">
                  {hasDue && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full bg-rose-500 ${
                        cell.isToday ? 'ring-1 ring-white/70' : ''
                      }`}
                      title="Kredi Kartı Son Ödeme"
                    />
                  )}
                  {hasStmt && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full bg-amber-500 ${
                        cell.isToday ? 'ring-1 ring-white/70' : ''
                      }`}
                      title="Hesap Kesim Günü"
                    />
                  )}
                  {hasIncome && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        cell.isToday ? 'bg-white ring-1 ring-emerald-200' : 'bg-emerald-500'
                      }`}
                      title="Gelir Kaydı"
                    />
                  )}
                  {hasTask && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full bg-purple-500 ${
                        cell.isToday ? 'ring-1 ring-white/70' : ''
                      }`}
                      title="Görev"
                    />
                  )}
                </div>

                {/* Tiny badge if > 3 events */}
                {totalEventsCount > 3 && (
                  <span className={`absolute top-1 right-1 text-[8px] font-bold px-1 rounded-full ${
                    cell.isToday ? 'bg-white/30 text-white' : 'bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-slate-300'
                  }`}>
                    {totalEventsCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Visual Legend Bar */}
        <div className="mt-5 pt-4 border-t border-[#E2E8F0] dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-[#64748B] dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Kredi Kartı Son Ödeme
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Hesap Kesim Tarihi
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-purple-500" /> Gündelik Görev
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Gelir / Tahsilat
            </span>
          </div>

          <div className="text-[11px] text-[#64748B]/80 dark:text-slate-500">
            Kare kutucuğa tıklayarak günün ajandasını açabilirsiniz.
          </div>
        </div>
      </div>

      {/* POPUP MODAL (Mini Pencere): Güne Tıklandığında Açılan Şık Ajanda */}
      {selectedDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] dark:text-slate-100 capitalize">
                    {formatDateTurkish(selectedDateModal)}
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-slate-400">
                    {selectedEvents.length} kayıtlı etkinlik ve finansal uyarı
                  </p>
                </div>
              </div>

              {/* Close Button X */}
              <button
                onClick={() => setSelectedDateModal(null)}
                className="p-1.5 rounded-xl text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Pencereyi Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Add Toggle Button */}
            <div className="flex items-center justify-between shrink-0">
              <span className="text-xs font-semibold text-[#0F172A] dark:text-slate-200">
                Günün Plan ve Ödemeleri
              </span>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-xl transition shadow-xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddForm ? 'Vazgeç' : 'Hızlı Görev Ekle'}</span>
              </button>
            </div>

            {/* Quick Add Inline Form */}
            {showAddForm && (
              <form onSubmit={handleAddSubmit} className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-[#E2E8F0] dark:border-slate-800 space-y-3 shrink-0">
                <input
                  type="text"
                  placeholder="Bu gün için görev veya plan başlığı..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-slate-100 focus:outline-none focus:border-emerald-500 shadow-xs"
                  autoFocus
                />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {(['low', 'medium', 'high'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewPriority(p)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition capitalize ${
                          newPriority === p
                            ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500'
                            : 'bg-white dark:bg-slate-800 text-[#64748B] dark:text-slate-400 border-[#E2E8F0] dark:border-slate-700'
                        }`}
                      >
                        {p === 'high' ? 'Yüksek' : p === 'medium' ? 'Orta' : 'Düşük'}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition shadow-xs"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            )}

            {/* Event List in Scrollable Body */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {selectedEvents.map((ev) => {
                const originalTaskId = ev.id.startsWith('task-') ? ev.id.replace('task-', '') : null;

                return (
                  <div
                    key={ev.id}
                    className={`p-3.5 rounded-xl border transition flex items-start gap-3 shadow-xs ${
                      ev.type === 'due_date'
                        ? 'bg-rose-50/80 dark:bg-rose-950/25 border-rose-200 dark:border-rose-900/50 text-rose-950 dark:text-rose-200'
                        : ev.type === 'statement'
                        ? 'bg-amber-50/80 dark:bg-amber-950/25 border-amber-200 dark:border-amber-900/50 text-amber-950 dark:text-amber-200'
                        : ev.type === 'income'
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-900/50 text-emerald-950 dark:text-emerald-200'
                        : 'bg-white dark:bg-slate-900/70 border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-slate-200'
                    }`}
                  >
                    {/* Action Icon / Checkbox */}
                    {ev.type === 'task' && originalTaskId ? (
                      <button
                        onClick={() => onToggleTask(originalTaskId)}
                        className="mt-0.5 text-[#64748B] hover:text-emerald-500 transition shrink-0"
                      >
                        {ev.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                    ) : ev.type === 'due_date' ? (
                      <CreditCard className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    ) : ev.type === 'statement' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <h4
                            className={`text-xs sm:text-sm font-semibold truncate ${
                              ev.completed ? 'line-through opacity-60' : ''
                            }`}
                          >
                            {ev.title}
                          </h4>
                        </div>
                        {ev.amount !== undefined && (
                          <span className="text-xs sm:text-sm font-bold shrink-0">
                            {formatCurrency(ev.amount)}
                          </span>
                        )}
                      </div>

                      {ev.details && (
                        <p className="text-xs opacity-85 mt-1 leading-snug">
                          {ev.details}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                            ev.type === 'due_date'
                              ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                              : ev.type === 'statement'
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                              : ev.type === 'income'
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                          }`}
                        >
                          {ev.type === 'due_date'
                            ? 'Son Ödeme Günü'
                            : ev.type === 'statement'
                            ? 'Hesap Kesimi'
                            : ev.type === 'income'
                            ? 'Gelir'
                            : 'Görev'}
                        </span>

                        {ev.priority && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                              ev.priority === 'high'
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                : ev.priority === 'medium'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-slate-400 border-[#E2E8F0] dark:border-slate-700'
                            }`}
                          >
                            {ev.priority === 'high' ? 'Yüksek Öncelik' : ev.priority === 'medium' ? 'Orta Öncelik' : 'Düşük Öncelik'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {selectedEvents.length === 0 && (
                <div className="py-12 text-center text-xs text-[#64748B] dark:text-slate-500 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-[#0F172A] dark:text-slate-300 text-sm">
                    Bu güne ait planlanmış etkinlik veya ödeme yok
                  </p>
                  <p className="text-xs text-[#64748B] max-w-xs mx-auto">
                    Yukarıdaki "Hızlı Görev Ekle" butonuna basarak bu güne hemen yeni bir görev kaydedebilirsiniz.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-[#64748B] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                Borçlar ve ekstreler takvime otomatik entegredir
              </span>
              <button
                onClick={() => setSelectedDateModal(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-200 text-xs font-semibold rounded-xl transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
