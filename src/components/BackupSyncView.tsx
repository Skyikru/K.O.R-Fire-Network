import React, { useState, useRef, useEffect } from 'react';
import { AppData, Expense, Income } from '../types';
import { hashPassword, encryptData, decryptData } from '../utils/crypto';
import { exportAllFinancialDataCSV, exportTransactionsCSV, parseCSVTransactions } from '../utils/storage';
import QRCode from 'qrcode';
import {
  Download,
  Upload,
  QrCode,
  ShieldCheck,
  Lock,
  KeyRound,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  Smartphone,
  Laptop,
  FileSpreadsheet,
  Calendar,
  Sparkles,
  Trash2,
  CreditCard,
} from 'lucide-react';

interface BackupSyncViewProps {
  data: AppData;
  onImportData: (newData: AppData) => void;
  onResetData: () => void;
  onCleanSlateData?: () => void;
  onUpdateSettings: (newSettings: AppData['settings']) => void;
  onImportCSVTransactions?: (imported: {
    expenses: Omit<Expense, 'id'>[];
    incomes: Omit<Income, 'id'>[];
  }) => void;
}

export const BackupSyncView: React.FC<BackupSyncViewProps> = ({
  data,
  onImportData,
  onResetData,
  onCleanSlateData,
  onUpdateSettings,
  onImportCSVTransactions,
}) => {
  const [copiedSyncCode, setCopiedSyncCode] = useState(false);
  const [pasteSyncCode, setPasteSyncCode] = useState('');
  const [syncCodeError, setSyncCodeError] = useState<string | null>(null);

  // QR Code State
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  // Encryption master setup
  const [newMasterPass, setNewMasterPass] = useState('');
  const [confirmMasterPass, setConfirmMasterPass] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const [csvExportFeedback, setCsvExportFeedback] = useState<string | null>(null);

  // Tüm Finansal Verileri (Gelirler, Giderler, Borçlar) CSV Olarak Dışa Aktar
  const handleExportAllFinancialCSV = () => {
    try {
      const csvContent = exportAllFinancialDataCSV(data);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const today = new Date().toISOString().split('T')[0];
      a.download = `tum_finansal_veriler_gelir_gider_borclar_${today}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setCsvExportFeedback('Tüm finansal veriler (gelirler, giderler, borçlar) CSV olarak indirildi!');
      setTimeout(() => setCsvExportFeedback(null), 4000);
    } catch (err) {
      alert('Tüm finansal verileri CSV dışa aktarma hatası: ' + String(err));
    }
  };

  // CSV Export & Import Handlers (Yalnızca Gelir ve Gider)
  const handleExportCSV = () => {
    try {
      const csvContent = exportTransactionsCSV(data);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `harcamalar_ve_gelirler_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setCsvExportFeedback('Gelir ve gider işlemleri CSV olarak indirildi!');
      setTimeout(() => setCsvExportFeedback(null), 4000);
    } catch (err) {
      alert('CSV dışa aktarma hatası: ' + String(err));
    }
  };

  const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const result = parseCSVTransactions(text);
        if (result.error) {
          alert(result.error);
          return;
        }
        if (result.expenses.length === 0 && result.incomes.length === 0) {
          alert('Dosyada geçerli harcama veya gelir satırı bulunamadı.');
          return;
        }

        if (onImportCSVTransactions) {
          onImportCSVTransactions(result);
        } else {
          // Fallback import
          onImportData({
            ...data,
            expenses: [
              ...data.expenses,
              ...result.expenses.map((exp, idx) => ({ ...exp, id: `imp-exp-${Date.now()}-${idx}` })),
            ],
            incomes: [
              ...data.incomes,
              ...result.incomes.map((inc, idx) => ({ ...inc, id: `imp-inc-${Date.now()}-${idx}` })),
            ],
          });
        }
        alert(
          `✓ Başarılı: ${result.expenses.length} harcama ve ${result.incomes.length} gelir kaydı içe aktarıldı!`
        );
      } catch (err) {
        alert('CSV ayrıştırma hatası: ' + String(err));
      } finally {
        if (csvFileInputRef.current) csvFileInputRef.current.value = '';
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  // Payday setting changer
  const handleSetPayday = (day: number) => {
    onUpdateSettings({
      ...data.settings,
      paydayDay: day,
    });
  };

  // Generate QR code for transfer
  const handleGenerateQR = async () => {
    try {
      // Export compact payload
      const payload = JSON.stringify({
        t: 'YF_SYNC',
        v: data.version,
        tasks: data.tasks,
        habits: data.habits,
        incomes: data.incomes,
        expenses: data.expenses,
        cards: data.cards,
      });

      // Generate Data URL for QR Code
      const url = await QRCode.toDataURL(payload, {
        width: 320,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      });
      setQrDataUrl(url);
      setShowQRModal(true);
    } catch {
      // If payload is too large for single standard QR, fallback to base64 text transfer
      alert('Veri boyutu tek bir QR koda sığmayacak kadar geniş. Lütfen "Senkronizasyon Kodunu Kopyala" veya "JSON İndir" seçeneğini kullanın.');
    }
  };

  // 1. Dışa Aktar (JSON İndir)
  const handleExportJSON = async (encrypted: boolean = false) => {
    try {
      let exportString = JSON.stringify({ ...data, exportedAt: new Date().toISOString() }, null, 2);
      let filename = `yasam_ve_finans_yedek_${new Date().toISOString().split('T')[0]}.json`;

      if (encrypted) {
        const pass = prompt('Yedek dosyasını şifrelemek için bir parola girin:');
        if (!pass) return;
        const cipher = await encryptData(exportString, pass);
        exportString = JSON.stringify({
          isEncrypted: true,
          cipher,
          version: data.version,
          exportedAt: new Date().toISOString(),
        });
        filename = `yasam_ve_finans_SIFRELI_${new Date().toISOString().split('T')[0]}.enc.json`;
      }

      const blob = new Blob([exportString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Dışa aktarma sırasında bir hata oluştu: ' + String(err));
    }
  };

  // 2. İçe Aktar (JSON Yükle)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target?.result as string;
        let parsed = JSON.parse(text);

        if (parsed.isEncrypted && parsed.cipher) {
          const pass = prompt('Bu yedek şifreli. Lütfen şifre çözme parolasını girin:');
          if (!pass) return;
          const decryptedJson = await decryptData(parsed.cipher, pass);
          parsed = JSON.parse(decryptedJson);
        }

        if (parsed.tasks && parsed.incomes && parsed.expenses && parsed.cards) {
          onImportData({
            version: parsed.version || 2,
            profileId: parsed.profileId || data.profileId,
            tasks: parsed.tasks || [],
            habits: parsed.habits || [],
            incomes: parsed.incomes || [],
            expenses: parsed.expenses || [],
            cards: parsed.cards || [],
            settings: parsed.settings || data.settings,
          });
          alert('Tüm veriler başarıyla cihazınıza yüklendi ve senkronize edildi!');
        } else {
          alert('Geçersiz dosya formatı! Beklenen veri şeması bulunamadı.');
        }
      } catch (err) {
        alert('Dosya okunurken veya şifre çözülürken hata: ' + String(err));
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // 3. Tek Tık Kod ile Senkronizasyon (Copy / Paste)
  const handleCopySyncCode = () => {
    const compact = JSON.stringify({
      version: data.version,
      profileId: data.profileId,
      tasks: data.tasks,
      habits: data.habits,
      incomes: data.incomes,
      expenses: data.expenses,
      cards: data.cards,
    });
    const code = btoa(encodeURIComponent(compact));
    navigator.clipboard.writeText(code).then(() => {
      setCopiedSyncCode(true);
      setTimeout(() => setCopiedSyncCode(false), 3000);
    });
  };

  const handleApplySyncCode = () => {
    setSyncCodeError(null);
    try {
      const decoded = decodeURIComponent(atob(pasteSyncCode.trim()));
      const parsed = JSON.parse(decoded);
      if (parsed.tasks && parsed.incomes && parsed.expenses && parsed.cards) {
        onImportData({
          version: parsed.version || 2,
          profileId: parsed.profileId || data.profileId,
          tasks: parsed.tasks,
          habits: parsed.habits || [],
          incomes: parsed.incomes,
          expenses: parsed.expenses,
          cards: parsed.cards,
          settings: data.settings,
        });
        setPasteSyncCode('');
        alert('Cihazlar arası veri senkronizasyonu tamamlandı!');
      } else {
        setSyncCodeError('Kod geçerli bir veri paketi içermiyor.');
      }
    } catch {
      setSyncCodeError('Geçersiz veya bozuk senkronizasyon kodu.');
    }
  };

  // 4. Kasa Şifresi Oluşturma / Değiştirme
  const handleSaveMasterPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newMasterPass.length < 4) {
      setPassError('Parola en az 4 karakter olmalıdır.');
      return;
    }
    if (newMasterPass !== confirmMasterPass) {
      setPassError('Parolalar birbiriyle uyuşmuyor.');
      return;
    }

    try {
      const { hash, salt } = await hashPassword(newMasterPass);
      onUpdateSettings({
        ...data.settings,
        enableEncryption: true,
        passwordHash: hash,
        salt,
      });
      setNewMasterPass('');
      setConfirmMasterPass('');
      setPassSuccess('Kasa kilidi başarıyla etkinleştirildi! Cihazınızda verileriniz güvende.');
    } catch {
      setPassError('Şifreleme anahtarı oluşturulurken hata oluştu.');
    }
  };

  const handleDisableEncryption = () => {
    if (confirm('Kasa kilidini kaldırmak istediğinize emin misiniz?')) {
      onUpdateSettings({
        ...data.settings,
        enableEncryption: false,
        passwordHash: undefined,
        salt: undefined,
      });
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-4xl mx-auto">
      {/* Privacy & Zero-Cost Notice */}
      <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-5 space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-sm font-semibold text-[#0F172A] dark:text-white">Sıfır Sunucu & Maksimum Gizlilik Altyapısı</h2>
        </div>
        <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
          Bu uygulama harici hiçbir veritabanı, ücretli sunucu veya banka API'si kullanmaz. Tüm kayıtlarınız yalnızca kullandığınız cihazın <code>localStorage</code> belleğinde tutulur. Telefonunuz ve bilgisayarınız arasında verileri aktarmak için aşağıdaki güvenli araçları kullanabilirsiniz.
        </p>
      </div>

      {/* Grid: 1. Manuel JSON Yedekleme & 2. Canlı Eşitleme Kodu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Sol: JSON Dışa / İçe Aktar */}
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">JSON Yedekleme (Manuel Aktarım)</h3>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mb-4">
              Masaüstündeki verileri telefona veya telefondaki verileri bilgisayara dosya olarak taşıyın.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => handleExportJSON(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition active:scale-98 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Verileri Dışa Aktar (JSON İndir)</span>
              </button>

              <button
                onClick={() => handleExportJSON(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-300 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-xs font-medium transition active:scale-98"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Şifreli JSON Olarak İndir (E2EE)</span>
              </button>

              <div className="pt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 dark:hover:bg-slate-800 hover:bg-slate-50 text-[#0F172A] dark:text-slate-200 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-xs font-medium transition active:scale-98"
                >
                  <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Verileri İçe Aktar (JSON Yükle)</span>
                </button>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#64748B] dark:text-slate-400 pt-3 border-t border-[#E2E8F0] dark:border-slate-800 flex items-center gap-1.5">
            <Laptop className="w-3.5 h-3.5" /> <Smartphone className="w-3.5 h-3.5" />
            <span>Masaüstü ve mobil arasında dosya transferi için tam uyumludur.</span>
          </div>
        </div>

        {/* Sağ: Tek Tık Kod veya QR ile Canlı Aktarım */}
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Cihazlar Arası Hızlı Aktarım</h3>
              </div>
              <button
                onClick={handleGenerateQR}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium flex items-center gap-1"
              >
                <QrCode className="w-3.5 h-3.5" /> QR Üret
              </button>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mb-3">
              Dosya indirmeden metin koduyla anında diğer cihaza aktarın:
            </p>

            {/* Copy button */}
            <button
              onClick={handleCopySyncCode}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 hover:border-emerald-500 text-[#0F172A] dark:text-slate-200 rounded-xl text-xs font-medium transition active:scale-98 mb-3"
            >
              {copiedSyncCode ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Senkronizasyon Kodu Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#64748B]" />
                  <span>Senkronizasyon Kodunu Kopyala</span>
                </>
              )}
            </button>

            {/* Paste & Apply */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Diğer cihazdan kopyalanan kodu buraya yapıştırın..."
                value={pasteSyncCode}
                onChange={(e) => setPasteSyncCode(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white text-xs placeholder-[#64748B]/60 focus:outline-none focus:border-emerald-500"
              />
              {syncCodeError && (
                <p className="text-[11px] text-rose-500">{syncCodeError}</p>
              )}
              <button
                onClick={handleApplySyncCode}
                disabled={!pasteSyncCode.trim()}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-medium rounded-xl transition shadow-xs"
              >
                Kodu Uygula ve Eşitle
              </button>
            </div>
          </div>

          <div className="text-[11px] text-[#64748B] dark:text-slate-400 pt-3 border-t border-[#E2E8F0] dark:border-slate-800">
            WhatsApp, Notlar veya Airdrop ile kodu diğer cihaza gönderip yapıştırabilirsiniz.
          </div>
        </div>
      </div>

      {/* Uçtan Uca Şifreli Kasa (E2EE Kilit Ayarı) */}
      <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Uçtan Uca Kasa Kilidi (E2EE)</h3>
          </div>
          {data.settings.enableEncryption && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Kasa Korumalı
            </span>
          )}
        </div>

        <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
          Cihazınızda PIN veya parola koruması tanımlayarak finansal bilgilerinizi koruyun. PBKDF2 ve AES-256 şifreleme ile anahtar sadece sizin parolanızdan türetilir.
        </p>

        {data.settings.enableEncryption ? (
          <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-800 dark:text-emerald-200">
                🔒 Bu cihazda yerel kasa kilidi devrede.
              </span>
              <button
                onClick={handleDisableEncryption}
                className="text-xs text-rose-500 hover:underline"
              >
                Kilidi Kaldır
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveMasterPassword} className="space-y-3 max-w-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="password"
                placeholder="Yeni Ana PIN / Parola"
                value={newMasterPass}
                onChange={(e) => setNewMasterPass(e.target.value)}
                className="px-3 py-2 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white text-xs focus:border-emerald-500 focus:outline-none"
              />
              <input
                type="password"
                placeholder="Parolayı Tekrarla"
                value={confirmMasterPass}
                onChange={(e) => setConfirmMasterPass(e.target.value)}
                className="px-3 py-2 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-[#0F172A] dark:text-white text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {passError && <p className="text-xs text-rose-500">{passError}</p>}
            {passSuccess && <p className="text-xs text-emerald-600 dark:text-emerald-400">{passSuccess}</p>}

            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition shadow-xs"
            >
              Kasa Kilidini Etkinleştir
            </button>
          </form>
        )}
      </div>

      {/* 5. Maaş Günü Döngüsü (Bütçe Dönemi) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">
              Maaş Günü & Bütçe Döngüsü
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Gelir ve harcamalarınızın hangi gün sıfırlanıp yeni bütçe dönemine gireceğini belirleyin.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => handleSetPayday(1)}
            className={`p-3 rounded-xl border text-left transition ${
              (data.settings.paydayDay || 1) === 1
                ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                : 'bg-slate-50 dark:bg-slate-900/60 border-[#E2E8F0] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-[#0F172A] dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold">Ayın 1'i</span>
              {(data.settings.paydayDay || 1) === 1 && (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400">
              Standart takvim ayı (1 - 30/31)
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleSetPayday(15)}
            className={`p-3 rounded-xl border text-left transition ${
              data.settings.paydayDay === 15
                ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                : 'bg-slate-50 dark:bg-slate-900/60 border-[#E2E8F0] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-[#0F172A] dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold">Ayın 15'i</span>
              {data.settings.paydayDay === 15 && (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400">
              Memur & 15'inde maaş alanlar (15 - 14)
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              const custom = prompt(
                'Maaş aldığınız günün numarasını girin (1 - 31):',
                String(data.settings.paydayDay || 1)
              );
              if (custom) {
                const parsed = parseInt(custom);
                if (!isNaN(parsed) && parsed >= 1 && parsed <= 31) {
                  handleSetPayday(parsed);
                }
              }
            }}
            className={`p-3 rounded-xl border text-left transition ${
              data.settings.paydayDay && data.settings.paydayDay !== 1 && data.settings.paydayDay !== 15
                ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                : 'bg-slate-50 dark:bg-slate-900/60 border-[#E2E8F0] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-[#0F172A] dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold">
                {data.settings.paydayDay && data.settings.paydayDay !== 1 && data.settings.paydayDay !== 15
                  ? `Ayın ${data.settings.paydayDay}. Günü`
                  : 'Özel Gün Seç'}
              </span>
              {data.settings.paydayDay &&
                data.settings.paydayDay !== 1 &&
                data.settings.paydayDay !== 15 && (
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                )}
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400">
              İstediğiniz bir günü belirleyin
            </p>
          </button>
        </div>
      </div>

      {/* 6. Excel / CSV İçe & Dışa Aktarma */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">
                Excel / CSV Finansal Veri Dışa & İçe Aktarma
              </h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Finansal kayıtlarınızı (gelirler, giderler, kredi kartı ve taksit borçları) Excel uyumlu Türkçe CSV formatında dışa aktarın.
              </p>
            </div>
          </div>
        </div>

        {/* Veri Özet Rozetleri */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Gelirler: <strong>{data.incomes?.length || 0}</strong> adet
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Giderler: <strong>{data.expenses?.length || 0}</strong> adet
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40 font-medium">
            <CreditCard className="w-3 h-3 text-indigo-500" />
            Borçlar: <strong>{(data.cards?.length || 0) + (data.installments?.length || 0)}</strong> adet ({data.cards?.length || 0} Kart, {data.installments?.length || 0} Taksit)
          </span>
        </div>

        {/* Başarı Geri Bildirimi */}
        {csvExportFeedback && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs">
            <Check className="w-4 h-4 shrink-0" />
            <span>{csvExportFeedback}</span>
          </div>
        )}

        {/* Eylem Butonları */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {/* Ana Buton: Tüm Finansal Verileri Dışa Aktar (Gelirler, Giderler, Borçlar) */}
          <button
            onClick={handleExportAllFinancialCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition active:scale-95 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Tüm Finansal Verileri CSV Olarak Dışa Aktar (Gelirler, Giderler, Borçlar)</span>
          </button>

          {/* İkincil Buton: Yalnızca Gelir & Gider CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-200 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-xs font-medium transition active:scale-95"
            title="Sadece nakit akışı ve harcama kayıtlarını dışa aktarır"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Yalnızca Gelir & Gider CSV</span>
          </button>

          {/* İçe Aktarma Butonu */}
          <input
            type="file"
            ref={csvFileInputRef}
            onChange={handleCSVFileChange}
            accept=".csv,text/csv"
            className="hidden"
          />
          <button
            onClick={() => csvFileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-200 border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-xs font-medium transition active:scale-95"
          >
            <Upload className="w-3.5 h-3.5 text-[#64748B] dark:text-slate-400" />
            <span>CSV / Ekstre Dosyası Yükle</span>
          </button>
        </div>

        <div className="text-[11px] text-[#64748B] dark:text-slate-400 pt-1 border-t border-[#E2E8F0] dark:border-slate-800/80 flex items-center gap-1.5">
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Excel ve Google E-Tablolar ile tam uyumludur. Türkçe karakterler (UTF-8 BOM) ve noktalı virgül (;) ayracı ile kusursuz açılır.</span>
        </div>
      </div>

      {/* 7. Başlangıç & Sıfırlama Yönetimi (Temiz Sayfa vs Örnekler) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">
            Bütçe Sıfırlama & Temiz Sayfa
          </h3>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
            Gerçek bütçenizle sıfırdan başlamak için demo verileri temizleyin veya test etmek için örnek verileri yükleyin.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Temiz Sayfa Aç */}
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-300">
                  Kendi Bütçemle Başla (Temiz Sayfa)
                </h4>
              </div>
              <p className="text-[11px] text-emerald-900/80 dark:text-emerald-300/80 leading-relaxed">
                Tüm örnek maaş ve giderleri temizler. Sadece kendi gerçek gelir, gider ve kartlarınızı girebileceğiniz tertemiz bir profil açar.
              </p>
            </div>
            <button
              onClick={() => {
                if (
                  confirm(
                    'Örnek demo verileri temizlenip tamamen boş, temiz bir bütçe sayfası açılacaktır. Onaylıyor musunuz?'
                  )
                ) {
                  if (onCleanSlateData) {
                    onCleanSlateData();
                  }
                }
              }}
              className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition active:scale-95 shadow-xs"
            >
              🧹 Demo Verileri Temizle & Başla
            </button>
          </div>

          {/* Örnek Verilere Dön */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <RotateCcw className="w-4 h-4 text-[#64748B] dark:text-slate-400" />
                <h4 className="text-xs font-bold text-[#0F172A] dark:text-slate-300">
                  Örnek (Demo) Şablonuna Dön
                </h4>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 leading-relaxed">
                Uygulamanın tüm özelliklerini inceleyebilmeniz için zengin örnek maaş, kart ve grafik verilerini yeniden yükler.
              </p>
            </div>
            <button
              onClick={() => {
                if (
                  confirm(
                    'Tüm mevcut kayıtlarınız silinecek ve başlangıç örnek şablonu yüklenecektir. Onaylıyor musunuz?'
                  )
                ) {
                  onResetData();
                }
              }}
              className="mt-3 w-full py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition active:scale-95"
            >
              Örnek Şablonu Yükle
            </button>
          </div>
        </div>
      </div>

      {/* QR MODAL */}
      {showQRModal && qrDataUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xs rounded-2xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-700 p-5 shadow-2xl text-center space-y-4">
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Telefondan Tara</h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Telefonunuzun kamerası ile QR kodu okutarak verilerinizi anında aktarabilirsiniz.
            </p>
            <div className="bg-white p-3 rounded-xl inline-block shadow-xs border border-slate-200">
              <img src={qrDataUrl} alt="Transfer QR Code" className="w-56 h-56 mx-auto" />
            </div>
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-white text-xs font-medium rounded-xl transition"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
