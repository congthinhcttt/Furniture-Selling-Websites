const DEFAULT_API_BASE_URL = "http://localhost:8080";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
);

export const GOOGLE_LOGIN_URL = `${API_BASE_URL}/oauth2/authorization/google`;

