import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api";
import type { DeliveryTrackingApiResponse } from "../types/delivery";

interface UpdateDeliveryStatusPayload {
  status: string;
  shippingNote?: string;
  failReason?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

interface UpdateShippingDetailsPayload {
  shippingProvider?: string;
  trackingCode?: string;
  trackingUrl?: string;
  shippedAt?: string;
  shippingNote?: string;
}

export async function getAdminDelivery(orderId: number) {
  const response = await axiosClient.get<ApiResponse<DeliveryTrackingApiResponse>>(
    `/api/admin/orders/${orderId}/delivery`
  );
  return response.data.data;
}

export async function updateAdminShippingDetails(orderId: number, payload: UpdateShippingDetailsPayload) {
  const response = await axiosClient.put<ApiResponse<DeliveryTrackingApiResponse>>(
    `/api/admin/orders/${orderId}/delivery/shipping-details`,
    payload
  );
  return response.data.data;
}

export async function updateAdminDeliveryStatus(orderId: number, payload: UpdateDeliveryStatusPayload) {
  const response = await axiosClient.put<ApiResponse<DeliveryTrackingApiResponse>>(
    `/api/admin/orders/${orderId}/delivery/status`,
    payload
  );
  return response.data.data;
}
