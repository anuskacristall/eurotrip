import React, { useState } from 'react';
import {
  X,
  Github,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Globe,
  KeyRound,
  Rocket,
  ShieldCheck,
  ChevronRight,
  Info,
} from 'lucide-react';

interface GitHubPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubPagesModal: React.FC<GitHubPagesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10">
              <Github className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">
                  Publicar no GitHub Pages
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  100% Gratuito
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Seu app online, com login seguro do Google e banco na nuvem sem custos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Destaque explicativo */}
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-sky-950 space-y-1">
              <p className="font-bold text-sky-900">
                Sim, é 100% funcional e o Login com Google funciona perfeitamente!
              </p>
              <p className="text-sky-800 leading-relaxed">
                O GitHub Pages hospeda o código da aplicação de graça. Como este app é um React SPA que se conecta diretamente ao Firebase no navegador, o login do Google e a sincronização em tempo real funcionam sem precisar de servidor pago.
              </p>
            </div>
          </div>

          {/* O que já configuramos no projeto */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <h4 className="font-bold text-emerald-950 text-xs flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Já pré-configurado no seu projeto:
            </h4>
            <ul className="text-xs text-emerald-800 space-y-1 list-disc list-inside">
              <li>
                <strong>Caminhos relativos (base: './'):</strong> Ajustado no <code className="bg-emerald-100/80 px-1 py-0.5 rounded text-emerald-900 font-mono">vite.config.ts</code> para carregar no subdiretório do GitHub.
              </li>
              <li>
                <strong>Publicação Automática:</strong> Arquivo <code className="bg-emerald-100/80 px-1 py-0.5 rounded text-emerald-900 font-mono">.github/workflows/deploy.yml</code> criado para fazer o deploy a cada atualização.
              </li>
            </ul>
          </div>

          {/* Passo a passo */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Rocket className="w-4 h-4 text-indigo-600" />
              Passo a Passo para Colocar no Ar:
            </h4>

            {/* Passo 1 */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]">1</span>
                Criar Repositório no GitHub
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Acesse o <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold hover:underline inline-flex items-center gap-0.5">GitHub <ExternalLink className="w-3 h-3" /></a> e crie um novo repositório (ex: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-800">eurotrip-planner</code>). Pode ser <strong>Público</strong> ou <strong>Privado</strong>.
              </p>
              <p className="text-xs text-slate-500">
                Envie os arquivos deste projeto para o seu repositório (via Git ou pelo botão "Upload files" do GitHub).
              </p>
            </div>

            {/* Passo 2 */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]">2</span>
                Ativar o GitHub Pages no Repositório
              </div>
              <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>No seu repositório no GitHub, clique na aba <strong>Settings</strong> (Configurações).</li>
                <li>No menu da esquerda, clique em <strong>Pages</strong>.</li>
                <li>
                  Em <strong>Build and deployment &gt; Source</strong>, escolha: <strong className="text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">GitHub Actions</strong>.
                </li>
                <li>O GitHub executará o arquivo que criamos automaticamente e gerará o seu link!</li>
              </ol>
            </div>

            {/* Passo 3 */}
            <div className="border border-amber-200 rounded-2xl p-4 bg-amber-50/50 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[11px]">3</span>
                <span>Autorizar o Domínio no Firebase (Para o Login do Google funcionar)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Por segurança, o Google exige que você autorize o endereço onde o login será feito:
              </p>
              <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside leading-relaxed">
                <li>
                  Acesse o <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-amber-800 font-bold hover:underline inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-3 h-3" /></a>.
                </li>
                <li>Entre em <strong>Authentication</strong> ➔ aba <strong>Settings</strong> (Configurações).</li>
                <li>Role até <strong>Authorized domains</strong> (Domínios autorizados) e clique em <strong>Add domain</strong>.</li>
                <li>
                  Cole o domínio do GitHub:
                  <div className="mt-1.5 flex items-center gap-2">
                    <code className="bg-amber-100 text-amber-900 px-2 py-1 rounded-lg font-mono text-xs font-bold border border-amber-300">
                      github.io
                    </code>
                    <button
                      onClick={() => handleCopy('github.io', 'domain')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer shadow-2xs"
                    >
                      {copiedText === 'domain' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </li>
              </ol>
              <div className="text-[11px] text-amber-900 bg-amber-100/70 p-2.5 rounded-xl border border-amber-200">
                💡 <strong>Dica:</strong> Adicionar <code className="font-mono font-bold">github.io</code> autoriza tanto seu link atual quanto qualquer teste que fizer. Leva menos de 10 segundos!
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sem custos de hospedagem, sem cartão de crédito</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition cursor-pointer"
          >
            Entendido!
          </button>
        </div>
      </div>
    </div>
  );
};
