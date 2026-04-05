export interface AuthUser {
  username: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  role?: string;
  authProvider?: string;
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
  authProvider?: string;
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
  authProvider?: string;
}

export interface UpdateUserProfilePayload {
  fullName?: string;
  email?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordByTokenPayload {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
