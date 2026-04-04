export interface OrderItem {
  productId: number;
  productName: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderResponse {
  id: number;
  orderCode: string;
  accountId: number;
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  note?: string;
  totalAmount: number;
  status: string;
  vnpTxnRef?: string;
  vnpTransactionNo?: string;
  bankCode?: string;
  responseCode?: string;
  payDate?: string;
  createdAt: string;
  deliveryStatus?: string;
  deliveryStatusLabel?: string;
  shippingProvider?: string;
  trackingCode?: string;
  trackingUrl?: string;
  shippedAt?: string;
  deliveredAt?: string;
  items: OrderItem[];
}
