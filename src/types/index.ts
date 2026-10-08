export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  completed: boolean;
  dueDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  completedDates: string[]; // array of YYYY-MM-DD
  createdAt: string;
}

export type IncomeSource = 'Maaş' | 'Ek Gelir' | 'Serbest Meslek' | 'Yatırım / Getiri' | 'Satış' | 'Diğer';

export interface Income {
  id: string;
  amount: number;
  source: IncomeSource | string;
  date: string; // YYYY-MM-DD
  note?: string;
}

export type ExpenseCategory =
  | 'Market & Gıda'
  | 'Fatura & Abonelik'
  | 'Kira & Konut'
  | 'Ulaşım & Yakıt'
  | 'Sağlık & Bakım'
  | 'Eğlence & Sosyal'
  | 'Giyim & Alışveriş'
  | 'Eğitim'
  | 'Zorunlu Ödeme'
  | 'Diğer';

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory | string;
  date: string; // YYYY-MM-DD
  isMandatory?: boolean; // Vadesi/zorunlu gider mi?
  note?: string;
}

export interface CreditCardDebt {
  id: string;
  name: string; // Örn: Bonus Kart, Garanti Kredi Kartı
  totalDebt: number; // Toplam güncel borç
  statementDate: number; // Ayın kaçıncı günü hesap kesim (1-31)
  dueDate: string; // YYYY-MM-DD son ödeme tarihi
  minPaymentRate: number; // Varsayılan: 20 veya 40 (yüzde olarak)
  note?: string;
  isPaidThisMonth?: boolean;
}

export type AppTheme = 'dark' | 'light';

export type NavTab = 'dashboard' | 'finance' | 'tasks' | 'calendar' | 'backup';

export interface UserProfile {
  id: string;
  name: string;
  type: 'personal' | 'work' | 'shared';
  color: string;
  createdAt: string;
}

export interface AppSettings {
  currency: string;
  theme: AppTheme;
  enableEncryption: boolean;
  passwordHash?: string;
  salt?: string;
  lastBackupDate?: string;
  activeTab: NavTab;
  paydayDay?: number; // Maaş günü: varsayılan 1 (örn: ayın 15'i ise 15)
}

export interface CategoryBudget {
  category: ExpenseCategory | string;
  monthlyLimit: number;
}

export interface InstallmentLoan {
  id: string;
  title: string;
  totalAmount: number;
  monthlyAmount: number;
  remainingInstallments: number;
  totalInstallments: number;
  dueDateDay: number; // 1-31
  category: ExpenseCategory | string;
  bankOrVendor?: string;
  startDate: string; // YYYY-MM-DD
  note?: string;
}

export interface EmergencyFund {
  currentAmount: number;
  targetMonths: number;
}

export interface DailyRoutineExpense {
  id: string;
  title: string; // Örn: Otobüs / Ulaşım, Sigara, Öğle Yemeği, Kahve
  amount: number; // Örn: 25, 75, 180, 50
  category: ExpenseCategory | string;
  icon?: string;
  isAvoidableHabit?: boolean; // Kötü alışkanlık tasarruf kumbarası
  note?: string;
}

export interface SavingsGoal {
  id: string;
  title: string; // Örn: Yeni Telefon, Tatil, Araba Peşinatı
  targetAmount: number;
  currentAmount: number;
  targetDate?: string; // YYYY-MM-DD
  category?: string;
  color?: string;
  note?: string;
}

export interface SubscriptionItem {
  id: string;
  title: string; // Örn: Spotify, Netflix, İnternet, Spor Salonu
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  renewalDay: number; // 1-31
  category: ExpenseCategory | string;
  status: 'active' | 'paused';
  note?: string;
}

export interface FixedExpenseItem {
  id: string;
  title: string; // Örn: Ev Kirası, Apartman Aidatı, Fiber İnternet, Su & Elektrik
  amount: number;
  dueDay: number; // 1-31 (Her ayın N. günü)
  category: ExpenseCategory | string;
  type: 'rent' | 'subscription' | 'bill' | 'loan' | 'dues' | 'other';
  isPaidThisMonth?: boolean;
  autoPay?: boolean;
  note?: string;
}

export interface AppData {
  version: number;
  profileId: string;
  tasks: Task[];
  habits: Habit[];
  incomes: Income[];
  expenses: Expense[];
  cards: CreditCardDebt[];
  categoryBudgets?: CategoryBudget[];
  installments?: InstallmentLoan[];
  emergencyFund?: EmergencyFund;
  dailyRoutines?: DailyRoutineExpense[];
  savingsGoals?: SavingsGoal[];
  subscriptions?: SubscriptionItem[];
  fixedExpenses?: FixedExpenseItem[];
  settings: AppSettings;
  exportedAt?: string;
}

export interface MultiProfileStore {
  version: number;
  activeProfileId: string;
  profiles: UserProfile[];
  profilesData: Record<string, AppData>;
}

export interface CalendarDayEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'task' | 'due_date' | 'statement' | 'income' | 'expense';
  amount?: number;
  completed?: boolean;
  priority?: Priority;
  details?: string;
}
