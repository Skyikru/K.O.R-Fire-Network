import {
  AppData,
  MultiProfileStore,
  UserProfile,
  Task,
  Habit,
  Income,
  Expense,
  ExpenseCategory,
  CreditCardDebt,
  CalendarDayEvent,
  AppTheme,
  CategoryBudget,
  InstallmentLoan,
  EmergencyFund,
  DailyRoutineExpense,
  SavingsGoal,
  SubscriptionItem,
  FixedExpenseItem,
} from '../types';

const STORE_KEY = 'yasambilgi_multi_store_v2';
const LEGACY_KEY = 'yasambilgi_data_v1';

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'profile-personal',
    name: 'Kişisel',
    type: 'personal',
    color: '#10b981', // emerald
    createdAt: new Date().toISOString(),
  },
  {
    id: 'profile-work',
    name: 'İş & Serbest',
    type: 'work',
    color: '#06b6d4', // cyan
    createdAt: new Date().toISOString(),
  },
  {
    id: 'profile-shared',
    name: 'Ortak / Aile',
    type: 'shared',
    color: '#8b5cf6', // purple
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_CATEGORY_BUDGETS: CategoryBudget[] = [
  { category: 'Market & Gıda', monthlyLimit: 7500 },
  { category: 'Fatura & Abonelik', monthlyLimit: 2500 },
  { category: 'Kira & Konut', monthlyLimit: 15000 },
  { category: 'Ulaşım & Yakıt', monthlyLimit: 2000 },
  { category: 'Eğlence & Sosyal', monthlyLimit: 1500 },
  { category: 'Sağlık & Bakım', monthlyLimit: 1200 },
  { category: 'Giyim & Alışveriş', monthlyLimit: 2500 },
];

export const DEFAULT_INSTALLMENTS: InstallmentLoan[] = [
  {
    id: 'inst-1',
    title: 'Akıllı Telefon Taksiti',
    totalAmount: 24000,
    monthlyAmount: 2000,
    remainingInstallments: 5,
    totalInstallments: 12,
    dueDateDay: 18,
    category: 'Giyim & Alışveriş',
    bankOrVendor: 'Bonus Alışveriş Kredisi',
    startDate: new Date(Date.now() - 86400000 * 210).toISOString().split('T')[0],
    note: 'Peşin fiyatına 12 taksit',
  },
  {
    id: 'inst-2',
    title: 'Klima & Ev Eşyası',
    totalAmount: 18000,
    monthlyAmount: 3000,
    remainingInstallments: 2,
    totalInstallments: 6,
    dueDateDay: 22,
    category: 'Kira & Konut',
    bankOrVendor: 'Mağaza Taksiti',
    startDate: new Date(Date.now() - 86400000 * 120).toISOString().split('T')[0],
    note: 'Son 2 taksit kaldı',
  },
];

export const DEFAULT_EMERGENCY_FUND: EmergencyFund = {
  currentAmount: 52000,
  targetMonths: 3,
};

export const DEFAULT_DAILY_ROUTINES: DailyRoutineExpense[] = [
  {
    id: 'rtn-1',
    title: 'Otobüs / Toplu Taşıma',
    amount: 25,
    category: 'Ulaşım & Yakıt',
    icon: 'bus',
    note: 'Günlük yol ücreti',
  },
  {
    id: 'rtn-2',
    title: 'Sigara',
    amount: 75,
    category: 'Diğer',
    icon: 'smoke',
    isAvoidableHabit: true,
    note: 'Bırakıldığında kumbaraya aktarılabilir',
  },
  {
    id: 'rtn-3',
    title: 'Öğle Yemeği / Menü',
    amount: 180,
    category: 'Market & Gıda',
    icon: 'food',
    note: 'İş / okul öğle yemeği',
  },
  {
    id: 'rtn-4',
    title: 'Kahve / Çay',
    amount: 50,
    category: 'Eğlence & Sosyal',
    icon: 'coffee',
    isAvoidableHabit: true,
    note: 'Dışarıdan kahve',
  },
  {
    id: 'rtn-5',
    title: 'Ekmek & Temel İhtiyaç',
    amount: 30,
    category: 'Market & Gıda',
    icon: 'shopping',
    note: 'Günlük fırın & market',
  },
];

export const DEFAULT_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'goal-1',
    title: 'Yeni Akıllı Telefon',
    targetAmount: 35000,
    currentAmount: 14500,
    targetDate: new Date(Date.now() + 86400000 * 90).toISOString().split('T')[0],
    category: 'Elektronik',
    color: '#3b82f6',
    note: 'Eski cihazı yenileme',
  },
  {
    id: 'goal-2',
    title: 'Yaz Tatili Fonu',
    targetAmount: 25000,
    currentAmount: 8500,
    targetDate: new Date(Date.now() + 86400000 * 180).toISOString().split('T')[0],
    category: 'Tatil & Gezi',
    color: '#10b981',
    note: '1 haftalık dinlenme',
  },
  {
    id: 'goal-3',
    title: 'Kötü Alışkanlığı Bırakma Kumbarası',
    targetAmount: 15000,
    currentAmount: 3750,
    category: 'Kişisel Başarı',
    color: '#8b5cf6',
    note: 'Sigara içilmeyen günlerin birikimi',
  },
];

export const DEFAULT_SUBSCRIPTIONS: SubscriptionItem[] = [
  {
    id: 'sub-1',
    title: 'Spotify Premium',
    amount: 65,
    billingCycle: 'monthly',
    renewalDay: 5,
    category: 'Fatura & Abonelik',
    status: 'active',
    note: 'Bireysel müzik aboneliği',
  },
  {
    id: 'sub-2',
    title: 'Netflix Standart',
    amount: 190,
    billingCycle: 'monthly',
    renewalDay: 14,
    category: 'Fatura & Abonelik',
    status: 'active',
    note: 'Dizi & Film platformu',
  },
  {
    id: 'sub-3',
    title: 'Fiber Ev İnterneti',
    amount: 380,
    billingCycle: 'monthly',
    renewalDay: 20,
    category: 'Fatura & Abonelik',
    status: 'active',
    note: '100 Mbps sınırsız',
  },
  {
    id: 'sub-4',
    title: 'YouTube Premium',
    amount: 80,
    billingCycle: 'monthly',
    renewalDay: 26,
    category: 'Fatura & Abonelik',
    status: 'active',
    note: 'Reklamsız video',
  },
];

