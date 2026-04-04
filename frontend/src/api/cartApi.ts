import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api";
import type { CartResponse } from "../types/cart";

export function notifyCartUpdated() {
  window.dispatchEvent(new Event("cart-updated"));
}

export async function getMyCart() {
  const response = await axiosClient.get<ApiResponse<CartResponse>>("/api/user/cart");
  return response.data.data;
}

export async function addToCart(productId: number, quantity = 1) {
  const response = await axiosClient.post<ApiResponse<CartResponse>>("/api/user/cart/items", {
    productId,
    quantity,
  });

  notifyCartUpdated();
  return response.data.data;
}

export async function updateCartItemQuantity(productId: number, quantity: number) {
  const response = await axiosClient.put<ApiResponse<CartResponse>>(
    `/api/user/cart/items/${productId}`,
    null,
    {
      params: { quantity },
    }
  );

  notifyCartUpdated();
  return response.data.data;
}

export async function removeCartItem(productId: number) {
  await axiosClient.delete<ApiResponse<null>>(`/api/user/cart/items/${productId}`);
  notifyCartUpdated();
}

export async function clearMyCart() {
  await axiosClient.delete<ApiResponse<null>>("/api/user/cart/clear");
  notifyCartUpdated();
}
