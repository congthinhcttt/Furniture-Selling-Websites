import { Link } from "react-router-dom";
import type { DeliveryTrackingViewModel } from "../../types/delivery";
import {
  formatAbsoluteDateTime,
  getDeliveryStatusMeta,
  getTrackingHeadline,
} from "../../utils/deliveryTracking";
import DeliveryStatusBadge from "./DeliveryStatusBadge";

interface TrackingSummaryHeroProps {
  tracking: DeliveryTrackingViewModel;
}

export default function TrackingSummaryHero({ tracking }: TrackingSummaryHeroProps) {
  const statusMeta = getDeliveryStatusMeta(tracking.shippingStatus);

  return (
    <header className={`tracking-hero tracking-hero--${statusMeta.tone}`}>
      <div className="tracking-hero__main">
        <div className="tracking-hero__topline">
          <p className="tracking-hero__eyebrow">Theo dõi vận chuyển</p>
          <DeliveryStatusBadge
            status={tracking.shippingStatus}
            label={tracking.statusLabel || statusMeta.label}
          />
        </div>

        <div className="tracking-hero__title-row">
          <div>
            <h1>{getTrackingHeadline(tracking.shippingStatus)}</h1>
            <p className="tracking-hero__subtitle">{statusMeta.description}</p>
            <p className="tracking-hero__order-code">{tracking.orderCode}</p>
          </div>
        </div>

        <div className="tracking-hero__metrics">
          <div className="tracking-hero__metric">
            <span>Đơn vị vận chuyển</span>
            <strong>{tracking.shippingProvider || "Đang cập nhật"}</strong>
            <small>{tracking.trackingCode || "Mã vận đơn sẽ hiển thị khi shop gửi hàng."}</small>
          </div>
          <div className="tracking-hero__metric">
            <span>Đã gửi hàng</span>
            <strong>{tracking.shippedAt ? formatAbsoluteDateTime(tracking.shippedAt) : "Chưa bàn giao"}</strong>
            <small>{tracking.shippingNote || "Shop sẽ cập nhật ghi chú vận chuyển khi có thông tin mới."}</small>
          </div>
          <div className="tracking-hero__metric">
            <span>Hoàn tất giao hàng</span>
            <strong>{tracking.deliveredAt ? formatAbsoluteDateTime(tracking.deliveredAt) : "Chưa hoàn tất"}</strong>
            <small>{tracking.failReason || "Xem lịch sử trạng thái bên dưới để biết tiến trình vận chuyển."}</small>
          </div>
        </div>
      </div>

      <div className="tracking-hero__actions">
        <Link to="/account/orders" className="btn btn-domora-outline">
          Quay lại danh sách đơn
        </Link>
        {tracking.trackingUrl ? (
          <a href={tracking.trackingUrl} target="_blank" rel="noreferrer" className="btn btn-domora">
            Tra cứu vận đơn
          </a>
        ) : null}
      </div>
    </header>
  );
}
