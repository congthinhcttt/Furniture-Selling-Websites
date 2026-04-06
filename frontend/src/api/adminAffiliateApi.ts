import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api";
import type { AffiliateConfig, AffiliateConfigUpdatePayload } from "../types/affiliate";

export async function getAdminAffiliateConfig() {
  const response = await axiosClient.get<ApiResponse<AffiliateConfig>>("/api/admin/affiliate/config");
  return response.data.data;
}

export async function updateAdminAffiliateConfig(payload: AffiliateConfigUpdatePayload) {
  const response = await axiosClient.put<ApiResponse<AffiliateConfig>>("/api/admin/affiliate/config", payload);
  return response.data.data;
}
