import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api";
import type {
  VoucherApplyRequest,
  VoucherApplyResponse,
  VoucherSummary,
} from "../types/voucher";

export async function getAvailableVouchers() {
  const response = await axiosClient.get<ApiResponse<VoucherSummary[]>>(
    "/api/user/vouchers/available"
  );

  return response.data.data;
}

export async function applyVoucher(payload: VoucherApplyRequest) {
  const response = await axiosClient.post<ApiResponse<VoucherApplyResponse>>(
    "/api/user/vouchers/apply",
    payload
  );

  return response.data.data;
}
