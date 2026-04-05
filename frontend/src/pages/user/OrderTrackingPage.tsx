import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../api/authApi";
import { getOrderTracking } from "../../api/deliveryApi";
import DeliveryStatusBadge from "../../components/common/DeliveryStatusBadge";
import { useOrderTrackingStream } from "../../hooks/useOrderTrackingStream";
import type { DeliveryTrackingViewModel } from "../../types/delivery";
import {
  formatAbsoluteDateTime,
  getDeliveryStatusMeta,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getTimelineSteps,
} from "../../utils/deliveryTracking";

function TrackingPageSkeleton() {
  return (
    <div className="tracking-shell">
      <div className="tracking-skeleton tracking-skeleton--hero" />
      <div className="tracking-skeleton tracking-skeleton--timeline" />
    </div>
  );
}

function CompactTrackingCard({ tracking }: { tracking: DeliveryTrackingViewModel }) {
  const meta = getDeliveryStatusMeta(tracking.shippingStatus);
  const timeline = getTimelineSteps(tracking.shippingStatus, tracking.timeline).steps;
  const [showAllHistory, setShowAllHistory] = useState(false);
  const historyItems = showAllHistory ? tracking.history : tracking.history.slice(0, 5);

  return (
    <article className="tracking-panel tracking-compact">
      <div className="tracking-compact__head">
        <div>
          <p className="tracking-panel__kicker">Theo dõi đơn hàng</p>
          <h2>#{tracking.orderCode}</h2>
          <p className="tracking-compact__desc">{tracking.statusDescription || meta.description}</p>
        </div>
        <DeliveryStatusBadge status={tracking.shippingStatus} label={tracking.statusLabel || meta.label} />
      </div>

      <div className="tracking-compact__meta">
        <div>
          <span>Mã vận đơn</span>
          <strong>{tracking.trackingCode || "Đang cập nhật"}</strong>
        </div>
        <div>
          <span>Đơn vị vận chuyển</span>
          <strong>{tracking.shippingProvider || "Đang cập nhật"}</strong>
        </div>
        <div>
          <span>Thanh toán</span>
          <strong>{getPaymentMethodLabel(tracking.paymentMethod)}</strong>
          <DeliveryStatusBadge
            status={tracking.paymentStatus}
            label={getPaymentStatusLabel(tracking.paymentStatus)}
            size="sm"
          />
        </div>
      </div>

      <div className="tracking-compact__delivery">
        <div>
          <span>Người nhận</span>
          <strong>{tracking.receiverName}</strong>
          <small>{tracking.receiverPhone}</small>
        </div>
        <div>
          <span>Địa chỉ giao hàng</span>
          <strong>{tracking.shippingAddress}</strong>
        </div>
      </div>

      <div className="tracking-compact__timeline">
        {timeline.map((step) => (
          <div key={step.key} className={`tracking-compact-step tracking-compact-step--${step.state}`}>
            <div className="tracking-compact-step__marker" />
            <div className="tracking-compact-step__content">
              <div className="tracking-compact-step__head">
                <strong>{step.label}</strong>
                <span>{step.timestamp ? formatAbsoluteDateTime(step.timestamp) : "-"}</span>
              </div>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="tracking-compact__detail-grid">
        <div>
          <span>Thời gian gửi hàng</span>
          <strong>{tracking.shippedAt ? formatAbsoluteDateTime(tracking.shippedAt) : "Đang cập nhật"}</strong>
        </div>
        <div>
          <span>Thời gian giao thành công</span>
          <strong>{tracking.deliveredAt ? formatAbsoluteDateTime(tracking.deliveredAt) : "Chưa giao"}</strong>
        </div>
        <div>
          <span>Bước tiếp theo</span>
          <strong>{tracking.nextStep}</strong>
        </div>
      </div>

      {(tracking.shippingNote || tracking.failReason) && (
        <div className="tracking-compact__notes">
          {tracking.shippingNote && (
            <div>
              <span>Ghi chú giao hàng</span>
              <p>{tracking.shippingNote}</p>
            </div>
          )}
          {tracking.failReason && (
            <div>
              <span>Lý do thất bại</span>
              <p>{tracking.failReason}</p>
            </div>
          )}
        </div>
      )}

      <div className="tracking-compact__history">
        <div className="tracking-compact__history-head">
          <h3>Lịch sử cập nhật</h3>
          {tracking.history.length > 5 && (
            <button type="button" className="btn btn-domora-outline btn-sm" onClick={() => setShowAllHistory((v) => !v)}>
              {showAllHistory ? "Thu gọn" : "Xem đầy đủ"}
            </button>
          )}
        </div>

        {historyItems.map((item, index) => (
          <div key={`${item.status}-${item.changedAt}-${index}`} className="tracking-compact-history-item">
            <div className="tracking-compact-history-item__top">
              <strong>{item.statusLabel}</strong>
              <span>{formatAbsoluteDateTime(item.changedAt)}</span>
            </div>
            <p>{item.description}</p>
            <div className="tracking-compact-history-item__meta">
              <small>
                Cập nhật bởi: {item.changedBy || "Hệ thống"} {item.changedByRole ? `(${item.changedByRole})` : ""}
              </small>
              {item.note ? <small>Ghi chú: {item.note}</small> : null}
            </div>
          </div>
        ))}
      </div>

      {tracking.trackingUrl ? (
        <div className="tracking-compact__actions">
          <a
            href={tracking.trackingUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-domora-outline btn-sm"
          >
            Tra cứu với đơn vị vận chuyển
          </a>
        </div>
      ) : null}
    </article>
  );
}

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const numericOrderId = Number(orderId);
  const [tracking, setTracking] = useState<DeliveryTrackingViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadNonce, setReloadNonce] = useState(0);

  useEffect(() => {
    if (!numericOrderId) {
      setError("Không tìm thấy đơn hàng.");
      setLoading(false);
      return;
    }

    let active = true;

    const fetchTracking = async () => {
      try {
        setLoading(true);
        setError("");
        const snapshot = await getOrderTracking(numericOrderId);

        if (active) {
          setTracking(snapshot);
        }
      } catch (err) {
        if (active) {
          setError(getApiErrorMessage(err, "Không thể tải thông tin theo dõi vận chuyển."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchTracking();

    return () => {
      active = false;
    };
  }, [numericOrderId, reloadNonce]);

  const { streamError, streamStatus } = useOrderTrackingStream(numericOrderId, {
    enabled: !loading && !error && !!tracking,
    onSnapshot: setTracking,
  });

  const streamLabel = useMemo(() => {
    switch (streamStatus) {
      case "connecting":
        return "Đang kết nối cập nhật.";
      case "live":
        return "Đang cập nhật thời gian thực.";
      case "reconnecting":
        return "Đang kết nối lại.";
      case "fallback":
        return "Đang tải lại dữ liệu.";
      default:
        return "";
    }
  }, [streamStatus]);

  if (loading) {
    return (
      <section className="tracking-page">
        <div className="container py-5">
          <TrackingPageSkeleton />
        </div>
      </section>
    );
  }

  if (error || !tracking) {
    return (
      <section className="tracking-page">
        <div className="container py-5">
          <div className="tracking-feedback tracking-feedback--error">
            <div className="tracking-feedback__icon" />
            <h2>Không thể tải theo dõi đơn hàng</h2>
            <p>{error || "Thông tin theo dõi hiện không khả dụng."}</p>
            <div className="tracking-feedback__actions">
              <button type="button" className="btn btn-domora" onClick={() => setReloadNonce((value) => value + 1)}>
                Thử lại
              </button>
              <Link to="/account/orders" className="btn btn-domora-outline">
                Quay lại đơn hàng
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="tracking-page">
      <div className="container py-5">
        <div className="tracking-shell">
          {streamLabel ? (
            <div className={`tracking-stream-banner tracking-stream-banner--${streamError ? "warning" : "live"}`}>
              <strong>Theo dõi đơn hàng</strong>
              <span>{streamLabel}</span>
            </div>
          ) : null}

          <CompactTrackingCard tracking={tracking} />
        </div>
      </div>
    </section>
  );
}
