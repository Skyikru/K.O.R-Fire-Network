import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  CheckSquare,
  Calendar,
  ShieldCheck,
  Lock,
  Sun,
  Moon,
  Users,
  Mic,
  Search,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { NavTab, UserProfile, AppTheme } from '../types';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  encryptionEnabled: boolean;
  onLockVault?: () => void;
  pendingTasksCount: number;
  currentProfile: UserProfile;
  onOpenProfileModal: () => void;
  theme: AppTheme;
  onToggleTheme: () => void;
  onOpenVoiceModal?: () => void;
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  encryptionEnabled,
  onLockVault,
  pendingTasksCount,
  currentProfile,
  onOpenProfileModal,
  theme,
  onToggleTheme,
  onOpenVoiceModal,
  onOpenSearch,
}) => {
  const todayFormatted = new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  interface NavItem {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Özet', icon: LayoutDashboard },
    { id: 'finance', label: 'Finans', icon: Wallet },
    { id: 'tasks', label: 'Görevler', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined },
    { id: 'calendar', label: 'Takvim', icon: Calendar },
    { id: 'backup', label: 'Yedek', icon: ShieldCheck },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0A0F1D]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-slate-800/80 px-3 sm:px-6 py-2.5 transition-colors">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Profile Pill */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-[#0F172A] dark:text-white leading-none">
                  Yaşam & Finans
                </h1>
                {/* Profile Selector Badge */}
                <button
                  onClick={onOpenProfileModal}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-slate-200 transition active:scale-95"
                  title="Hesap veya Profil Değiştir"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: currentProfile.color }}
                  />
                  <span className="truncate max-w-[80px] sm:max-w-[110px]">{currentProfile.name}</span>
                  <Users className="w-3 h-3 text-[#64748B]" />
                </button>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#64748B] dark:text-slate-400 capitalize mt-0.5 leading-none">
                {todayFormatted}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-[#E2E8F0] dark:border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-white dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-[#E2E8F0] dark:border-emerald-500/30 shadow-xs'
                      : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Actions: Search, Voice Assistant, Theme Toggle, Lock, Install */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {onOpenSearch && (
              <>
                {/* Desktop Search Button */}
                <button
                  onClick={onOpenSearch}
                  className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-slate-200 border border-[#E2E8F0] dark:border-slate-800 text-xs transition active:scale-95 shadow-2xs"
                  title="Tüm işlem ve görevlerde ara (Ctrl + K)"
                >
                  <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[11px] font-medium">Hızlı Ara...</span>
                  <kbd className="px-1.5 py-0.2 text-[10px] font-mono bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded text-slate-500 dark:text-slate-400">
                    Ctrl K
                  </kbd>
                </button>

                {/* Mobile Search Icon Button */}
                <button
                  onClick={onOpenSearch}
                  className="md:hidden p-2 rounded-xl text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-[#E2E8F0] dark:border-slate-800 transition active:scale-95"
                  title="İşlem ve Görev Ara"
                >
                  <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </button>
              </>
            )}

            {onOpenVoiceModal && (
              <button
                onClick={onOpenVoiceModal}
                className="p-2 rounded-xl text-purple-600 dark:text-purple-400 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 border border-purple-200/80 dark:border-purple-800/60 transition active:scale-95 shadow-2xs"
                title="Sesli Komut ile Görev / Harcama Ekle"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}

            {/* Theme Toggle (Dark / Light) */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-[#0F172A] dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-[#E2E8F0] dark:border-slate-800 transition active:scale-95"
              title={theme === 'dark' ? 'Aydınlık Moda Geç' : 'Karanlık Moda Geç'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#0F172A]" />
              )}
            </button>

            {encryptionEnabled && onLockVault && (
              <button
                onClick={onLockVault}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#0F172A] dark:text-slate-300 bg-slate-100 dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700/80 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                title="Kasayı Hemen Kilitle"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Kilitle</span>
              </button>
            )}

            <PWAInstallButton />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (5 tabs with Calendar) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#0A0F1D]/95 backdrop-blur-lg border-t border-[#E2E8F0] dark:border-slate-800/80 px-1 py-1.5 safe-bottom">
        <div className="grid grid-cols-5 gap-0.5 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl text-[10px] font-medium transition ${
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 font-bold'
                    : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-slate-200 active:bg-slate-100 dark:active:bg-slate-800/40'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-emerald-600 dark:text-emerald-400 stroke-[2.2]' : 'text-[#64748B]'}`} />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white text-[8px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="truncate max-w-full">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
