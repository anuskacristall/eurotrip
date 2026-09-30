import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { TabType, AppData } from './types';
import { loadAppData, INITIAL_DATA, createBlankAppData } from './utils/storage';
import {
  onAuthChange,
  subscribeToUserPlanner,
  saveUserPlanner,
} from './firebase';
import { Header } from './components/Header';
import { PreTripView } from './components/PreTripView';
import { TripExpenseView } from './components/TripExpenseView';
import { ChecklistView } from './components/ChecklistView';
import { WiseExchangeModal } from './components/WiseExchangeModal';
import { JanuarySalaryModal } from './components/JanuarySalaryModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { LoginScreen } from './components/LoginScreen';
import { Footer } from './components/Footer';
import { GitHubPagesModal } from './components/GitHubPagesModal';
import { Plane, LogIn, Sparkles } from 'lucide-react';

export default function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);

  const [data, setData] = useState<AppData>(() => loadAppData());
  const [currentTab, setCurrentTab] = useState<TabType>('pretrip');
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // Modais
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWiseModalOpen, setIsWiseModalOpen] = useState(false);
  const [isJanuaryModalOpen, setIsJanuaryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);

  // Escutar login / logout do Firebase Auth
  useEffect(() => {
    const unsubscribeAuth = onAuthChange((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        setIsGuestMode(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Assinar dados no Firestore específicos do usuário autenticado (ou modo compartilhado/offline)
  useEffect(() => {
    if (authLoading) return;

    const userId = currentUser ? currentUser.uid : null;
    const unsubscribe = subscribeToUserPlanner(userId, (cloudData) => {
      setData(cloudData);
      setIsCloudSynced(true);
    });

    return () => unsubscribe();
  }, [currentUser, authLoading]);

  const handleUpdateData = (updater: (prev: AppData) => AppData) => {
    setData((prev) => {
      const updated = updater(prev);
      const userId = currentUser ? currentUser.uid : null;
      saveUserPlanner(userId, updated);
      return updated;
    });
  };

  const handleResetAllData = () => {
    const blank = createBlankAppData();
    setData(blank);
    const userId = currentUser ? currentUser.uid : null;
    saveUserPlanner(userId, blank);
  };

  // 1. Tela de Carregamento Inicial do Firebase Auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-sky-500/25 animate-pulse mb-3">
          <Plane className="w-7 h-7 -rotate-45" />
        </div>
        <div className="font-bold text-slate-800 text-sm">Carregando EuroTrip Planner...</div>
        <div className="text-xs text-slate-400 mt-1">Conectando ao Firebase</div>
      </div>
    );
  }

  // 2. Tela de Login Dedicada Externa (quando não estiver logado e não escolheu modo visitante)
  if (!currentUser && !isGuestMode) {
    return (
      <>
        <LoginScreen
          onContinueAsGuest={() => setIsGuestMode(true)}
          onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
        />
        <GitHubPagesModal
          isOpen={isGitHubModalOpen}
          onClose={() => setIsGitHubModalOpen(false)}
        />
      </>
    );
  }

  // 3. Aplicação do Planner (quando logado ou no modo visitante)
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Sticky Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'exchange') {
            setIsWiseModalOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        settings={data.settings}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenWiseModal={() => setIsWiseModalOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Banner de convite caso esteja no modo visitante */}
      {!currentUser && isGuestMode && (
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 text-white py-2.5 px-4 text-xs shadow-xs">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <Sparkles className="w-4 h-4 text-sky-200 flex-shrink-0 hidden xs:inline" />
              <span>
                <strong>Modo Visitante:</strong> Faça login com o Google para salvar seu planejamento exclusivo na nuvem e separar seus dados dos da sua família!
              </span>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-slate-900 rounded-lg font-bold text-xs shadow-xs hover:bg-slate-100 transition cursor-pointer flex-shrink-0 whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5 text-sky-600" />
              <span>Fazer Login</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6">
        {currentTab === 'pretrip' && (
          <PreTripView
            data={data}
            onUpdateData={handleUpdateData}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
          />
        )}

        {currentTab === 'trip' && (
          <TripExpenseView
            data={data}
            onUpdateData={handleUpdateData}
            onOpenJanuaryModal={() => setIsJanuaryModalOpen(true)}
            onOpenWiseModal={() => setIsWiseModalOpen(true)}
          />
        )}

        {currentTab === 'checklist' && (
          <ChecklistView
            data={data}
            onUpdateData={handleUpdateData}
          />
        )}
      </main>

      {/* Footer com Backup, Restauração e Exportação */}
      <Footer
        data={data}
        onDataRestored={(restored) => setData(restored)}
        onResetAllData={handleResetAllData}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
      />

      {/* Modal Autenticação & Conta */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Modal Guia de Deploy GitHub Pages */}
      <GitHubPagesModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />

      {/* Modal Câmbio Wise */}
      <WiseExchangeModal
        isOpen={isWiseModalOpen}
        onClose={() => setIsWiseModalOpen(false)}
        data={data}
        onUpdateData={handleUpdateData}
      />

      {/* Modal Injeção Salário de Janeiro */}
      <JanuarySalaryModal
        isOpen={isJanuaryModalOpen}
        onClose={() => setIsJanuaryModalOpen(false)}
        data={data}
        onUpdateData={handleUpdateData}
      />

      {/* Modal Configurações & Parâmetros */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        data={data}
        onUpdateData={handleUpdateData}
        onResetAllData={handleResetAllData}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
      />
    </div>
  );
}
