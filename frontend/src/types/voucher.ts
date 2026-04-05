export interface VoucherApplyRequest {
  code: string;
  subtotal: number;
}

export interface VoucherSummary {
  id: number;
  code: string;
  name: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minOrderValue: number | null;
  maxDiscount: number | null;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherApplyResponse {
  voucherId: number;
  code: string;
  name: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  subtotal: number;
  discountAmount: number;
  finalTotal: number;
}
