import React, { useState } from 'react';
import { AppData, ChecklistItem } from '../types';
import { formatBRL, formatEUR } from '../utils/formatters';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Edit2,
  ShoppingBag,
  ExternalLink,
  Sparkles,
  Filter,
  CheckCircle2,
  CircleDollarSign,
  AlertCircle,
} from 'lucide-react';

interface ChecklistViewProps {
  data: AppData;
  onUpdateData: (updater: (prev: AppData) => AppData) => void;
}

const DEFAULT_CATEGORIES = [
  'Roupas de Inverno',
  'Calçados',
  'Mala & Acessórios',
  'Documentos & Seguro',
  'Eletrônicos & Acessórios',
  'Farmácia & Cuidados',
  'Conectividade',
  'Outros',
];

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  data,
  onUpdateData,
}) => {
  const checklist = data.checklist || [];

  // Filtros
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'purchased'>('all');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [costVal, setCostVal] = useState('');
  const [currency, setCurrency] = useState<'BRL' | 'EUR'>('BRL');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [customCatInput, setCustomCatInput] = useState('');
  const [notes, setNotes] = useState('');
  const [link, setLink] = useState('');

  // Categorias disponíveis
  const availableCategories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...checklist.map((item) => item.category).filter(Boolean)])
  );

  // Totais
  const totalItems = checklist.length;
  const purchasedItems = checklist.filter((i) => i.isPurchased).length;
  const pendingItems = totalItems - purchasedItems;
  const percentDone = totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 0;

  const totalCostBrl = checklist.reduce((sum, item) => {
    if (!item.estimatedCostBrl) return sum;
    return sum + (item.currency === 'EUR' ? item.estimatedCostBrl * data.settings.estimatedRate : item.estimatedCostBrl);
  }, 0);

  const purchasedCostBrl = checklist
    .filter((i) => i.isPurchased)
    .reduce((sum, item) => {
      if (!item.estimatedCostBrl) return sum;
      return sum + (item.currency === 'EUR' ? item.estimatedCostBrl * data.settings.estimatedRate : item.estimatedCostBrl);
    }, 0);

  const pendingCostBrl = totalCostBrl - purchasedCostBrl;

  // Filtragem
  const filteredItems = checklist.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'purchased' && item.isPurchased) ||
      (statusFilter === 'pending' && !item.isPurchased);
    return matchesCat && matchesStatus;
  });

  const handleTogglePurchased = (id: string) => {
    onUpdateData((prev) => ({
      ...prev,
      checklist: (prev.checklist || []).map((item) =>
        item.id === id
          ? {
              ...item,
              isPurchased: !item.isPurchased,
              purchaseDate: !item.isPurchased ? new Date().toISOString().slice(0, 10) : undefined,
            }
          : item
      ),
    }));
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const numCost = parseFloat(costVal.replace(',', '.')) || 0;
    const finalCategory = isAddingNewCat && customCatInput.trim() ? customCatInput.trim() : category;

    if (editingId) {
      onUpdateData((prev) => ({
        ...prev,
        checklist: (prev.checklist || []).map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: title.trim(),
                estimatedCostBrl: numCost,
                currency,
                category: finalCategory,
                notes: notes.trim() || undefined,
                link: link.trim() || undefined,
              }
            : item
        ),
      }));
      setEditingId(null);
    } else {
      const newItem: ChecklistItem = {
        id: 'chk-' + Date.now(),
        title: title.trim(),
        estimatedCostBrl: numCost,
        currency,
        category: finalCategory,
        isPurchased: false,
        notes: notes.trim() || undefined,
        link: link.trim() || undefined,
      };

      onUpdateData((prev) => ({
        ...prev,
        checklist: [...(prev.checklist || []), newItem],
      }));
    }

    // Reset Form
    setTitle('');
    setCostVal('');
    setNotes('');
    setLink('');
    setIsAddingNewCat(false);
    setCustomCatInput('');
    setShowForm(false);
  };

  const startEdit = (item: ChecklistItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setCostVal(item.estimatedCostBrl ? item.estimatedCostBrl.toString() : '');
    setCurrency(item.currency || 'BRL');
    setCategory(item.category);
    setNotes(item.notes || '');
    setLink(item.link || '');
    setIsAddingNewCat(false);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    onUpdateData((prev) => ({
      ...prev,
      checklist: (prev.checklist || []).filter((item) => item.id !== id),
    }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. CARDS DE RESUMO DO CHECKLIST */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Progresso do Checklist */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Itens Comprados
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 font-mono-num">
            <div className="text-2xl sm:text-3xl text-slate-900 font-bold">
              {purchasedItems}{' '}
              <span className="text-sm font-normal text-slate-400">/ {totalItems}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 font-normal flex items-center justify-between">
              <span>{percentDone}% concluído</span>
              <span>{pendingItems} pendentes</span>
            </div>
          </div>
        </div>

        {/* Card 2: Valor Já Pago / Investido */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Já Pago
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CircleDollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 font-mono-num">
            <div className="text-2xl sm:text-3xl text-emerald-600 font-bold">
              {formatBRL(purchasedCostBrl)}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-normal">
              {purchasedItems} itens já adquiridos
            </div>
          </div>
        </div>

        {/* Card 3: Valor Estimado Pendente */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ainda a Comprar
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 font-mono-num">
            <div className="text-2xl sm:text-3xl text-amber-600 font-bold">
              {formatBRL(pendingCostBrl)}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-normal">
              {pendingItems} itens restantes
            </div>
          </div>
        </div>

        {/* Card 4: Estimativa Total do Enxoval */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total do Checklist
            </span>
            <span className="text-xs text-indigo-600 bg-indigo-50 font-bold px-2 py-0.5 rounded-full">
              Independente
            </span>
          </div>
          <div className="mt-3 font-mono-num">
            <div className="text-2xl sm:text-3xl text-indigo-700 font-bold">
              {formatBRL(totalCostBrl)}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-normal">
              Não desconta da meta em Euros
            </div>
          </div>
        </div>
      </section>

      {/* Nota informativa clara */}
      <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-sky-800">
        <Sparkles className="w-4 h-4 text-sky-600 flex-shrink-0" />
        <span>
          <strong>Checklist de Compras & Enxoval:</strong> Esta lista serve para organizar tudo o que precisa ser comprado antes de viajar (roupas térmicas, seguro, mala, adaptador, etc.). Os valores aqui <strong>não descontam nem interferem</strong> na sua meta de Euros da viagem!
        </span>
      </div>

      {/* 2. MÓDULO PRINCIPAL DO CHECKLIST */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                Itens a Comprar para a Viagem
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Controle o que já foi comprado, valores estimados e o que ainda falta providenciar
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingId(null);
                setTitle('');
                setCostVal('');
                setNotes('');
                setLink('');
                setIsAddingNewCat(false);
                setShowForm(!showForm);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition shadow-sm shadow-indigo-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Item</span>
            </button>
          </div>
        </div>

        {/* Formulário de adicionar/editar */}
        {showForm && (
          <form
            onSubmit={handleSaveItem}
            className="mt-4 p-4 sm:p-5 bg-slate-50 rounded-2xl border border-indigo-200/80 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                {editingId ? 'Editar Item do Checklist' : 'Novo Item para Comprar'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nome do Item *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Seguro Viagem Europa, Segunda pele térmica..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Valor Estimado (R$ ou €)
                </label>
                <div className="flex gap-2">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as 'BRL' | 'EUR')}
                    className="w-20 px-2 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="BRL">R$</option>
                    <option value="EUR">€</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Ex: 150.00"
                    value={costVal}
                    onChange={(e) => setCostVal(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 font-mono-num focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Categoria
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                  >
                    {isAddingNewCat ? '← Escolher da lista' : '+ Nova categoria'}
                  </button>
                </div>
                {isAddingNewCat ? (
                  <input
                    type="text"
                    required
                    placeholder="Ex: Acessórios de Neve..."
                    value={customCatInput}
                    onChange={(e) => setCustomCatInput(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {availableCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Link do Produto / Loja (Opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://exemplo.com/produto"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Observações / Especificações (Tamanho, cor, marca, etc.)
              </label>
              <input
                type="text"
                placeholder="Ex: Tamanho M, levar 2 peças, comprar na Decathlon ou Shein..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm cursor-pointer"
              >
                {editingId ? 'Salvar Alterações' : 'Adicionar ao Checklist'}
              </button>
            </div>
          </form>
        )}

        {/* Filtros de Categoria e Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 my-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({checklist.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                statusFilter === 'pending' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pendentes ({pendingItems})
            </button>
            <button
              onClick={() => setStatusFilter('purchased')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                statusFilter === 'purchased' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Comprados ({purchasedItems})
            </button>
          </div>

          {/* Categorias Pills */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas Categorias
            </button>
            {availableCategories.map((c) => {
              const count = checklist.filter((i) => i.category === c).length;
              if (count === 0 && selectedCategory !== c) return null;
              return (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                    selectedCategory === c
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista de Itens */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">Nenhum item encontrado no checklist</p>
            <p className="text-xs text-slate-400 mt-1">
              Adicione os itens que você precisa adquirir antes da viagem à Europa!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item) => {
              return (
                <div
                  key={item.id}
                  className={`py-3.5 px-3 flex items-start sm:items-center justify-between gap-3 rounded-xl transition ${
                    item.isPurchased ? 'bg-emerald-50/40 hover:bg-emerald-50/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    {/* Botão de Checkbox */}
                    <button
                      onClick={() => handleTogglePurchased(item.id)}
                      className={`mt-0.5 sm:mt-0 p-1 rounded-lg transition cursor-pointer ${
                        item.isPurchased
                          ? 'text-emerald-600 bg-emerald-100 hover:bg-emerald-200'
                          : 'text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200'
                      }`}
                      title={item.isPurchased ? 'Marcar como pendente' : 'Marcar como comprado/pago'}
                    >
                      {item.isPurchased ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`font-semibold text-sm ${
                            item.isPurchased ? 'text-slate-500 line-through' : 'text-slate-900'
                          }`}
                        >
                          {item.title}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                          {item.category}
                        </span>
                        {item.isPurchased && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                            Pago ✓
                          </span>
                        )}
                      </div>

                      {item.notes && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                          {item.notes}
                        </p>
                      )}

                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:underline mt-1"
                        >
                          <span>Ver link / loja</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Valor e Ações */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {item.estimatedCostBrl ? (
                      <div className="text-right font-mono-num">
                        <div
                          className={`text-sm font-bold ${
                            item.isPurchased ? 'text-emerald-700' : 'text-slate-800'
                          }`}
                        >
                          {item.currency === 'EUR'
                            ? formatEUR(item.estimatedCostBrl)
                            : formatBRL(item.estimatedCostBrl)}
                        </div>
                        {item.currency === 'EUR' && (
                          <div className="text-[10px] text-slate-400 font-normal">
                            ≈ {formatBRL(item.estimatedCostBrl * data.settings.estimatedRate)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-mono-num">—</span>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(item)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
