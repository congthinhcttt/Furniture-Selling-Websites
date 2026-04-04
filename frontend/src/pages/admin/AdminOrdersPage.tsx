import { useEffect, useMemo, useState } from "react";
import {
  getAdminDelivery,
  updateAdminDeliveryStatus,
  updateAdminShippingDetails,
} from "../../api/adminDeliveryApi";
import { getApiErrorMessage } from "../../api/authApi";
import { getAdminOrders } from "../../api/adminOrderApi";
import Pagination from "../../components/common/Pagination";
import type { DeliveryTrackingApiResponse } from "../../types/delivery";
import type { OrderResponse } from "../../types/order";
import { clampPage, getTotalPages, paginateItems } from "../../utils/pagination";

const ADMIN_ORDERS_PER_PAGE = 8;
const STATUS_OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY_TO_SHIP",
  "SHIPPED",
  "DELIVERING",
  "DELIVERED",
  "FAILED",
  "CANCELLED",
];
const SHIPPING_PROVIDERS = ["GHN", "GHTK", "Viettel Post", "J&T Express", "Ninja Van"];

function formatPrice(price: number) {
  return `${price.toLocaleString("vi-VN")} đ`;
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleString("vi-VN") : "Đang cập nhật";
}

function toDateTimeLocalValue(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
}

