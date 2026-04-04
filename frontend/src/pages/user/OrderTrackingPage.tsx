import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../api/authApi";
import { getOrderTracking } from "../../api/deliveryApi";
import DeliveryInfoCard from "../../components/delivery/DeliveryInfoCard";
import PaymentInfoCard from "../../components/delivery/PaymentInfoCard";
import ShippingCarrierCard from "../../components/delivery/ShippingCarrierCard";
import ShippingStatusCard from "../../components/delivery/ShippingStatusCard";
import TrackingHistoryList from "../../components/delivery/TrackingHistoryList";
import TrackingSummaryHero from "../../components/delivery/TrackingSummaryHero";
import TrackingTimeline from "../../components/delivery/TrackingTimeline";
import { useOrderTrackingStream } from "../../hooks/useOrderTrackingStream";
import type { DeliveryTrackingViewModel } from "../../types/delivery";
import { getDeliveryStatusMeta } from "../../utils/deliveryTracking";

function TrackingPageSkeleton() {
  return (
    <div className="tracking-shell">
      <div className="tracking-skeleton tracking-skeleton--hero" />
      <div className="tracking-main-grid">
        <div className="tracking-main-column">
          <div className="tracking-skeleton tracking-skeleton--panel" />
          <div className="tracking-skeleton tracking-skeleton--timeline" />
        </div>
        <div className="tracking-sidebar">
          <div className="tracking-skeleton tracking-skeleton--panel" />
          <div className="tracking-skeleton tracking-skeleton--panel" />
          <div className="tracking-skeleton tracking-skeleton--panel" />
        </div>
      </div>
      <div className="tracking-details-grid">
        <div className="tracking-main-column">
          <div className="tracking-skeleton tracking-skeleton--history" />
        </div>
        <div className="tracking-sidebar">
          <div className="tracking-skeleton tracking-skeleton--panel" />
        </div>
      </div>
    </div>
  );
}

function CurrentStatusPanel({ tracking }: { tracking: DeliveryTrackingViewModel }) {
  const meta = getDeliveryStatusMeta(tracking.shippingStatus);

  return (
    <article className={`tracking-panel ${meta.tone === "warning" ? "tracking-panel--warning" : ""}`}>
      <div className="tracking-panel__header">
        <div>
          <p className="tracking-panel__kicker">Tóm tắt hiện tại</p>
          <h3>{tracking.statusLabel || meta.label}</h3>
        </div>
        <span className={`tracking-inline-status tracking-inline-status--${meta.tone}`}>{meta.label}</span>
      </div>

      <p className="tracking-panel__lead">{tracking.statusDescription || meta.description}</p>

      <div className="tracking-summary-list mt-3">
        <div>
          <span>Bước tiếp theo</span>
          <strong>{tracking.nextStep}</strong>
        </div>
        <div>
          <span>Tra cứu vận đơn</span>
          <strong>{tracking.trackingCode || "Chưa có mã vận đơn"}</strong>
        </div>
      </div>
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

  const { lastEvent, streamError, streamStatus } = useOrderTrackingStream(numericOrderId, {
    enabled: !loading && !error && !!tracking,
    onSnapshot: setTracking,
  });

  const streamLabel = useMemo(() => {
    switch (streamStatus) {
      case "connecting":
        return "Đang kết nối luồng cập nhật theo dõi...";
      case "live":
        return lastEvent?.emittedAt
          ? "Trạng thái vận chuyển đang được cập nhật gần thời gian thực."
          : "Đã kết nối luồng cập nhật theo dõi.";
      case "reconnecting":
        return "Kết nối SSE đang gián đoạn, hệ thống đang tự kết nối lại.";
      case "fallback":
        return "Tạm thời đang tải lại dữ liệu khi luồng SSE không ổn định.";
      default:
        return "";
    }
  }, [lastEvent?.emittedAt, streamStatus]);

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
          <TrackingSummaryHero tracking={tracking} />

          {streamLabel ? (
            <div className={`tracking-stream-banner tracking-stream-banner--${streamError ? "warning" : "live"}`}>
              <strong>{streamStatus === "live" ? "Cập nhật trực tiếp" : "Kết nối theo dõi"}</strong>
              <span>{streamLabel}</span>
            </div>
          ) : null}

          <div className="tracking-main-grid">
            <div className="tracking-main-column">
              <CurrentStatusPanel tracking={tracking} />
              <TrackingTimeline currentStatus={tracking.shippingStatus} items={tracking.timeline} />
            </div>

            <aside className="tracking-sidebar tracking-sidebar--primary">
              <ShippingCarrierCard
                shippingProvider={tracking.shippingProvider}
                trackingCode={tracking.trackingCode}
                trackingUrl={tracking.trackingUrl}
              />
              <ShippingStatusCard
                shippingStatus={tracking.shippingStatus}
                statusLabel={tracking.statusLabel}
                shippingNote={tracking.shippingNote}
                failReason={tracking.failReason}
                shippedAt={tracking.shippedAt}
                deliveredAt={tracking.deliveredAt}
              />
              <PaymentInfoCard
                paymentMethod={tracking.paymentMethod}
                paymentStatus={tracking.paymentStatus}
                deliveredAt={tracking.deliveredAt}
              />
            </aside>
          </div>

          <div className="tracking-details-grid">
            <div className="tracking-main-column tracking-main-column--history">
              <TrackingHistoryList items={tracking.history} />
            </div>

            <aside className="tracking-sidebar tracking-sidebar--details">
              <DeliveryInfoCard
                receiverName={tracking.receiverName}
                receiverPhone={tracking.receiverPhone}
                shippingAddress={tracking.shippingAddress}
              />
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
