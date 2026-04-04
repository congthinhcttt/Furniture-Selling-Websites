import type { DeliveryTimelineItem } from "../types/delivery";

export type DeliveryTone = "completed" | "current" | "upcoming" | "warning";

export interface DeliveryStatusMeta {
  label: string;
  description: string;
  tone: DeliveryTone;
}

export interface DeliveryTimelineStep {
  key: string;
  label: string;
  timestamp?: string;
  description: string;
  state: "completed" | "current" | "upcoming" | "failed";
}

export interface DeliveryTimelineModel {
  steps: DeliveryTimelineStep[];
  warningStep?: DeliveryTimelineStep;
}

const DATETIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export const MAIN_TRACKING_STEPS = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY_TO_SHIP",
  "SHIPPED",
  "DELIVERING",
  "DELIVERED",
] as const;

const WARNING_STATUSES = ["FAILED", "CANCELLED"];

const STATUS_META: Record<string, DeliveryStatusMeta> = {
  PENDING: {
    label: "Chờ xác nhận",
    description: "Shop đã nhận đơn và đang chờ xác nhận.",
    tone: "current",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    description: "Đơn hàng đã được xác nhận và đưa vào quy trình xử lý.",
    tone: "current",
  },
  PREPARING: {
    label: "Đang chuẩn bị",
    description: "Shop đang đóng gói và hoàn tất hàng hóa trước khi giao cho đơn vị vận chuyển.",
    tone: "current",
  },
  READY_TO_SHIP: {
    label: "Sẵn sàng bàn giao",
    description: "Đơn hàng đã sẵn sàng để bàn giao cho đơn vị vận chuyển.",
    tone: "current",
  },
  SHIPPED: {
    label: "Đã gửi hàng",
    description: "Shop đã bàn giao kiện hàng cho đơn vị vận chuyển.",
    tone: "current",
  },
  DELIVERING: {
    label: "Đang giao hàng",
    description: "Đơn hàng đang được đơn vị vận chuyển xử lý và giao tới người nhận.",
    tone: "current",
  },
  DELIVERED: {
    label: "Đã giao thành công",
    description: "Đơn hàng đã được giao thành công.",
    tone: "completed",
  },
  FAILED: {
    label: "Giao thất bại",
    description: "Đơn hàng giao chưa thành công. Shop sẽ cập nhật hướng xử lý tiếp theo nếu cần.",
    tone: "warning",
  },
  CANCELLED: {
    label: "Đã hủy",
    description: "Đơn hàng đã bị hủy.",
    tone: "warning",
  },
};

const NEXT_STEP_MAP: Record<string, string> = {
  PENDING: "Shop sẽ xác nhận đơn trước khi chuẩn bị hàng.",
  CONFIRMED: "Đơn hàng sẽ được chuyển sang khâu đóng gói và chuẩn bị giao.",
  PREPARING: "Shop đang hoàn tất đóng gói để bàn giao cho đơn vị vận chuyển.",
  READY_TO_SHIP: "Thông tin vận đơn sẽ xuất hiện ngay khi shop gửi hàng cho đơn vị vận chuyển.",
  SHIPPED: "Đơn vị vận chuyển đã tiếp nhận kiện hàng.",
  DELIVERING: "Bạn có thể theo dõi tiếp trên trang tra cứu vận đơn của hãng vận chuyển.",
  DELIVERED: "Đơn hàng đã hoàn tất.",
  FAILED: "Shop sẽ liên hệ hoặc cập nhật thêm nếu cần giao lại hay điều chỉnh thông tin.",
  CANCELLED: "Đơn hàng đã dừng xử lý.",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng",
  VNPAY: "VNPay",
};

const PAYMENT_STATUS_META: Record<string, { label: string; tone: DeliveryTone }> = {
  PAID: { label: "Đã thanh toán", tone: "completed" },
  PENDING: { label: "Chờ thanh toán", tone: "current" },
  FAILED: { label: "Thanh toán thất bại", tone: "warning" },
  UNPAID: { label: "Chưa thanh toán", tone: "upcoming" },
};

