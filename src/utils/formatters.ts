/**
 * Formatting and financial math utilities
 */

export function formatBRL(value: number): string {
  if (isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatEUR(value: number): string {
  if (isNaN(value)) return '0,00 €';
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, decimals = 2): string {
  if (isNaN(value)) return '0';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  return `${day}/${month}/${year}`;
}

export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getRelativeDayLabel(dateStr: string): string {
  const today = getTodayDateString();
  if (dateStr === today) return 'Hoje';
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yDay = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  if (dateStr === yDay) return 'Ontem';
  
  return formatDateBR(dateStr);
}

export function formatIncomeCategory(category?: string): string {
  if (!category) return 'Outras Entradas';
  if (category === 'salario') return 'Salário / Trabalho';
  if (category === 'ajuda_pai' || category === 'ajuda_familia') return 'Ajuda da Família';
  if (category === 'economias') return 'Economias Pessoais';
  if (category === 'renda_extra') return 'Renda Extra / Freela';
  if (category === 'outros') return 'Outras Entradas';
  return category;
}

/**
 * Calculates trip days stats: total days, elapsed days, remaining days.
 */
export function calculateTripDays(
  startDateStr: string,
  endDateStr: string,
  currentSimulatedDate?: string
) {
  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T23:59:59');
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  const referenceDate = currentSimulatedDate ? new Date(currentSimulatedDate + 'T12:00:00') : new Date();

  let elapsedDays = 0;
  let remainingDays = totalDays;
  let status: 'before' | 'during' | 'after' = 'before';

  if (referenceDate < start) {
    status = 'before';
    elapsedDays = 0;
    remainingDays = totalDays;
  } else if (referenceDate > end) {
    status = 'after';
    elapsedDays = totalDays;
    remainingDays = 0;
  } else {
    status = 'during';
    const diff = referenceDate.getTime() - start.getTime();
    elapsedDays = Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
    remainingDays = Math.max(1, totalDays - elapsedDays + 1);
  }

  return {
    totalDays,
    elapsedDays: Math.min(totalDays, elapsedDays),
    remainingDays: Math.max(1, remainingDays),
    status,
  };
}

/**
 * Calculates Wise exchange conversion:
 * IOF: default 3.5% (or custom)
 * Spread / Taxa Wise: e.g. 1.2%
 */
export function calculateWiseQuote(
  brlAmount: number,
  commercialRate: number,
  iofPercent = 3.5,
  spreadPercent = 1.2
) {
  if (!brlAmount || brlAmount <= 0 || !commercialRate || commercialRate <= 0) {
    return {
      brlAmount: 0,
      iofAmount: 0,
      spreadAmount: 0,
      totalFees: 0,
      netBrl: 0,
      eurAmount: 0,
      effectiveRate: commercialRate || 6.15,
    };
  }

  // Wise standard formula:
  // Gross BRL minus IOF and Wise service fee = Net BRL converted at commercial rate
  const iofAmount = brlAmount * (iofPercent / 100);
  const spreadAmount = brlAmount * (spreadPercent / 100);
  const totalFees = iofAmount + spreadAmount;
  const netBrl = Math.max(0, brlAmount - totalFees);
  
  const eurAmount = netBrl / commercialRate;
  const effectiveRate = eurAmount > 0 ? brlAmount / eurAmount : commercialRate;

  return {
    brlAmount,
    iofAmount,
    spreadAmount,
    totalFees,
    netBrl,
    eurAmount,
    effectiveRate,
  };
}
