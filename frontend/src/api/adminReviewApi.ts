import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api";
import type {
  AdminReview,
  AdminReviewPageResponse,
  AdminReviewQueryParams,
} from "../types/review";

interface AdminModerationPayload {
  adminNote?: string;
}

export async function getAdminReviews(params?: AdminReviewQueryParams) {
  const response = await axiosClient.get<ApiResponse<AdminReviewPageResponse>>("/api/admin/reviews", {
    params,
  });
  return response.data.data;
}

export async function getAdminReviewById(reviewId: number) {
  const response = await axiosClient.get<ApiResponse<AdminReview>>(`/api/admin/reviews/${reviewId}`);
  return response.data.data;
}

export async function approveAdminReview(reviewId: number, payload?: AdminModerationPayload) {
  const response = await axiosClient.patch<ApiResponse<AdminReview>>(
    `/api/admin/reviews/${reviewId}/approve`,
    payload ?? {}
  );
  return response.data.data;
}

export async function rejectAdminReview(reviewId: number, payload?: AdminModerationPayload) {
  const response = await axiosClient.patch<ApiResponse<AdminReview>>(
    `/api/admin/reviews/${reviewId}/reject`,
    payload ?? {}
  );
  return response.data.data;
}

export async function hideAdminReview(reviewId: number, payload?: AdminModerationPayload) {
  const response = await axiosClient.patch<ApiResponse<AdminReview>>(
    `/api/admin/reviews/${reviewId}/hide`,
    payload ?? {}
  );
  return response.data.data;
}

export async function unhideAdminReview(reviewId: number, payload?: AdminModerationPayload) {
  const response = await axiosClient.patch<ApiResponse<AdminReview>>(
    `/api/admin/reviews/${reviewId}/unhide`,
    payload ?? {}
  );
  return response.data.data;
}

export async function deleteAdminReview(reviewId: number) {
  await axiosClient.delete<ApiResponse<null>>(`/api/admin/reviews/${reviewId}`);
}
