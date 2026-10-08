import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert } from 'lucide-react';
import { verifyPassword } from '../utils/crypto';

interface VaultLockModalProps {
  storedHash: string;
  storedSalt: string;
  onUnlock: () => void;
}

export const VaultLockModal: React.FC<VaultLockModalProps> = ({
  storedHash,
  storedSalt,
  onUnlock,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Lütfen kilit parolanızı girin.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const isValid = await verifyPassword(password, storedHash, storedSalt);
      if (isValid) {
        onUnlock();
      } else {
        setError('Hatalı parola veya PIN! Lütfen tekrar deneyin.');
      }
    } catch {
      setError('Kilit açılırken doğrulama hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 p-6 shadow-2xl text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center mb-4">
          <Lock className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
        </div>

        <h2 className="text-xl font-bold text-[#0F172A] dark:text-white tracking-tight">Kasa Kilitli</h2>
        <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 mb-6 leading-relaxed">
          Verileriniz uçtan uca şifrelenmiştir. Kişisel finans ve görevlerinize erişmek için ana parolanızı girin.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="password"
              placeholder="Ana Parola veya PIN..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white placeholder-[#64748B]/60 text-sm focus:outline-none focus:border-emerald-500 transition shadow-xs"
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs text-left">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition shadow-xs"
          >
            {loading ? 'Doğrulanıyor...' : 'Kilidi Aç'}
          </button>
        </form>
      </div>
    </div>
  );
};
