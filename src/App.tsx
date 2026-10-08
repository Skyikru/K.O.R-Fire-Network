import React, { useState, useEffect } from 'react';
import {
  AppData,
  MultiProfileStore,
  UserProfile,
  Task,
  Habit,
  Income,
  Expense,
  CreditCardDebt,
  NavTab,
  AppTheme,
  Priority,
  CategoryBudget,
  EmergencyFund,
  InstallmentLoan,
  DailyRoutineExpense,
  SavingsGoal,
  SubscriptionItem,
  FixedExpenseItem,
} from './types';
import {
  loadMultiProfileStore,
  saveMultiProfileStore,
  INITIAL_DATA,
  createCleanProfileData,
  getTodayString,
} from './utils/storage';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { FinanceView } from './components/FinanceView';
import { TasksView } from './components/TasksView';
import { CalendarView } from './components/CalendarView';
import { BackupSyncView } from './components/BackupSyncView';
import { ProfileModal } from './components/ProfileModal';
import { VaultLockModal } from './components/VaultLockModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { MonthlyReportModal } from './components/MonthlyReportModal';
import { BankSmsParserModal } from './components/BankSmsParserModal';

const THEME_STORAGE_KEY = 'yasambilgi_theme_pref';

export default function App() {
  // Load Multi-Profile store from localStorage
  const [store, setStore] = useState<MultiProfileStore>(() => loadMultiProfileStore());
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBankSmsModal, setShowBankSmsModal] = useState(false);

  // Active Profile details
  const activeProfile =
    store.profiles.find((p) => p.id === store.activeProfileId) || store.profiles[0];

  // Active Profile's AppData
  const activeData: AppData =
    store.profilesData[store.activeProfileId] || {
      ...INITIAL_DATA,
      profileId: store.activeProfileId,
    };

  // Robust Theme state ('dark' | 'light') with dedicated localStorage persistence
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
    } catch {}
    return activeData.settings.theme || 'dark';
  });

  // Apply theme class to document root, update meta theme-color and save to localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#0A0F1D' : '#F8FAFC');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  // Save store to localStorage on change
  useEffect(() => {
    saveMultiProfileStore(store);
  }, [store]);

  // Global Keyboard Shortcut: Ctrl+K or Cmd+K or / to open Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Vault lock state for active profile
  const [isVaultLocked, setIsVaultLocked] = useState<boolean>(() => {
    return !!(activeData.settings.enableEncryption && activeData.settings.passwordHash);
  });

  // Whenever active profile changes, reset vault lock if that profile has password
  const handleSelectProfile = (profileId: string) => {
    const targetData = store.profilesData[profileId];
    setStore((prev) => ({
      ...prev,
      activeProfileId: profileId,
    }));
    setShowProfileModal(false);
    if (targetData?.settings?.enableEncryption && targetData?.settings?.passwordHash) {
      setIsVaultLocked(true);
    } else {
      setIsVaultLocked(false);
    }
  };

  // Helper to update active profile's data
  const updateActiveData = (updater: (prev: AppData) => AppData) => {
    setStore((prev) => {
      const current = prev.profilesData[prev.activeProfileId] || {
        ...INITIAL_DATA,
        profileId: prev.activeProfileId,
      };
      const updated = updater(current);
      return {
        ...prev,
        profilesData: {
          ...prev.profilesData,
          [prev.activeProfileId]: updated,
        },
      };
    });
  };

  // Theme toggle with immediate feedback
  const handleToggleTheme = () => {
    const nextTheme: AppTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {}
    updateActiveData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        theme: nextTheme,
      },
    }));
  };

  // Profile Management Handlers
  const handleCreateProfile = (name: string, type: 'personal' | 'work' | 'shared', color: string) => {
    const newId = `profile-${Date.now()}`;
    const newProfile: UserProfile = {
      id: newId,
      name,
      type,
      color,
      createdAt: new Date().toISOString(),
    };

    const newProfileData: AppData = {
      version: 2,
      profileId: newId,
      tasks: [],
      habits: [],
      incomes: [],
      expenses: [],
      cards: [],
      settings: {
        currency: '₺',
        theme,
        enableEncryption: false,
        activeTab: 'dashboard',
      },
    };

    setStore((prev) => ({
      ...prev,
      activeProfileId: newId,
      profiles: [...prev.profiles, newProfile],
      profilesData: {
        ...prev.profilesData,
        [newId]: newProfileData,
      },
    }));
    setShowProfileModal(false);
  };

  const handleRenameProfile = (id: string, newName: string) => {
    setStore((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.id === id ? { ...p, name: newName } : p)),
    }));
  };

  const handleDeleteProfile = (id: string) => {
    if (store.profiles.length <= 1) {
      alert('En az 1 profil kalmalıdır.');
      return;
    }

    setStore((prev) => {
      const remainingProfiles = prev.profiles.filter((p) => p.id !== id);
      const nextActiveId =
        prev.activeProfileId === id ? remainingProfiles[0].id : prev.activeProfileId;
      const { [id]: _, ...remainingData } = prev.profilesData;

      return {
        ...prev,
        activeProfileId: nextActiveId,
        profiles: remainingProfiles,
        profilesData: remainingData,
      };
    });
  };

  // Quick modals triggered from dashboard
  const [quickIncomeOpen, setQuickIncomeOpen] = useState(false);
  const [quickExpenseOpen, setQuickExpenseOpen] = useState(false);

  // Quick form states
  const [quickAmount, setQuickAmount] = useState('');
  const [quickIncomeSource, setQuickIncomeSource] = useState('Maaş');
  const [quickExpenseCat, setQuickExpenseCat] = useState('Market & Gıda');
  const [quickDate, setQuickDate] = useState(getTodayString());
  const [quickNote, setQuickNote] = useState('');
  const [quickIsMandatory, setQuickIsMandatory] = useState(false);

  // Task Actions
  const handleAddTask = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const task: Task = {
      ...newTask,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    updateActiveData((prev) => ({ ...prev, tasks: [task, ...prev.tasks] }));
  };

  const handleToggleTask = (taskId: string) => {
    updateActiveData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    updateActiveData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  };

  // Calendar quick task add
  const handleQuickAddTask = (title: string, priority: Priority, date: string) => {
    handleAddTask({
      title,
      priority,
      completed: false,
      dueDate: date,
    });
  };

  // Habit Actions
  const handleAddHabit = (title: string) => {
    const habit: Habit = {
      id: `habit-${Date.now()}`,
      title,
      streak: 1,
      completedDates: [getTodayString()],
      createdAt: new Date().toISOString(),
    };
    updateActiveData((prev) => ({ ...prev, habits: [...prev.habits, habit] }));
  };

  const handleToggleHabitToday = (habitId: string) => {
    const today = getTodayString();
    updateActiveData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => {
        if (h.id !== habitId) return h;
        const isDone = h.completedDates.includes(today);
        let newDates: string[];
        let newStreak = h.streak;

        if (isDone) {
          newDates = h.completedDates.filter((d) => d !== today);
          newStreak = Math.max(0, h.streak - 1);
        } else {
          newDates = [...h.completedDates, today];
          newStreak = h.streak + 1;
        }

        return {
          ...h,
          completedDates: newDates,
          streak: newStreak,
        };
      }),
    }));
  };

  const handleDeleteHabit = (habitId: string) => {
    updateActiveData((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== habitId),
    }));
  };

  // Income Actions
  const handleAddIncome = (income: Omit<Income, 'id'>) => {
    const item: Income = {
      ...income,
      id: `inc-${Date.now()}`,
    };
    updateActiveData((prev) => ({ ...prev, incomes: [item, ...prev.incomes] }));
  };

  const handleDeleteIncome = (id: string) => {
    updateActiveData((prev) => ({
      ...prev,
      incomes: prev.incomes.filter((i) => i.id !== id),
    }));
  };

  // Expense Actions
  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    const item: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
    };
    updateActiveData((prev) => ({ ...prev, expenses: [item, ...prev.expenses] }));
  };

  const handleDeleteExpense = (id: string) => {
    updateActiveData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  };

  // Card & Debt Actions
  const handleAddCard = (card: Omit<CreditCardDebt, 'id'>) => {
    const item: CreditCardDebt = {
      ...card,
      id: `card-${Date.now()}`,
    };
    updateActiveData((prev) => ({ ...prev, cards: [...prev.cards, item] }));
  };

  const handleUpdateCardDebt = (cardId: string, newTotalDebt: number) => {
    updateActiveData((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => (c.id === cardId ? { ...c, totalDebt: newTotalDebt } : c)),
    }));
  };

  const handleDeleteCard = (id: string) => {
    updateActiveData((prev) => ({
      ...prev,
      cards: prev.cards.filter((c) => c.id !== id),
    }));
  };

  // Category Budget Actions
  const handleSaveBudgets = (newBudgets: CategoryBudget[]) => {
    updateActiveData((prev) => ({
      ...prev,
      categoryBudgets: newBudgets,
    }));
    showToast('✓ Kategori harcama limitleri güncellendi.');
  };

  // Emergency Fund Actions
  const handleUpdateEmergencyFund = (fund: EmergencyFund) => {
    updateActiveData((prev) => ({
      ...prev,
      emergencyFund: fund,
    }));
    showToast('✓ Acil durum fonu ve hedefi güncellendi.');
  };

  // Installment Loans Actions
  const handleAddInstallment = (inst: Omit<InstallmentLoan, 'id'>) => {
    const item: InstallmentLoan = {
      ...inst,
      id: `inst-${Date.now()}`,
    };
    updateActiveData((prev) => ({
      ...prev,
      installments: [item, ...(prev.installments || [])],
    }));
    showToast(`✓ "${inst.title}" taksit planı kaydedildi.`);
  };

  const handlePayInstallment = (id: string) => {
    updateActiveData((prev) => ({
      ...prev,
      installments: (prev.installments || []).map((inst) => {
        if (inst.id === id) {
          const nextRemaining = Math.max(0, inst.remainingInstallments - 1);
          return { ...inst, remainingInstallments: nextRemaining };
        }
        return inst;
      }),
    }));
    showToast('✓ 1 taksit ödendi olarak işaretlendi.');
  };

  const handleDeleteInstallment = (id: string) => {
    updateActiveData((prev) => ({
      ...prev,
      installments: (prev.installments || []).filter((i) => i.id !== id),
    }));
    showToast('✓ Taksit kaydı silindi.');
  };

  // Daily Routine Handlers
  const handleLogRoutineExpense = (routine: DailyRoutineExpense) => {
    handleAddExpense({
      amount: routine.amount,
      category: routine.category,
      date: getTodayString(),
      isMandatory:
        routine.category === 'Ulaşım & Yakıt' ||
        routine.category === 'Kira & Konut' ||
        routine.category === 'Fatura & Abonelik',
      note: `${routine.title} (Günlük Rutin)`,
    });
    showToast(`✓ ${routine.title} (${routine.amount.toLocaleString('tr-TR')} ₺) bugünün harcamalarına eklendi.`);
  };

  const handleRewardAvoidedHabit = (routine: DailyRoutineExpense) => {
    updateActiveData((prev) => {
      const goals = prev.savingsGoals || [];
      const habitGoal = goals.find(
        (g) =>
          g.title.toLowerCase().includes('kötü') ||
          g.title.toLowerCase().includes('alışkanlık') ||
          g.title.toLowerCase().includes('sigara')
      );
      let newGoals: SavingsGoal[];
      if (habitGoal) {
        newGoals = goals.map((g) =>
          g.id === habitGoal.id ? { ...g, currentAmount: g.currentAmount + routine.amount } : g
        );
      } else {
        newGoals = [
          ...goals,
          {
            id: `goal-habit-${Date.now()}`,
            title: 'Kötü Alışkanlığı Bırakma Kumbarası',
            targetAmount: 10000,
            currentAmount: routine.amount,
            category: 'Kişisel Başarı',
            color: '#8b5cf6',
          },
        ];
      }
      return { ...prev, savingsGoals: newGoals };
    });
    showToast(`🎉 İrade zaferi! ${routine.title} harcaması yerine ${routine.amount.toLocaleString('tr-TR')} ₺ kumbaraya aktarıldı!`);
  };

  const handleSaveRoutines = (newRoutines: DailyRoutineExpense[]) => {
    updateActiveData((prev) => ({ ...prev, dailyRoutines: newRoutines }));
    showToast('✓ Günlük rutinler kaydedildi.');
  };

  const handleSaveGoals = (newGoals: SavingsGoal[]) => {
    updateActiveData((prev) => ({ ...prev, savingsGoals: newGoals }));
    showToast('✓ Birikim hedefleri güncellendi.');
  };

  const handleSaveSubscriptions = (newSubs: SubscriptionItem[]) => {
    updateActiveData((prev) => ({ ...prev, subscriptions: newSubs }));
    showToast('✓ Abonelikler güncellendi.');
  };

  const handleSaveFixedExpenses = (newFixed: FixedExpenseItem[]) => {
    updateActiveData((prev) => ({ ...prev, fixedExpenses: newFixed }));
    showToast('✓ Sabit giderler ve yaklaşan vadeler güncellendi.');
  };

  // Backup & Import Actions
  const handleImportData = (newData: AppData) => {
    updateActiveData(() => newData);
  };

  const handleResetData = () => {
    updateActiveData(() => ({
      ...INITIAL_DATA,
      profileId: store.activeProfileId,
    }));
    setIsVaultLocked(false);
    showToast('✓ Örnek başlangıç şablonu yüklendi.');
  };

  const handleCleanSlateData = () => {
    updateActiveData(() => createCleanProfileData(store.activeProfileId));
    setIsVaultLocked(false);
    showToast('✓ Demo veriler temizlendi. Tertemiz kendi bütçe sayfanız açıldı!');
  };

  const handleImportCSVTransactions = ({
    expenses,
    incomes,
  }: {
    expenses: Omit<Expense, 'id'>[];
    incomes: Omit<Income, 'id'>[];
  }) => {
    updateActiveData((prev) => ({
      ...prev,
      expenses: [
        ...prev.expenses,
        ...expenses.map((exp, idx) => ({ ...exp, id: `csv-exp-${Date.now()}-${idx}` })),
      ],
      incomes: [
        ...prev.incomes,
        ...incomes.map((inc, idx) => ({ ...inc, id: `csv-inc-${Date.now()}-${idx}` })),
      ],
    }));
    showToast(`✓ ${expenses.length} harcama ve ${incomes.length} gelir başarıyla içe aktarıldı!`);
  };

  const handleUpdateSettings = (newSettings: AppData['settings']) => {
    updateActiveData((prev) => ({ ...prev, settings: newSettings }));
  };

  // Quick Income Submit
  const handleQuickIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(quickAmount);
    if (isNaN(num) || num <= 0) return;
    handleAddIncome({
      amount: num,
      source: quickIncomeSource,
      date: quickDate,
      note: quickNote.trim() || undefined,
    });
    setQuickAmount('');
    setQuickNote('');
    setQuickIncomeOpen(false);
  };

  // Quick Expense Submit
  const handleQuickExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(quickAmount);
    if (isNaN(num) || num <= 0) return;
    handleAddExpense({
      amount: num,
      category: quickExpenseCat,
      date: quickDate,
      isMandatory: quickIsMandatory,
      note: quickNote.trim() || undefined,
    });
    setQuickAmount('');
    setQuickNote('');
    setQuickIsMandatory(false);
    setQuickExpenseOpen(false);
  };

  // Toast notification for user actions & voice feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const handleVoiceExpense = (amount: number, category: string, date: string, note?: string) => {
    handleAddExpense({
      amount,
      category: category as any,
      date: date || getTodayString(),
      isMandatory: category === 'Fatura & Abonelik' || category === 'Kira & Konut' || category === 'Zorunlu Ödeme',
      note: note || 'Sesli komutla eklendi',
    });
    showToast(`✓ ${amount.toLocaleString('tr-TR')} TL ${category} harcaması kaydedildi!`);
  };

  const handleVoiceIncome = (amount: number, source: string, date: string, note?: string) => {
    handleAddIncome({
      amount,
      source: source as any,
      date: date || getTodayString(),
      note: note || 'Sesli komutla eklendi',
    });
    showToast(`✓ ${amount.toLocaleString('tr-TR')} TL ${source} geliri kaydedildi!`);
  };

  const handleOpenExpenseFormWithData = (amount: number, category: string, date: string, note?: string) => {
    setQuickAmount(String(amount));
    setQuickExpenseCat(category as any);
    setQuickDate(date || getTodayString());
    setQuickNote(note || 'Sesli komutla eklendi');
    setQuickIsMandatory(category === 'Fatura & Abonelik' || category === 'Kira & Konut' || category === 'Zorunlu Ödeme');
    setQuickExpenseOpen(true);
    showToast(`🎙️ "${category}" harcama formu ${amount.toLocaleString('tr-TR')} TL ile dolduruldu.`);
  };

  const handleOpenIncomeFormWithData = (amount: number, source: string, date: string, note?: string) => {
    setQuickAmount(String(amount));
    setQuickIncomeSource(source as any);
    setQuickDate(date || getTodayString());
    setQuickNote(note || 'Sesli komutla eklendi');
    setQuickIncomeOpen(true);
    showToast(`🎙️ "${source}" gelir formu ${amount.toLocaleString('tr-TR')} TL ile dolduruldu.`);
  };

  const pendingTasks = activeData.tasks.filter((t) => !t.completed).length;

  return (
    <div
      className={`min-h-screen ${
        theme === 'dark' ? 'dark bg-[#0A0F1D] text-slate-100' : 'bg-[#F8FAFC] text-[#0F172A]'
      } flex flex-col font-sans selection:bg-emerald-500/20 transition-colors duration-150`}
    >
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        encryptionEnabled={!!activeData.settings.enableEncryption}
        onLockVault={() => setIsVaultLocked(true)}
        pendingTasksCount={pendingTasks}
        currentProfile={activeProfile}
        onOpenProfileModal={() => setShowProfileModal(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 pt-5">
        {activeTab === 'dashboard' && (
          <DashboardView
            data={activeData}
            onNavigate={setActiveTab}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenQuickIncome={() => {
              setQuickAmount('');
              setQuickNote('');
              setQuickDate(getTodayString());
              setQuickIncomeOpen(true);
            }}
            onOpenQuickExpense={() => {
              setQuickAmount('');
              setQuickNote('');
              setQuickDate(getTodayString());
              setQuickIsMandatory(false);
              setQuickExpenseOpen(true);
            }}
            onToggleTask={handleToggleTask}
            onToggleHabitToday={handleToggleHabitToday}
            onOpenReportModal={() => setShowReportModal(true)}
            onOpenBankSmsModal={() => setShowBankSmsModal(true)}
            onSaveBudgets={handleSaveBudgets}
            onUpdateEmergencyFund={handleUpdateEmergencyFund}
            onAddInstallment={handleAddInstallment}
            onPayInstallment={handlePayInstallment}
            onDeleteInstallment={handleDeleteInstallment}
            onLogRoutineExpense={handleLogRoutineExpense}
            onRewardAvoidedHabit={handleRewardAvoidedHabit}
            onSaveRoutines={handleSaveRoutines}
            onSaveGoals={handleSaveGoals}
            onSaveSubscriptions={handleSaveSubscriptions}
            onSaveFixedExpenses={handleSaveFixedExpenses}
          />
        )}

        {activeTab === 'finance' && (
          <FinanceView
            data={activeData}
            onAddIncome={handleAddIncome}
            onDeleteIncome={handleDeleteIncome}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            onAddCard={handleAddCard}
            onUpdateCardDebt={handleUpdateCardDebt}
            onDeleteCard={handleDeleteCard}
            onSaveBudgets={handleSaveBudgets}
            onUpdateEmergencyFund={handleUpdateEmergencyFund}
            onAddInstallment={handleAddInstallment}
            onPayInstallment={handlePayInstallment}
            onDeleteInstallment={handleDeleteInstallment}
            onOpenReportModal={() => setShowReportModal(true)}
            onOpenBankSmsModal={() => setShowBankSmsModal(true)}
            onLogRoutineExpense={handleLogRoutineExpense}
            onRewardAvoidedHabit={handleRewardAvoidedHabit}
            onSaveRoutines={handleSaveRoutines}
            onSaveGoals={handleSaveGoals}
            onSaveSubscriptions={handleSaveSubscriptions}
            onSaveFixedExpenses={handleSaveFixedExpenses}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            data={activeData}
            onAddTask={(task) => {
              handleAddTask(task);
              showToast(`✓ "${task.title}" görevi eklendi.`);
            }}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onAddHabit={handleAddHabit}
            onToggleHabitToday={handleToggleHabitToday}
            onDeleteHabit={handleDeleteHabit}
            onVoiceExpense={handleVoiceExpense}
            onVoiceIncome={handleVoiceIncome}
            onOpenExpenseFormWithData={handleOpenExpenseFormWithData}
            onOpenIncomeFormWithData={handleOpenIncomeFormWithData}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            data={activeData}
            onToggleTask={handleToggleTask}
            onQuickAddTask={handleQuickAddTask}
          />
        )}

        {activeTab === 'backup' && (
          <BackupSyncView
            data={activeData}
            onImportData={handleImportData}
            onResetData={handleResetData}
            onCleanSlateData={handleCleanSlateData}
            onUpdateSettings={handleUpdateSettings}
            onImportCSVTransactions={handleImportCSVTransactions}
          />
        )}
      </main>

      {/* Profile Management Modal */}
      {showProfileModal && (
        <ProfileModal
          profiles={store.profiles}
          activeProfileId={store.activeProfileId}
          onSelectProfile={handleSelectProfile}
          onCreateProfile={handleCreateProfile}
          onRenameProfile={handleRenameProfile}
          onDeleteProfile={handleDeleteProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* E2EE Vault Lock Modal */}
      {isVaultLocked && activeData.settings.passwordHash && activeData.settings.salt && (
        <VaultLockModal
          storedHash={activeData.settings.passwordHash}
          storedSalt={activeData.settings.salt}
          onUnlock={() => setIsVaultLocked(false)}
        />
      )}

      {/* Offline Toast */}
      <OfflineIndicator />

      {/* Quick Income Modal */}
      {quickIncomeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white mb-3">Hızlı Gelir Ekle</h3>
            <form onSubmit={handleQuickIncomeSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-[#64748B] dark:text-slate-400 mb-1">Tutar (TL) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={quickAmount}
                  onChange={(e) => setQuickAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white text-sm focus:border-emerald-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#64748B] dark:text-slate-400 mb-1">Kaynak</label>
                <select
                  value={quickIncomeSource}
                  onChange={(e) => setQuickIncomeSource(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Maaş">Maaş</option>
                  <option value="Ek Gelir">Ek Gelir</option>
                  <option value="Serbest Meslek">Serbest Meslek</option>
                  <option value="Yatırım / Getiri">Yatırım / Getiri</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#64748B] dark:text-slate-400 mb-1">Not</label>
                <input
                  type="text"
                  placeholder="Açıklama (isteğe bağlı)"
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickIncomeOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-300 text-xs font-medium rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-xl shadow-xs"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Expense Modal */}
      {quickExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white mb-3">Hızlı Gider Ekle</h3>
            <form onSubmit={handleQuickExpenseSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-[#64748B] dark:text-slate-400 mb-1">Tutar (TL) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={quickAmount}
                  onChange={(e) => setQuickAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white text-sm focus:border-rose-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#64748B] dark:text-slate-400 mb-1">Kategori</label>
                <select
                  value={quickExpenseCat}
                  onChange={(e) => setQuickExpenseCat(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white text-sm focus:border-rose-500 focus:outline-none"
                >
                  <option value="Market & Gıda">Market & Gıda</option>
                  <option value="Fatura & Abonelik">Fatura & Abonelik</option>
                  <option value="Kira & Konut">Kira & Konut</option>
                  <option value="Ulaşım & Yakıt">Ulaşım & Yakıt</option>
                  <option value="Sağlık & Bakım">Sağlık & Bakım</option>
                  <option value="Eğlence & Sosyal">Eğlence & Sosyal</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="quickMandatory"
                  checked={quickIsMandatory}
                  onChange={(e) => setQuickIsMandatory(e.target.checked)}
                  className="rounded text-amber-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
                <label htmlFor="quickMandatory" className="text-xs text-[#0F172A] dark:text-slate-300 cursor-pointer">
                  Zorunlu / Vadesi Dolacak Ödeme
                </label>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickExpenseOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-300 text-xs font-medium rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-xl shadow-xs"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Search & Filter Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        data={activeData}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setIsSearchOpen(false);
        }}
        onToggleTask={handleToggleTask}
        onDeleteTask={(taskId) => {
          handleDeleteTask(taskId);
          showToast('✓ Görev silindi.');
        }}
        onDeleteExpense={(id) => {
          handleDeleteExpense(id);
          showToast('✓ Gider kaydı silindi.');
        }}
        onDeleteIncome={(id) => {
          handleDeleteIncome(id);
          showToast('✓ Gelir kaydı silindi.');
        }}
      />

      {/* Monthly Financial Statement & Executive Report Modal */}
      <MonthlyReportModal
        data={activeData}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />

      {/* Smart Bank SMS & Notification Parser Modal */}
      <BankSmsParserModal
        isOpen={showBankSmsModal}
        onClose={() => setShowBankSmsModal(false)}
        onAddExpense={(exp) => {
          handleAddExpense(exp);
          showToast(
            `✓ ${exp.note || 'Banka harcaması'} (${exp.amount.toLocaleString('tr-TR')} ₺) başarıyla kaydedildi!`
          );
        }}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-xs font-semibold rounded-2xl shadow-xl border border-slate-700/60 dark:border-slate-200 transition-all animate-in slide-in-from-bottom-3 duration-200">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 p-1 rounded-lg hover:bg-white/10 dark:hover:bg-black/10 transition text-slate-400 hover:text-white dark:hover:text-black"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
