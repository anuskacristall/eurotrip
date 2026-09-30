import React, { useState } from 'react';
import {
  AppData,
  Income,
  IncomeCategory,
  INCOME_CATEGORIES,
  FixedCostItem,
} from '../types';
import {
  formatBRL,
  formatEUR,
  formatDateBR,
  getTodayDateString,
  formatIncomeCategory,
} from '../utils/formatters';
import {
  PiggyBank,
  TrendingUp,
  Target,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Calculator,
  ShieldAlert,
  ChevronDown,
  Sparkles,
  Info,
} from 'lucide-react';

interface PreTripViewProps {
  data: AppData;
  onUpdateData: (updater: (prev: AppData) => AppData) => void;
  onOpenSettings: () => void;
}

export const PreTripView: React.FC<PreTripViewProps> = ({
  data,
  onUpdateData,
  onOpenSettings,
}) => {
  const { settings, incomes, fixedCosts } = data;

  // Calculos da Meta
  const metaTotalBrl = settings.euroGoal * settings.estimatedRate;
  const totalAportesViagem = incomes.reduce((sum, item) => sum + (item.tripAmount || 0), 0);
  const totalAcumuladoViagem = settings.initialSavingsBrl + totalAportesViagem;
  const faltaBrl = Math.max(0, metaTotalBrl - totalAcumuladoViagem);
  const faltaEur = faltaBrl > 0 ? faltaBrl / settings.estimatedRate : 0;
  const progressPercent = Math.min(100, Math.round((totalAcumuladoViagem / metaTotalBrl) * 100)) || 0;

  // Filtro de Entradas
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Form de Nova Entrada
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newTotalVal, setNewTotalVal] = useState('');
  const [newTripVal, setNewTripVal] = useState('');
  const [newDate, setNewDate] = useState(getTodayDateString());
  const [newCat, setNewCat] = useState<string>('Salário / Trabalho');
  const [newCustomCatInput, setNewCustomCatInput] = useState('');
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newNotes, setNewNotes] = useState('');

  // Editing state for income
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);

  // Lista de categorias disponíveis (filtrando códigos legados como 'salario' e 'ajuda_pai')
  const bannedCategoryKeys = new Set(['salario', 'ajuda_pai', 'economias', 'ajuda_familia', 'renda_extra', 'outros']);
  const availableCategories = Array.from(
    new Set([
      'Salário / Trabalho',
      'Economias Pessoais',
      'Ajuda da Família',
      'Renda Extra / Freela',
      'Outras Entradas',
      ...(data.customIncomeCategories || []).filter((c) => !bannedCategoryKeys.has(c)),
      ...incomes.map((i) => i.category).filter((c) => c && !bannedCategoryKeys.has(c)),
    ])
  );

  // Form de Novo Custo Fixo
  const [showFixedCostForm, setShowFixedCostForm] = useState(false);
  const [newCostTitle, setNewCostTitle] = useState('');
  const [newCostVal, setNewCostVal] = useState('');
  const [newCostNotes, setNewCostNotes] = useState('');
  const [newCostStartMonth, setNewCostStartMonth] = useState('2026-10');

  // Meses de acompanhamento
  const trackedMonths = [
    { key: '2026-10', label: 'Outubro 2026' },
    { key: '2026-11', label: 'Novembro 2026', alert: true },
    { key: '2026-12', label: 'Dezembro 2026' },
    { key: '2027-01', label: 'Janeiro 2027' },
  ];

  // Atalho do Estágio (30h/sem a R$ 20/h -> ~R$ 2.400 / R$ 2.600)
  const handlePresetEstagio = () => {
    // Sugestão para a viagem
    const sugestaoViagem = 1400;
    setNewDesc('Salário Estágio (30h/sem x R$ 20/h)');
    setNewTotalVal(sugestaoViagem.toString());
    setNewTripVal(sugestaoViagem.toString());
    setNewCat('Salário / Trabalho');
    setNewNotes('Calculado com base em 30h semanais a R$ 20,00/hora');
  };

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const trip = parseFloat(newTripVal.replace(',', '.')) || 0;

    if (!newDesc.trim() || trip <= 0) return;

    const finalCat = isAddingNewCat && newCustomCatInput.trim() ? newCustomCatInput.trim() : newCat;

    if (editingIncomeId) {
      onUpdateData((prev) => {
        const customCats = prev.customIncomeCategories || [];
        const updatedCustomCats =
          isAddingNewCat && newCustomCatInput.trim() && !customCats.includes(newCustomCatInput.trim())
            ? [...customCats, newCustomCatInput.trim()]
            : customCats;

        return {
          ...prev,
          customIncomeCategories: updatedCustomCats,
          incomes: prev.incomes.map((item) =>
            item.id === editingIncomeId
              ? {
                  ...item,
                  description: newDesc,
                  totalAmount: trip,
                  tripAmount: trip,
                  date: newDate,
                  category: finalCat,
                  notes: newNotes,
                }
              : item
          ),
        };
      });
      setEditingIncomeId(null);
    } else {
      const newIncomeItem: Income = {
        id: 'inc-' + Date.now(),
        description: newDesc,
        totalAmount: trip,
        tripAmount: trip,
        date: newDate,
        category: finalCat,
        notes: newNotes,
      };

      onUpdateData((prev) => {
        const customCats = prev.customIncomeCategories || [];
        const updatedCustomCats =
          isAddingNewCat && newCustomCatInput.trim() && !customCats.includes(newCustomCatInput.trim())
            ? [...customCats, newCustomCatInput.trim()]
            : customCats;

        return {
          ...prev,
          customIncomeCategories: updatedCustomCats,
          incomes: [newIncomeItem, ...prev.incomes],
        };
      });
    }

    // Reset form
    setNewDesc('');
    setNewTotalVal('');
    setNewTripVal('');
    setNewNotes('');
    setIsAddingNewCat(false);
    setNewCustomCatInput('');
    setShowIncomeForm(false);
  };

  const startEditIncome = (item: Income) => {
    setEditingIncomeId(item.id);
    setNewDesc(item.description);
    setNewTotalVal(item.tripAmount.toString());
    setNewTripVal(item.tripAmount.toString());
    setNewDate(item.date);
    setNewCat(item.category || 'Salário / Trabalho');
    setIsAddingNewCat(false);
    setNewCustomCatInput('');
    setNewNotes(item.notes || '');
    setShowIncomeForm(true);
  };

  const handleDeleteIncome = (id: string) => {
    onUpdateData((prev) => ({
      ...prev,
      incomes: prev.incomes.filter((item) => item.id !== id),
    }));
  };

  // Toggle paid status for fixed cost month
  const handleToggleFixedCostMonth = (costId: string, monthKey: string) => {
    onUpdateData((prev) => ({
      ...prev,
      fixedCosts: prev.fixedCosts.map((cost) => {
        if (cost.id !== costId) return cost;
        const currentPaid = !!cost.paidMonths[monthKey];
        return {
          ...cost,
          paidMonths: {
            ...cost.paidMonths,
            [monthKey]: !currentPaid,
          },
        };
      }),
    }));
  };

  const handleAddFixedCost = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newCostVal.replace(',', '.')) || 0;
    if (!newCostTitle.trim() || amount <= 0) return;

    const newCost: FixedCostItem = {
      id: 'fc-' + Date.now(),
      title: newCostTitle,
      monthlyAmount: amount,
      notes: newCostNotes,
      startMonth: newCostStartMonth,
      paidMonths: {},
    };

    onUpdateData((prev) => ({
      ...prev,
      fixedCosts: [...prev.fixedCosts, newCost],
    }));

    setNewCostTitle('');
    setNewCostVal('');
    setNewCostNotes('');
    setShowFixedCostForm(false);
  };

  const handleDeleteFixedCost = (id: string) => {
    onUpdateData((prev) => ({
      ...prev,
      fixedCosts: prev.fixedCosts.filter((c) => c.id !== id),
    }));
  };

  const filteredIncomes = incomes.filter((item) =>
    selectedCategory === 'all' ? true : formatIncomeCategory(item.category) === selectedCategory
  );

  return (
    <div className="space-y-6 pb-12">
      {/* 1. CARDS DE RESUMO NO TOPO */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Meta Total */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Meta em Euros
              </span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3" style={{ fontFamily: 'system-ui', fontWeight: 'bold' }}>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900" style={{ fontFamily: 'system-ui', fontWeight: 'bold' }}>
                {formatEUR(settings.euroGoal)}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center justify-between font-normal">
                <span>≈ {formatBRL(metaTotalBrl)}</span>
                <button
                  onClick={onOpenSettings}
                  className="text-sky-600 hover:text-sky-700 font-medium hover:underline text-[11px]"
                >
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Total Acumulado */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Acumulado p/ Viagem
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <PiggyBank className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3" style={{ fontFamily: 'system-ui', fontWeight: 'bold' }}>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600" style={{ fontFamily: 'system-ui', fontWeight: 'bold' }}>
                {formatBRL(totalAcumuladoViagem)}
              </div>
              <div className="text-xs text-slate-500 mt-1 truncate font-normal">
                Inicial: {formatBRL(settings.initialSavingsBrl)} + Entradas: {formatBRL(totalAportesViagem)}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Falta para a Meta */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Falta p/ a Meta
              </span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  faltaBrl === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}
              >
                {faltaBrl === 0 ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              </div>
            </div>
            <div className="mt-3" style={{ fontFamily: 'system-ui', fontWeight: 'bold' }}>
              <div
                className={`text-2xl sm:text-3xl font-extrabold ${
                  faltaBrl === 0 ? 'text-emerald-600' : 'text-amber-600'
                }`}
                style={{ fontFamily: 'system-ui', fontWeight: 'bold' }}
              >
                {faltaBrl === 0 ? 'Meta Atingida! 🎉' : formatBRL(faltaBrl)}
              </div>
              <div className="text-xs text-slate-500 mt-1 font-normal">
                {faltaBrl === 0 ? '100% garantido' : `Equivalente a ≈ ${formatEUR(faltaEur)}`}
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Progresso Visual */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Progresso
              </span>
              <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                {progressPercent}%
              </span>
            </div>

            <div className="mt-3" style={{ fontFamily: 'system-ui', fontWeight: 'bold' }}>
              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-3.5 p-0.5 border border-slate-200/80 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-sky-500 to-indigo-600 h-full rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2 font-normal">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MÓDULO DE ENTRADAS PARA A VIAGEM */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-600" />
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                Entradas para a Viagem
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cadastre suas receitas e defina quanto de cada valor vai direto para a meta em Euros
            </p>
          </div>

          <div className="flex items-center gap-2">
            {incomes.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onUpdateData((prev) => ({
                    ...prev,
                    incomes: [],
                  }));
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold transition border border-slate-200 hover:border-rose-200 cursor-pointer"
                title="Apagar todas as entradas da lista"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpar Entradas</span>
              </button>
            )}
            <button
              onClick={() => {
                setEditingIncomeId(null);
                setNewDesc('');
                setNewTotalVal('');
                setNewTripVal('');
                setIsAddingNewCat(false);
                setNewCustomCatInput('');
                setShowIncomeForm(!showIncomeForm);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold transition shadow-sm shadow-sky-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Entrada</span>
            </button>
          </div>
        </div>

        {/* Form para adicionar/editar entrada */}
        {showIncomeForm && (
          <form
            onSubmit={handleAddIncome}
            className="mt-4 p-4 sm:p-5 bg-slate-50 rounded-2xl border border-sky-200/80 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                {editingIncomeId ? 'Editar Entrada' : 'Cadastrar Nova Entrada / Receita'}
              </h3>
              {/* Quick calculator helper for Estágio */}
              <button
                type="button"
                onClick={handlePresetEstagio}
                className="inline-flex items-center gap-1 text-xs text-sky-700 hover:text-sky-800 bg-sky-100 hover:bg-sky-200 px-2.5 py-1 rounded-lg transition font-medium cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Simular Estágio (30h/sem x R$ 20)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Salário Outubro, Venda de itens..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Categoria / Origem
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewCat(!isAddingNewCat);
                      if (!isAddingNewCat) {
                        setNewCustomCatInput('');
                      }
                    }}
                    className="text-[11px] text-sky-600 hover:text-sky-700 font-medium hover:underline"
                  >
                    {isAddingNewCat ? '← Escolher da lista' : '+ Criar nova'}
                  </button>
                </div>
                {isAddingNewCat ? (
                  <input
                    type="text"
                    required
                    placeholder="Digite a nova categoria..."
                    value={newCustomCatInput}
                    onChange={(e) => setNewCustomCatInput(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                ) : (
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {availableCategories.map((catName) => (
                      <option key={catName} value={catName}>
                        {catName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-700 mb-1">
                  Valor Destinado à Viagem (R$)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 1400.00"
                  value={newTripVal}
                  onChange={(e) => {
                    setNewTripVal(e.target.value);
                    setNewTotalVal(e.target.value);
                  }}
                  className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-emerald-300 text-emerald-800 font-bold font-mono-num focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Data do Recebimento
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Observações
                </label>
                <input
                  type="text"
                  placeholder="Ex: Reserva para gastos ou transferências"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowIncomeForm(false);
                  setEditingIncomeId(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white transition shadow-sm cursor-pointer"
              >
                {editingIncomeId ? 'Salvar Alterações' : 'Salvar Entrada'}
              </button>
            </div>
          </form>
        )}

        {/* Filtros rápidos por categoria */}
        <div className="flex gap-2 my-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas as Entradas ({incomes.length})
          </button>
          {availableCategories.map((catName) => {
            const count = incomes.filter((i) => formatIncomeCategory(i.category) === catName).length;
            if (count === 0 && selectedCategory !== catName) return null;
            return (
              <button
                key={catName}
                onClick={() => setSelectedCategory(catName)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  selectedCategory === catName
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>🏷️</span>
                <span>{catName}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Lista de Entradas */}
        {filteredIncomes.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <PiggyBank className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">Nenhuma entrada cadastrada</p>
            <p className="text-xs text-slate-400 mt-1">
              Cadastre suas receitas e aportes para acompanhar o crescimento da sua meta
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Descrição / Origem</th>
                  <th className="py-2.5 px-3 text-right text-emerald-700">Entradas</th>
                  <th className="py-2.5 px-3">Observações</th>
                  <th className="py-2.5 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredIncomes.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-slate-500 font-mono-num whitespace-nowrap">
                        {formatDateBR(item.date)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">💰</span>
                          <div>
                            <div className="font-semibold text-slate-800">{item.description}</div>
                            <span className="inline-block text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100 mt-0.5">
                              {formatIncomeCategory(item.category)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono-num font-bold text-emerald-600 whitespace-nowrap bg-emerald-50/40 rounded-lg">
                        +{formatBRL(item.tripAmount)}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-xs">
                        {item.notes || '—'}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => startEditIncome(item)}
                            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteIncome(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 4. MÓDULO DE CUSTOS FIXOS & RETENÇÕES NO BRASIL */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                Custos Fixos & Retenções no Brasil
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Controle mensal das contas que devem ser pagas no Brasil para blindar e não gastar o dinheiro da viagem
            </p>
          </div>

          <div className="flex items-center gap-2">
            {fixedCosts.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onUpdateData((prev) => ({
                    ...prev,
                    fixedCosts: [],
                  }));
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold transition border border-slate-200 hover:border-rose-200 cursor-pointer"
                title="Apagar todos os custos fixos"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpar Custos</span>
              </button>
            )}
            <button
              onClick={() => setShowFixedCostForm(!showFixedCostForm)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Custo Fixo</span>
            </button>
          </div>
        </div>

        {/* Form para novo custo fixo */}
        {showFixedCostForm && (
          <form
            onSubmit={handleAddFixedCost}
            className="mt-4 p-4 bg-slate-50 rounded-2xl border border-indigo-200 space-y-3"
          >
            <h4 className="text-xs font-bold text-indigo-900 uppercase">Novo Custo Fixo no Brasil</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome da Conta</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Plano de Celular / Academia"
                  value={newCostTitle}
                  onChange={(e) => setNewCostTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Valor Mensal (R$)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 89.90"
                  value={newCostVal}
                  onChange={(e) => setNewCostVal(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-300 font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Observações</label>
                <input
                  type="text"
                  placeholder="Ex: Vencimento dia 10"
                  value={newCostNotes}
                  onChange={(e) => setNewCostNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-300"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowFixedCostForm(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg text-xs bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
              >
                Cadastrar Custo
              </button>
            </div>
          </form>
        )}

        {/* Tabela de Acompanhamento Mensal */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Custo Fixo</th>
                <th className="py-2.5 px-3">Valor / Mês</th>
                {trackedMonths.map((m) => (
                  <th
                    key={m.key}
                    className={`py-2.5 px-3 text-center ${
                      m.alert ? 'bg-amber-50/80 text-amber-900 rounded-t-lg' : ''
                    }`}
                  >
                    <span>{m.label}</span>
                    {m.alert && <span className="block text-[9px] text-amber-600 font-normal">Alerta</span>}
                  </th>
                ))}
                <th className="py-2.5 px-2 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {fixedCosts.map((cost) => (
                <tr key={cost.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-800">{cost.title}</div>
                    {cost.notes && <div className="text-[11px] text-slate-400">{cost.notes}</div>}
                  </td>
                  <td className="py-3 px-3 font-mono-num font-bold text-slate-700 whitespace-nowrap">
                    {formatBRL(cost.monthlyAmount)}
                  </td>
                  {trackedMonths.map((m) => {
                    const isPaid = !!cost.paidMonths[m.key];
                    const isBeforeStart = cost.startMonth && m.key < cost.startMonth;

                    return (
                      <td
                        key={m.key}
                        className={`py-3 px-3 text-center ${
                          m.alert ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        {isBeforeStart ? (
                          <span className="text-[11px] text-slate-300 italic">Inicia em {cost.startMonth}</span>
                        ) : (
                          <button
                            onClick={() => handleToggleFixedCostMonth(cost.id, m.key)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isPaid ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            <span>{isPaid ? 'Pago' : 'Pendente'}</span>
                          </button>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => handleDeleteFixedCost(cost.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 rounded transition"
                      title="Excluir Custo Fixo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50/80 font-bold text-xs">
                <td className="py-3 px-3 text-slate-700">Total Mensal Comprometido</td>
                <td className="py-3 px-3 font-mono-num text-slate-900">
                  {formatBRL(fixedCosts.reduce((s, c) => s + c.monthlyAmount, 0))}
                </td>
                {trackedMonths.map((m) => {
                  const monthTotal = fixedCosts.reduce((sum, cost) => {
                    if (cost.startMonth && m.key < cost.startMonth) return sum;
                    return sum + cost.monthlyAmount;
                  }, 0);
                  const monthPaid = fixedCosts.reduce((sum, cost) => {
                    if (cost.startMonth && m.key < cost.startMonth) return sum;
                    return cost.paidMonths[m.key] ? sum + cost.monthlyAmount : sum;
                  }, 0);
                  const allPaid = monthTotal > 0 && monthPaid === monthTotal;

                  return (
                    <td key={m.key} className="py-3 px-3 text-center font-mono-num">
                      <div className="text-slate-800">{formatBRL(monthTotal)}</div>
                      <div className={`text-[10px] ${allPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {allPaid ? '100% quitado' : `Pago: ${formatBRL(monthPaid)}`}
                      </div>
                    </td>
                  );
                })}
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
};
