/**
 * Server-side verification of Firebase ID tokens.
 *
 * The client sends a raw `idToken`; Google's Identity Toolkit validates it and
 * tells us which email it actually belongs to. Only that response is trusted —
 * nothing supplied in the request body is. Without this check, any anonymous
 * caller could POST `{ email: "admin@anything" }` and receive an admin role.
 */

import { firebaseConfig } from './firebaseConfig';

const LOOKUP_URL = 'https://identitytoolkit.googleapis.com/v1/accounts:lookup';

function apiKey(): string {
  return process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || firebaseConfig.apiKey;
}

export interface FirebaseProfile {
  uid: string;
  email: string;
  name: string | null;
  photoUrl: string | null;
  emailVerified: boolean;
}

/**
 * Returns the verified profile, or `null` when the token is missing, expired,
 * revoked, or the network call fails. Never throws.
 */
export async function verifyFirebaseIdToken(
  idToken: string | undefined | null
): Promise<FirebaseProfile | null> {
  const key = apiKey();
  if (!idToken || !key) return null;

  try {
    const res = await fetch(`${LOOKUP_URL}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const json = await res.json();
    const user = json?.users?.[0];
    if (!user?.email) return null;

    return {
      uid: String(user.localId || ''),
      email: String(user.email).toLowerCase().trim(),
      name: user.displayName || null,
      photoUrl: user.photoUrl || null,
      emailVerified: Boolean(user.emailVerified),
    };
  } catch (err) {
    console.warn('[firebaseVerify] token verification failed:', (err as Error)?.message);
    return null;
  }
}
