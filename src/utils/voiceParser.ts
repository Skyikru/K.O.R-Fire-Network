import { ExpenseCategory, IncomeSource, Priority } from '../types';

export interface VoiceParsedExpense {
  type: 'expense';
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  isMandatory?: boolean;
  note?: string;
  rawText: string;
}

export interface VoiceParsedTask {
  type: 'task';
  title: string;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  rawText: string;
}

export interface VoiceParsedIncome {
  type: 'income';
  amount: number;
  source: IncomeSource;
  date: string; // YYYY-MM-DD
  note?: string;
  rawText: string;
}

export type VoiceParsedResult = VoiceParsedExpense | VoiceParsedTask | VoiceParsedIncome;

// Helper to format Date to YYYY-MM-DD
function toDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Convert Turkish word numbers to digits
function parseTurkishNumberWords(text: string): number | null {
  const lower = text.toLowerCase();
  
  // First look for numeric digits like "200", "200,50", "200.00"
  const digitMatch = lower.match(/(\d+(?:[.,]\d+)?)/);
  if (digitMatch) {
    const cleanNum = digitMatch[1].replace(',', '.');
    const val = parseFloat(cleanNum);
    if (!isNaN(val) && val > 0) return val;
  }

  // Word-based numbers in Turkish
  const ones: Record<string, number> = {
    bir: 1, iki: 2, üç: 3, dört: 4, beş: 5, altı: 6, yedi: 7, sekiz: 8, dokuz: 9,
  };
  const tens: Record<string, number> = {
    on: 10, yirmi: 20, otuz: 30, kırk: 40, elli: 50, altmış: 60, yetmiş: 70, seksen: 80, doksan: 90,
  };

  // Check simple common phrases e.g. "iki yüz elli", "beş yüz", "bin", "üç bin"
  let total = 0;
  const words = lower.split(/\s+/);
  let current = 0;

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (ones[w]) {
      current += ones[w];
    } else if (tens[w]) {
      current += tens[w];
    } else if (w === 'yüz') {
      current = current === 0 ? 100 : current * 100;
    } else if (w === 'bin') {
      current = current === 0 ? 1000 : current * 1000;
      total += current;
      current = 0;
    } else {
      if (current > 0) {
        total += current;
        current = 0;
      }
    }
  }
  total += current;

  return total > 0 ? total : null;
}

// Extract date from Turkish natural speech
function extractDate(text: string): string {
  const lower = text.toLowerCase();
  const now = new Date();

  if (lower.includes('yarın') || lower.includes('yarına')) {
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    return toDateStr(tomorrow);
  }

  if (lower.includes('dün') || lower.includes('düne')) {
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    return toDateStr(yesterday);
  }

  if (lower.includes('haftaya') || lower.includes('gelecek hafta')) {
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    return toDateStr(nextWeek);
  }

  // Days of week
  const weekdays: Record<string, number> = {
    pazar: 0,
    pazartesi: 1,
    salı: 2,
    çarşamba: 3,
    perşembe: 4,
    cuma: 5,
    cumartesi: 6,
  };

  for (const [dayName, dayIndex] of Object.entries(weekdays)) {
    if (lower.includes(dayName)) {
      const targetDate = new Date();
      let diff = (dayIndex - now.getDay() + 7) % 7;
      if (diff === 0 && !lower.includes('bugün')) diff = 7;
      targetDate.setDate(now.getDate() + diff);
      return toDateStr(targetDate);
    }
  }

  // Default: Today
  return toDateStr(now);
}

// Categorize expense based on words
function extractExpenseCategory(text: string): { category: ExpenseCategory; isMandatory: boolean } {
  const lower = text.toLowerCase();

  if (
    lower.includes('market') ||
    lower.includes('bakkal') ||
    lower.includes('süpermarket') ||
    lower.includes('migros') ||
    lower.includes('manav') ||
    lower.includes('kasap') ||
    lower.includes('gıda') ||
    lower.includes('ekmek') ||
    lower.includes('kahvaltı')
  ) {
    return { category: 'Market & Gıda', isMandatory: false };
  }

  if (
    lower.includes('fatura') ||
    lower.includes('elektrik') ||
    lower.includes('su') ||
    lower.includes('doğalgaz') ||
    lower.includes('gaz') ||
    lower.includes('internet') ||
    lower.includes('telefon') ||
    lower.includes('abonelik') ||
    lower.includes('netflix') ||
    lower.includes('spotify')
  ) {
    return { category: 'Fatura & Abonelik', isMandatory: true };
  }

  if (lower.includes('kira') || lower.includes('aidat') || lower.includes('ev') || lower.includes('konut')) {
    return { category: 'Kira & Konut', isMandatory: true };
  }

  if (
    lower.includes('benzin') ||
    lower.includes('mazot') ||
    lower.includes('yakıt') ||
    lower.includes('otobüs') ||
    lower.includes('metro') ||
    lower.includes('akbil') ||
    lower.includes('taksi') ||
    lower.includes('ulaşım') ||
    lower.includes('bilet') ||
    lower.includes('otopark')
  ) {
    return { category: 'Ulaşım & Yakıt', isMandatory: false };
  }

  if (
    lower.includes('sağlık') ||
    lower.includes('eczane') ||
    lower.includes('ilaç') ||
    lower.includes('doktor') ||
    lower.includes('hastane') ||
    lower.includes('berber') ||
    lower.includes('kuaför') ||
    lower.includes('bakım')
  ) {
    return { category: 'Sağlık & Bakım', isMandatory: false };
  }

  if (
    lower.includes('kahve') ||
    lower.includes('starbucks') ||
    lower.includes('kafe') ||
    lower.includes('cafe') ||
    lower.includes('restoran') ||
    lower.includes('yemek') ||
    lower.includes('dışarıda') ||
    lower.includes('eğlence') ||
    lower.includes('sinema') ||
    lower.includes('bar') ||
    lower.includes('sosyal')
  ) {
    return { category: 'Eğlence & Sosyal', isMandatory: false };
  }

  if (
    lower.includes('giyim') ||
    lower.includes('kıyafet') ||
    lower.includes('ayakkabı') ||
    lower.includes('pantolon') ||
    lower.includes('gömlek') ||
    lower.includes('elbise') ||
    lower.includes('alışveriş') ||
    lower.includes('mont')
  ) {
    return { category: 'Giyim & Alışveriş', isMandatory: false };
  }

  if (
    lower.includes('eğitim') ||
    lower.includes('kurs') ||
    lower.includes('kitap') ||
    lower.includes('ders') ||
    lower.includes('okul')
  ) {
    return { category: 'Eğitim', isMandatory: false };
  }

  if (lower.includes('zorunlu') || lower.includes('borç') || lower.includes('taksit')) {
    return { category: 'Zorunlu Ödeme', isMandatory: true };
  }

  return { category: 'Diğer', isMandatory: false };
}

