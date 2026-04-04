import { formatAbsoluteDateTime, getDeliveryStatusMeta } from "../../utils/deliveryTracking";

interface ShippingStatusCardProps {
  shippingStatus: string;
  statusLabel?: string;
  shippingNote?: string;
  failReason?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export default function ShippingStatusCard({
  shippingStatus,
  statusLabel,
  shippingNote,
  failReason,
  shippedAt,
  deliveredAt,
}: ShippingStatusCardProps) {
  const statusMeta = getDeliveryStatusMeta(shippingStatus);
  const normalized = (shippingStatus || "").toUpperCase();

  return (
    <article
      className={`tracking-panel ${normalized === "FAILED" ? "tracking-panel--warning" : "tracking-panel--accent"}`}
    >
      <div className="tracking-panel__header">
        <div>
          <p className="tracking-panel__kicker">Trạng thái vận chuyển</p>
          <h3>{statusLabel || statusMeta.label}</h3>
        </div>
        <span className={`tracking-inline-status tracking-inline-status--${statusMeta.tone}`}>
          {statusMeta.label}
        </span>
      </div>

      <p className="tracking-panel__lead">{statusMeta.description}</p>

      <div className="tracking-summary-list mt-3">
        <div>
          <span>Đã gửi cho đơn vị vận chuyển</span>
          <strong>{shippedAt ? formatAbsoluteDateTime(shippedAt) : "Chưa bàn giao"}</strong>
        </div>
        <div>
          <span>Đã giao thành công</span>
          <strong>{deliveredAt ? formatAbsoluteDateTime(deliveredAt) : "Chưa hoàn tất"}</strong>
        </div>
      </div>

      {shippingNote ? <p className="tracking-panel__hint mt-3">{shippingNote}</p> : null}
      {normalized === "FAILED" && failReason ? <p className="tracking-panel__hint">{failReason}</p> : null}
    </article>
  );
}
