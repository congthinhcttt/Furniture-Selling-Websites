import axios from "axios";
import axiosClient from "./axiosClient";
import { GOOGLE_LOGIN_URL } from "../config/runtime";
import type { ApiResponse } from "../types/api";
import type { AuthResponseData, UserProfile } from "../types/auth";

interface LoginPayload {
  loginName: string;
  password: string;
}

interface RegisterPayload {
  loginName: string;
  password: string;
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