// Extract income source
function extractIncomeSource(text: string): IncomeSource {
  const lower = text.toLowerCase();
  if (lower.includes('maaş')) return 'Maaş';
  if (lower.includes('ek gelir') || lower.includes('prim') || lower.includes('ikramiye')) return 'Ek Gelir';
  if (lower.includes('serbest') || lower.includes('freelance') || lower.includes('danışmanlık')) return 'Serbest Meslek';
  if (lower.includes('yatırım') || lower.includes('faiz') || lower.includes('temettü') || lower.includes('kripto')) return 'Yatırım / Getiri';
  if (lower.includes('satış') || lower.includes('sahibinden') || lower.includes('dolap')) return 'Satış';
  return 'Diğer';
}

// Extract priority for task
function extractPriority(text: string): Priority {
  const lower = text.toLowerCase();
  if (
    lower.includes('acil') ||
    lower.includes('yüksek') ||
    lower.includes('önemli') ||
    lower.includes('hemen') ||
    lower.includes('kritik')
  ) {
    return 'high';
  }
  if (
    lower.includes('düşük') ||
    lower.includes('önemsiz') ||
    lower.includes('boş zaman') ||
    lower.includes('acele yok')
  ) {
    return 'low';
  }
  return 'medium';
}

// Clean title from command clutter
function cleanTaskTitle(text: string): string {
  let cleaned = text
    .replace(/(?:görevi|görev|planı|olarak)?\s*(?:ekle|kaydet|oluştur|yaz|koy)\s*$/i, '')
    .replace(/^(?:lütfen|bana|hemen|bugün|yarın|dün)\s+/i, '')
    .replace(/(?:yüksek|orta|düşük|acil)\s+öncelikli\s*/i, '')
    .replace(/(?:görevi|görev|plan)\s*$/i, '')
    .trim();

  // Capitalize first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toLocaleUpperCase('tr-TR') + cleaned.slice(1);
  } else {
    cleaned = 'Yeni Görev';
  }

  return cleaned;
}

/**
 * Main parse function for Turkish voice input
 */
export function parseVoiceCommand(transcript: string): VoiceParsedResult {
  const trimmed = transcript.trim();
  const lower = trimmed.toLowerCase();
  const dateStr = extractDate(trimmed);
  const amount = parseTurkishNumberWords(trimmed);

  // 1. Check if it's an Income command
  const isIncomeKeyword =
    lower.includes('maaş') ||
    lower.includes('gelir') ||
    lower.includes('tahsilat') ||
    lower.includes('kazandım') ||
    lower.includes('yattı') ||
    lower.includes('para geldi');

  if (isIncomeKeyword && amount !== null && amount > 0) {
    const source = extractIncomeSource(trimmed);
    return {
      type: 'income',
      amount,
      source,
      date: dateStr,
      note: trimmed,
      rawText: trimmed,
    };
  }

  // 2. Check if it's an Expense command
  const isExpenseKeyword =
    lower.includes('harcama') ||
    lower.includes('harcaması') ||
    lower.includes('gider') ||
    lower.includes('gideri') ||
    lower.includes('ödedim') ||
    lower.includes('aldım') ||
    lower.includes('harcadım') ||
    lower.includes('fatura') ||
    lower.includes('market') ||
    lower.includes('masraf') ||
    lower.includes('tl') ||
    lower.includes('lira');

  // If there's an amount and expense keyword (or specific expense category)
  if (amount !== null && amount > 0 && (isExpenseKeyword || lower.includes('tl') || lower.includes('lira'))) {
    const { category, isMandatory } = extractExpenseCategory(trimmed);
    
    // Clean note
    let note = trimmed;
    if (note.length > 60) {
      note = note.slice(0, 60);
    }

    return {
      type: 'expense',
      amount,
      category,
      date: dateStr,
      isMandatory,
      note,
      rawText: trimmed,
    };
  }

  // 3. Otherwise: Task command
  const priority = extractPriority(trimmed);
  const taskTitle = cleanTaskTitle(trimmed);

  return {
    type: 'task',
    title: taskTitle,
    priority,
    dueDate: dateStr,
    rawText: trimmed,
  };
}
