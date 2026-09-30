import React, { useState } from 'react';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../firebase';
import {
  Plane,
  Shield,
  Sparkles,
  PiggyBank,
  CheckSquare,
  Euro,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  Lock,
  Github,
} from 'lucide-react';

interface LoginScreenProps {
  onContinueAsGuest: () => void;
  onOpenGitHubModal?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onContinueAsGuest, onOpenGitHubModal }) => {
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Erro no login Google:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('A janela do Google foi fechada antes de concluir o login.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMessage('O navegador bloqueou a janela pop-up do Google. Permita pop-ups ou entre com e-mail.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMessage('Domínio não autorizado no Firebase. Se você publicou no GitHub Pages, adicione "github.io" em Firebase Console > Authentication > Settings > Authorized domains.');
      } else {
        setErrorMessage(err.message || 'Falha ao autenticar com o Google. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMessage(null);
    try {
      if (isRegister) {
        if (password.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres.');
        }
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      console.error('Erro na autenticação por email:', err);
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        setErrorMessage('E-mail ou senha incorretos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('Este e-mail já está cadastrado. Tente entrar.');
      } else {
        setErrorMessage(err.message || 'Ocorreu um erro ao entrar.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/40 to-slate-100 flex flex-col justify-between text-slate-800 antialiased p-4 sm:p-6 lg:p-8">
      {/* Header simples */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Plane className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
              EuroTrip Planner
            </h1>
            <span className="text-[11px] text-slate-500 font-medium">
              Europa 23/12 a 02/02
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-sky-700 bg-sky-100/70 border border-sky-200/80 px-3 py-1.5 rounded-full font-medium">
          <Lock className="w-3.5 h-3.5" />
          <span>Acesso individual e protegido</span>
        </div>
      </header>

      {/* Card Central de Login */}
      <main className="max-w-md w-full mx-auto my-8">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-200/90 p-6 sm:p-8 relative overflow-hidden">
          {/* Detalhe superior */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500"></div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 mb-3 shadow-inner">
              <Plane className="w-7 h-7 -rotate-45" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Acesse seu Planner de Viagem
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Entre com a sua conta Google para acessar seu planejamento individual. Seus dados e metas ficam 100% particulares e salvos na nuvem.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Botão Oficial do Google em destaque */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-sm font-semibold transition-all shadow-sm hover:shadow-md hover:border-slate-400 active:scale-[0.99] cursor-pointer disabled:opacity-60"
          >
            {/* SVG Oficial Google Logo */}
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.39 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.61 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{loading ? 'Conectando...' : 'Entrar com o Google'}</span>
          </button>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verificação em 2 etapas (2FA) do próprio Google</span>
          </div>

          {/* Divisor */}
          <div className="flex items-center my-5">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="px-3 text-[11px] text-slate-400 uppercase font-medium">ou</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          {/* Modo Email / Senha */}
          {!isEmailMode ? (
            <button
              type="button"
              onClick={() => setIsEmailMode(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
            >
              Entrar ou cadastrar com E-mail
            </button>
          ) : (
            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Senha</label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo de 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-xs text-sky-600 hover:underline font-medium"
                >
                  {isRegister ? 'Já tenho conta: Entrar' : 'Não tem conta? Cadastrar'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white transition shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {loading ? 'Aguarde...' : isRegister ? 'Cadastrar' : 'Entrar'}
                </button>
              </div>
            </form>
          )}

          {/* Entrar como convidado */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <button
              onClick={onContinueAsGuest}
              className="text-xs text-slate-500 hover:text-slate-800 transition underline underline-offset-2 cursor-pointer font-medium"
            >
              Explorar como visitante (Modo Offline / Sem Login)
            </button>
          </div>
        </div>

        {/* Recursos em destaque */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 backdrop-blur-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0">
              <PiggyBank className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs text-slate-900 truncate">Metas em Reais</div>
              <div className="text-[10px] text-slate-500 truncate">Salários e aportes</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 backdrop-blur-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <Euro className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs text-slate-900 truncate">Gastos em Euros</div>
              <div className="text-[10px] text-slate-500 truncate">Wise, Cartão & Espécie</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 backdrop-blur-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs text-slate-900 truncate">Checklist Enxoval</div>
              <div className="text-[10px] text-slate-500 truncate">Roupas, seguro e mala</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/80 backdrop-blur-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs text-slate-900 truncate">Multi-Dispositivo</div>
              <div className="text-[10px] text-slate-500 truncate">Celular, iPad e PC</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer simples */}
      <footer className="text-center text-xs text-slate-400 py-3 flex flex-col sm:flex-row items-center justify-center gap-3">
        <span>EuroTrip Planner • Cada viajante tem seus dados isolados e privados</span>
        {onOpenGitHubModal && (
          <>
            <span className="hidden sm:inline">•</span>
            <button
              onClick={onOpenGitHubModal}
              className="text-slate-600 hover:text-indigo-600 font-medium inline-flex items-center gap-1 transition cursor-pointer"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Publicar no GitHub Pages</span>
            </button>
          </>
        )}
      </footer>
    </div>
  );
};