function toIsoDateTime(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Thời điểm không hợp lệ.");
  }

  return date.toISOString();
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [deliveryDetail, setDeliveryDetail] = useState<DeliveryTrackingApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [pendingAction, setPendingAction] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [shippingForm, setShippingForm] = useState({
    shippingProvider: "",
    trackingCode: "",
    trackingUrl: "",
    shippedAt: "",
    shippingNote: "",
  });
  const [statusForm, setStatusForm] = useState({
    status: "PENDING",
    shippedAt: "",
    deliveredAt: "",
    failReason: "",
    shippingNote: "",
  });

  const loadOrders = async () => {
    const data = await getAdminOrders();
    setOrders(data);
  };

  const hydrateForms = (detail: DeliveryTrackingApiResponse) => {
    setShippingForm({
      shippingProvider: detail.shippingProvider || "",
      trackingCode: detail.trackingCode || "",
      trackingUrl: detail.trackingUrl || "",
      shippedAt: toDateTimeLocalValue(detail.shippedAt),
      shippingNote: detail.shippingNote || "",
    });
    setStatusForm({
      status: detail.shippingStatus || "PENDING",
      shippedAt: toDateTimeLocalValue(detail.shippedAt),
      deliveredAt: toDateTimeLocalValue(detail.deliveredAt),
      failReason: detail.failReason || "",
      shippingNote: detail.shippingNote || "",
    });
  };

  const loadDeliveryDetail = async (orderId: number) => {
    try {
      setLoadingDetail(true);
      setDetailError("");
      const detail = await getAdminDelivery(orderId);
      setDeliveryDetail(detail);
      hydrateForms(detail);
    } catch (err) {
      setDetailError(getApiErrorMessage(err, "Không thể tải chi tiết vận chuyển."));
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");
        await loadOrders();
      } catch (err) {
        setError(getApiErrorMessage(err, "Không thể tải danh sách đơn hàng quản trị."));
      } finally {
        setLoading(false);
      }
    };

    void fetchOrders();
  }, []);

  const totalPages = getTotalPages(orders.length, ADMIN_ORDERS_PER_PAGE);
  const safePage = clampPage(currentPage, totalPages);
  const paginatedOrders = paginateItems(orders, safePage, ADMIN_ORDERS_PER_PAGE);

  useEffect(() => {
    if (currentPage !== safePage) {
      setCurrentPage(safePage);
    }
  }, [currentPage, safePage]);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  const performDeliveryAction = async (actionKey: string, action: () => Promise<unknown>) => {
    if (!selectedOrderId) {
      return;
    }

    try {
      setPendingAction(actionKey);
      setDetailError("");
      await action();
      await Promise.all([loadOrders(), loadDeliveryDetail(selectedOrderId)]);
    } catch (err) {
      setDetailError(getApiErrorMessage(err, "Không thể cập nhật thông tin vận chuyển."));
    } finally {
      setPendingAction("");
    }
  };

  const handleSelectOrder = async (orderId: number) => {
    setSelectedOrderId(orderId);
    await loadDeliveryDetail(orderId);
  };

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Vận hành vận chuyển</p>
          <h1 className="admin-page-title">Quản lý vận chuyển đơn hàng</h1>
          <p className="admin-page-desc">
            Cập nhật đơn vị vận chuyển, mã vận đơn, liên kết tra cứu và trạng thái giao hàng theo mô hình shop bán nội thất.
          </p>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>Danh sách đơn hàng</h2>
        </div>

        {loading ? (
          <div className="admin-empty-state">Đang tải đơn hàng...</div>
        ) : error ? (
          <div className="admin-empty-state">{error}</div>
        ) : orders.length === 0 ? (
          <div className="admin-empty-state">Chưa có đơn hàng nào.</div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Đơn</th>
                    <th>Người nhận</th>
                    <th>Thanh toán</th>
                    <th>Tổng tiền</th>
                    <th>Vận chuyển</th>
                    <th>Sản phẩm</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.orderCode || `#${order.id}`}</strong>
                        <div className="admin-table-subtext">{formatDate(order.createdAt)}</div>
                      </td>
                      <td>
                        <strong>{order.receiverName}</strong>
                        <div className="admin-table-subtext">{order.receiverPhone}</div>
                        <div className="admin-table-subtext">{order.shippingAddress}</div>
                      </td>
                      <td>
                        <strong>{order.paymentMethod}</strong>
                        <div className="admin-table-subtext">{order.paymentStatus}</div>
                      </td>
                      <td>{formatPrice(order.totalAmount)}</td>
                      <td>
                        <strong>{order.deliveryStatusLabel || order.deliveryStatus || order.status}</strong>
                        <div className="admin-table-subtext">{order.shippingProvider || "Chưa có đơn vị vận chuyển"}</div>
                        <div className="admin-table-subtext">{order.trackingCode || "Chưa có mã vận đơn"}</div>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-dark mt-2"
                          onClick={() => void handleSelectOrder(order.id)}
                        >
                          {selectedOrderId === order.id ? "Đang chỉnh sửa" : "Cập nhật vận chuyển"}
                        </button>
                      </td>
                      <td>
                        <div className="admin-order-items">
                          {order.items.map((item) => (
                            <div key={`${order.id}-${item.productId}`}>
                              {item.productName} x {item.quantity}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </div>

      {selectedOrder ? (
        <div className="admin-panel admin-delivery-ops">
          <div className="admin-panel-head">
            <div>
              <h2>Cập nhật vận chuyển cho {selectedOrder.orderCode || `#${selectedOrder.id}`}</h2>
              <p className="admin-page-desc">
                Trạng thái hiện tại: <strong>{deliveryDetail?.statusLabel || deliveryDetail?.shippingStatus || "Đang tải"}</strong>
              </p>
            </div>
          </div>

          {loadingDetail ? (
            <div className="admin-empty-state">Đang tải chi tiết vận chuyển...</div>
          ) : detailError ? (
            <div className="admin-empty-state">{detailError}</div>
          ) : deliveryDetail ? (
            <>
              <div className="admin-delivery-summary">
                <div>
                  <span>Đơn vị vận chuyển</span>
                  <strong>{deliveryDetail.shippingProvider || "Chưa có"}</strong>
                </div>
                <div>
                  <span>Mã vận đơn</span>
                  <strong>{deliveryDetail.trackingCode || "Chưa có"}</strong>
                </div>
                <div>
                  <span>Đã gửi hàng</span>
                  <strong>{formatDate(deliveryDetail.shippedAt)}</strong>
                </div>
                <div>
                  <span>Đã giao</span>
                  <strong>{formatDate(deliveryDetail.deliveredAt)}</strong>
                </div>
              </div>

              <div className="admin-delivery-grid">
                <article className="admin-delivery-card">
                  <h3>Thông tin vận chuyển</h3>
                  <div className="admin-form-grid">
                    <input
                      list="shipping-provider-options"
                      className="form-control"
                      placeholder="Đơn vị vận chuyển"
                      value={shippingForm.shippingProvider}
                      onChange={(event) =>
                        setShippingForm((current) => ({ ...current, shippingProvider: event.target.value }))
                      }
                    />
                    <datalist id="shipping-provider-options">
                      {SHIPPING_PROVIDERS.map((provider) => (
                        <option key={provider} value={provider} />
                      ))}
                    </datalist>
                    <input
                      className="form-control"
                      placeholder="Mã vận đơn"
                      value={shippingForm.trackingCode}
                      onChange={(event) =>
                        setShippingForm((current) => ({ ...current, trackingCode: event.target.value }))
                      }
                    />
                    <input
                      className="form-control"
                      placeholder="Liên kết tra cứu"
                      value={shippingForm.trackingUrl}
                      onChange={(event) =>
                        setShippingForm((current) => ({ ...current, trackingUrl: event.target.value }))
                      }
                    />
                    <input
                      className="form-control"
                      type="datetime-local"
                      value={shippingForm.shippedAt}
                      onChange={(event) =>
                        setShippingForm((current) => ({ ...current, shippedAt: event.target.value }))
                      }
                    />
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Ghi chú vận chuyển"
                      value={shippingForm.shippingNote}
                      onChange={(event) =>
                        setShippingForm((current) => ({ ...current, shippingNote: event.target.value }))
                      }
                    />
                    <button
                      type="button"
                      className="btn btn-domora"
                      disabled={pendingAction === "shipping"}
                      onClick={() =>
                        void performDeliveryAction("shipping", () =>
                          updateAdminShippingDetails(selectedOrder.id, {
                            shippingProvider: shippingForm.shippingProvider || undefined,
                            trackingCode: shippingForm.trackingCode || undefined,
                            trackingUrl: shippingForm.trackingUrl || undefined,
                            shippedAt: toIsoDateTime(shippingForm.shippedAt),
                            shippingNote: shippingForm.shippingNote || undefined,
                          })
                        )
                      }
                    >
                      Lưu thông tin vận chuyển
                    </button>
                  </div>
                </article>

                <article className={`admin-delivery-card ${statusForm.status === "FAILED" ? "admin-delivery-card--warning" : ""}`}>
                  <h3>Trạng thái giao hàng</h3>
                  <div className="admin-form-grid">
                    <select
                      className="form-select"
                      value={statusForm.status}
                      onChange={(event) => setStatusForm((current) => ({ ...current, status: event.target.value }))}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <input
                      className="form-control"
                      type="datetime-local"
                      value={statusForm.shippedAt}
                      onChange={(event) =>
                        setStatusForm((current) => ({ ...current, shippedAt: event.target.value }))
                      }
                    />
                    <input
                      className="form-control"
                      type="datetime-local"
                      value={statusForm.deliveredAt}
                      onChange={(event) =>
                        setStatusForm((current) => ({ ...current, deliveredAt: event.target.value }))
                      }
                    />
                    {statusForm.status === "FAILED" ? (
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Lý do giao thất bại"
                        value={statusForm.failReason}
                        onChange={(event) =>
                          setStatusForm((current) => ({ ...current, failReason: event.target.value }))
                        }
                      />
                    ) : null}
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Ghi chú cập nhật"
                      value={statusForm.shippingNote}
                      onChange={(event) =>
                        setStatusForm((current) => ({ ...current, shippingNote: event.target.value }))
                      }
                    />
                    <button
                      type="button"
                      className="btn btn-domora-outline"
                      disabled={pendingAction === "status"}
                      onClick={() =>
                        void performDeliveryAction("status", () =>
                          updateAdminDeliveryStatus(selectedOrder.id, {
                            status: statusForm.status,
                            shippedAt: toIsoDateTime(statusForm.shippedAt),
                            deliveredAt: toIsoDateTime(statusForm.deliveredAt),
                            failReason: statusForm.failReason || undefined,
                            shippingNote: statusForm.shippingNote || undefined,
                          })
                        )
                      }
                    >
                      Lưu trạng thái
                    </button>
                  </div>
                </article>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
