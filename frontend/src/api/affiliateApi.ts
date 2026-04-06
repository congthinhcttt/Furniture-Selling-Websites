import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api";
import type { UserAffiliateInfo, UserReferralItem } from "../types/affiliate";

export async function getMyAffiliateInfo() {
  const response = await axiosClient.get<ApiResponse<UserAffiliateInfo>>("/api/user/affiliate/me");
  return response.data.data;
}

export async function getMyAffiliateReferrals() {
  const response = await axiosClient.get<ApiResponse<UserReferralItem[]>>("/api/user/affiliate/referrals");
  return response.data.data;
}