export const DEFAULT_FIXED_EXPENSES: FixedExpenseItem[] = [
  {
    id: 'fix-1',
    title: 'Ev Kirası',
    amount: 14000,
    dueDay: 5,
    category: 'Kira & Konut',
    type: 'rent',
    isPaidThisMonth: true,
    autoPay: true,
    note: 'Ev sahibine kira ödemesi',
  },
  {
    id: 'fix-2',
    title: 'Apartman & Site Aidatı',
    amount: 750,
    dueDay: 10,
    category: 'Kira & Konut',
    type: 'dues',
    isPaidThisMonth: false,
    note: 'Bina yönetimi ortak gider aidatı',
  },
  {
    id: 'fix-3',
    title: 'Elektrik + Doğalgaz Faturası',
    amount: 1850,
    dueDay: 12,
    category: 'Fatura & Abonelik',
    type: 'bill',
    isPaidThisMonth: true,
    autoPay: true,
    note: 'Aylık elektrik ve ısınma',
  },
  {
    id: 'fix-4',
    title: 'Fiber Ev İnterneti (100 Mbps)',
    amount: 380,
    dueDay: 15,
    category: 'Fatura & Abonelik',
    type: 'bill',
    isPaidThisMonth: false,
    autoPay: true,
    note: 'Sınırsız ev interneti',
  },
  {
    id: 'fix-5',
    title: 'Netflix & Spotify Aboneliği',
    amount: 255,
    dueDay: 20,
    category: 'Fatura & Abonelik',
    type: 'subscription',
    isPaidThisMonth: false,
    autoPay: true,
    note: 'Düzenli dijital eğlence',
  },
  {
    id: 'fix-6',
    title: 'Akıllı Telefon Kredi Taksiti',
    amount: 2000,
    dueDay: 22,
    category: 'Zorunlu Ödeme',
    type: 'loan',
    isPaidThisMonth: false,
    note: 'Banka kredi taksiti',
  },
];

// Generate realistic historical incomes and expenses for the previous 5 months
function getHistoricalSampleData() {
  const incomes: Income[] = [];
  const expenses: Expense[] = [];
  const now = new Date();

  for (let i = 1; i <= 5; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    // Previous month salary & side income
    incomes.push({
      id: `hist-inc-m${i}-1`,
      amount: 42000 + (5 - i) * 1000,
      source: 'Maaş',
      date: `${mStr}-05`,
      note: 'Aylık net maaş',
    });
    if (i % 2 === 0) {
      incomes.push({
        id: `hist-inc-m${i}-2`,
        amount: 5500 + i * 500,
        source: 'Ek Gelir',
        date: `${mStr}-12`,
        note: 'Ek danışmanlık projesi',
      });
    }

    // Previous month expenses
    expenses.push({
      id: `hist-exp-m${i}-1`,
      amount: 13500,
      category: 'Kira & Konut',
      date: `${mStr}-05`,
      isMandatory: true,
      note: 'Kira',
    });
    expenses.push({
      id: `hist-exp-m${i}-2`,
      amount: 1700 + (i % 3) * 200,
      category: 'Fatura & Abonelik',
      date: `${mStr}-11`,
      isMandatory: true,
      note: 'Faturalar',
    });
    expenses.push({
      id: `hist-exp-m${i}-3`,
      amount: 4200 + (i * 350),
      category: 'Market & Gıda',
      date: `${mStr}-14`,
      isMandatory: false,
      note: 'Aylık mutfak gideri',
    });
    expenses.push({
      id: `hist-exp-m${i}-4`,
      amount: 1400 + (i * 150),
      category: 'Ulaşım & Yakıt',
      date: `${mStr}-18`,
      isMandatory: false,
      note: 'Ulaşım & akaryakıt',
    });
    expenses.push({
      id: `hist-exp-m${i}-5`,
      amount: 900 + (i * 100),
      category: 'Eğlence & Sosyal',
      date: `${mStr}-22`,
      isMandatory: false,
      note: 'Dışarıda yemek ve sosyal harcamalar',
    });
  }

  return { incomes, expenses };
}

const historicalData = getHistoricalSampleData();

