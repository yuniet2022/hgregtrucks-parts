import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth, isConfigured } from './config';

function checkAuth() {
  if (!auth || !isConfigured) throw new Error('Firebase Auth not configured');
  return auth;
}

export function fbSignIn(email: string, password: string) {
  const _auth = checkAuth();
  return signInWithEmailAndPassword(_auth, email, password);
}

export function fbSignOut() {
  const _auth = checkAuth();
  return signOut(_auth);
}

export function fbOnAuthChange(callback: (user: User | null) => void) {
  const _auth = checkAuth();
  return onAuthStateChanged(_auth, callback);
}

export { auth };
