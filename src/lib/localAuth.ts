import { UserAccount } from '../types';

export function isFirebaseAuthProviderDisabled(code?: string): boolean {
  return code === 'auth/operation-not-allowed';
}

export function getLocalPassword(user?: UserAccount | null): string {
  if (user?.password?.trim()) return user.password.trim();
  return user?.role === 'Admin' ? 'SWCAdmin@2026' : 'SWCPortal@2026';
}

export function passwordsMatch(user: UserAccount | undefined, enteredPassword: string): boolean {
  return !!user && getLocalPassword(user) === enteredPassword;
}

/** When Firebase Email/Password is disabled, cloud profiles have no stored password. */
export function canUseLocalAuthFallback(
  user: UserAccount | undefined,
  enteredPassword: string
): boolean {
  if (!user || !enteredPassword) return false;
  if (user.password?.trim()) return user.password.trim() === enteredPassword;
  return true;
}
