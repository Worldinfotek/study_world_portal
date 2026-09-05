/** Firebase is disconnected. Google Auth / Workspace / Firestore are not used. */
export const FEATURE_UNAVAILABLE = 'Feature not available yet';

export const MASTER_ADMIN_EMAIL = '';

export const auth = {
  currentUser: null as { email?: string } | null,
};

export const googleAuthProvider = null;

export function setCachedAccessToken(_token: string | null) {
  // no-op: Firebase is not connected
}

export async function googleSignIn(): Promise<never> {
  throw new Error(FEATURE_UNAVAILABLE);
}

export async function getAccessToken(): Promise<string | null> {
  throw new Error(FEATURE_UNAVAILABLE);
}

export async function logoutGoogle(): Promise<void> {
  throw new Error(FEATURE_UNAVAILABLE);
}
