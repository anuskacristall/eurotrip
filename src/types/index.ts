export type TabType = 'pretrip' | 'trip' | 'checklist' | 'exchange';

export type ExpenseCategory = 
  | 'mercado' 
  | 'cafes' 
  | 'transporte' 
  | 'compras' 
  | 'presentes' 
  | 'passeios' 
  | 'outros';

export type PaymentMethod = 'wise' | 'aproximacao' | 'dinheiro';

export type IncomeCategory = string;

export interface Income {
  id: string;
  date: string;
  description: string;
  totalAmount: number; // R$
  tripAmount: number;  // R$ destinado à viagem
  category: string;    // Customizável pelo usuário
  notes?: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  estimatedCostBrl?: number; // R$ ou moeda de compra
  currency?: 'BRL' | 'EUR';
  category: string; // Ex: Roupas de Inverno, Mala & Acessórios, Farmácia, Documentos & Seguro, Eletrônicos
  isPurchased: boolean; // check se já foi comprada/paga
  notes?: string;
  purchaseDate?: string;
  link?: string;
}

export interface FixedCostItem {
  id: string;
  title: string;
  monthlyAmount: number; // R$
  startMonth?: string;   // e.g. "2026-12"
  notes?: string;
  paidMonths: { [yearMonth: string]: boolean }; // e.g. { "2026-10": true, "2026-11": false }
}

export interface TripExpense {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number; // €
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  description: string;
  createdAt: number;
}

export interface WiseExchange {
  id: string;
  date: string;
  brlAmount: number;
  iofRate: number; // e.g. 0.035
  spreadRate: number; // e.g. 0.012
  commercialRate: number;
  effectiveRate: number;
  eurAmount: number;
  notes?: string;
}

export type CurrencyExchange = WiseExchange;

export interface AppSettings {
  euroGoal: number;          // Default: 1000 €
  estimatedRate: number;     // Default: 6.15 R$/€
  initialSavingsBrl: number; // Default: 1400.00 R$
  tripStartDate: string;     // Default: "2026-12-23"
  tripEndDate: string;       // Default: "2027-02-02"
  wiseIofPercent: number;    // Default: 3.5%
  wiseSpreadPercent: number; // Default: 1.2%
}

export interface AppData {
  settings: AppSettings;
  incomes: Income[];
  fixedCosts: FixedCostItem[];
  expenses: TripExpense[];
  exchanges: WiseExchange[];
  checklist?: ChecklistItem[]; // Checklist de itens a comprar pré-viagem
  customIncomeCategories?: string[]; // Categorias personalizadas de entradas
  manualEurAdded: number; // Saldo de euros inserido manualmente se houver
}

export const CATEGORY_INFO: Record<ExpenseCategory, { label: string; icon: string; color: string; bg: string }> = {
  mercado: { label: 'Mercado / Casa', icon: '🛒', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  cafes: { label: 'Cafés / Lanches', icon: '☕', color: 'text-amber-700', bg: 'bg-amber-100' },
  transporte: { label: 'Transporte / Metrô', icon: '🚇', color: 'text-blue-700', bg: 'bg-blue-100' },
  compras: { label: 'Compras / Farmácia', icon: '🛍️', color: 'text-purple-700', bg: 'bg-purple-100' },
  presentes: { label: 'Presentes / Bebê', icon: '🎁', color: 'text-pink-700', bg: 'bg-pink-100' },
  passeios: { label: 'Passeios / Lazer', icon: '🎟️', color: 'text-orange-700', bg: 'bg-orange-100' },
  outros: { label: 'Outros Gastos', icon: '🏷️', color: 'text-slate-700', bg: 'bg-slate-100' },
};

export const PAYMENT_METHODS: Record<PaymentMethod, { label: string; icon: string; description: string }> = {
  wise: { label: 'Cartão Internacional / Débito', icon: '💳', description: 'Nomad, Wise, Inter, C6...' },
  aproximacao: { label: 'Aproximação / Celular', icon: '📱', description: 'Apple Pay, Google Pay, NFC' },
  dinheiro: { label: 'Dinheiro em Espécie', icon: '💶', description: 'Notas & moedas de Euro' },
};

export const INCOME_CATEGORIES: Record<string, { label: string; icon: string }> = {
  salario: { label: 'Salário / Trabalho', icon: '💼' },
  economias: { label: 'Economias Pessoais', icon: '🏦' },
  ajuda_familia: { label: 'Ajuda da Família', icon: '🤝' },
  renda_extra: { label: 'Renda Extra / Vendas', icon: '✨' },
  outros: { label: 'Outras Entradas', icon: '💰' },
};
