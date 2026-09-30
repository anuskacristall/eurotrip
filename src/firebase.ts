import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User,
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { AppData } from './types';
import { INITIAL_DATA, createBlankAppData, loadAppData, saveAppData } from './utils/storage';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Chave local para dados do usuário quando logado
const getStorageKeyForUser = (userId: string | null) =>
  userId ? `eurotrip_data_${userId}` : 'eurotrip_data';

/**
 * Login com o Google via Pop-up
 */
export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Login com E-mail e Senha (fallback)
 */
export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

/**
 * Cadastro com E-mail e Senha (fallback)
 */
export async function registerWithEmail(email: string, pass: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  return result.user;
}

/**
 * Logout do usuário
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Escuta mudanças de estado de autenticação
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Inscreve-se em tempo real no planner pessoal do usuário autenticado (ou modo compartilhado)
 */
export function subscribeToUserPlanner(
  userId: string | null,
  onDataChanged: (data: AppData) => void,
  onError?: (err: any) => void
): () => void {
  // Caminho do documento no Firestore
  const docRef = userId
    ? doc(db, 'users', userId, 'planner', 'main')
    : doc(db, 'trips', 'main_trip_plan');

  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const cloudData = docSnap.data() as AppData;
        saveAppData(cloudData);
        if (userId) {
          try {
            localStorage.setItem(getStorageKeyForUser(userId), JSON.stringify(cloudData));
          } catch {}
        }
        onDataChanged(cloudData);
      } else {
        // Se ainda não existir no Firestore para este usuário, inicializa com o planner em branco (meta 1000€)
        const blankData = createBlankAppData();
        setDoc(docRef, blankData, { merge: true })
          .then(() => onDataChanged(blankData))
          .catch((err) => console.warn('Erro ao inicializar dados do usuário no Firestore:', err));
      }
    },
    (err) => {
      console.warn('Erro ao escutar dados no Firestore:', err);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
}

/**
 * Salva os dados do planner do usuário no Firestore e no cache local
 */
export async function saveUserPlanner(userId: string | null, data: AppData): Promise<void> {
  saveAppData(data);
  if (userId) {
    try {
      localStorage.setItem(getStorageKeyForUser(userId), JSON.stringify(data));
    } catch {}
  }

  try {
    const docRef = userId
      ? doc(db, 'users', userId, 'planner', 'main')
      : doc(db, 'trips', 'main_trip_plan');
    await setDoc(docRef, data);
  } catch (error) {
    console.error('Falha ao salvar no Firestore:', error);
  }
}
