import React, { useState, useEffect } from 'react';
import { AppData, Task, Priority } from '../types';
import { getTodayString } from '../utils/storage';
import {
  CheckSquare,
  Plus,
  Trash2,
  Flame,
  CheckCircle2,
  Circle,
  Mic,
  MicOff,
  Sparkles,
  AlertCircle,
  Check,
  Search,
  X,
} from 'lucide-react';
import { VoiceAssistantModal } from './VoiceAssistantModal';
import { parseVoiceCommand, VoiceParsedResult } from '../utils/voiceParser';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface TasksViewProps {
  data: AppData;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddHabit: (title: string) => void;
  onToggleHabitToday: (habitId: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onVoiceExpense?: (amount: number, category: string, date: string, note?: string) => void;
  onVoiceIncome?: (amount: number, source: string, date: string, note?: string) => void;
  onOpenExpenseFormWithData?: (amount: number, category: string, date: string, note?: string) => void;
  onOpenIncomeFormWithData?: (amount: number, source: string, date: string, note?: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  data,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onAddHabit,
  onToggleHabitToday,
  onDeleteHabit,
  onVoiceExpense,
  onVoiceIncome,
  onOpenExpenseFormWithData,
  onOpenIncomeFormWithData,
}) => {
  const todayStr = getTodayString();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // New task form state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskDueDate, setTaskDueDate] = useState(todayStr);

  // Inline speech recognition inside Task Modal
  const {
    isSupported: isInlineVoiceSupported,
    isListening: isInlineVoiceListening,
    transcript: inlineVoiceTranscript,
    error: inlineVoiceError,
    startListening: startInlineVoice,
    stopListening: stopInlineVoice,
    resetTranscript: resetInlineVoice,
  } = useSpeechRecognition();

  const [voiceFeedbackNotice, setVoiceFeedbackNotice] = useState<string | null>(null);

  // New habit form state
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [habitTitle, setHabitTitle] = useState('');

  // Full Voice Assistant Modal state
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  // Task filtering logic
  const filteredTasks = data.tasks.filter((t) => {
    if (filter === 'pending' && t.completed) return false;
    if (filter === 'completed' && !t.completed) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLocaleLowerCase('tr-TR').trim();
      const titleMatch = t.title.toLocaleLowerCase('tr-TR').includes(q);
      const dateMatch = t.dueDate?.includes(q);
      const prioMatch = (t.priority === 'high' ? 'acil yüksek' : t.priority === 'medium' ? 'orta' : 'düşük').includes(q);
      if (!titleMatch && !dateMatch && !prioMatch) return false;
    }
    return true;
  });

  const totalTasks = data.tasks.length;
  const completedTasks = data.tasks.filter((t) => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // React to inline voice transcript changes
  useEffect(() => {
    if (!inlineVoiceTranscript || inlineVoiceTranscript.trim().length < 3) return;

    const parsed = parseVoiceCommand(inlineVoiceTranscript);

    if (parsed.type === 'expense') {
      setVoiceFeedbackNotice(`💡 Harcama tespit edildi: ${parsed.amount} TL - ${parsed.category}. Harcama formu dolduruluyor...`);
      stopInlineVoice();
      // Delay briefly so user sees the feedback, then switch to expense form
      setTimeout(() => {
        setShowTaskModal(false);
        resetInlineVoice();
        setVoiceFeedbackNotice(null);
        if (onOpenExpenseFormWithData) {
          onOpenExpenseFormWithData(parsed.amount, parsed.category, parsed.date, parsed.note);
        } else if (onVoiceExpense) {
          onVoiceExpense(parsed.amount, parsed.category, parsed.date, parsed.note);
        }
      }, 700);
    } else if (parsed.type === 'income') {
      setVoiceFeedbackNotice(`💡 Gelir tespit edildi: ${parsed.amount} TL - ${parsed.source}. Gelir formu dolduruluyor...`);
      stopInlineVoice();
      setTimeout(() => {
        setShowTaskModal(false);
        resetInlineVoice();
        setVoiceFeedbackNotice(null);
        if (onOpenIncomeFormWithData) {
          onOpenIncomeFormWithData(parsed.amount, parsed.source, parsed.date, parsed.note);
        } else if (onVoiceIncome) {
          onVoiceIncome(parsed.amount, parsed.source, parsed.date, parsed.note);
        }
      }, 700);
    } else if (parsed.type === 'task') {
      setTaskTitle(parsed.title);
      setTaskPriority(parsed.priority);
      setTaskDueDate(parsed.dueDate);
      setVoiceFeedbackNotice(`✓ Görev formu dolduruldu: "${parsed.title}"`);
    }
  }, [inlineVoiceTranscript]);

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    onAddTask({
      title: taskTitle.trim(),
      priority: taskPriority,
      completed: false,
      dueDate: taskDueDate || todayStr,
    });
    setTaskTitle('');
    setShowTaskModal(false);
    stopInlineVoice();
    resetInlineVoice();
    setVoiceFeedbackNotice(null);
  };

  const handleSaveHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;
    onAddHabit(habitTitle.trim());
    setHabitTitle('');
    setShowHabitModal(false);
  };

  const handleApplyVoiceResult = (result: VoiceParsedResult, autoSave: boolean) => {
    if (result.type === 'task') {
      if (autoSave) {
        onAddTask({
          title: result.title,
          priority: result.priority,
          dueDate: result.dueDate,
          completed: false,
        });
      } else {
        setTaskTitle(result.title);
        setTaskPriority(result.priority);
        setTaskDueDate(result.dueDate);
        setShowTaskModal(true);
      }
    } else if (result.type === 'expense') {
      if (autoSave) {
        if (onVoiceExpense) {
          onVoiceExpense(result.amount, result.category, result.date, result.note);
        }
      } else {
        if (onOpenExpenseFormWithData) {
          onOpenExpenseFormWithData(result.amount, result.category, result.date, result.note);
        } else if (onVoiceExpense) {
          onVoiceExpense(result.amount, result.category, result.date, result.note);
        }
      }
    } else if (result.type === 'income') {
      if (autoSave) {
        if (onVoiceIncome) {
          onVoiceIncome(result.amount, result.source, result.date, result.note);
        }
      } else {
        if (onOpenIncomeFormWithData) {
          onOpenIncomeFormWithData(result.amount, result.source, result.date, result.note);
        } else if (onVoiceIncome) {
          onVoiceIncome(result.amount, result.source, result.date, result.note);
        }
      }
    }
  };

  const toggleInlineMic = () => {
    if (isInlineVoiceListening) {
      stopInlineVoice();
    } else {
      resetInlineVoice();
      setVoiceFeedbackNotice(null);
      startInlineVoice();
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* 1. Daily Progress Bar Card */}
      <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#0F172A] dark:text-white">Gündelik Tamamlanma Oranı</h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
              Bugünkü görevlerin {completedTasks} / {totalTasks} tanesi tamamlandı
            </p>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">%{progressPercent}</span>
          </div>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 2. Tasks Management Header & Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input and status tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#64748B] dark:text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Görevlerde ara (başlık, acil, tarih)..."
              className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 text-xs text-[#0F172A] dark:text-white placeholder:text-[#64748B] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 p-0.5 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl overflow-x-auto shrink-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-[#E2E8F0] dark:border-emerald-500/30 shadow-xs'
                  : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-slate-200'
              }`}
            >
              Tümü ({data.tasks.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                filter === 'pending'
                  ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-[#E2E8F0] dark:border-emerald-500/30 shadow-xs'
                  : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-slate-200'
              }`}
            >
              Bekleyenler ({data.tasks.filter((t) => !t.completed).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                filter === 'completed'
                  ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-[#E2E8F0] dark:border-emerald-500/30 shadow-xs'
                  : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-slate-200'
              }`}
            >
              Tamamlanan ({completedTasks})
            </button>
          </div>
        </div>

        {/* Add buttons: Voice Assistant, New Task, Habit */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVoiceModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition active:scale-95 shadow-xs"
            title="Web Speech API ile sesli görev veya harcama ekle"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Sesle Ekle</span>
          </button>
          <button
            onClick={() => setShowTaskModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition active:scale-95 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Görev</span>
          </button>
          <button
            onClick={() => setShowHabitModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-[#0F172A] dark:text-slate-200 border border-[#E2E8F0] dark:border-slate-800 rounded-xl text-xs font-medium transition active:scale-95 shadow-xs"
          >
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Alışkanlık</span>
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition ${
              task.completed ? 'bg-slate-50/60 dark:bg-slate-900/30 opacity-70' : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={() => onToggleTask(task.id)}
                className="shrink-0 text-[#64748B] hover:text-emerald-500 transition"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-500/20" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400 hover:text-emerald-500" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <p
                  onClick={() => onToggleTask(task.id)}
                  className={`text-xs sm:text-sm cursor-pointer select-none truncate ${
                    task.completed ? 'line-through text-[#64748B] dark:text-slate-500' : 'text-[#0F172A] dark:text-slate-200 font-medium'
                  }`}
                >
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                      task.priority === 'high'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        : task.priority === 'medium'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-slate-400 border-[#E2E8F0] dark:border-slate-700'
                    }`}
                  >
                    {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
                  </span>
                  <span className="text-[11px] text-[#64748B] dark:text-slate-400">
                    Son Tarih: {task.dueDate}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onDeleteTask(task.id)}
              className="p-1 rounded-lg text-[#64748B] hover:text-rose-500 hover:bg-rose-500/10 transition"
              title="Görevi Sil"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="py-12 text-center text-xs text-[#64748B] dark:text-slate-500">
            {filter === 'pending'
              ? 'Bekleyen görev yok, harika gidiyorsunuz!'
              : filter === 'completed'
              ? 'Henüz tamamlanan görev yok.'
              : 'Seçili filtrede görüntülenecek görev bulunamadı.'}
          </div>
        )}
      </div>

      {/* 3. Alışkanlıklar & Streak Takibi */}
      <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Alışkanlık & Zinciri Kırma Takibi</h3>
          </div>
          <button
            onClick={() => setShowHabitModal(true)}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Alışkanlık Ekle
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.habits.map((habit) => {
            const isDoneToday = habit.completedDates.includes(todayStr);
            return (
              <div
                key={habit.id}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-[#E2E8F0] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold text-[#0F172A] dark:text-white truncate">{habit.title}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-xs font-bold text-orange-500">{habit.streak} gün</span>
                    <span className="text-[10px] text-[#64748B]">kesintisiz seri</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleHabitToday(habit.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition active:scale-95 ${
                      isDoneToday
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 font-semibold'
                        : 'bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-[#E2E8F0] dark:border-slate-700'
                    }`}
                  >
                    {isDoneToday ? '✓ Tamamlandı' : 'Bugün Yap'}
                  </button>
                  <button
                    onClick={() => onDeleteHabit(habit.id)}
                    className="p-1 text-[#64748B] hover:text-rose-500"
                    title="Alışkanlığı Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {data.habits.length === 0 && (
            <div className="col-span-full py-8 text-center text-xs text-[#64748B] dark:text-slate-500">
              Henüz takip edilen bir alışkanlık yok. Yeni bir alışkanlık ekleyerek zinciri başlatın!
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Yeni Görev Ekle */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Yeni Görev Ekle
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    stopInlineVoice();
                    setShowTaskModal(false);
                    setShowVoiceModal(true);
                  }}
                  className="p-1.5 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition"
                  title="Gelişmiş Sesli Asistan Penceresi"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Inline Voice Recognition Banner */}
            <div className="mb-3 p-2.5 rounded-xl bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/25 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={toggleInlineMic}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isInlineVoiceListening
                      ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/30'
                      : 'bg-purple-600 hover:bg-purple-500 text-white'
                  }`}
                  title={isInlineVoiceListening ? 'Dinlemeyi durdur' : 'Sesli komutla doldur'}
                >
                  {isInlineVoiceListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-purple-800 dark:text-purple-300 truncate">
                    {isInlineVoiceListening ? 'Sizi dinliyor... Konuşun' : 'Sesli Komutla Formu Doldur'}
                  </p>
                  <p className="text-[10px] text-purple-600 dark:text-purple-400 truncate">
                    {inlineVoiceTranscript ? `"${inlineVoiceTranscript}"` : 'Örn: "Bugün 200 TL market harcaması ekle"'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleInlineMic}
                className={`text-[11px] px-2 py-1 rounded-lg font-semibold shrink-0 transition ${
                  isInlineVoiceListening
                    ? 'bg-rose-500 text-white'
                    : 'bg-purple-600 text-white hover:bg-purple-500'
                }`}
              >
                {isInlineVoiceListening ? 'Durdur' : 'Mikrofon'}
              </button>
            </div>

            {/* Voice Feedback Notification */}
            {voiceFeedbackNotice && (
              <div className="mb-3 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px]">{voiceFeedbackNotice}</span>
              </div>
            )}

            {inlineVoiceError && (
              <div className="mb-3 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{inlineVoiceError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTask} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-[#64748B] dark:text-slate-400 mb-1">
                  Görev Başlığı *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Örn: Kredi kartı ekstrelerini kontrol et"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white text-sm focus:border-emerald-500 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={toggleInlineMic}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg transition ${
                      isInlineVoiceListening
                        ? 'text-rose-500 animate-pulse'
                        : 'text-slate-400 hover:text-purple-600'
                    }`}
                    title="Sesle dikte et"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#64748B] dark:text-slate-400 mb-1">Öncelik Derecesi</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTaskPriority(p)}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition capitalize ${
                        taskPriority === p
                          ? p === 'high'
                            ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40'
                            : p === 'medium'
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                          : 'bg-[#F8FAFC] dark:bg-slate-900 text-[#64748B] dark:text-slate-400 border-[#E2E8F0] dark:border-slate-700'
                      }`}
                    >
                      {p === 'high' ? 'Yüksek' : p === 'medium' ? 'Orta' : 'Düşük'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#64748B] dark:text-slate-400 mb-1">Son Tarih</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    stopInlineVoice();
                    setShowTaskModal(false);
                  }}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-300 text-xs font-medium rounded-xl transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-xl transition shadow-xs"
                >
                  Görevi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Yeni Alışkanlık Ekle */}
      {showHabitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white flex items-center gap-2 mb-4">
              <Flame className="w-4 h-4 text-orange-500" />
              Yeni Alışkanlık Başlat
            </h3>
            <form onSubmit={handleSaveHabit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-[#64748B] dark:text-slate-400 mb-1">Alışkanlık Hedefi *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Günlük harcamaları kaydet veya 2L su"
                  value={habitTitle}
                  onChange={(e) => setHabitTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white text-sm focus:border-emerald-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                Her gün tamamladığınızda zincir seriniz (streak) 1 gün artar.
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHabitModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-300 text-xs font-medium rounded-xl transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-xl transition shadow-xs"
                >
                  Başlat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onApplyParsedResult={handleApplyVoiceResult}
      />
    </div>
  );
};
