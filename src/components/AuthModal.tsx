import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { loginWithGoogle, loginWithEmail, registerWithEmail, logoutUser } from '../firebase';
import { X, LogIn, LogOut, CheckCircle2, Shield, User as UserIcon, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await loginWithGoogle();
      setSuccessMessage('Login com Google realizado com sucesso!');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Erro no login Google:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('A janela de login do Google foi fechada antes de concluir.');
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
        setSuccessMessage('Conta criada com sucesso! Você já está conectado(a).');
      } else {
        await loginWithEmail(email, password);
        setSuccessMessage('Login efetuado com sucesso!');
      }
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Erro na autenticação por email:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMessage('E-mail ou senha incorretos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('Este e-mail já está cadastrado. Tente fazer login.');
      } else {
        setErrorMessage(err.message || 'Ocorreu um erro ao autenticar.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      onClose();
    } catch (err: any) {
      setErrorMessage('Erro ao sair da conta: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden relative">
        {/* Header do Modal */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {currentUser ? 'Sua Conta do Planner' : 'Acessar Planner Individual'}
              </h3>
              <p className="text-xs text-slate-500">
                {currentUser
                  ? 'Planner pessoal sincronizado na nuvem'
                  : 'Faça login para ter seu planner exclusivo'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {currentUser ? (
            /* Estado: Já Logado */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Usuário'}
                    className="w-12 h-12 rounded-full border border-slate-200 object-cover shadow-xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 text-sm truncate">
                    {currentUser.displayName || 'Usuário Conectado'}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{currentUser.email}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[11px] font-semibold text-emerald-700">
                      Planner Pessoal Ativo
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed bg-sky-50/60 p-3.5 rounded-xl border border-sky-100">
                🔒 <strong>Planners Isolados:</strong> Todos os seus lançamentos, despesas e checklists estão salvos sob seu e-mail e são 100% privados. Quando sua irmã entrar com a conta dela, ela terá o planner exclusivo dela.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-transparent rounded-xl transition cursor-pointer shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{loading ? 'Saindo...' : 'Sair da Conta'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Estado: Não Logado */
            <div className="space-y-4">
              <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <p className="font-semibold text-slate-800 mb-1">
                  ✨ Cada pessoa com o seu próprio planner:
                </p>
                Você e sua irmã podem usar o mesmo link! Ao fazer login com o Google, o app separa automaticamente os dados:
                <ul className="mt-1.5 space-y-1 text-slate-500 list-disc list-inside">
                  <li>Seu login dá acesso exclusivo às suas metas e entradas.</li>
                  <li>O login da sua irmã abre o painel próprio e independente dela.</li>
                </ul>
              </div>

              {/* Botão Oficial do Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-semibold transition-all shadow-sm hover:shadow hover:border-slate-400 active:scale-[0.99] cursor-pointer disabled:opacity-60"
              >
                {/* SVG Oficial Google Logo */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <span>{loading ? 'Conectando...' : 'Continuar com o Google'}</span>
              </button>

              {/* Divisor */}
              <div className="flex items-center my-3">
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
                  Entrar com E-mail e Senha
                </button>
              ) : (
                <form onSubmit={handleEmailAuth} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">E-mail</label>
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
                    <label className="block text-xs font-medium text-slate-600 mb-1">Senha</label>
                    <input
                      type="password"
                      required
                      placeholder="Pelo menos 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setIsRegister(!isRegister)}
                      className="text-xs text-sky-600 hover:underline"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
