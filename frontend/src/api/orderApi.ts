import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api";
import type { OrderResponse } from "../types/order";

export async function getMyOrders() {
  const response = await axiosClient.get<ApiResponse<OrderResponse[]>>("/api/user/orders");
  return response.data.data;
}

interface CreateOrderPayload {
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  note?: string;
}

interface CreateVnpayPaymentPayload {
  orderId: number;
}

export interface VnpayCreatePaymentResponse {
  orderId: number;
  paymentUrl: string;
  vnpTxnRef: string;
}

export async function createOrder(payload: CreateOrderPayload) {
  const response = await axiosClient.post<ApiResponse<OrderResponse>>("/api/user/orders", payload);
  return response.data.data;
}

export async function createVnpayPayment(payload: CreateVnpayPaymentPayload) {
  const response = await axiosClient.post<ApiResponse<VnpayCreatePaymentResponse>>(
    "/api/user/payments/vnpay/create",
    payload
  );
  return response.data.data;
}
