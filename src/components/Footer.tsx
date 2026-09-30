import React, { useRef } from 'react';
import { AppData } from '../types';
import {
  downloadJsonBackup,
  restoreJsonBackup,
  saveAppData,
} from '../utils/storage';
import { exportSingleFileHtml } from '../utils/exportHtml';
import {
  Download,
  Upload,
  FileCode,
  HardDrive,
  RotateCcw,
  ShieldCheck,
  Heart,
  Github,
} from 'lucide-react';

interface FooterProps {
  data: AppData;
  onDataRestored: (newData: AppData) => void;
  onResetAllData: () => void;
  onOpenGitHubModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  data,
  onDataRestored,
  onResetAllData,
  onOpenGitHubModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const restored = await restoreJsonBackup(file);
      onDataRestored(restored);
      alert('Backup restaurado com sucesso!');
    } catch (err: any) {
      alert('Erro ao restaurar backup: ' + (err.message || 'Arquivo inválido'));
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white/70 backdrop-blur-sm py-8 text-slate-600 text-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Backup & Tools Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <span>Backup & Sincronização</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Firebase Nuvem Ativo
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Seus dados sincronizam em tempo real entre iPad, celular e computador, com cópia local de segurança.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Download JSON */}
            <button
              onClick={() => downloadJsonBackup(data)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs font-semibold text-xs transition cursor-pointer"
              title="Baixar cópia de segurança em arquivo JSON"
            >
              <Download className="w-3.5 h-3.5 text-sky-600" />
              <span>Baixar Backup (JSON)</span>
            </button>

            {/* Restore JSON */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs font-semibold text-xs transition cursor-pointer"
              title="Restaurar dados de um backup anterior"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span>Restaurar Backup</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            {/* Export Standalone HTML */}
            <button
              onClick={() => exportSingleFileHtml(data)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm cursor-pointer"
              title="Baixar arquivo HTML único autocontido para abrir em qualquer lugar offline"
            >
              <FileCode className="w-3.5 h-3.5 text-white" />
              <span>Baixar App Offline (.html)</span>
            </button>

            {/* Publicar no GitHub Pages */}
            {onOpenGitHubModal && (
              <button
                onClick={onOpenGitHubModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition shadow-sm cursor-pointer"
                title="Guia passo a passo para hospedar grátis no GitHub Pages com Login e Nuvem"
              >
                <Github className="w-3.5 h-3.5 text-white" />
                <span>Publicar no GitHub Pages</span>
              </button>
            )}
          </div>
        </div>

        {/* Disclaimer & Footer Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2 text-center sm:text-left">
          <div className="flex items-center gap-1">
            <span>Planejador de Viagem Brasil ➔ Europa (23/12 a 02/02)</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onResetAllData}
              className="text-slate-400 hover:text-rose-600 transition flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpar Dados (Em Branco)</span>
            </button>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Privacidade Total</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