function parseDate(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatAbsoluteDateTime(value?: string) {
  const date = parseDate(value);
  return date ? DATETIME_FORMATTER.format(date) : "Đang cập nhật";
}

export function getTrackingStatusMeta(status?: string) {
  return STATUS_META[(status || "").toUpperCase()] || {
    label: "Đang cập nhật",
    description: "Hệ thống đang cập nhật trạng thái vận chuyển.",
    tone: "upcoming" as DeliveryTone,
  };
}

export const getDeliveryStatusMeta = getTrackingStatusMeta;

export function getStatusDescription(status?: string) {
  return getTrackingStatusMeta(status).description;
}

export function getNextStepText(status?: string) {
  return NEXT_STEP_MAP[(status || "").toUpperCase()] || "Shop sẽ tiếp tục cập nhật trạng thái vận chuyển cho bạn.";
}

export function isWarningTrackingStatus(status?: string) {
  return WARNING_STATUSES.includes((status || "").toUpperCase());
}

export function getTrackingHeadline(status?: string) {
  switch ((status || "").toUpperCase()) {
    case "DELIVERED":
      return "Đơn hàng đã giao thành công";
    case "FAILED":
      return "Đơn hàng giao chưa thành công";
    case "CANCELLED":
      return "Đơn hàng đã bị hủy";
    default:
      return "Theo dõi vận chuyển";
  }
}

export function getPaymentMethodLabel(method?: string) {
  return PAYMENT_METHOD_LABELS[(method || "").toUpperCase()] || method || "Đang cập nhật";
}

export function getPaymentStatusLabel(status?: string) {
  return PAYMENT_STATUS_META[(status || "").toUpperCase()]?.label || "Đang cập nhật";
}

export function getPaymentStatusTone(status?: string): DeliveryTone {
  return PAYMENT_STATUS_META[(status || "").toUpperCase()]?.tone || "upcoming";
}

export function resolveStepState(stepStatus: string, currentStatus: string): DeliveryTimelineStep["state"] {
  const normalizedCurrent = (currentStatus || "").toUpperCase();
  const normalizedStep = (stepStatus || "").toUpperCase();
  const currentIndex = MAIN_TRACKING_STEPS.indexOf(normalizedCurrent as (typeof MAIN_TRACKING_STEPS)[number]);
  const stepIndex = MAIN_TRACKING_STEPS.indexOf(normalizedStep as (typeof MAIN_TRACKING_STEPS)[number]);

  if (normalizedCurrent === "DELIVERED") {
    return stepIndex <= MAIN_TRACKING_STEPS.indexOf("DELIVERED") ? "completed" : "upcoming";
  }

  if (isWarningTrackingStatus(normalizedCurrent)) {
    return stepIndex < MAIN_TRACKING_STEPS.indexOf("DELIVERING") ? "completed" : "upcoming";
  }

  if (currentIndex === -1 || stepIndex === -1) {
    return "upcoming";
  }

  if (stepIndex < currentIndex) {
    return "completed";
  }

  if (stepIndex === currentIndex) {
    return "current";
  }

  return "upcoming";
}

export function getTimelineSteps(currentStatus: string, items: DeliveryTimelineItem[]): DeliveryTimelineModel {
  const normalized = (currentStatus || "").toUpperCase();
  const latestByStatus = new Map(items.map((item) => [item.status, item]));

  const steps = MAIN_TRACKING_STEPS.map((status) => {
    const item = latestByStatus.get(status);
    const meta = getTrackingStatusMeta(status);

    return {
      key: status,
      label: meta.label,
      description: item?.description || meta.description,
      timestamp: item?.changedAt,
      state: resolveStepState(status, normalized),
    } satisfies DeliveryTimelineStep;
  });

  const warningStep = isWarningTrackingStatus(normalized)
    ? {
        key: normalized,
        label: getTrackingStatusMeta(normalized).label,
        description:
          latestByStatus.get(normalized)?.note ||
          latestByStatus.get(normalized)?.description ||
          getTrackingStatusMeta(normalized).description,
        timestamp: latestByStatus.get(normalized)?.changedAt,
        state: "failed" as const,
      }
    : undefined;

  return { steps, warningStep };
}