export const INITIAL_DATA: AppData = {
  version: 2,
  profileId: 'profile-personal',
  settings: {
    currency: '₺',
    theme: 'dark',
    enableEncryption: false,
    activeTab: 'dashboard',
  },
  tasks: [
    {
      id: 'task-1',
      title: 'Aylık bütçe ve kart ekstrelerini gözden geçir',
      priority: 'high',
      completed: true,
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      title: 'Elektrik & İnternet faturası son ödeme kontrolü',
      priority: 'high',
      completed: false,
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-3',
      title: 'Haftalık mutfak ve pazar alışverişi listesi',
      priority: 'medium',
      completed: false,
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-4',
      title: 'Kişisel gelişim: 30 dk kitap oku',
      priority: 'low',
      completed: false,
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    },
  ],
  habits: [
    {
      id: 'habit-1',
      title: 'Gereksiz harcama yapmama (No-Spend Day)',
      streak: 4,
      completedDates: [
        new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
        new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
        new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
        new Date().toISOString().split('T')[0],
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'habit-2',
      title: '2 Litre Su İçme',
      streak: 7,
      completedDates: [
        new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
        new Date().toISOString().split('T')[0],
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'habit-3',
      title: 'Günün tüm harcamalarını kaydet',
      streak: 12,
      completedDates: [new Date().toISOString().split('T')[0]],
      createdAt: new Date().toISOString(),
    },
  ],
  incomes: [
    {
      id: 'inc-1',
      amount: 45000,
      source: 'Maaş',
      date: new Date().toISOString().slice(0, 7) + '-05',
      note: 'Aylık net ana maaş',
    },
    {
      id: 'inc-2',
      amount: 6500,
      source: 'Ek Gelir',
      date: new Date().toISOString().slice(0, 7) + '-10',
      note: 'Freelance tasarım projesi',
    },
    ...historicalData.incomes,
  ],
  expenses: [
    {
      id: 'exp-1',
      amount: 14000,
      category: 'Kira & Konut',
      date: new Date().toISOString().slice(0, 7) + '-05',
      isMandatory: true,
      note: 'Ev kirası',
    },
    {
      id: 'exp-2',
      amount: 1850,
      category: 'Fatura & Abonelik',
      date: new Date().toISOString().slice(0, 7) + '-12',
      isMandatory: true,
      note: 'Elektrik + Doğalgaz + Fiber İnternet',
    },
    {
      id: 'exp-3',
      amount: 3200,
      category: 'Market & Gıda',
      date: new Date().toISOString().slice(0, 7) + '-08',
      isMandatory: false,
      note: 'Haftalık süpermarket alışverişi',
    },
    {
      id: 'exp-4',
      amount: 1200,
      category: 'Ulaşım & Yakıt',
      date: new Date().toISOString().slice(0, 7) + '-14',
      isMandatory: false,
      note: 'Akbil & benzin',
    },
    {
      id: 'exp-5',
      amount: 1200,
      category: 'Eğlence & Sosyal',
      date: new Date().toISOString().slice(0, 7) + '-16',
      isMandatory: false,
      note: 'Dışarıda yemek ve restoran harcaması',
    },
    {
      id: 'exp-6',
      amount: 650,
      category: 'Sağlık & Bakım',
      date: new Date().toISOString().slice(0, 7) + '-18',
      isMandatory: false,
      note: 'Eczane ve vitamin takviyesi',
    },
    ...historicalData.expenses,
  ],
  cards: [
    {
      id: 'card-1',
      name: 'Maaş Bankası Bonus Kart',
      totalDebt: 18500,
      statementDate: 15,
      dueDate: new Date().toISOString().slice(0, 7) + '-25',
      minPaymentRate: 20,
      note: '25.000 TL altı limit (%20 asgari)',
      isPaidThisMonth: false,
    },
    {
      id: 'card-2',
      name: 'Platinum Kredi Kartı',
      totalDebt: 32000,
      statementDate: 10,
      dueDate: new Date().toISOString().slice(0, 7) + '-20',
      minPaymentRate: 40,
      note: '25.000 TL üzeri limit yasal %40 asgari',
      isPaidThisMonth: false,
    },
  ],
  categoryBudgets: DEFAULT_CATEGORY_BUDGETS,
  installments: DEFAULT_INSTALLMENTS,
  emergencyFund: DEFAULT_EMERGENCY_FUND,
  dailyRoutines: DEFAULT_DAILY_ROUTINES,
  savingsGoals: DEFAULT_SAVINGS_GOALS,
  subscriptions: DEFAULT_SUBSCRIPTIONS,
  fixedExpenses: DEFAULT_FIXED_EXPENSES,
};

export function ensureAppDataDefaults(data: AppData): AppData {
  if (!data) return INITIAL_DATA;
  return {
    ...data,
    categoryBudgets:
      data.categoryBudgets && data.categoryBudgets.length > 0
        ? data.categoryBudgets
        : DEFAULT_CATEGORY_BUDGETS,
    installments:
      data.installments !== undefined ? data.installments : DEFAULT_INSTALLMENTS,
    emergencyFund: data.emergencyFund || DEFAULT_EMERGENCY_FUND,
    dailyRoutines:
      data.dailyRoutines && data.dailyRoutines.length > 0
        ? data.dailyRoutines
        : DEFAULT_DAILY_ROUTINES,
    savingsGoals:
      data.savingsGoals && data.savingsGoals.length > 0
        ? data.savingsGoals
        : DEFAULT_SAVINGS_GOALS,
    subscriptions:
      data.subscriptions && data.subscriptions.length > 0
        ? data.subscriptions
        : DEFAULT_SUBSCRIPTIONS,
    fixedExpenses:
      data.fixedExpenses && data.fixedExpenses.length > 0
        ? data.fixedExpenses
        : DEFAULT_FIXED_EXPENSES,
  };
}

function createBlankProfileData(profileId: string, theme: AppTheme = 'dark'): AppData {
  return {
    version: 2,
    profileId,
    tasks: [],
    habits: [],
    incomes: [],
    expenses: [],
    cards: [],
    categoryBudgets: DEFAULT_CATEGORY_BUDGETS,
    installments: [],
    emergencyFund: { currentAmount: 0, targetMonths: 3 },
    dailyRoutines: DEFAULT_DAILY_ROUTINES,
    savingsGoals: [],
    subscriptions: [],
    fixedExpenses: DEFAULT_FIXED_EXPENSES,
    settings: {
      currency: '₺',
      theme,
      enableEncryption: false,
      activeTab: 'dashboard',
    },
  };
}

export function loadMultiProfileStore(): MultiProfileStore {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed: MultiProfileStore = JSON.parse(raw);
      if (parsed.profiles && parsed.profiles.length > 0 && parsed.profilesData) {
        const enrichedProfilesData: Record<string, AppData> = {};
        for (const [key, pData] of Object.entries(parsed.profilesData)) {
          enrichedProfilesData[key] = ensureAppDataDefaults(pData);
        }
        return {
          ...parsed,
          profilesData: enrichedProfilesData,
        };
      }
    }

    // Check if legacy single profile exists
    const legacyRaw = localStorage.getItem(LEGACY_KEY);
    let initialPersonalData = INITIAL_DATA;
    if (legacyRaw) {
      try {
        const legacyParsed = JSON.parse(legacyRaw);
        initialPersonalData = {
          ...INITIAL_DATA,
          ...legacyParsed,
          profileId: 'profile-personal',
          version: 2,
          settings: {
            ...INITIAL_DATA.settings,
            ...(legacyParsed.settings || {}),
          },
        };
      } catch (e) {
        console.warn('Eski veri dönüştürülürken hata:', e);
      }
    }

    const defaultStore: MultiProfileStore = {
      version: 2,
      activeProfileId: 'profile-personal',
      profiles: DEFAULT_PROFILES,
      profilesData: {
        'profile-personal': initialPersonalData,
        'profile-work': {
          ...createBlankProfileData('profile-work', initialPersonalData.settings.theme),
          incomes: [
            {
              id: 'inc-work-1',
              amount: 28000,
              source: 'Serbest Meslek',
              date: new Date().toISOString().slice(0, 7) + '-15',
              note: 'Müşteri danışmanlık faturası',
            },
          ],
          tasks: [
            {
              id: 'task-w-1',
              title: 'Müşteri teklif dosyasını gönder',
              priority: 'high',
              completed: false,
              dueDate: new Date().toISOString().split('T')[0],
              createdAt: new Date().toISOString(),
            },
          ],
        },
        'profile-shared': {
          ...createBlankProfileData('profile-shared', initialPersonalData.settings.theme),
          expenses: [
            {
              id: 'exp-sh-1',
              amount: 5000,
              category: 'Market & Gıda',
              date: new Date().toISOString().slice(0, 7) + '-10',
              isMandatory: true,
              note: 'Ortak ev alışverişi',
            },
          ],
        },
      },
    };

    saveMultiProfileStore(defaultStore);
    return defaultStore;
  } catch (err) {
    console.error('MultiProfileStore yüklenirken hata:', err);
    return {
      version: 2,
      activeProfileId: 'profile-personal',
      profiles: DEFAULT_PROFILES,
      profilesData: {
        'profile-personal': INITIAL_DATA,
      },
    };
  }
}

export function saveMultiProfileStore(store: MultiProfileStore): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('MultiProfileStore kaydedilirken hata:', err);
  }
}

