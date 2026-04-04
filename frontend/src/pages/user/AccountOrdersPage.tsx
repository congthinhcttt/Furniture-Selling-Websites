import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../api/authApi";
import { getMyOrders } from "../../api/orderApi";
import type { OrderResponse } from "../../types/order";
import {
  getDeliveryStatusMeta,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getPaymentStatusTone,
} from "../../utils/deliveryTracking";

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")} đ`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("vi-VN");
}

function mapToneToBadgeClass(tone: string) {
  switch (tone) {
    case "completed":
      return "approved";
    case "warning":
      return "rejected";
    case "current":
      return "pending";
    default:
      return "hidden";
  }
}

export default function AccountOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");
        setOrders(await getMyOrders());
      } catch (err) {
        setError(getApiErrorMessage(err, "Không thể tải danh sách đơn hàng."));
      } finally {
        setLoading(false);
      }
    };

    void fetchOrders();
  }, []);

  return (
    <section className="info-page">
      <div className="container info-page-section">
        <div className="account-main-grid">
          <div className="info-card info-card-large">
            <div className="account-section-heading">
              <div>
                <p className="account-section-kicker">Theo dõi đơn hàng</p>
                <h2>Đơn hàng của tôi</h2>
              </div>
              <span className="account-section-chip">{orders.length} đơn hàng</span>
            </div>

            <p className="account-note">
              Theo dõi trạng thái xử lý, đơn vị vận chuyển và mã vận đơn cho từng đơn hàng.
            </p>

            {loading ? (
              <p>Đang tải đơn hàng...</p>
            ) : error ? (
              <p>{error}</p>
            ) : orders.length === 0 ? (
              <p>Bạn chưa có đơn hàng nào.</p>
            ) : (
              <div className="account-order-list-expanded">
                {orders.map((order) => {
                  const deliveryMeta = getDeliveryStatusMeta(order.deliveryStatus || order.status);
                  const paymentTone = getPaymentStatusTone(order.paymentStatus);

                  return (
                    <article className="account-order-summary-card" key={order.id}>
                      <div className="account-order-summary__top">
                        <div>
                          <strong>{order.orderCode || `Đơn #${order.id}`}</strong>
                          <p>{formatDate(order.createdAt)}</p>
                        </div>
                        <span className={`account-status-badge ${mapToneToBadgeClass(deliveryMeta.tone)}`}>
                          {order.deliveryStatusLabel || deliveryMeta.label}
                        </span>
                      </div>

                      <div className="account-order-summary__meta">
                        <div className="account-order-summary__metric">
                          <span className="account-grid-label">Tổng tiền</span>
                          <strong>{formatCurrency(order.totalAmount)}</strong>
                        </div>
                        <div className="account-order-summary__metric">
                          <span className="account-grid-label">Thanh toán</span>
                          <strong>{getPaymentMethodLabel(order.paymentMethod)}</strong>
                        </div>
                        <div className="account-order-summary__metric">
                          <span className="account-grid-label">Trạng thái thanh toán</span>
                          <strong className={`account-status-badge ${mapToneToBadgeClass(paymentTone)}`}>
                            {getPaymentStatusLabel(order.paymentStatus)}
                          </strong>
                        </div>
                        <div className="account-order-summary__metric">
                          <span className="account-grid-label">Vận chuyển</span>
                          <strong>{order.shippingProvider || "Đang cập nhật"}</strong>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-domora account-order-summary__action"
                        onClick={() => navigate(`/orders/${order.id}/tracking`)}
                      >
                        Xem theo dõi đơn hàng
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
