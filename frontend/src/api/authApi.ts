import axios from "axios";
import axiosClient from "./axiosClient";
import { GOOGLE_LOGIN_URL } from "../config/runtime";
import type { ApiResponse } from "../types/api";
import type {
  AuthResponseData,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordByTokenPayload,
  UpdateUserProfilePayload,
  UserProfile,
} from "../types/auth";

interface LoginPayload {
  loginName: string;
  password: string;
}

interface RegisterPayload {
  loginName: string;
  password: string;
  referralCode?: string;
}

export { GOOGLE_LOGIN_URL };

export async function loginAccount(payload: LoginPayload): Promise<ApiResponse<AuthResponseData>> {
  const response = await axiosClient.post<ApiResponse<AuthResponseData>>("/api/auth/login", payload);
  return response.data;
}

export async function registerAccount(payload: RegisterPayload): Promise<ApiResponse<AuthResponseData>> {
  const response = await axiosClient.post<ApiResponse<AuthResponseData>>("/api/auth/register", payload);
  return response.data;
}

export async function getCurrentUserProfile(): Promise<UserProfile> {
  const response = await axiosClient.get<ApiResponse<UserProfile>>("/api/auth/me");
  return response.data.data;
}

export async function updateCurrentUserProfile(payload: UpdateUserProfilePayload): Promise<UserProfile> {
  const response = await axiosClient.put<ApiResponse<UserProfile>>("/api/user/profile", payload);
  return response.data.data;
}

export async function uploadCurrentUserAvatar(file: File): Promise<UserProfile> {
  const formData = new FormData();
  formData.append("avatar", file);
  const response = await axiosClient.put<ApiResponse<UserProfile>>("/api/user/profile/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
}

export async function changeCurrentUserPassword(payload: ChangePasswordPayload): Promise<void> {
  await axiosClient.put<ApiResponse<null>>("/api/user/profile/password", payload);
}

export async function forgotPasswordAccount(payload: ForgotPasswordPayload): Promise<string> {
  const response = await axiosClient.post<ApiResponse<null>>("/api/auth/forgot-password/request", payload);
  return response.data.message || "Đã gửi email hướng dẫn đặt lại mật khẩu.";
}

export async function resetPasswordByToken(payload: ResetPasswordByTokenPayload): Promise<void> {
  await axiosClient.post<ApiResponse<null>>("/api/auth/forgot-password/reset", payload);
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;

    if (!message) {
      return fallback;
    }

    if (message.includes("No static resource")) {
      return "API tương ứng chưa sẵn sàng hoặc backend chưa được khởi động lại.";
    }

    return message;
  }

  return fallback;
}
