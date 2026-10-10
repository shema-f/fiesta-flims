/**
 * Firebase web configuration, shared by the client SDK (`src/lib/firebase.ts`)
 * and server-side token verification (`src/lib/firebaseVerify.ts`) so the two
 * can never drift apart.
 *
 * These are *web* config values: Firebase publishes them in the browser bundle
 * by design. They identify the project but authorise nothing — access is
 * granted only by a verified ID token or a valid OAuth flow.
 */
export const firebaseConfig = {
  apiKey: 'AIzaSyADbqtdD8-bLXf-X7Y9q6C8ZAI7-nwwUyA',
  authDomain: 'fiestaflix-15748.firebaseapp.com',
  projectId: 'fiestaflix-15748',
  storageBucket: 'fiestaflix-15748.firebasestorage.app',
  messagingSenderId: '51856498086',
  appId: '1:51856498086:web:fc122a1cab2fa6a3dd8367',
  measurementId: 'G-4TEZ8BD6NV',
};
