import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full bg-amber-500/90 text-slate-950 font-medium px-4 py-1.5 text-xs shadow-xl backdrop-blur-md border border-amber-300 animate-pulse">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Çevrimdışı Mod — Tüm veriler cihazınızda kaydedilmeye devam ediyor</span>
    </div>
  );
};
