import React from 'react';
import { User } from 'firebase/auth';
import { TabType, AppSettings } from '../types';
import { Plane, PiggyBank, ArrowLeftRight, Settings, Sparkles, CheckSquare, User as UserIcon } from 'lucide-react';
import { formatBRL, formatEUR } from '../utils/formatters';

interface HeaderProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  settings: AppSettings;
  onOpenSettings: () => void;
  onOpenWiseModal: () => void;
  currentUser: User | null;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  settings,
  onOpenSettings,
  onOpenWiseModal,
  currentUser,
  onOpenAuthModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Top brand & quick stats bar */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                  EuroTrip Planner
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                  <Sparkles className="w-3 h-3 text-sky-600" /> 23/12 a 02/02
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Planejamento financeiro pré-viagem & controle de gastos na Europa
              </p>
            </div>
          </div>

          {/* Quick Info & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick exchange rate chip */}
            <button
              onClick={onOpenWiseModal}
              title="Abrir Simulador de Câmbio & Cartões"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors text-xs font-medium cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden xs:inline">Cotação:</span>
              <span className="font-mono-num font-bold">1€ = {formatBRL(settings.estimatedRate)}</span>
            </button>

            {/* Auth / Profile Button */}
            {currentUser ? (
              <button
                onClick={onOpenAuthModal}
                title={`Conectado como ${currentUser.displayName || currentUser.email}`}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Usuário'}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                  </div>
                )}
                <span className="max-w-[80px] sm:max-w-[120px] truncate hidden xs:inline">
                  {currentUser.displayName ? currentUser.displayName.split(' ')[0] : 'Minha Conta'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-xs shadow-sky-600/30 transition cursor-pointer"
              >
                {/* Google Icon */}
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                  />
                </svg>
                <span>Entrar</span>
              </button>
            )}

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              title="Ajustar Parâmetros & Metas"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
              aria-label="Configurações"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 pb-2 sm:pb-3 overflow-x-auto no-scrollbar">
          {/* Tab 1: Pré-Viagem & Metas (Brasil) */}
          <button
            onClick={() => onSelectTab('pretrip')}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer ${
              currentTab === 'pretrip'
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-500/25 ring-2 ring-sky-600/20 font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <PiggyBank className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">1. Pré-Viagem</span>
            <span className="text-[10px] opacity-80 uppercase tracking-wider hidden lg:inline">
              (Brasil R$)
            </span>
          </button>

          {/* Tab 2: Diário de Gastos na Viagem (Europa) */}
          <button
            onClick={() => onSelectTab('trip')}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer ${
              currentTab === 'trip'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/25 ring-2 ring-emerald-600/20 font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <Plane className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">2. Diário de Gastos</span>
            <span className="text-[10px] opacity-80 uppercase tracking-wider hidden lg:inline">
              (Europa €)
            </span>
          </button>

          {/* Tab 3: Checklist de Compras */}
          <button
            onClick={() => onSelectTab('checklist')}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer ${
              currentTab === 'checklist'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25 ring-2 ring-indigo-600/20 font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">3. Checklist de Compras</span>
          </button>

          {/* Tab 4: Simulador de Câmbio */}
          <button
            onClick={() => onSelectTab('exchange')}
            className={`flex-none flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer ${
              currentTab === 'exchange'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/25 ring-2 ring-purple-600/20 font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4 flex-shrink-0" />
            <span>Simulador de Câmbio</span>
          </button>
        </div>
      </div>
    </header>
  );
};
