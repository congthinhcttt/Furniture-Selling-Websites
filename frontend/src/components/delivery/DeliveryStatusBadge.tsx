import { getDeliveryStatusMeta } from "../../utils/deliveryTracking";

interface DeliveryStatusBadgeProps {
  status: string;
  label?: string;
  size?: "sm" | "md";
}

function getBadgeClass(status: string) {
  switch (getDeliveryStatusMeta(status).tone) {
    case "completed":
      return "tracking-status-badge--completed";
    case "warning":
      return "tracking-status-badge--warning";
    case "current":
      return "tracking-status-badge--current";
    default:
      return "tracking-status-badge--upcoming";
  }
}

export default function DeliveryStatusBadge({ status, label, size = "md" }: DeliveryStatusBadgeProps) {
  const meta = getDeliveryStatusMeta(status);

  return (
    <span className={`tracking-status-badge ${getBadgeClass(status)} tracking-status-badge--${size}`}>
      {label || meta.label}
    </span>
  );
}
