import React, { useState } from 'react';
import { AppData, WiseExchange } from '../types';
import {
  formatBRL,
  formatEUR,
  calculateWiseQuote,
  getTodayDateString,
  formatDateBR,
} from '../utils/formatters';
import {
  ArrowLeftRight,
  X,
  CheckCircle2,
  Trash2,
  Sparkles,
  CreditCard,
  Clock,
  Wallet,
  ShieldCheck,
} from 'lucide-react';

interface WiseExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
  onUpdateData: (updater: (prev: AppData) => AppData) => void;
}

export const WiseExchangeModal: React.FC<WiseExchangeModalProps> = ({
  isOpen,
  onClose,
  data,
  onUpdateData,
}) => {
  if (!isOpen) return null;

  const { settings, exchanges } = data;

  // Estados da calculadora
  const [brlInput, setBrlInput] = useState('1000');
  const [commercialRateInput, setCommercialRateInput] = useState(settings.estimatedRate.toString());
  const [iofPercentInput, setIofPercentInput] = useState(settings.wiseIofPercent.toString());
  const [spreadPercentInput, setSpreadPercentInput] = useState(settings.wiseSpreadPercent.toString());
  const [exchangeDate, setExchangeDate] = useState(getTodayDateString());
  const [exchangeNotes, setExchangeNotes] = useState('Cartão Internacional');
  const [successToast, setSuccessToast] = useState(false);

  // Cálculos dinâmicos
  const numBrl = parseFloat(brlInput.replace(',', '.')) || 0;
  const numRate = parseFloat(commercialRateInput.replace(',', '.')) || 6.15;
  const numIof = parseFloat(iofPercentInput.replace(',', '.')) || 3.5;
  const numSpread = parseFloat(spreadPercentInput.replace(',', '.')) || 1.2;

  const quote = calculateWiseQuote(numBrl, numRate, numIof, numSpread);

  // Presets de cartões / contas
  const applyPreset = (iof: number, spread: number, defaultNote: string) => {
    setIofPercentInput(iof.toString());
    setSpreadPercentInput(spread.toString());
    setExchangeNotes(defaultNote);
  };

  const handleRegisterExchange = (e: React.FormEvent) => {
    e.preventDefault();
    if (quote.eurAmount <= 0) return;

    const newExchange: WiseExchange = {
      id: 'exch-' + Date.now(),
      date: exchangeDate,
      brlAmount: quote.brlAmount,
      iofRate: numIof / 100,
      spreadRate: numSpread / 100,
      commercialRate: numRate,
      effectiveRate: quote.effectiveRate,
      eurAmount: Math.round(quote.eurAmount * 100) / 100,
      notes: exchangeNotes.trim() || 'Conversão de Moeda',
    };

    onUpdateData((prev) => ({
      ...prev,
      exchanges: [newExchange, ...prev.exchanges],
      // Atualiza também a cotação estimada padrão para acompanhar
      settings: {
        ...prev.settings,
        estimatedRate: numRate,
      },
    }));

    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
    }, 3000);

    setExchangeNotes('Cartão Internacional');
  };

  const handleDeleteExchange = (id: string) => {
    onUpdateData((prev) => ({
      ...prev,
      exchanges: prev.exchanges.filter((ex) => ex.id !== id),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Header do Modal */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                Simulador & Registro de Câmbio
              </h3>
              <p className="text-xs text-emerald-100">
                Para qualquer cartão ou conta (Nomad, Wise, Inter, C6, Revolut, etc.)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {successToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Câmbio registrado com sucesso! Os Euros já foram creditados na sua Carteira (€).</span>
            </div>
          )}

          {/* Atalhos rápidos para tipos de cartão */}
          <div>
            <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Escolher tipo de cartão / conta:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset(1.1, 1.2, 'Nomad / C6 / Inter')}
                className="px-2 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 text-[11px] font-medium text-center transition cursor-pointer"
              >
                🌍 Conta Global (1.1%)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(3.5, 1.2, 'Cartão Débito')}
                className="px-2 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 text-[11px] font-medium text-center transition cursor-pointer"
              >
                💳 Débito Inter (3.5%)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(4.38, 4.0, 'Cartão de Crédito')}
                className="px-2 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 text-[11px] font-medium text-center transition cursor-pointer"
              >
                💳 Crédito Tradicional
              </button>
              <button
                type="button"
                onClick={() => applyPreset(1.1, 0.0, 'Dinheiro em Espécie')}
                className="px-2 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 text-[11px] font-medium text-center transition cursor-pointer"
              >
                💶 Casa de Câmbio
              </button>
            </div>
          </div>

          {/* Calculadora em Tempo Real */}
          <form onSubmit={handleRegisterExchange} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Valor a Enviar em R$ */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Você envia em Reais (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    R$
                  </span>
                  <input
                    type="text"
                    required
                    value={brlInput}
                    onChange={(e) => setBrlInput(e.target.value)}
                    placeholder="1000.00"
                    className="w-full pl-9 pr-3 py-2.5 text-base font-bold font-mono-num rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/60"
                  />
                </div>
              </div>

              {/* Cotação Comercial do Euro */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cotação Comercial do Euro (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    1€ =
                  </span>
                  <input
                    type="text"
                    required
                    value={commercialRateInput}
                    onChange={(e) => setCommercialRateInput(e.target.value)}
                    placeholder="6.15"
                    className="w-full pl-11 pr-3 py-2.5 text-base font-bold font-mono-num rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/60"
                  />
                </div>
              </div>
            </div>

            {/* Ajuste de Tarifas: IOF e Spread Personalizáveis */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
                <span className="flex items-center gap-1.5 font-bold text-slate-800">
                  <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                  Taxas da Operação (Totalmente Personalizáveis):
                </span>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                  Qualquer Cartão
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">IOF da Operação (%)</span>
                  <div className="flex items-center gap-1 mt-0.5 font-bold font-mono-num text-slate-800">
                    <input
                      type="text"
                      value={iofPercentInput}
                      onChange={(e) => setIofPercentInput(e.target.value)}
                      className="w-14 px-1.5 py-1 bg-white border border-slate-300 rounded-lg text-center"
                    />
                    <span>% ({formatBRL(quote.iofAmount)})</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500">Spread / Taxa do Cartão (%)</span>
                  <div className="flex items-center gap-1 mt-0.5 font-bold font-mono-num text-slate-800">
                    <input
                      type="text"
                      value={spreadPercentInput}
                      onChange={(e) => setSpreadPercentInput(e.target.value)}
                      className="w-14 px-1.5 py-1 bg-white border border-slate-300 rounded-lg text-center"
                    />
                    <span>% ({formatBRL(quote.spreadAmount)})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD DE RESULTADO LÍQUIDO */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-500/50 rounded-2xl p-4 text-center">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Valor Líquido a Receber em Euros
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700 font-mono-num mt-1">
                {formatEUR(quote.eurAmount)}
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-emerald-800/90 font-mono-num">
                <span>Total de taxas: {formatBRL(quote.totalFees)}</span>
                <span>•</span>
                <span>Cotação Efetiva Final: 1€ = {formatBRL(quote.effectiveRate)}</span>
              </div>
            </div>

            {/* Campos complementares para o registro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Data da Conversão
                </label>
                <input
                  type="date"
                  value={exchangeDate}
                  onChange={(e) => setExchangeDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Identificação do Cartão / Conta
                </label>
                <input
                  type="text"
                  placeholder="Ex: Nomad, Inter Global, C6, Wise, Espécie..."
                  value={exchangeNotes}
                  onChange={(e) => setExchangeNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Botão Registrar Câmbio */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition transform active:scale-[0.99] cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Registrar Câmbio & Creditar na Carteira (€)</span>
            </button>
          </form>

          {/* HISTÓRICO DE CÂMBIOS REALIZADOS */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Histórico de Conversões Realizadas ({exchanges.length})</span>
            </h4>

            {exchanges.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-xl">
                Nenhum câmbio registrado ainda. Simule e registre quando comprar euros na sua conta ou cartão.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {exchanges.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800">
                        +{formatEUR(ex.eurAmount)}
                        <span className="text-slate-400 font-normal ml-2">
                          (Enviado: {formatBRL(ex.brlAmount)})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {formatDateBR(ex.date)} • Efetiva: 1€ = {formatBRL(ex.effectiveRate)}
                        {ex.notes && ` • ${ex.notes}`}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteExchange(ex.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 rounded transition cursor-pointer"
                      title="Excluir câmbio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
