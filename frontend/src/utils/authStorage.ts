import type { AuthUser } from "../types/auth";

const AUTH_STORAGE_KEY = "auth";

export function getStoredAuth(): AuthUser | null {
  const localAuth = localStorage.getItem(AUTH_STORAGE_KEY);
  if (localAuth) {
    return JSON.parse(localAuth) as AuthUser;
  }

  const sessionAuth = sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (sessionAuth) {
    return JSON.parse(sessionAuth) as AuthUser;
  }

  return null;
}

export function saveAuth(auth: AuthUser, persist = true) {
  if (persist) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}
