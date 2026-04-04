import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api";
import type {
  CreateReviewPayload,
  Review,
  ReviewPageResponse,
  ReviewQueryParams,
  ReviewSummary,
  ReviewableItem,
  UpdateReviewPayload,
} from "../types/review";

export async function getProductReviewSummary(productId: number) {
  const response = await axiosClient.get<ApiResponse<ReviewSummary>>(
    `/api/user/products/${productId}/reviews/summary`
  );
  return response.data.data;
}

export async function getProductReviews(productId: number, params?: ReviewQueryParams) {
  const response = await axiosClient.get<ApiResponse<ReviewPageResponse>>(
    `/api/user/products/${productId}/reviews`,
    { params }
  );
  return response.data.data;
}

export async function createReview(payload: CreateReviewPayload) {
  const response = await axiosClient.post<ApiResponse<Review>>("/api/user/reviews", payload);
  return response.data.data;
}

export async function updateReview(reviewId: number, payload: UpdateReviewPayload) {
  const response = await axiosClient.put<ApiResponse<Review>>(`/api/user/reviews/${reviewId}`, payload);
  return response.data.data;
}

export async function deleteReview(reviewId: number) {
  await axiosClient.delete<ApiResponse<null>>(`/api/user/reviews/${reviewId}`);
}

export async function markReviewHelpful(reviewId: number) {
  const response = await axiosClient.post<ApiResponse<Review>>(`/api/user/reviews/${reviewId}/helpful`);
  return response.data.data;
}

export async function unmarkReviewHelpful(reviewId: number) {
  const response = await axiosClient.delete<ApiResponse<Review>>(`/api/user/reviews/${reviewId}/helpful`);
  return response.data.data;
}

export async function getMyReviews() {
  const response = await axiosClient.get<ApiResponse<Review[]>>("/api/user/me/reviews");
  return response.data.data;
}

export async function getOrderReviewableItems(orderId: number) {
  const response = await axiosClient.get<ApiResponse<ReviewableItem[]>>(
    `/api/user/orders/${orderId}/reviewable-items`
  );
  return response.data.data;
}
