import { AppData, AppSettings } from '../types';

export const STORAGE_KEY = 'eurotrip_planner_data_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  euroGoal: 1000,
  estimatedRate: 6.15,
  initialSavingsBrl: 0,
  tripStartDate: '2026-12-23',
  tripEndDate: '2027-02-02',
  wiseIofPercent: 1.1,
  wiseSpreadPercent: 1.2,
};

export const INITIAL_CHECKLIST = [
  {
    id: 'chk-1',
    title: 'Seguro Viagem Europa (Tratado de Schengen - min. 30.000€)',
    estimatedCostBrl: 320.0,
    currency: 'BRL' as const,
    category: 'Documentos & Seguro',
    isPurchased: false,
    notes: 'Obrigatório para entrar na União Europeia',
  },
  {
    id: 'chk-2',
    title: 'Casaco Pesado Impermeável / Corta-Vento Térmico',
    estimatedCostBrl: 450.0,
    currency: 'BRL' as const,
    category: 'Roupas de Inverno',
    isPurchased: false,
    notes: 'Para temperaturas entre 0°C e 8°C no inverno europeu',
  },
  {
    id: 'chk-3',
    title: 'Segunda Pele Térmica (Calça e Blusa Fleece/Térmica)',
    estimatedCostBrl: 180.0,
    currency: 'BRL' as const,
    category: 'Roupas de Inverno',
    isPurchased: false,
    notes: 'Kit com 2 conjuntos',
  },
  {
    id: 'chk-4',
    title: 'Bota ou Tênis Confortável e Resistente à Água',
    estimatedCostBrl: 350.0,
    currency: 'BRL' as const,
    category: 'Calçados',
    isPurchased: false,
    notes: 'Para caminhadas longas (15k a 20k passos/dia)',
  },
  {
    id: 'chk-5',
    title: 'Adaptador Universal de Tomada (Padrão Europeu Tipo C/F)',
    estimatedCostBrl: 55.0,
    currency: 'BRL' as const,
    category: 'Eletrônicos & Acessórios',
    isPurchased: false,
    notes: 'Pinos redondos para tomadas na Europa',
  },
  {
    id: 'chk-6',
    title: 'Powerbank 10.000 ou 20.000 mAh Homologado Anac',
    estimatedCostBrl: 140.0,
    currency: 'BRL' as const,
    category: 'Eletrônicos & Acessórios',
    isPurchased: false,
    notes: 'Carregar na mala de mão, essencial para mapa/Wise na rua',
  },
  {
    id: 'chk-7',
    title: 'Farmacinha Básica (Antigripal, antialérgico, curativos, etc.)',
    estimatedCostBrl: 110.0,
    currency: 'BRL' as const,
    category: 'Farmácia & Cuidados',
    isPurchased: false,
    notes: 'Remédios no exterior exigem receita ou são caros',
  },
  {
    id: 'chk-8',
    title: 'Chip Internacional de Internet (eSIM Europa - Ex: Airalo/Holafly)',
    estimatedCostBrl: 160.0,
    currency: 'BRL' as const,
    category: 'Conectividade',
    isPurchased: false,
    notes: 'Dados móveis ilimitados ou 20GB para 40 dias',
  },
];

export const CLEAN_CATEGORIES = [
  'Salário / Trabalho',
  'Economias Pessoais',
  'Ajuda da Família',
  'Renda Extra / Freela',
  'Outras Entradas',
];

/**
 * Cria uma estrutura de dados totalmente em branco, mantendo apenas a meta de 1.000 €
 * e o checklist inicial não comprado.
 */
export function createBlankAppData(): AppData {
  return {
    settings: {
      ...DEFAULT_SETTINGS,
      euroGoal: 1000,
    },
    incomes: [],
    fixedCosts: [],
    expenses: [],
    exchanges: [],
    checklist: INITIAL_CHECKLIST.map((item) => ({ ...item, isPurchased: false })),
    customIncomeCategories: [...CLEAN_CATEGORIES],
    manualEurAdded: 0,
  };
}

export const INITIAL_DATA: AppData = createBlankAppData();

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAppData(INITIAL_DATA);
      return INITIAL_DATA;
    }
    const parsed = JSON.parse(raw);

    // Filtra categorias indesejadas como 'salario' e 'ajuda_pai'
    const bannedKeys = new Set(['salario', 'ajuda_pai', 'economias', 'ajuda_familia', 'renda_extra', 'outros']);
    const customCats = Array.isArray(parsed.customIncomeCategories)
      ? parsed.customIncomeCategories.filter((c: string) => c && !bannedKeys.has(c))
      : CLEAN_CATEGORIES;

    return {
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
      incomes: Array.isArray(parsed.incomes) ? parsed.incomes : [],
      fixedCosts: Array.isArray(parsed.fixedCosts) ? parsed.fixedCosts : [],
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
      exchanges: Array.isArray(parsed.exchanges) ? parsed.exchanges : [],
      checklist: Array.isArray(parsed.checklist) ? parsed.checklist : INITIAL_CHECKLIST,
      customIncomeCategories: customCats.length > 0 ? customCats : CLEAN_CATEGORIES,
      manualEurAdded: typeof parsed.manualEurAdded === 'number' ? parsed.manualEurAdded : 0,
    };
  } catch (err) {
    console.error('Erro ao ler localStorage:', err);
    return INITIAL_DATA;
  }
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Erro ao salvar no localStorage:', err);
  }
}

export function downloadJsonBackup(data: AppData): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `eurotrip-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function restoreJsonBackup(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (!parsed.settings) {
          throw new Error('Formato de backup inválido');
        }
        saveAppData(parsed);
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo'));
    reader.readAsText(file);
  });
}
