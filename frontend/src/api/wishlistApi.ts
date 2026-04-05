import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api";
import type {
  WishlistCheckResponse,
  WishlistCountResponse,
  WishlistItem,
} from "../types/wishlist";

export function notifyWishlistUpdated() {
  window.dispatchEvent(new Event("wishlist-updated"));
}

export async function getMyWishlist() {
  const response = await axiosClient.get<ApiResponse<WishlistItem[]>>("/api/user/wishlist");
  return response.data.data;
}

export async function addProductToWishlist(productId: number) {
  const response = await axiosClient.post<ApiResponse<WishlistItem>>(`/api/user/wishlist/${productId}`);
  notifyWishlistUpdated();
  return response.data.data;
}

export async function removeProductFromWishlist(productId: number) {
  await axiosClient.delete<ApiResponse<null>>(`/api/user/wishlist/${productId}`);
  notifyWishlistUpdated();
}

export async function checkProductInWishlist(productId: number) {
  const response = await axiosClient.get<ApiResponse<WishlistCheckResponse>>(
    `/api/user/wishlist/check/${productId}`
  );
  return response.data.data;
}

export async function getWishlistCount() {
  const response = await axiosClient.get<ApiResponse<WishlistCountResponse>>("/api/user/wishlist/count");
  return response.data.data.count;
}
