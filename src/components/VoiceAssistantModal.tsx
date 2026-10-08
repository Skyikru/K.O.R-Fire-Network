import React, { useState, useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { parseVoiceCommand, VoiceParsedResult } from '../utils/voiceParser';
import { formatCurrency, formatDateTurkish } from '../utils/storage';
import {
  Mic,
  MicOff,
  Sparkles,
  X,
  Check,
  TrendingDown,
  TrendingUp,
  CheckSquare,
  Calendar,
  AlertCircle,
  Tag,
  ArrowRight,
  Flame,
} from 'lucide-react';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyParsedResult: (result: VoiceParsedResult, autoSave: boolean) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onApplyParsedResult,
}) => {
  const {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const [manualText, setManualText] = useState('');
  const [parsedResult, setParsedResult] = useState<VoiceParsedResult | null>(null);

  // Auto-start listening when modal opens
  useEffect(() => {
    if (isOpen) {
      setManualText('');
      setParsedResult(null);
      resetTranscript();
      if (isSupported) {
        startListening();
      }
    } else {
      stopListening();
    }
  }, [isOpen, isSupported]);

  // When speech transcript changes, update parsed result
  useEffect(() => {
    const activeText = transcript || manualText;
    if (activeText.trim().length > 2) {
      const parsed = parseVoiceCommand(activeText);
      setParsedResult(parsed);
    } else {
      setParsedResult(null);
    }
  }, [transcript, manualText]);

  if (!isOpen) return null;

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleExampleClick = (example: string) => {
    setManualText(example);
    const parsed = parseVoiceCommand(example);
    setParsedResult(parsed);
    stopListening();
  };

  const handleConfirm = (autoSave: boolean) => {
    if (!parsedResult) return;
    onApplyParsedResult(parsedResult, autoSave);
    onClose();
  };

  const EXAMPLE_COMMANDS = [
    'Bugün 200 TL market harcaması ekle',
    'Yarın spor yap görevi ekle',
    '350 TL elektrik faturası gideri ekle',
    'Acil rapor hazırla görevi ekle',
    '5000 TL maaş geliri ekle',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white">
                Sesli Asistan ile Ekle
              </h3>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                Web Speech API ile sesli harcama veya görev oluşturma
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Microphone Interactive Hero */}
          <div className="flex flex-col items-center justify-center py-4 bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl border border-[#E2E8F0] dark:border-slate-800">
            {/* Animated Mic Button */}
            <div className="relative">
              {isListening && (
                <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
              )}
              <button
                type="button"
                onClick={handleToggleMic}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-md ${
                  isListening
                    ? 'bg-rose-500 text-white ring-4 ring-rose-500/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
                title={isListening ? 'Dinlemeyi Durdur' : 'Dinlemeyi Başlat'}
              >
                {isListening ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
              </button>
            </div>

            <div className="mt-3 text-center">
              <span className={`text-xs font-semibold ${isListening ? 'text-rose-500 animate-pulse' : 'text-[#64748B] dark:text-slate-400'}`}>
                {isListening ? 'Sizi Dinliyor... Konuşun' : 'Mikrofona basarak konuşun'}
              </span>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                Türkçe ses algılama (Web Speech API)
              </p>
            </div>

            {/* Transcript display */}
            <div className="w-full px-4 mt-3">
              <div className="min-h-[44px] p-3 rounded-xl bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 text-xs text-center flex items-center justify-center">
                {transcript ? (
                  <span className="text-[#0F172A] dark:text-white font-medium italic">
                    "{transcript}"
                  </span>
                ) : manualText ? (
                  <span className="text-[#0F172A] dark:text-white font-medium italic">
                    "{manualText}"
                  </span>
                ) : (
                  <span className="text-[#64748B]/70 dark:text-slate-500">
                    Örn: "Bugün 200 TL market harcaması ekle"
                  </span>
                )}
              </div>
            </div>

            {/* Error or Fallback Message */}
            {error && (
              <div className="mx-4 mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!isSupported && (
              <div className="mx-4 mt-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Tarayıcınızda Web Speech API mikrofon desteği bulunmuyor. Aşağıdaki kutucuğa yazarak da deneyebilirsiniz.</span>
              </div>
            )}
          </div>

          {/* Parsed Result Preview Card */}
          {parsedResult && (
            <div className="p-4 rounded-xl bg-white dark:bg-[#131d2e] border-2 border-emerald-500/40 shadow-xs space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Ses Algılandı & Ayrıştırıldı
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  parsedResult.type === 'expense'
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                    : parsedResult.type === 'income'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                    : 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30'
                }`}>
                  {parsedResult.type === 'expense' ? 'Gider Girişi' : parsedResult.type === 'income' ? 'Gelir Girişi' : 'Yeni Görev'}
                </span>
              </div>

              {parsedResult.type === 'expense' && (
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] dark:text-slate-400">Tutar:</span>
                    <strong className="text-base text-rose-600 dark:text-rose-400 font-extrabold">
                      {formatCurrency(parsedResult.amount)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] dark:text-slate-400">Kategori:</span>
                    <span className="font-semibold text-[#0F172A] dark:text-white flex items-center gap-1">
                      <Tag className="w-3 h-3 text-[#64748B]" /> {parsedResult.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] dark:text-slate-400">Tarih:</span>
                    <span className="text-[#0F172A] dark:text-slate-200">
                      {formatDateTurkish(parsedResult.date)}
                    </span>
                  </div>
                </div>
              )}

              {parsedResult.type === 'task' && (
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] dark:text-slate-400">Görev:</span>
                    <strong className="text-sm text-[#0F172A] dark:text-white font-bold">
                      {parsedResult.title}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] dark:text-slate-400">Öncelik:</span>
                    <span className={`px-1.5 py-0.5 rounded font-semibold text-[10px] ${
                      parsedResult.priority === 'high'
                        ? 'bg-rose-500/10 text-rose-600'
                        : parsedResult.priority === 'medium'
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {parsedResult.priority === 'high' ? 'Yüksek' : parsedResult.priority === 'medium' ? 'Orta' : 'Düşük'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] dark:text-slate-400">Tarih:</span>
                    <span className="text-[#0F172A] dark:text-slate-200">
                      {formatDateTurkish(parsedResult.dueDate)}
                    </span>
                  </div>
                </div>
              )}

              {parsedResult.type === 'income' && (
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] dark:text-slate-400">Gelir Tutarı:</span>
                    <strong className="text-base text-emerald-600 dark:text-emerald-400 font-extrabold">
                      {formatCurrency(parsedResult.amount)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] dark:text-slate-400">Kaynak:</span>
                    <span className="font-semibold text-[#0F172A] dark:text-white">
                      {parsedResult.source}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2 border-t border-[#E2E8F0] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleConfirm(false)}
                  className="flex-1 py-2 px-3 bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white text-xs font-semibold rounded-xl hover:bg-slate-50 transition shadow-xs"
                >
                  Formu Doldur & İncele
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirm(true)}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition shadow-xs active:scale-95"
                >
                  Otomatik Kaydet ✓
                </button>
              </div>
            </div>
          )}

          {/* Quick Example Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[#64748B] dark:text-slate-400">
              Örnek Sesli Komutlar (Tıklayarak da deneyebilirsiniz):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLE_COMMANDS.map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  onClick={() => handleExampleClick(cmd)}
                  className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-300 transition text-left border border-slate-200/80 dark:border-slate-700/60"
                >
                  "{cmd}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#64748B] dark:text-slate-400">
            Gizlilik: Ses kaydı sunucuya iletilmez, yerel işlenir.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
