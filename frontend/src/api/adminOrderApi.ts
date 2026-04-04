import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api";
import type { OrderResponse } from "../types/order";

export async function getAdminOrders() {
  const response = await axiosClient.get<ApiResponse<OrderResponse[]>>("/api/admin/orders");
  return response.data.data;
}

export async function updateAdminOrderStatus(orderId: number, status: string) {
  const response = await axiosClient.patch<ApiResponse<OrderResponse>>(
    `/api/admin/orders/${orderId}/status`,
    null,
    {
      params: { status },
    }
  );

  return response.data.data;
}
