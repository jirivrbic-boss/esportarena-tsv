export type PasswordRecoveryAccount = {
  uid: string;
  email: string;
  displayName: string;
  hasProfile: boolean;
};

const STORAGE_KEY = "esportarena-password-recovery";

export function savePasswordRecoveryAccount(
  account: PasswordRecoveryAccount
): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  } catch {
    /* */
  }
}

export function readPasswordRecoveryAccount(): PasswordRecoveryAccount | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PasswordRecoveryAccount>;
    if (!parsed.email || !parsed.uid) return null;
    return {
      uid: String(parsed.uid),
      email: String(parsed.email),
      displayName: String(parsed.displayName ?? "Účet kapitána"),
      hasProfile: Boolean(parsed.hasProfile),
    };
  } catch {
    return null;
  }
}

export function clearPasswordRecoveryAccount(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* */
  }
}
