import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api";
import type {
  DeliveryRealtimeEvent,
  DeliveryTimelineItem,
  DeliveryTrackingApiResponse,
  DeliveryTrackingViewModel,
} from "../types/delivery";
import { API_BASE_URL } from "../config/runtime";
import { getStoredAuth } from "../utils/authStorage";
import { getNextStepText, getStatusDescription } from "../utils/deliveryTracking";

function normalizeLegacyTrackingText(value?: string) {
  if (!value) {
    return value;
  }

  return value
    .replace(/Dang giao hang/g, "Đang giao hàng")
    .replace(/dang giao hang/g, "đang giao hàng")
    .replace(/Tai xe da lay hang/g, "Đơn vị vận chuyển đã tiếp nhận hàng")
    .replace(/tai xe da lay hang/g, "đơn vị vận chuyển đã tiếp nhận hàng")
    .replace(/Da gan tai xe/g, "Đã cập nhật đơn vị vận chuyển")
    .replace(/da gan tai xe/g, "đã cập nhật đơn vị vận chuyển")
    .replace(/San sang giao/g, "Sẵn sàng bàn giao")
    .replace(/san sang giao/g, "sẵn sàng bàn giao")
    .replace(/Dang chuan bi hang/g, "Đang chuẩn bị hàng")
    .replace(/dang chuan bi hang/g, "đang chuẩn bị hàng")
    .replace(/Tai xe/g, "Đơn vị vận chuyển")
    .replace(/tai xe/g, "đơn vị vận chuyển")
    .replace(/shipper/g, "đơn vị vận chuyển")
    .replace(/Don hang dang tren duong giao den khach\./g, "Đơn hàng đang được vận chuyển tới khách.")
    .replace(/Don hang da san sang de giao\./g, "Đơn hàng đã sẵn sàng bàn giao cho đơn vị vận chuyển.")
    .replace(/Don hang dang duoc chuan bi\./g, "Đơn hàng đang được chuẩn bị.")
    .replace(/Tai xe da lay hang khoi kho\./g, "Đơn vị vận chuyển đã tiếp nhận hàng tại kho.")
    .replace(/Da gan shipper cho don hang\./g, "Đã cập nhật đơn vị vận chuyển cho đơn hàng.");
}

function normalizeTimelineItem(item: DeliveryTimelineItem): DeliveryTimelineItem {
  return {
    ...item,
    statusLabel: normalizeLegacyTrackingText(item.statusLabel) || item.statusLabel,
    description: normalizeLegacyTrackingText(item.description) || item.description,
    note: normalizeLegacyTrackingText(item.note),
  };
}

export function normalizeTrackingResponse(payload: DeliveryTrackingApiResponse): DeliveryTrackingViewModel {
  const timeline = payload.trackingTimeline.map(normalizeTimelineItem);

  return {
    ...payload,
    statusDescription: getStatusDescription(payload.shippingStatus),
    nextStep: getNextStepText(payload.shippingStatus),
    trackingTimeline: timeline,
    timeline,
    history: [...timeline].reverse(),
  };
}

export async function getOrderTracking(orderId: number) {
  const response = await axiosClient.get<ApiResponse<DeliveryTrackingApiResponse>>(
    `/api/user/orders/${orderId}/tracking`
  );
  return normalizeTrackingResponse(response.data.data);
}

export async function getOrderTrackingTimeline(orderId: number) {
  const response = await axiosClient.get<ApiResponse<DeliveryTimelineItem[]>>(
    `/api/user/orders/${orderId}/tracking/timeline`
  );
  return response.data.data;
}

export function normalizeTrackingEvent(payload: {
  eventType: string;
  orderId: number;
  emittedAt: string;
  tracking: DeliveryTrackingApiResponse;
}): DeliveryRealtimeEvent {
  return {
    ...payload,
    tracking: normalizeTrackingResponse(payload.tracking),
  };
}

export function subscribeOrderTracking(
  orderId: number,
  handlers: {
    onMessage: (payload: DeliveryRealtimeEvent) => void;
    onError?: () => void;
  }
) {
  const token = getStoredAuth()?.token;
  if (!token) {
    return null;
  }

  const streamUrl = new URL(`${API_BASE_URL}/api/user/orders/${orderId}/tracking/stream`);
  streamUrl.searchParams.set("token", token);

  const eventSource = new EventSource(streamUrl.toString());
  eventSource.onmessage = (event) => {
    const payload = JSON.parse(event.data) as {
      eventType: string;
      orderId: number;
      emittedAt: string;
      tracking: DeliveryTrackingApiResponse;
    };

    handlers.onMessage(normalizeTrackingEvent(payload));
  };
  eventSource.onerror = () => {
    handlers.onError?.();
  };

  return eventSource;
}
