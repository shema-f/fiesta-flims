import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Official Fiesta Flix Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyADbqtdD8-bLXf-X7Y9q6C8ZAI7-nwwUyA",
  authDomain: "fiestaflix-15748.firebaseapp.com",
  projectId: "fiestaflix-15748",
  storageBucket: "fiestaflix-15748.firebasestorage.app",
  messagingSenderId: "51856498086",
  appId: "1:51856498086:web:fc122a1cab2fa6a3dd8367",
  measurementId: "G-4TEZ8BD6NV"
};

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
