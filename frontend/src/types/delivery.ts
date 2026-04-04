export interface DeliveryTimelineItem {
  status: string;
  statusLabel: string;
  description: string;
  note?: string;
  changedBy?: string;
  changedByRole?: string;
  changedAt: string;
}

export interface DeliveryTrackingApiResponse {
  orderId: number;
  orderCode: string;
  shippingStatus: string;
  statusLabel: string;
  shippedAt?: string;
  deliveredAt?: string;
  shippingProvider?: string;
  trackingCode?: string;
  trackingUrl?: string;
  shippingNote?: string;
  failReason?: string;
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  trackingTimeline: DeliveryTimelineItem[];
}

export interface DeliveryTrackingViewModel extends DeliveryTrackingApiResponse {
  statusDescription: string;
  nextStep: string;
  timeline: DeliveryTimelineItem[];
  history: DeliveryTimelineItem[];
}

export interface DeliveryRealtimeEvent {
  eventType: string;
  orderId: number;
  emittedAt: string;
  tracking: DeliveryTrackingViewModel;
}
