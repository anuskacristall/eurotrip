import React, { useState } from 'react';
import { AppData, AppSettings } from '../types';
import { Settings, X, Save, Trash2, AlertTriangle, Github } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
  onUpdateData: (updater: (prev: AppData) => AppData) => void;
  onResetAllData: () => void;
  onOpenGitHubModal?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  data,
  onUpdateData,
  onResetAllData,
  onOpenGitHubModal,
}) => {
  if (!isOpen) return null;

  const { settings, manualEurAdded } = data;

  const [euroGoalStr, setEuroGoalStr] = useState(settings.euroGoal.toString());
  const [estimatedRateStr, setEstimatedRateStr] = useState(settings.estimatedRate.toString());
  const [initialSavingsBrlStr, setInitialSavingsBrlStr] = useState((settings.initialSavingsBrl ?? 0).toString());
  const [tripStartDate, setTripStartDate] = useState(settings.tripStartDate);
  const [tripEndDate, setTripEndDate] = useState(settings.tripEndDate);
  const [wiseIofStr, setWiseIofStr] = useState(settings.wiseIofPercent.toString());
  const [wiseSpreadStr, setWiseSpreadStr] = useState(settings.wiseSpreadPercent.toString());
  const [manualEurStr, setManualEurStr] = useState(manualEurAdded.toString());

  // Estado para confirmação interna sem window.confirm
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const euroGoal = parseFloat(euroGoalStr.replace(',', '.')) || 1000;
    const estimatedRate = parseFloat(estimatedRateStr.replace(',', '.')) || 6.15;
    
    const parsedSavings = parseFloat(initialSavingsBrlStr.replace(',', '.'));
    const initialSavingsBrl = isNaN(parsedSavings) ? 0 : parsedSavings;

    const wiseIofPercent = parseFloat(wiseIofStr.replace(',', '.')) || 1.1;
    const wiseSpreadPercent = parseFloat(wiseSpreadStr.replace(',', '.')) || 1.2;
    const manualEur = parseFloat(manualEurStr.replace(',', '.')) || 0;

    const newSettings: AppSettings = {
      euroGoal,
      estimatedRate,
      initialSavingsBrl,
      tripStartDate,
      tripEndDate,
      wiseIofPercent,
      wiseSpreadPercent,
    };

    onUpdateData((prev) => ({
      ...prev,
      settings: newSettings,
      manualEurAdded: manualEur,
    }));

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                Parâmetros & Metas
              </h3>
              <p className="text-xs text-slate-400">
                Ajuste os valores de referência da sua viagem
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

        {/* Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Meta em Euros */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Meta em Euros (€)
              </label>
              <input
                type="text"
                required
                value={euroGoalStr}
                onChange={(e) => setEuroGoalStr(e.target.value)}
                className="w-full px-3 py-2 text-sm font-bold font-mono-num rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500"
              />
              <span className="text-[10px] text-slate-400">Padrão: 1.000 €</span>
            </div>

            {/* Cotação Estimada Padrão */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cotação Padrão (R$/€)
              </label>
              <input
                type="text"
                required
                value={estimatedRateStr}
                onChange={(e) => setEstimatedRateStr(e.target.value)}
                className="w-full px-3 py-2 text-sm font-bold font-mono-num rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500"
              />
              <span className="text-[10px] text-slate-400">Padrão: R$ 6,15 por €</span>
            </div>

            {/* Saldo Inicial Guardado */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Saldo Inicial Guardado (R$)
              </label>
              <input
                type="text"
                value={initialSavingsBrlStr}
                onChange={(e) => setInitialSavingsBrlStr(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm font-bold font-mono-num rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500"
              />
              <span className="text-[10px] text-slate-400">Quanto você já tem guardado em R$</span>
            </div>

            {/* Saldo Adicional Manual em Euros */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Euros em Espécie / Saldo Inicial (€)
              </label>
              <input
                type="text"
                value={manualEurStr}
                onChange={(e) => setManualEurStr(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm font-bold font-mono-num rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500"
              />
              <span className="text-[10px] text-slate-400">Euros já comprados ou em notas</span>
            </div>
          </div>

          {/* Período da Viagem */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">
              Período da Viagem (Europa)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Data de Início</label>
                <input
                  type="date"
                  value={tripStartDate}
                  onChange={(e) => setTripStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Data de Término</label>
                <input
                  type="date"
                  value={tripEndDate}
                  onChange={(e) => setTripEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Taxas do Cartão / Câmbio */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">
              Taxas do Cartão & Câmbio
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">IOF (%)</label>
                <input
                  type="text"
                  value={wiseIofStr}
                  onChange={(e) => setWiseIofStr(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Spread / Taxa (%)</label>
                <input
                  type="text"
                  value={wiseSpreadStr}
                  onChange={(e) => setWiseSpreadStr(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono-num"
                />
              </div>
            </div>
          </div>

          {/* Hospedagem Gratuita no GitHub Pages */}
          {onOpenGitHubModal && (
            <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Github className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    Hospedar no GitHub Pages
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                      Grátis
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Publique com login Google e banco na nuvem sem custos
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGitHubModal();
                }}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex-shrink-0"
              >
                Ver Instruções
              </button>
            </div>
          )}

          {/* CARD DEDICADO: ZERAR LANÇAMENTOS (SEM CONFIRM NATIVO) */}
          <div className="pt-3 border-t border-slate-200">
            {!showResetConfirm ? (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    Zerar Todos os Lançamentos
                  </h4>
                  <p className="text-xs text-rose-600/90 mt-0.5">
                    Limpa entradas e despesas para começar do zero. A meta de 1.000 € e o checklist são mantidos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex-shrink-0 whitespace-nowrap"
                >
                  Limpar Tudo
                </button>
              </div>
            ) : (
              <div className="bg-rose-100 border-2 border-rose-400 rounded-2xl p-4 space-y-3 animate-fadeIn">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-rose-900">
                      Confirmar limpeza total dos lançamentos?
                    </h5>
                    <p className="text-xs text-rose-700 mt-0.5">
                      Todas as entradas, aportes e custos fixos serão apagados. A meta continuará em 1.000 €.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onResetAllData();
                      setShowResetConfirm(false);
                      onClose();
                    }}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition cursor-pointer"
                  >
                    ✓ Sim, Limpar Tudo Agora
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3.5 py-2 bg-white text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold border border-slate-300 transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Botões do Rodapé (Apenas Cancelar e Salvar) */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Parâmetros</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