export function formatCurrency(amount: number, currency: string = '₺'): string {
  return (
    new Intl.NumberFormat('tr-TR', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(amount) +
    ' ' +
    currency
  );
}

export function formatPreciseCurrency(amount: number, currency: string = '₺'): string {
  return (
    new Intl.NumberFormat('tr-TR', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(amount) +
    ' ' +
    currency
  );
}

export function calculateMinCardPayment(card: CreditCardDebt): number {
  const rate = card.minPaymentRate || 20;
  return Math.round((card.totalDebt * rate) / 100);
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getCurrentMonthKey(): string {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

export function formatDateTurkish(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function getCalendarEventsForMonth(data: AppData, year: number, month: number): CalendarDayEvent[] {
  const events: CalendarDayEvent[] = [];
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;

  // 1. Görevler (Tasks)
  data.tasks.forEach((t) => {
    if (t.dueDate && t.dueDate.startsWith(monthStr)) {
      events.push({
        id: `task-${t.id}`,
        title: t.title,
        date: t.dueDate,
        type: 'task',
        completed: t.completed,
        priority: t.priority,
      });
    }
  });

  // 2. Kredi Kartı Son Ödeme Günleri (Card Due Dates)
  data.cards.forEach((c) => {
    if (c.dueDate && c.dueDate.startsWith(monthStr)) {
      events.push({
        id: `due-${c.id}`,
        title: `${c.name} Son Ödeme Günü`,
        date: c.dueDate,
        type: 'due_date',
        amount: calculateMinCardPayment(c),
        details: `Toplam Borç: ${formatCurrency(c.totalDebt)} • Asgari: ${formatCurrency(calculateMinCardPayment(c))}`,
      });
    }

    // 3. Kredi Kartı Hesap Kesim Günleri (Statement Dates)
    if (c.statementDate >= 1 && c.statementDate <= 31) {
      // Days in that month
      const maxDays = new Date(year, month, 0).getDate();
      const stDay = Math.min(c.statementDate, maxDays);
      const stDateStr = `${monthStr}-${String(stDay).padStart(2, '0')}`;
      events.push({
        id: `stmt-${c.id}`,
        title: `${c.name} Hesap Kesimi`,
        date: stDateStr,
        type: 'statement',
        details: `Ekstre kesildiğinde borç kesinleşir.`,
      });
    }
  });

  // 4. Gelirler (Incomes)
  data.incomes.forEach((inc) => {
    if (inc.date && inc.date.startsWith(monthStr)) {
      events.push({
        id: `inc-${inc.id}`,
        title: `Gelir: ${inc.source}`,
        date: inc.date,
        type: 'income',
        amount: inc.amount,
        details: inc.note,
      });
    }
  });

  // 5. Giderler (Zorunlu veya normal)
  data.expenses.forEach((exp) => {
    if (exp.date && exp.date.startsWith(monthStr)) {
      events.push({
        id: `exp-${exp.id}`,
        title: `${exp.category}${exp.isMandatory ? ' (Zorunlu)' : ''}`,
        date: exp.date,
        type: 'expense',
        amount: exp.amount,
        details: exp.note,
      });
    }
  });

  // 6. Taksit Ödeme Günleri (Installments)
  (data.installments || []).forEach((inst) => {
    if (inst.remainingInstallments > 0 && inst.dueDateDay >= 1 && inst.dueDateDay <= 31) {
      const maxDays = new Date(year, month, 0).getDate();
      const instDay = Math.min(inst.dueDateDay, maxDays);
      const instDateStr = `${monthStr}-${String(instDay).padStart(2, '0')}`;
      events.push({
        id: `inst-due-${inst.id}`,
        title: `Taksit: ${inst.title}`,
        date: instDateStr,
        type: 'due_date',
        amount: inst.monthlyAmount,
        details: `Aylık Taksit: ${formatCurrency(inst.monthlyAmount)} • Kalan: ${inst.remainingInstallments}/${inst.totalInstallments} ay`,
      });
    }
  });

  // 7. Abonelik Çekim Günleri (Subscriptions)
  (data.subscriptions || []).forEach((sub) => {
    if (sub.status === 'active' && sub.renewalDay >= 1 && sub.renewalDay <= 31) {
      const maxDays = new Date(year, month, 0).getDate();
      const subDay = Math.min(sub.renewalDay, maxDays);
      const subDateStr = `${monthStr}-${String(subDay).padStart(2, '0')}`;
      events.push({
        id: `sub-${sub.id}`,
        title: `Abonelik: ${sub.title}`,
        date: subDateStr,
        type: 'due_date',
        amount: sub.amount,
        details: `${sub.title} ${sub.billingCycle === 'monthly' ? 'aylık' : 'yıllık'} yenileme`,
      });
    }
  });

  return events;
}

/**
 * Creates clean slate AppData for a user who wants to start fresh without demo data
 */
export function createCleanProfileData(profileId: string = 'profile-personal'): AppData {
  return {
    version: 2,
    profileId,
    settings: {
      currency: '₺',
      theme: 'dark',
      enableEncryption: false,
      activeTab: 'dashboard',
      paydayDay: 1,
    },
    tasks: [],
    habits: [],
    incomes: [],
    expenses: [],
    cards: [],
    categoryBudgets: DEFAULT_CATEGORY_BUDGETS,
    installments: [],
    emergencyFund: {
      currentAmount: 0,
      targetMonths: 3,
    },
    dailyRoutines: [
      {
        id: 'rtn-clean-1',
        title: 'Toplu Taşıma / Ulaşım',
        amount: 25,
        category: 'Ulaşım & Yakıt',
        icon: 'bus',
      },
      {
        id: 'rtn-clean-2',
        title: 'Öğle Yemeği',
        amount: 150,
        category: 'Market & Gıda',
        icon: 'food',
      },
      {
        id: 'rtn-clean-3',
        title: 'Kahve / Çay',
        amount: 50,
        category: 'Eğlence & Sosyal',
        icon: 'coffee',
        isAvoidableHabit: true,
      },
    ],
    savingsGoals: [],
    subscriptions: [],
  };
}

/**
 * Calculate the active budget cycle start and end dates based on user's payday.
 * For example: if payday is 15, on Oct 8 we are in cycle Sep 15 - Oct 14.
 * On Oct 16 we are in cycle Oct 15 - Nov 14.
 */
export function getBudgetCycleDates(
  paydayDay: number = 1,
  refDate: Date = new Date()
): { startDate: string; endDate: string; label: string; daysRemaining: number } {
  const currentDay = refDate.getDate();
  const year = refDate.getFullYear();
  const month = refDate.getMonth(); // 0-indexed

  let startYear = year;
  let startMonth = month;
  let endYear = year;
  let endMonth = month;

  if (paydayDay <= 1) {
    // Standard calendar month: 1st of this month to last day of this month
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;
    const daysRemaining = Math.max(1, lastDayOfMonth - currentDay + 1);

    const monthNames = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return {
      startDate,
      endDate,
      label: `${monthNames[month]} ${year}`,
      daysRemaining,
    };
  }

  // Custom payday day (e.g. 15th)
  if (currentDay >= paydayDay) {
    // Current cycle started this month on paydayDay and ends next month on (paydayDay - 1)
    startMonth = month;
    endMonth = month + 1;
    if (endMonth > 11) {
      endMonth = 0;
      endYear = year + 1;
    }
  } else {
    // Current cycle started last month on paydayDay and ends this month on (paydayDay - 1)
    startMonth = month - 1;
    if (startMonth < 0) {
      startMonth = 11;
      startYear = year - 1;
    }
    endMonth = month;
  }

  const maxStartDays = new Date(startYear, startMonth + 1, 0).getDate();
  const actualStartDay = Math.min(paydayDay, maxStartDays);
  const actualEndDay = Math.max(1, paydayDay - 1);

  const startDate = `${startYear}-${String(startMonth + 1).padStart(2, '0')}-${String(actualStartDay).padStart(2, '0')}`;
  const endDate = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-${String(actualEndDay).padStart(2, '0')}`;

  const endDateTime = new Date(endYear, endMonth, actualEndDay, 23, 59, 59).getTime();
  const nowTime = refDate.getTime();
  const diffDays = Math.max(1, Math.ceil((endDateTime - nowTime) / (1000 * 60 * 60 * 24)));

  const monthNames = [
    'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
    'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'
  ];
  const label = `${actualStartDay} ${monthNames[startMonth]} - ${actualEndDay} ${monthNames[endMonth]}`;

  return {
    startDate,
    endDate,
    label,
    daysRemaining: diffDays,
  };
}

/**
 * Check if a date string (YYYY-MM-DD) falls within the active budget cycle
 */
export function isDateInBudgetCycle(
  dateStr: string,
  paydayDay: number = 1,
  refDate: Date = new Date()
): boolean {
  if (!dateStr) return false;
  const cycle = getBudgetCycleDates(paydayDay, refDate);
  return dateStr >= cycle.startDate && dateStr <= cycle.endDate;
}

export interface ParsedBankSms {
  amount: number | null;
  merchant: string;
  category: ExpenseCategory;
  date: string;
  isMandatory: boolean;
  confidence: boolean;
  bankName?: string;
  rawAmountStr?: string;
  rawDateStr?: string;
}

/**
 * Advanced Bank SMS & Notification Parser
 * Uses multi-pass regex to extract:
 * 1. Exact amount with Turkish/European/Standard decimal handling
 * 2. Accurate transaction date (numeric, ISO, or Turkish month names)
 * 3. Merchant / vendor name cleaned of corporate suffix noise
 * 4. Categorization via exhaustive Turkish keyword and pattern matchers
 * 5. Bank identity recognition
 */
export function parseBankSms(text: string): ParsedBankSms {
  const clean = text.trim();
  const lower = clean.toLocaleLowerCase('tr-TR');

  // --- 1. BANK DETECTION ---
  let bankName = '';
  if (/garanti|bonus|paracard/i.test(clean)) bankName = 'Garanti BBVA';
  else if (/iş bankası|is bankasi|maximum|maximiles/i.test(clean)) bankName = 'İş Bankası';
  else if (/yapı kredi|yapi kredi|worldcard/i.test(clean)) bankName = 'Yapı Kredi';
  else if (/akbank|axess|wings/i.test(clean)) bankName = 'Akbank';
  else if (/ziraat|bankkart/i.test(clean)) bankName = 'Ziraat Bankası';
  else if (/vakıfbank|vakifbank|vakıf|world/i.test(clean)) bankName = 'Vakıfbank';
  else if (/halkbank|paraf/i.test(clean)) bankName = 'Halkbank';
  else if (/enpara/i.test(clean)) bankName = 'Enpara.com';
  else if (/qnb|finansbank|cardfinans/i.test(clean)) bankName = 'QNB Finansbank';
  else if (/papara/i.test(clean)) bankName = 'Papara';
  else if (/denizbank|deniz/i.test(clean)) bankName = 'Denizbank';
  else if (/teb|cepteteb/i.test(clean)) bankName = 'TEB';
  else if (/kuveyt türk|kuveyt turk/i.test(clean)) bankName = 'Kuveyt Türk';
  else if (/fibabanka/i.test(clean)) bankName = 'Fibabanka';
  else if (/ing bank|ing/i.test(clean)) bankName = 'ING';

  // --- 2. AMOUNT EXTRACTION WITH ADVANCED REGEX ---
  let amount: number | null = null;
  let rawAmountStr = '';

  // Advanced patterns for Turkish banking SMS
  const amountPatterns: RegExp[] = [
    // Standard with currency: "1.250,50 TL", "345,50TL", "150 TL", "2.500,00 TRY", "450 ₺", "₺1.250,50", "TL 450,00"
    /(?:(?:₺|TL|TRY)\s*)?(\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)\s*(?:TL|TRY|₺)/i,
    // Explicit keywords: "tutarında 345,50 TL", "tutar: 1.250,00", "harcama tutarı: 150 TL"
    /(?:tutar[ıi]?(?:nda|ndaki|m[ıi]z)?|tutarl[ıi]|harcama(?:s[ıi])?|i[şs]lem(?:i)?|çekilen|ödenen)\s*:?\s*(?:(?:₺|TL|TRY)\s*)?(\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)\s*(?:TL|TRY|₺)?/i,
    // Amounts followed by suffix: "345,50 TL'lik", "500 TL lik"
    /(\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)\s*(?:TL|TRY|₺)?\s*['’]?(?:lik|l[ıi]k|liktir)/i,
  ];

  for (const pattern of amountPatterns) {
    const match = clean.match(pattern);
    if (match && match[1]) {
      const candidateStr = match[1].trim();

      // Normalize Turkish / European number formatting:
      // "1.250,50" -> "1250.50"
      // "1.250" -> "1250"
      // "345,50" -> "345.50"
      // "345.50" -> "345.50"
      let normalized = candidateStr;
      if (candidateStr.includes('.') && candidateStr.includes(',')) {
        // e.g. 1.250,50 -> remove dots, replace comma with dot
        normalized = candidateStr.replace(/\./g, '').replace(',', '.');
      } else if (candidateStr.includes(',')) {
        // e.g. 345,50 -> replace comma with dot
        normalized = candidateStr.replace(',', '.');
      } else if (candidateStr.includes('.')) {
        // Check if dot is thousand separator (e.g. 1.250) or decimal (e.g. 345.50)
        const parts = candidateStr.split('.');
        if (parts.length === 2 && parts[1].length === 3) {
          normalized = candidateStr.replace('.', '');
        } else {
          // Standard decimal
          normalized = candidateStr;
        }
      }

      const parsedNum = parseFloat(normalized);
      // Ensure it's not a 4-digit card number (like 4123) or OTP code
      const isCardPrefix = clean.match(new RegExp(`(?:kartınızla|kartınız|kartla|kart ile|ile biten)\\s+${candidateStr}`, 'i'));
      const isCardSuffix = clean.match(new RegExp(`${candidateStr}\\s+(?:ile biten|no'lu|nolu)`, 'i'));

      if (!isNaN(parsedNum) && parsedNum > 0 && !isCardPrefix && !isCardSuffix) {
        amount = parsedNum;
        rawAmountStr = candidateStr;
        break;
      }
    }
  }

  // --- 3. DATE EXTRACTION WITH ADVANCED REGEX ---
  let date = getTodayString();
  let rawDateStr = '';

  const TURKISH_MONTHS: Record<string, string> = {
    ocak: '01', oca: '01',
    şubat: '02', subat: '02', şub: '02', sub: '02',
    mart: '03', mar: '03',
    nisan: '04', nis: '04',
    mayıs: '05', mayis: '05', may: '05',
    haziran: '06', haz: '06',
    temmuz: '07', tem: '07',
    ağustos: '08', agustos: '08', ağu: '08', agu: '08',
    eylül: '09', eylul: '09', eyl: '09',
    ekim: '10', eki: '10',
    kasım: '11', kasim: '11', kas: '11',
    aralık: '12', aralik: '12', ara: '12',
  };

  // Pattern A: Turkish textual date: "08 Ekim 2026", "15 Mayıs", "8 Kas 2026", "23 Nisan 2026"
  const textualDateMatch = clean.match(/(\b\d{1,2})\s+(ocak|şubat|subat|mart|nisan|mayıs|mayis|haziran|temmuz|ağustos|agustos|eylül|eylul|ekim|kasım|kasim|aralık|aralik|oca|şub|sub|mar|nis|may|haz|tem|ağu|agu|eyl|eki|kas|ara)\b(?:\s+(\d{4}))?/i);
  if (textualDateMatch) {
    const day = String(parseInt(textualDateMatch[1])).padStart(2, '0');
    const monthKey = textualDateMatch[2].toLocaleLowerCase('tr-TR');
    const m = TURKISH_MONTHS[monthKey] || '01';
    let y = textualDateMatch[3] || String(new Date().getFullYear());
    date = `${y}-${m}-${day}`;
    rawDateStr = textualDateMatch[0];
  } else {
    // Pattern B: Numeric date: "08.10.2026", "08/10/2026", "08-10-2026", "2026-10-08"
    const numericDateMatch =
      clean.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/) || // YYYY-MM-DD
      clean.match(/(?:tarih:?\s*)?(\b\d{1,2})[./-](\d{1,2})[./-](\d{2,4})\b/) || // DD.MM.YYYY
      clean.match(/(?:tarihinde|tarihli|\b)(\d{1,2})[./-](\d{1,2})\b/); // DD.MM (fallback)

    if (numericDateMatch) {
      if (numericDateMatch[1].length === 4) {
        // YYYY-MM-DD
        const y = numericDateMatch[1];
        const m = String(parseInt(numericDateMatch[2])).padStart(2, '0');
        const day = String(parseInt(numericDateMatch[3])).padStart(2, '0');
        date = `${y}-${m}-${day}`;
      } else {
        // DD.MM.YYYY
        const day = String(parseInt(numericDateMatch[1])).padStart(2, '0');
        const m = String(parseInt(numericDateMatch[2])).padStart(2, '0');
        let y = numericDateMatch[3] || String(new Date().getFullYear());
        if (y.length === 2) y = '20' + y;
        if (parseInt(m) >= 1 && parseInt(m) <= 12 && parseInt(day) >= 1 && parseInt(day) <= 31) {
          date = `${y}-${m}-${day}`;
        }
      }
      rawDateStr = numericDateMatch[0];
    }
  }

  // --- 4. MERCHANT EXTRACTION WITH ADVANCED REGEX ---
  let merchant = '';
  const merchantPatterns: RegExp[] = [
    // "... MIGROS firmasından / noktasından / işyerinden / mağazasından ..."
    /(?:(?:ile|kartınızla|kartla)\s+)?([A-ZÇĞİÖŞÜa-zçğıöşü0-9\s&.'-]+?)\s+(?:firmas[ıi]ndan|noktas[ıi]ndan|i[şs]yerinden|ma[ğg]azas[ıi]ndan|firmas[ıi]nda|noktas[ıi]nda|i[şs]yerinde|ma[ğg]azas[ıi]nda)/i,
    // "... YEMEKSEPETI üzerinden / aracılığıyla ..."
    /([A-ZÇĞİÖŞÜa-zçğıöşü0-9\s&.'-]+?)\s+(?:üzerinden|uzerinden|arac[ıi]l[ıi][ğg][ıi]yla)/i,
    // "POS: MIGROS TR" or "İŞYERİ: OPET"
    /(?:POS|İ[ŞS]YER[İI]|ISYERI|ÜYE\s+İ[ŞS]YER[İI]):\s*([A-ZÇĞİÖŞÜa-zçğıöşü0-9\s&.'-]+?)(?=[,\n;]|\s+tutar|\s+\d)/i,
    // "MIGROS faturası için ..."
    /([A-ZÇĞİÖŞÜa-zçğıöşü0-9\s&.'-]+?)\s+(?:faturas[ıi]|aboneli[ğg]i)\s+(?:için|icin)/i,
    // "... için MIGROS harcaması ..."
    /(?:ile|için|icin)\s+([A-ZÇĞİÖŞÜa-zçğıöşü0-9\s&.'-]+?)\s+(?:harcama|ödeme|odeme|i[şs]lem|al[ıi][şs]veri[şs])/i,
  ];

  for (const pattern of merchantPatterns) {
    const match = clean.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      // Ignore if it grabbed pure bank name or card prefix
      if (!/^(garanti|bonus|kart|kartınız|paracard|maximum|axess|worldcard|bankkart)$/i.test(candidate)) {
        merchant = candidate;
        break;
      }
    }
  }

  // Clean corporate suffixes from merchant:
  if (merchant) {
    merchant = merchant
      .replace(/\b(TICARET|TİCARET|A\.Ş\.|A\.S\.|AŞ|AS|LTD\.|ŞTİ\.|STI\.|SAN\.|VE|HIZMETLERI|HİZMETLERİ|PERAKENDE|MAGAZACILIK|MAĞAZACILIK|ELEKTRONIK|ELEKTRONİK|GIDA|İSTANBUL|ISTANBUL|ANKARA|IZMIR|İZMİR|TR)\b/gi, '')
      .replace(/[.,\-_/]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Title case formatting
    merchant = merchant
      .toLocaleLowerCase('tr-TR')
      .split(' ')
      .filter((w) => w.length > 0)
      .map((w) => w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1))
      .join(' ');
  }

  // Fallback merchant if still empty
  if (!merchant) {
    const tokens = clean
      .split(/\s+/)
      .filter((w) => w.length > 2 && !/^\d+/.test(w) && !/^(tl|try|ile|icin|için|tutar|tutarı|tutarında|yapılan|harcama)$/i.test(w));
    merchant = tokens.slice(0, 2).join(' ') || (bankName ? `${bankName} Harcaması` : 'Banka Kart Harcaması');
  }

  // --- 5. CATEGORY & MANDATORY CLASSIFICATION ---
  let category: ExpenseCategory = 'Diğer';
  let isMandatory = false;

  const mLower = merchant.toLocaleLowerCase('tr-TR');
  const fullLower = lower;

  // Regex rules for categories:
  const isMarket =
    /\b(migros|bim|a101|a-101|şok|sok|carrefour|carrefoursa|file\s+market|macrocenter|tarım\s+kredi|hakmar|pehlivanoğlu|bizim\s+toptan|metro\s+gross|getir|yemeksepeti|trendyol\s+yemek|istegelsin|fırın|firin|pastane|kasap|şarküteri|sarkuteri|manav|starbucks|kahve|coffee|espresso|burger\s+king|mcdonalds|kfc|popeyes|dominos|pizza|köfteci\s+yusuf|kebap|döner|restoran|lokanta|cafe|kafe|bistro)\b/.test(
      mLower
    ) ||
    /\b(migros|bim|a101|şok|sok|carrefour|getir|yemeksepeti|trendyol\s+yemek|fırın|kasap|manav|starbucks|kahve|burger|mcdonalds|restoran|lokanta|market|gıda)\b/.test(
      fullLower
    );

  const isTransport =
    /\b(opet|shell|bp|petrol\s+ofisi|total|aytemiz|lukoil|alpet|akaryakıt|akaryakit|benzin|otogaz|lpg|uber|taksi|bitaksi|martı|marti|binbin|hop|scooter|otobüs|otobus|metro|marmaray|akbil|istanbulkart|izmirim|ankaray|ego|havaş|havabus|kamil\s+koç|pamukkale|tcdd|yht|hgs|ogs|otoyol|thy|türk\s+hava\s+yolları|turkish\s+airlines|pegasus|sunexpress|ajet|anadolujet|enuygun|turna|obilet)\b/.test(
      mLower
    ) ||
    /\b(opet|shell|bp|petrol|akaryakıt|yakıt|benzin|uber|taksi|martı|binbin|otobüs|akbil|istanbulkart|thy|pegasus|bilet|hgs|ogs)\b/.test(
      fullLower
    );

  const isBills =
    /\b(turkcell|vodafone|türk\s+telekom|turktelekom|netgsm|superonline|kablonet|millenicom|turknet|enerjisa|ck\s+boğaziçi|ayedaş|toroslar|başkent\s+elektrik|elektrik|iski|aski|izsu|buski|igdaş|igdas|baskentgaz|izmirgaz|aksa\s+doğalgaz|doğalgaz|dogalgaz|fatura|abonelik|netflix|spotify|youtube\s+premium|apple|itunes|google\s+play|disney|blutv|exxen|amazon\s+prime|gain|tod\s+tv|digiturk|d-smart|tivibu)\b/.test(
      mLower
    ) ||
    /\b(turkcell|vodafone|telekom|netflix|spotify|youtube|enerjisa|elektrik|iski|su\s+fatura|igdaş|doğalgaz|internet|fatura|abonelik)\b/.test(
      fullLower
    );

  const isRent =
    /\b(kira|ev\s+kirası|konut\s+kirası|aidat|apartman\s+aidat|site\s+aidat|yönetim\s+aidat|site\s+yönetimi|apartman\s+yönetimi)\b/.test(
      mLower
    ) ||
    /\b(kira|aidat|apartman|konut)\b/.test(fullLower);

  const isHealth =
    /\b(eczane|eczanesi|hastane|tıp\s+merkezi|klinik|poliklinik|sağlık|saglik|diş\s+hekimi|optik|gözlük|veteriner|medikal|laboratuvar|kuaför|kuafor|berber|güzellik|watsons|gratis|rossmann|sephora)\b/.test(
      mLower
    ) ||
    /\b(eczane|hastane|sağlık|saglik|medikal|diş|optik|kuaför|berber)\b/.test(
      fullLower
    );

  const isShopping =
    /\b(trendyol|hepsiburada|amazon|n11|çiçeksepeti|ciceksepeti|pazarama|zara|pull&bear|bershka|stradivarius|massimo\s+dutti|h&m|mango|lcw|lc\s+waikiki|defacto|koton|mavi|boyner|beymen|vakko|ipekyol|network|sarar|kiğılı|nike|adidas|puma|skechers|flo|deichmann|teknosa|mediamarkt|media\s+markt|vatan|apple\s+store|d&r|ikea|koçtaş|koctas|bauhaus|tekzen|evidea|karaca|english\s+home|madame\s+coco)\b/.test(
      mLower
    ) ||
    /\b(trendyol|hepsiburada|amazon|zara|lcw|boyner|mango|defacto|koton|teknosa|mediamarkt|vatan|ikea|koçtaş|giyim|mağaza)\b/.test(
      fullLower
    );

  const isEntertainment =
    /\b(sinema|cineverse|cinemaximum|tiyatro|opera|konser|biletix|passo|biletinial|etkinlik|festival|bowling|oyun\s+salonu|playstation|steam|epic\s+games|lunapark|akvaryum)\b/.test(
      mLower
    ) ||
    /\b(sinema|tiyatro|konser|biletix|passo|etkinlik|steam|playstation)\b/.test(
      fullLower
    );

  const isEducation =
    /\b(okul|kolej|üniversite|universite|kurs|dershane|kitabevi|kitap|kırtasiye|kirtasiye|udemy|coursera|eğitim|egitim|burs)\b/.test(
      mLower
    ) ||
    /\b(okul|kolej|üniversite|kurs|kırtasiye|udemy|eğitim)\b/.test(fullLower);

  const isMandatoryFee =
    /\b(vergi|gib|gelir\s+idaresi|harç|harc|ceza|trafik\s+cezası|sgk|bağkur|bagkur|noter|belediye|icra|kredi\s+kartı\s+borç|kredi\s+taksiti)\b/.test(
      mLower
    ) ||
    /\b(vergi|harç|ceza|sgk|noter|borç\s+ödeme)\b/.test(fullLower);

  if (isMarket) {
    category = 'Market & Gıda';
  } else if (isTransport) {
    category = 'Ulaşım & Yakıt';
  } else if (isBills) {
    category = 'Fatura & Abonelik';
    isMandatory = true;
  } else if (isRent) {
    category = 'Kira & Konut';
    isMandatory = true;
  } else if (isHealth) {
    category = 'Sağlık & Bakım';
  } else if (isShopping) {
    category = 'Giyim & Alışveriş';
  } else if (isEntertainment) {
    category = 'Eğlence & Sosyal';
  } else if (isEducation) {
    category = 'Eğitim';
  } else if (isMandatoryFee) {
    category = 'Zorunlu Ödeme';
    isMandatory = true;
  }

  return {
    amount,
    merchant,
    category,
    date,
    isMandatory,
    confidence: amount !== null,
    bankName,
    rawAmountStr,
    rawDateStr,
  };
}

/**
 * Generates an Excel-ready CSV string containing ALL financial data:
 * - Gelirler (Incomes)
 * - Giderler (Expenses)
 * - Borçlar (Kredi Kartı Borçları ve Taksitli Krediler / Borçlar)
 * Fully compatible with Turkish Excel (UTF-8 BOM \uFEFF, semicolon delimiter).
 */
export function exportAllFinancialDataCSV(data: AppData): string {
  const rows: string[] = [];

  // Header
  rows.push('Tarih / Vade;Finansal Tür;Kalem / Başlık;Tutar (TL);Kategori / Kaynak;Zorunlu / Durum;Detay / Not');

  // 1. Gelirler (Incomes)
  (data.incomes || []).forEach((inc) => {
    const escapedNote = (inc.note || '').replace(/"/g, '""');
    const escapedSource = (inc.source || 'Gelir').replace(/"/g, '""');
    rows.push(
      `"${inc.date}";"Gelir";"${escapedSource}";"${inc.amount.toFixed(2)}";"${escapedSource}";"Nakit Girişi";"${escapedNote}"`
    );
  });

  // 2. Giderler (Expenses)
  (data.expenses || []).forEach((exp) => {
    const escapedNote = (exp.note || '').replace(/"/g, '""');
    const escapedCat = (exp.category || 'Gider').replace(/"/g, '""');
    rows.push(
      `"${exp.date}";"Gider";"${escapedCat}";"${exp.amount.toFixed(2)}";"${escapedCat}";"${exp.isMandatory ? 'Zorunlu Gider' : 'İsteğe Bağlı'}";"${escapedNote}"`
    );
  });

  // 3. Kredi Kartı Borçları (Credit Card Debts)
  (data.cards || []).forEach((card) => {
    const escapedName = (card.name || 'Kredi Kartı').replace(/"/g, '""');
    const minPay = calculateMinCardPayment(card);
    const status = card.isPaidThisMonth
      ? 'Bu Ay Ödendi'
      : `Asgari Ödeme: ${minPay.toFixed(2)} TL (%${card.minPaymentRate || 20})`;
    const noteText = card.note
      ? card.note
      : `Hesap Kesim: Ayın ${card.statementDate}. günü | Son Ödeme: ${card.dueDate || '-'}`;
    const escapedNote = noteText.replace(/"/g, '""');
    rows.push(
      `"${card.dueDate || '-'}";"Borç (Kredi Kartı)";"${escapedName}";"${card.totalDebt.toFixed(2)}";"Kredi Kartı Borcu";"${status}";"${escapedNote}"`
    );
  });

  // 4. Taksitli Borçlar ve Krediler (Installment Loans)
  (data.installments || []).forEach((inst) => {
    const escapedTitle = (inst.title || 'Taksitli Borç').replace(/"/g, '""');
    const escapedCat = (inst.category || 'Taksit / Kredi').replace(/"/g, '""');
    const bank = inst.bankOrVendor ? ` (${inst.bankOrVendor})` : '';
    const status = `Kalan: ${inst.remainingInstallments}/${inst.totalInstallments} Ay • Aylık: ${inst.monthlyAmount.toFixed(2)} TL`;
    const noteText = inst.note
      ? inst.note
      : `Vade Günü: Ayın ${inst.dueDateDay}. günü`;
    const escapedNote = noteText.replace(/"/g, '""');
    rows.push(
      `"${inst.startDate || '-'}";"Borç (Taksit / Kredi)";"${escapedTitle}";"${inst.totalAmount.toFixed(2)}";"${escapedCat}${bank}";"${status}";"${escapedNote}"`
    );
  });

  // Return UTF-8 BOM prefix so Excel opens Turkish characters (₺, ç, ş, ı, ö, ü) flawlessly
  return '\uFEFF' + rows.join('\r\n');
}

/**
 * Generates an Excel-ready CSV string with UTF-8 BOM (\uFEFF)
 * and semicolon delimiter for Turkish locale compatibility
 */
export function exportTransactionsCSV(data: AppData): string {
  const rows: string[] = [];

  // Header
  rows.push('Tarih;Tür;Kategori / Kaynak;Tutar (TL);Zorunlu Mu;Not / Açıklama');

  // Incomes
  data.incomes.forEach((inc) => {
    const escapedNote = (inc.note || '').replace(/"/g, '""');
    rows.push(
      `"${inc.date}";"Gelir";"${inc.source}";"${inc.amount.toFixed(2)}";"Hayır";"${escapedNote}"`
    );
  });

  // Expenses
  data.expenses.forEach((exp) => {
    const escapedNote = (exp.note || '').replace(/"/g, '""');
    rows.push(
      `"${exp.date}";"Gider";"${exp.category}";"${exp.amount.toFixed(2)}";"${exp.isMandatory ? 'Evet' : 'Hayır'}";"${escapedNote}"`
    );
  });

  // Return UTF-8 BOM prefix so Excel opens Turkish characters (₺, ç, ş, ı, ö, ü) flawlessly
  return '\uFEFF' + rows.join('\r\n');
}

/**
 * Parses user imported CSV text into Expenses and Incomes
 */
export function parseCSVTransactions(csvText: string): {
  expenses: Omit<Expense, 'id'>[];
  incomes: Omit<Income, 'id'>[];
  error?: string;
} {
  const expenses: Omit<Expense, 'id'>[] = [];
  const incomes: Omit<Income, 'id'>[] = [];

  const lines = csvText
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return { expenses, incomes, error: 'CSV dosyası boş veya başlık satırı eksik.' };
  }

  // Detect delimiter: semicolon or comma
  const header = lines[0];
  const delim = header.includes(';') ? ';' : ',';

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Split by delimiter considering quotes
    const cols = line
      .split(new RegExp(`${delim}(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)`))
      .map((c) => c.replace(/^"|"$/g, '').trim());

    if (cols.length < 4) continue;

    const date = cols[0] || getTodayString();
    const type = (cols[1] || 'Gider').toLocaleLowerCase('tr-TR');
    const categoryOrSource = cols[2] || 'Diğer';
    const amountStr = cols[3].replace(/\./g, '').replace(',', '.');
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) continue;

    const isMandatory = (cols[4] || '').toLocaleLowerCase('tr-TR').includes('evet');
    const note = cols[5] || undefined;

    if (type.includes('gelir')) {
      incomes.push({
        amount,
        source: categoryOrSource,
        date,
        note,
      });
    } else {
      expenses.push({
        amount,
        category: categoryOrSource as any,
        date,
        isMandatory,
        note,
      });
    }
  }

  return { expenses, incomes };
}
