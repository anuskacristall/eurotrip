import React, { useState, useMemo } from 'react';
import {
  AppData,
  TripExpense,
  ExpenseCategory,
  PaymentMethod,
  CATEGORY_INFO,
  PAYMENT_METHODS,
} from '../types';
import {
  formatEUR,
  formatBRL,
  formatDateBR,
  getRelativeDayLabel,
  getTodayDateString,
  calculateTripDays,
} from '../utils/formatters';
import {
  Wallet,
  Receipt,
  Calendar,
  Sparkles,
  TrendingDown,
  Plus,
  Trash2,
  Filter,
  Search,
  ArrowUpRight,
  Clock,
  PieChart,
  Tag,
  CreditCard,
  Banknote,
  Smartphone,
  ChevronDown,
} from 'lucide-react';

interface TripExpenseViewProps {
  data: AppData;
  onUpdateData: (updater: (prev: AppData) => AppData) => void;
  onOpenJanuaryModal: () => void;
  onOpenWiseModal: () => void;
}

export const TripExpenseView: React.FC<TripExpenseViewProps> = ({
  data,
  onUpdateData,
  onOpenJanuaryModal,
  onOpenWiseModal,
}) => {
  const { settings, expenses, exchanges, manualEurAdded } = data;

  // Calculo de Euros disponíveis
  const totalEurFromExchanges = exchanges.reduce((acc, ex) => acc + (ex.eurAmount || 0), 0);
  const totalEurDeposited = totalEurFromExchanges + (manualEurAdded || 0);
  const totalEurSpent = expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);
  const eurBalance = totalEurDeposited - totalEurSpent;

  // Dias da Viagem
  // Viagem: 23/12 a 02/02 (~41-42 dias)
  const tripDays = useMemo(() => {
    return calculateTripDays(settings.tripStartDate, settings.tripEndDate);
  }, [settings.tripStartDate, settings.tripEndDate]);

  // Médias diárias
  // Se ainda não começou a viagem, usamos dias decorridos como 1 para não dividir por 0 se houver gastos teste
  const effectiveElapsedDays = Math.max(1, tripDays.elapsedDays);
  const dailyAverageSpent = totalEurSpent / effectiveElapsedDays;
  
  // Orçamento diário restante: Saldo restante dividido pelos dias restantes
  const remainingDays = Math.max(1, tripDays.remainingDays);
  const dailyBudgetRemaining = Math.max(0, eurBalance) / remainingDays;

  // Form de Nova Despesa (Mobile-First)
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('cafes');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wise');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(getTodayDateString());
  const [showFullExpenseForm, setShowFullExpenseForm] = useState(false);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');

  // Sugestões rápidas de descrição
  const quickDescriptions = [
    'Pastel de nata e café',
    'Metrô bilhete diário',
    'Mimo sobrinha',
    'Mercado para casa',
    'Almoço executivo',
    'Farmácia / Remédios',
    'Água mineral & lanche',
  ];

  // Adição rápida ao valor (+1, +2, +5, +10)
  const handleAddValue = (val: number) => {
    const current = parseFloat(amountStr.replace(',', '.')) || 0;
    const nextVal = (current + val).toFixed(2);
    setAmountStr(nextVal);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountStr.replace(',', '.'));
    if (!parsedAmount || parsedAmount <= 0) return;

    const newExpense: TripExpense = {
      id: 'exp-' + Date.now(),
      amount: parsedAmount,
      category,
      paymentMethod,
      description: description.trim() || CATEGORY_INFO[category].label,
      date: expenseDate,
      createdAt: Date.now(),
    };

    onUpdateData((prev) => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
    }));

    // Reset rápidos
    setAmountStr('');
    setDescription('');
    // Manter a data e método mais usados
  };

  const handleDeleteExpense = (id: string) => {
    onUpdateData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  };

  // Filtragem e ordenação
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        const matchesQuery =
          !searchQuery.trim() ||
          exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          CATEGORY_INFO[exp.category].label.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = filterCategory === 'all' || exp.category === filterCategory;
        const matchesPay = filterPayment === 'all' || exp.paymentMethod === filterPayment;
        return matchesQuery && matchesCat && matchesPay;
      })
      .sort((a, b) => {
        // Ordenar por data decrescente, e por createdAt se na mesma data
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
  }, [expenses, searchQuery, filterCategory, filterPayment]);

  // Agrupamento por dia
  const expensesByDate = useMemo(() => {
    const groups: { [date: string]: { items: TripExpense[]; total: number } } = {};
    for (const exp of filteredExpenses) {
      if (!groups[exp.date]) {
        groups[exp.date] = { items: [], total: 0 };
      }
      groups[exp.date].items.push(exp);
      groups[exp.date].total += exp.amount;
    }
    return groups;
  }, [filteredExpenses]);

  // Distribuição de gastos por categoria
  const categoryStats = useMemo(() => {
    const stats: Record<ExpenseCategory, number> = {
      mercado: 0,
      cafes: 0,
      transporte: 0,
      compras: 0,
      presentes: 0,
      passeios: 0,
      outros: 0,
    };
    for (const exp of expenses) {
      stats[exp.category] = (stats[exp.category] || 0) + exp.amount;
    }
    return stats;
  }, [expenses]);

  return (
    <div className="space-y-6 pb-16">
      {/* BANNER / STATUS DA VIAGEM */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="font-extrabold text-base sm:text-lg tracking-tight">
                Viagem à Europa (23/12/2026 a 02/02/2027)
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Duração total de <strong>{tripDays.totalDays} dias</strong>. 
              {tripDays.status === 'before' && (
                <span> A viagem começa em breve! Faltam {tripDays.remainingDays} dias.</span>
              )}
              {tripDays.status === 'during' && (
                <span> Dia <strong>{tripDays.elapsedDays}</strong> de {tripDays.totalDays} ({tripDays.remainingDays} dias restantes).</span>
              )}
              {tripDays.status === 'after' && (
                <span> Viagem concluída! Todos os {tripDays.totalDays} dias registrados.</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 1. CARDS DE CONTROLE EM EUROS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Saldo Disponível em Carteira */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Saldo na Carteira
              </span>
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
                  eurBalance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}
              >
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div
              className={`text-xl sm:text-3xl font-extrabold font-mono-num mt-2 ${
                eurBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {formatEUR(eurBalance)}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Total creditado: {formatEUR(totalEurDeposited)}</span>
            <button
              onClick={onOpenWiseModal}
              className="text-sky-600 font-medium hover:underline text-[10px]"
            >
              + Adicionar
            </button>
          </div>
        </div>

        {/* Card 2: Total Gasto até o Momento */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Gasto
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-3xl font-extrabold text-slate-900 font-mono-num mt-2">
              {formatEUR(totalEurSpent)}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-1 border-t border-slate-100">
            {expenses.length} compra{expenses.length === 1 ? '' : 's'} registrada{expenses.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Card 3: Média Gasta por Dia */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Média Gasta / Dia
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-3xl font-extrabold text-indigo-600 font-mono-num mt-2">
              {formatEUR(dailyAverageSpent)}
              <span className="text-xs font-normal text-slate-400">/dia</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-1 border-t border-slate-100">
            Considerando {effectiveElapsedDays} dia{effectiveElapsedDays === 1 ? '' : 's'}
          </div>
        </div>

        {/* Card 4: Orçamento Diário Restante */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Meta Diária Restante
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-3xl font-extrabold text-sky-700 font-mono-num mt-2">
              {formatEUR(dailyBudgetRemaining)}
              <span className="text-xs font-normal text-slate-400">/dia</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-1 border-t border-slate-100">
            Para os próximos {remainingDays} dias
          </div>
        </div>
      </section>

      {/* 2. REGISTRO RÁPIDO DE DESPESAS (OTIMIZADO PARA CELULAR NA RUA) */}
      <section className="bg-white rounded-2xl border-2 border-emerald-500/40 shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              €
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Registrar Gasto Rápido na Rua
              </h3>
              <p className="text-[11px] text-slate-500">
                Toque nos botões rápidos ou digite o valor da compra
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowFullExpenseForm(!showFullExpenseForm)}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-medium sm:hidden"
          >
            {showFullExpenseForm ? 'Modo Rápido' : 'Mais Opções'}
          </button>
        </div>

        <form onSubmit={handleCreateExpense} className="space-y-4">
          {/* Campo de Valor em Euros bem grande */}
          <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-200">
            <div className="flex items-center justify-between gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-400">€</span>
              <input
                type="text"
                inputMode="decimal"
                required
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full text-2xl sm:text-4xl font-extrabold font-mono-num text-slate-900 bg-transparent focus:outline-none text-right placeholder-slate-300"
              />
              {amountStr && (
                <button
                  type="button"
                  onClick={() => setAmountStr('')}
                  className="text-xs text-slate-400 hover:text-slate-600 bg-slate-200/70 px-2 py-1 rounded-md"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Teclado de Incremento Rápido */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-200/60">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Atalhos:</span>
              {[1, 2, 5, 10, 20, 50].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handleAddValue(v)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold font-mono-num border border-slate-200 shadow-xs transition active:scale-95 cursor-pointer"
                >
                  +{v}€
                </button>
              ))}
            </div>
          </div>

          {/* Seleção de Categoria com Ícones Confortáveis */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Selecione a Categoria
            </label>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {(Object.keys(CATEGORY_INFO) as ExpenseCategory[]).map((catKey) => {
                const info = CATEGORY_INFO[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-xl mb-1">{info.icon}</span>
                    <span className="text-[11px] leading-tight line-clamp-1">{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Forma de Pagamento
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((pmKey) => {
                const pm = PAYMENT_METHODS[pmKey];
                const isSelected = paymentMethod === pmKey;
                return (
                  <button
                    key={pmKey}
                    type="button"
                    onClick={() => setPaymentMethod(pmKey)}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{pm.icon}</span>
                    <span className="truncate">{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Descrição e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Descrição breve
              </label>
              <input
                type="text"
                placeholder="Ex: Pastel de nata e café"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              {/* Sugestões de 1 clique */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickDescriptions.slice(0, 4).map((desc) => (
                  <button
                    key={desc}
                    type="button"
                    onClick={() => setDescription(desc)}
                    className="text-[10px] text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md transition"
                  >
                    + {desc}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Data do Gasto
              </label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex gap-1.5 mt-1.5">
                <button
                  type="button"
                  onClick={() => setExpenseDate(getTodayDateString())}
                  className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded hover:bg-emerald-100 font-medium"
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const y = new Date();
                    y.setDate(y.getDate() - 1);
                    setExpenseDate(y.toISOString().slice(0, 10));
                  }}
                  className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded hover:bg-slate-200"
                >
                  Ontem
                </button>
              </div>
            </div>
          </div>

          {/* Botão de Registro Confortável */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition transform active:scale-[0.99] cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Salvar Despesa ({formatEUR(parseFloat(amountStr.replace(',', '.')) || 0)})</span>
          </button>
        </form>
      </section>

      {/* 3. DISTRIBUIÇÃO DE GASTOS POR CATEGORIA */}
      {totalEurSpent > 0 && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <span>Distribuição de Gastos por Categoria</span>
            </h3>
            <span className="text-xs font-mono-num font-semibold text-slate-500">
              Total: {formatEUR(totalEurSpent)}
            </span>
          </div>

          {/* Barra proporcional visual */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 mb-4">
            {(Object.keys(CATEGORY_INFO) as ExpenseCategory[]).map((catKey) => {
              const spent = categoryStats[catKey];
              if (!spent) return null;
              const pct = (spent / totalEurSpent) * 100;
              const bgColors: Record<ExpenseCategory, string> = {
                mercado: 'bg-emerald-500',
                cafes: 'bg-amber-500',
                transporte: 'bg-blue-500',
                compras: 'bg-purple-500',
                presentes: 'bg-pink-500',
                passeios: 'bg-orange-500',
                outros: 'bg-slate-500',
              };

              return (
                <div
                  key={catKey}
                  style={{ width: `${pct}%` }}
                  title={`${CATEGORY_INFO[catKey].label}: ${formatEUR(spent)} (${pct.toFixed(0)}%)`}
                  className={`${bgColors[catKey]} h-full transition-all`}
                />
              );
            })}
          </div>

          {/* Lista com valores por categoria */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {(Object.keys(CATEGORY_INFO) as ExpenseCategory[]).map((catKey) => {
              const spent = categoryStats[catKey];
              const pct = totalEurSpent > 0 ? ((spent / totalEurSpent) * 100).toFixed(0) : '0';
              const info = CATEGORY_INFO[catKey];

              return (
                <div
                  key={catKey}
                  className={`p-2 rounded-xl border flex items-center justify-between ${
                    spent > 0 ? 'bg-slate-50/70 border-slate-200' : 'bg-transparent border-transparent opacity-40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span>{info.icon}</span>
                    <span className="truncate text-slate-700">{info.label}</span>
                  </div>
                  <div className="text-right font-mono-num font-semibold text-slate-800 whitespace-nowrap ml-1">
                    {formatEUR(spent)} <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. HISTÓRICO DE DESPESAS (LINHA DO TEMPO) */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              <span>Linha do Tempo de Gastos</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Histórico cronológico ordenado do mais recente para o mais antigo
            </p>
          </div>

          {/* Campo de Busca Rápida */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar despesa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-48"
            />
          </div>
        </div>

        {/* Filtros rápidos por categoria e forma de pagamento */}
        <div className="flex flex-wrap items-center gap-2 my-3">
          <div className="flex items-center gap-1 text-xs text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrar:</span>
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs px-2.5 py-1 bg-slate-100 rounded-lg border-none text-slate-700 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Todas as Categorias</option>
            {Object.entries(CATEGORY_INFO).map(([k, v]) => (
              <option key={k} value={k}>
                {v.icon} {v.label}
              </option>
            ))}
          </select>

          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="text-xs px-2.5 py-1 bg-slate-100 rounded-lg border-none text-slate-700 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Todas Formas de Pagamento</option>
            {Object.entries(PAYMENT_METHODS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.icon} {v.label}
              </option>
            ))}
          </select>

          {(filterCategory !== 'all' || filterPayment !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setFilterCategory('all');
                setFilterPayment('all');
                setSearchQuery('');
              }}
              className="text-[11px] text-indigo-600 hover:underline ml-auto"
            >
              Limpar Filtros
            </button>
          )}
        </div>

        {/* Timeline dos Dias */}
        {Object.keys(expensesByDate).length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">Nenhuma despesa encontrada</p>
            <p className="text-xs text-slate-400 mt-1">
              Use o formulário acima para registrar sua primeira compra na Europa!
            </p>
          </div>
        ) : (
          <div className="space-y-5 mt-4">
            {Object.entries(expensesByDate).map(([date, group]) => {
              const dayLabel = getRelativeDayLabel(date);

              return (
                <div key={date} className="space-y-2">
                  {/* Cabeçalho do Dia com Subtotal */}
                  <div className="flex items-center justify-between bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-bold text-xs text-slate-800">{dayLabel}</span>
                      <span className="text-[11px] text-slate-400 font-mono-num">
                        ({formatDateBR(date)})
                      </span>
                    </div>
                    <div className="text-xs font-extrabold font-mono-num text-slate-700">
                      Subtotal: <span className="text-emerald-700">{formatEUR(group.total)}</span>
                    </div>
                  </div>

                  {/* Itens do Dia */}
                  <div className="divide-y divide-slate-100 bg-white rounded-xl border border-slate-100 overflow-hidden">
                    {group.items.map((item) => {
                      const cat = CATEGORY_INFO[item.category] || CATEGORY_INFO.outros;
                      const pay = PAYMENT_METHODS[item.paymentMethod] || PAYMENT_METHODS.wise;

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 hover:bg-slate-50/80 transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${cat.bg}`}
                            >
                              {cat.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-800 text-xs sm:text-sm truncate">
                                {item.description}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                <span className="text-slate-600 font-medium">{cat.label}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <span>{pay.icon}</span>
                                  <span>{pay.label}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                            <span className="font-extrabold text-sm sm:text-base font-mono-num text-slate-900">
                              -{formatEUR(item.amount)}
                            </span>
                            <button
                              onClick={() => handleDeleteExpense(item.id)}
                              className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Excluir despesa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
