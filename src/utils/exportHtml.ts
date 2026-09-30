import { AppData } from '../types';

/**
 * Generates and downloads a self-contained Single-File HTML application
 * containing embedded HTML, Tailwind CSS via CDN / styles, and interactive JavaScript
 * pre-populated with the user's current data and localStorage sync.
 */
export function exportSingleFileHtml(data: AppData) {
  const serializedData = JSON.stringify(data).replace(/</g, '\\u003c');

  const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>EuroTrip Planner - Offline Standalone</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
    .font-mono-num { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 700; font-feature-settings: 'tnum' on; }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased min-h-screen pb-12">
  <!-- Top Header -->
  <header class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 py-3 shadow-xs">
    <div class="max-w-4xl mx-auto px-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-sm">✈️</div>
        <div>
          <h1 class="font-bold text-slate-900 text-sm sm:text-base leading-tight">EuroTrip Planner</h1>
          <p class="text-[10px] text-slate-500">Versão Offline Portátil (23/12 a 02/02)</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span id="headerRateBadge" class="text-xs font-mono-num font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg"></span>
      </div>
    </div>
    
    <!-- Tab Switcher -->
    <div class="max-w-4xl mx-auto px-4 flex gap-2 mt-2.5">
      <button id="tabBtn1" onclick="switchTab('tab1')" class="flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition bg-sky-600 text-white">
        🔵 1. Pré-Viagem (Brasil)
      </button>
      <button id="tabBtn2" onclick="switchTab('tab2')" class="flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition bg-slate-100 text-slate-600">
        🟢 2. Diário de Viagem (€)
      </button>
    </div>
  </header>

  <!-- Main Container -->
  <main class="max-w-4xl mx-auto px-4 pt-5 space-y-6">
    <!-- ABA 1: PRÉ-VIAGEM -->
    <div id="viewTab1" class="space-y-5">
      <!-- Cards Resumo -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-white p-4 rounded-2xl border border-slate-200">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Meta em Euros</span>
          <div id="cardMetaEur" class="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono-num mt-1"></div>
          <div id="cardMetaBrl" class="text-[11px] text-slate-500 mt-0.5"></div>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-slate-200">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Acumulado p/ Viagem</span>
          <div id="cardAcumuladoBrl" class="text-xl sm:text-2xl font-extrabold text-emerald-600 font-mono-num mt-1"></div>
          <div id="cardAcumuladoSub" class="text-[10px] text-slate-400 mt-0.5"></div>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-slate-200">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Falta p/ a Meta</span>
          <div id="cardFaltaBrl" class="text-xl sm:text-2xl font-extrabold text-amber-600 font-mono-num mt-1"></div>
          <div id="cardFaltaEur" class="text-[10px] text-slate-500 mt-0.5"></div>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-slate-200">
          <div class="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
            <span>Progresso</span>
            <span id="cardProgressPct" class="text-sky-600"></span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-3 mt-2 overflow-hidden">
            <div id="cardProgressBar" class="bg-sky-600 h-full rounded-full transition-all"></div>
          </div>
        </div>
      </div>

      <!-- Tabela Custos Fixos Brasil -->
      <div class="bg-white rounded-2xl border border-slate-200 p-4">
        <h3 class="font-bold text-slate-800 text-sm mb-3">Custos Fixos & Retenções no Brasil</h3>
        <div id="fixedCostsContainer" class="space-y-2 text-xs"></div>
      </div>

      <!-- Entradas & Aportes -->
      <div class="bg-white rounded-2xl border border-slate-200 p-4">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-bold text-slate-800 text-sm">Entradas & Aportes</h3>
          <button onclick="promptNewIncome()" class="px-2.5 py-1 bg-sky-600 text-white rounded-lg text-xs font-semibold">+ Nova Entrada</button>
        </div>
        <div id="incomesContainer" class="divide-y divide-slate-100 text-xs"></div>
      </div>
    </div>

    <!-- ABA 2: DIÁRIO DE GASTOS NA VIAGEM -->
    <div id="viewTab2" class="space-y-5 hidden">
      <!-- Cards de Controle -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-white p-4 rounded-2xl border border-slate-200">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Saldo Carteira</span>
          <div id="tripEurBalance" class="text-xl sm:text-2xl font-extrabold text-emerald-600 font-mono-num mt-1"></div>
          <div class="text-[10px] text-slate-400">Total disponível</div>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-slate-200">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Total Gasto</span>
          <div id="tripEurSpent" class="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono-num mt-1"></div>
          <div id="tripExpenseCount" class="text-[10px] text-slate-400"></div>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-slate-200">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Média / Dia</span>
          <div id="tripDailyAvg" class="text-xl sm:text-2xl font-extrabold text-indigo-600 font-mono-num mt-1"></div>
          <div class="text-[10px] text-slate-400">Média decorrida</div>
        </div>
        <div class="bg-white p-4 rounded-2xl border border-slate-200">
          <span class="text-[10px] font-bold text-slate-400 uppercase">Orçamento / Dia</span>
          <div id="tripDailyBudget" class="text-xl sm:text-2xl font-extrabold text-sky-600 font-mono-num mt-1"></div>
          <div class="text-[10px] text-slate-400">Para dias restantes</div>
        </div>
      </div>

      <!-- Registro Rápido -->
      <div class="bg-white rounded-2xl border-2 border-emerald-500/40 p-4 space-y-3">
        <h3 class="font-bold text-slate-900 text-sm">Registrar Gasto Rápido na Rua (€)</h3>
        <form onsubmit="handleQuickExpense(event)" class="space-y-3">
          <div class="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span class="text-2xl font-bold text-slate-400">€</span>
            <input id="quickAmount" type="text" inputmode="decimal" required placeholder="0.00" class="w-full text-2xl font-extrabold font-mono-num bg-transparent focus:outline-none text-right">
          </div>
          <div class="flex gap-1.5 flex-wrap">
            <button type="button" onclick="addVal(1)" class="px-2 py-1 bg-slate-100 rounded text-xs font-semibold">+1€</button>
            <button type="button" onclick="addVal(2)" class="px-2 py-1 bg-slate-100 rounded text-xs font-semibold">+2€</button>
            <button type="button" onclick="addVal(5)" class="px-2 py-1 bg-slate-100 rounded text-xs font-semibold">+5€</button>
            <button type="button" onclick="addVal(10)" class="px-2 py-1 bg-slate-100 rounded text-xs font-semibold">+10€</button>
            <button type="button" onclick="addVal(20)" class="px-2 py-1 bg-slate-100 rounded text-xs font-semibold">+20€</button>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <select id="quickCat" class="p-2 border rounded-xl bg-white">
              <option value="cafes">☕ Cafés / Lanches</option>
              <option value="mercado">🛒 Mercado / Casa</option>
              <option value="transporte">🚇 Transporte / Metrô</option>
              <option value="compras">🛍️ Compras / Farmácia</option>
              <option value="presentes">🎁 Presentes / Bebê</option>
              <option value="passeios">🎟️ Passeios / Lazer</option>
              <option value="outros">🏷️ Outros Gastos</option>
            </select>
            <select id="quickPay" class="p-2 border rounded-xl bg-white">
              <option value="wise">💳 Cartão Internacional</option>
              <option value="aproximacao">📱 Celular NFC</option>
              <option value="dinheiro">💶 Dinheiro Espécie</option>
            </select>
          </div>
          <input id="quickDesc" type="text" placeholder="Descrição (Ex: Pastel de nata e café)" class="w-full p-2 border rounded-xl text-xs bg-white">
          <button type="submit" class="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow">Salvar Despesa</button>
        </form>
      </div>

      <!-- Lista de Gastos -->
      <div class="bg-white rounded-2xl border border-slate-200 p-4">
        <h3 class="font-bold text-slate-800 text-sm mb-3">Histórico de Despesas</h3>
        <div id="tripExpensesContainer" class="divide-y divide-slate-100 text-xs"></div>
      </div>
    </div>
  </main>

  <script>
    const INITIAL_STATE = ${serializedData};
    const STORAGE_KEY = 'eurotrip_planner_data_v1';
    let appData = null;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      appData = stored ? JSON.parse(stored) : INITIAL_STATE;
    } catch(e) {
      appData = INITIAL_STATE;
    }

    function save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
      } catch(e) {}
      render();
    }

    function fmtBRL(v) {
      return (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    function fmtEUR(v) {
      return (v || 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
    }

    function switchTab(t) {
      document.getElementById('viewTab1').classList.toggle('hidden', t !== 'tab1');
      document.getElementById('viewTab2').classList.toggle('hidden', t !== 'tab2');
      document.getElementById('tabBtn1').className = t === 'tab1' ? 'flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition bg-sky-600 text-white' : 'flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition bg-slate-100 text-slate-600';
      document.getElementById('tabBtn2').className = t === 'tab2' ? 'flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition bg-emerald-600 text-white' : 'flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition bg-slate-100 text-slate-600';
    }

    function addVal(n) {
      const input = document.getElementById('quickAmount');
      const cur = parseFloat(input.value.replace(',', '.')) || 0;
      input.value = (cur + n).toFixed(2);
    }

    function handleQuickExpense(e) {
      e.preventDefault();
      const val = parseFloat(document.getElementById('quickAmount').value.replace(',', '.'));
      if (!val || val <= 0) return;
      const cat = document.getElementById('quickCat').value;
      const pay = document.getElementById('quickPay').value;
      const desc = document.getElementById('quickDesc').value.trim() || 'Gasto na viagem';

      const newExp = {
        id: 'exp-' + Date.now(),
        amount: val,
        category: cat,
        paymentMethod: pay,
        description: desc,
        date: new Date().toISOString().slice(0, 10),
        createdAt: Date.now()
      };

      appData.expenses.unshift(newExp);
      document.getElementById('quickAmount').value = '';
      document.getElementById('quickDesc').value = '';
      save();
    }

    function toggleFixedCost(id, month) {
      appData.fixedCosts = appData.fixedCosts.map(fc => {
        if (fc.id === id) {
          fc.paidMonths = fc.paidMonths || {};
          fc.paidMonths[month] = !fc.paidMonths[month];
        }
        return fc;
      });
      save();
    }

    function promptNewIncome() {
      const desc = prompt('Descrição da entrada (Ex: Salário Estágio):');
      if (!desc) return;
      const total = parseFloat(prompt('Valor Total Recebido em R$:', '2400'));
      if (!total) return;
      const trip = parseFloat(prompt('Valor Destinado para a Viagem em R$:', '1200'));

      appData.incomes.unshift({
        id: 'inc-' + Date.now(),
        date: new Date().toISOString().slice(0, 10),
        description: desc,
        totalAmount: total || 0,
        tripAmount: trip || 0,
        category: 'salario'
      });
      save();
    }

    function deleteExp(id) {
      if (confirm('Excluir gasto?')) {
        appData.expenses = appData.expenses.filter(e => e.id !== id);
        save();
      }
    }

    function render() {
      const rate = appData.settings.estimatedRate || 6.15;
      document.getElementById('headerRateBadge').textContent = '1€ = ' + fmtBRL(rate);

      // Tab 1 calculations
      const metaEur = appData.settings.euroGoal || 1000;
      const metaBrl = metaEur * rate;
      const initialBrl = appData.settings.initialSavingsBrl || 0;
      const aportesBrl = appData.incomes.reduce((s, i) => s + (i.tripAmount || 0), 0);
      const totalViagemBrl = initialBrl + aportesBrl;
      const faltaBrl = Math.max(0, metaBrl - totalViagemBrl);
      const faltaEur = faltaBrl / rate;
      const pct = Math.min(100, Math.round((totalViagemBrl / metaBrl) * 100));

      document.getElementById('cardMetaEur').textContent = fmtEUR(metaEur);
      document.getElementById('cardMetaBrl').textContent = '≈ ' + fmtBRL(metaBrl);
      document.getElementById('cardAcumuladoBrl').textContent = fmtBRL(totalViagemBrl);
      document.getElementById('cardAcumuladoSub').textContent = 'Inicial: ' + fmtBRL(initialBrl) + ' + Aportes: ' + fmtBRL(aportesBrl);
      document.getElementById('cardFaltaBrl').textContent = faltaBrl === 0 ? 'Meta Batida!' : fmtBRL(faltaBrl);
      document.getElementById('cardFaltaEur').textContent = faltaBrl === 0 ? 'Parabéns!' : '≈ ' + fmtEUR(faltaEur);
      document.getElementById('cardProgressPct').textContent = pct + '%';
      document.getElementById('cardProgressBar').style.width = pct + '%';

      // Custos fixos
      const fcHtml = appData.fixedCosts.map(fc => {
        const isOctPaid = fc.paidMonths && fc.paidMonths['2026-10'];
        const isNovPaid = fc.paidMonths && fc.paidMonths['2026-11'];
        return '<div class="p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">' +
          '<div><div class="font-bold text-slate-800">' + fc.title + ' (' + fmtBRL(fc.monthlyAmount) + '/mês)</div>' +
          '<div class="text-[10px] text-slate-400">' + (fc.notes || '') + '</div></div>' +
          '<div class="flex gap-2">' +
          '<button onclick="toggleFixedCost(\\'' + fc.id + '\\', \\'2026-10\\')" class="px-2 py-1 rounded text-[11px] font-semibold border ' + (isOctPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200') + '">Out: ' + (isOctPaid ? 'Pago' : 'Pendente') + '</button>' +
          '<button onclick="toggleFixedCost(\\'' + fc.id + '\\', \\'2026-11\\')" class="px-2 py-1 rounded text-[11px] font-semibold border ' + (isNovPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200') + '">Nov: ' + (isNovPaid ? 'Pago' : 'Pendente') + '</button>' +
          '</div></div>';
      }).join('');
      document.getElementById('fixedCostsContainer').innerHTML = fcHtml;

      // Incomes
      const incHtml = appData.incomes.map(inc => {
        return '<div class="py-2.5 flex justify-between items-center">' +
          '<div><div class="font-semibold text-slate-800">' + inc.description + '</div>' +
          '<div class="text-[10px] text-slate-400">' + inc.date + ' • Total: ' + fmtBRL(inc.totalAmount) + '</div></div>' +
          '<div class="font-bold font-mono-num text-emerald-600">+' + fmtBRL(inc.tripAmount) + '</div>' +
          '</div>';
      }).join('');
      document.getElementById('incomesContainer').innerHTML = incHtml || '<p class="text-slate-400 py-2">Sem entradas registradas.</p>';

      // Tab 2 calculations
      const totalEurExchanges = (appData.exchanges || []).reduce((s, x) => s + (x.eurAmount || 0), 0);
      const totalEurAdded = totalEurExchanges + (appData.manualEurAdded || 0);
      const totalEurSpent = (appData.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
      const balance = totalEurAdded - totalEurSpent;
      const count = (appData.expenses || []).length;

      document.getElementById('tripEurBalance').textContent = fmtEUR(balance);
      document.getElementById('tripEurSpent').textContent = fmtEUR(totalEurSpent);
      document.getElementById('tripExpenseCount').textContent = count + ' compras registradas';
      document.getElementById('tripDailyAvg').textContent = fmtEUR(totalEurSpent / Math.max(1, count > 0 ? 1 : 1)) + '/dia';
      document.getElementById('tripDailyBudget').textContent = fmtEUR(Math.max(0, balance) / 41) + '/dia';

      // Expenses timeline
      const expHtml = (appData.expenses || []).map(exp => {
        return '<div class="py-2.5 flex justify-between items-center">' +
          '<div><div class="font-semibold text-slate-800">' + exp.description + '</div>' +
          '<div class="text-[10px] text-slate-400">' + exp.date + ' • ' + exp.category + ' • ' + exp.paymentMethod + '</div></div>' +
          '<div class="flex items-center gap-3">' +
          '<span class="font-bold font-mono-num text-slate-900">-' + fmtEUR(exp.amount) + '</span>' +
          '<button onclick="deleteExp(\\'' + exp.id + '\\')" class="text-rose-500 hover:text-rose-700 font-bold">×</button>' +
          '</div></div>';
      }).join('');
      document.getElementById('tripExpensesContainer').innerHTML = expHtml || '<p class="text-slate-400 py-3 text-center">Nenhuma compra cadastrada ainda.</p>';
    }

    render();
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `eurotrip-planner-offline-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
