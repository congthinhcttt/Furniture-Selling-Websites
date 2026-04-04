import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api";
import type { AdminAccount } from "../types/adminAccount";

export async function getAdminAccounts() {
  const response = await axiosClient.get<ApiResponse<AdminAccount[]>>("/api/admin/accounts");
  return response.data.data;
}

export async function updateAdminAccountRole(accountId: number, role: string) {
  const response = await axiosClient.put<ApiResponse<AdminAccount>>(
    `/api/admin/accounts/${accountId}/role`,
    { role }
  );

  return response.data.data;
}
