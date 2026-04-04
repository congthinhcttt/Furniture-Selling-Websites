export interface AuthUser {
  username: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  role?: string;
  accountId?: number;
  token?: string;
  tokenType?: string;
  expiresAt?: number;
}

export interface AuthResponseData {
  id: number;
  loginName: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  role?: string;
  token?: string;
  tokenType?: string;
  expiresAt?: number;
  message?: string;
}

export interface UserProfile {
  id: number;
  loginName: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  role?: string;
}
