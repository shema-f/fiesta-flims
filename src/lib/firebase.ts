import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { firebaseConfig } from './firebaseConfig';

// Initialize or reuse Firebase app singleton
export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth & Google Auth Provider
export const firebaseAuth = getAuth(firebaseApp);
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account'
});

// Safe client-side analytics initialization
export async function initFirebaseAnalytics() {
  if (typeof window !== 'undefined' && (await isSupported())) {
    try {
      return getAnalytics(firebaseApp);
    } catch (e) {
      console.warn('[Firebase] Analytics init error:', e);
      return null;
    }
  }
  return null;
}

export { signInWithPopup, firebaseSignOut };
