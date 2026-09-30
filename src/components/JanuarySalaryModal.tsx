import React, { useState } from 'react';
import { AppData, WiseExchange, Income } from '../types';
import {
  formatBRL,
  formatEUR,
  calculateWiseQuote,
  getTodayDateString,
} from '../utils/formatters';
import {
  Sparkles,
  X,
  CheckCircle2,
  ShieldCheck,
  Calculator,
  ArrowRight,
  Wallet,
} from 'lucide-react';

interface JanuarySalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
  onUpdateData: (updater: (prev: AppData) => AppData) => void;
}

export const JanuarySalaryModal: React.FC<JanuarySalaryModalProps> = ({
  isOpen,
  onClose,
  data,
  onUpdateData,
}) => {
  if (!isOpen) return null;

  const { settings, fixedCosts } = data;

  // Custos de Janeiro no Brasil
  const januaryMonthKey = '2027-01';
  const januaryCosts = fixedCosts.map((fc) => ({
    title: fc.title,
    amount: fc.monthlyAmount,
    isPaid: !!fc.paidMonths[januaryMonthKey],
  }));
  const totalJanuaryFixedCosts = fixedCosts.reduce((sum, fc) => {
    // If start month is after january 2027, skip
    if (fc.startMonth && januaryMonthKey < fc.startMonth) return sum;
    return sum + fc.monthlyAmount;
  }, 0);

  // Estados
  const [salaryGrossStr, setSalaryGrossStr] = useState('2400.00');
  const [exchangeRateStr, setExchangeRateStr] = useState(settings.estimatedRate.toString());
  const [markCostsPaid, setMarkCostsPaid] = useState(true);

  const salaryGross = parseFloat(salaryGrossStr.replace(',', '.')) || 0;
  const exchangeRate = parseFloat(exchangeRateStr.replace(',', '.')) || 6.15;
  
  // Sobra calculada após pagar as contas de janeiro no Brasil
  const calculatedLeftover = Math.max(0, salaryGross - totalJanuaryFixedCosts);
  const [tripAmountStr, setTripAmountStr] = useState(calculatedLeftover.toFixed(2));

  const tripAmount = parseFloat(tripAmountStr.replace(',', '.')) || 0;

  // Cálculo da conversão Wise
  const quote = calculateWiseQuote(
    tripAmount,
    exchangeRate,
    settings.wiseIofPercent,
    settings.wiseSpreadPercent
  );

  const handleConfirmInjection = (e: React.FormEvent) => {
    e.preventDefault();
    if (quote.eurAmount <= 0) return;

    const today = getTodayDateString();

    // 1. Criar novo registro de câmbio
    const newExchange: WiseExchange = {
      id: 'exch-jan-' + Date.now(),
      date: today,
      brlAmount: quote.brlAmount,
      iofRate: settings.wiseIofPercent / 100,
      spreadRate: settings.wiseSpreadPercent / 100,
      commercialRate: exchangeRate,
      effectiveRate: quote.effectiveRate,
      eurAmount: Math.round(quote.eurAmount * 100) / 100,
      notes: 'Injeção Salário de Janeiro (Sobra líquida)',
    };

    // 2. Criar entrada no módulo pré-viagem
    const newIncome: Income = {
      id: 'inc-jan-' + Date.now(),
      date: today,
      description: 'Salário de Janeiro (Recebido na Viagem)',
      totalAmount: salaryGross,
      tripAmount: tripAmount,
      category: 'salario',
      notes: `Custos de Janeiro no Brasil descontados (${formatBRL(totalJanuaryFixedCosts)})`,
    };

    onUpdateData((prev) => {
      // 3. Atualizar custos fixos de Janeiro como pagos se selecionado
      const updatedFixedCosts = markCostsPaid
        ? prev.fixedCosts.map((fc) => ({
            ...fc,
            paidMonths: {
              ...fc.paidMonths,
              [januaryMonthKey]: true,
            },
          }))
        : prev.fixedCosts;

      return {
        ...prev,
        exchanges: [newExchange, ...prev.exchanges],
        incomes: [newIncome, ...prev.incomes],
        fixedCosts: updatedFixedCosts,
      };
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                Injeção do Salário de Janeiro
              </h3>
              <p className="text-xs text-amber-100">
                Pague as contas do Brasil e converta a sobra para a carteira em Euros!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirmInjection} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Passo 1: Salário Bruto Recebido */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              1. Salário Recebido em Janeiro (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                R$
              </span>
              <input
                type="text"
                required
                value={salaryGrossStr}
                onChange={(e) => {
                  setSalaryGrossStr(e.target.value);
                  const val = parseFloat(e.target.value.replace(',', '.')) || 0;
                  const leftover = Math.max(0, val - totalJanuaryFixedCosts);
                  setTripAmountStr(leftover.toFixed(2));
                }}
                className="w-full pl-9 pr-3 py-2 text-base font-bold font-mono-num rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50"
              />
            </div>
          </div>

          {/* Passo 2: Dedução dos Custos Fixos do Brasil */}
          <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-950">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>2. Custos Fixos de Janeiro no Brasil</span>
              </span>
              <span className="font-mono-num text-amber-900">
                Total: -{formatBRL(totalJanuaryFixedCosts)}
              </span>
            </div>

            <div className="space-y-1 text-xs text-amber-900/80 pt-1">
              {januaryCosts.map((c, i) => (
                <div key={i} className="flex justify-between items-center text-[11px]">
                  <span>• {c.title}</span>
                  <span className="font-mono-num font-medium">{formatBRL(c.amount)}</span>
                </div>
              ))}
            </div>

            <label className="flex items-center gap-2 pt-2 border-t border-amber-200/60 cursor-pointer">
              <input
                type="checkbox"
                checked={markCostsPaid}
                onChange={(e) => setMarkCostsPaid(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="text-xs text-amber-950 font-medium">
                Marcar estas contas de Janeiro como pagas no Brasil
              </span>
            </label>
          </div>

          {/* Passo 3: Valor Destinado para Câmbio da Viagem */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                3. Aporte Líquido p/ Viagem (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  R$
                </span>
                <input
                  type="text"
                  required
                  value={tripAmountStr}
                  onChange={(e) => setTripAmountStr(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-base font-bold font-mono-num rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Sobra estimada: {formatBRL(calculatedLeftover)}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cotação Wise (R$/€)
              </label>
              <input
                type="text"
                required
                value={exchangeRateStr}
                onChange={(e) => setExchangeRateStr(e.target.value)}
                className="w-full px-3 py-2 text-base font-bold font-mono-num rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50"
              />
            </div>
          </div>

          {/* Resultado em Euros a Injetar */}
          <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-500/50 text-center">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Euros a Injetar Imediatamente na Carteira
            </span>
            <div className="text-3xl font-extrabold text-emerald-600 font-mono-num mt-1">
              +{formatEUR(quote.eurAmount)}
            </div>
            <div className="text-xs text-emerald-800/80 mt-1 font-mono-num">
              (R$ {formatBRL(quote.brlAmount)} líquido de taxas Wise)
            </div>
          </div>

          {/* Botão de Ação */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/30 transition transform active:scale-[0.99] cursor-pointer"
          >
            <Wallet className="w-5 h-5 text-amber-200" />
            <span>Confirmar Injeção de {formatEUR(quote.eurAmount)} na Carteira</span>
          </button>
        </form>
      </div>
    </div>
  );
};
