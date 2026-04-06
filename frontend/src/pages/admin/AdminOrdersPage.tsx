import { type ChangeEvent, useEffect, useMemo, useState } from "react";
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
  return `${price.toLocaleString("vi-VN")} d`;
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleString("vi-VN") : "Dang cap nhat";
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
    throw new Error("Thoi diem khong hop le.");
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    keyword: "",
    status: "",
    paymentStatus: "",
  });
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
      setDetailError(getApiErrorMessage(err, "Khong the tai chi tiet van chuyen."));
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
        setError(getApiErrorMessage(err, "Khong the tai danh sach don hang quan tri."));
      } finally {
        setLoading(false);
      }
    };

    void fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesKeyword =
        !keyword ||
        (order.orderCode || "").toLowerCase().includes(keyword) ||
        order.receiverName.toLowerCase().includes(keyword) ||
        order.receiverPhone.toLowerCase().includes(keyword);
      const currentStatus = order.deliveryStatus || order.status;
      const matchesStatus = !filters.status || currentStatus === filters.status;
      const matchesPayment = !filters.paymentStatus || order.paymentStatus === filters.paymentStatus;
      return matchesKeyword && matchesStatus && matchesPayment;
    });
  }, [orders, filters]);

  const totalPages = getTotalPages(filteredOrders.length, ADMIN_ORDERS_PER_PAGE);
  const safePage = clampPage(currentPage, totalPages);
  const paginatedOrders = paginateItems(filteredOrders, safePage, ADMIN_ORDERS_PER_PAGE);

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
      setDetailError(getApiErrorMessage(err, "Khong the cap nhat thong tin van chuyen."));
    } finally {
      setPendingAction("");
    }
  };

  const handleSelectOrder = async (orderId: number) => {
    setSelectedOrderId(orderId);
    await loadDeliveryDetail(orderId);
  };

  const handleFilterChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
    setCurrentPage(1);
  };

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Van hanh van chuyen</p>
          <h1 className="admin-page-title">Quan ly van chuyen don hang</h1>
          <p className="admin-page-desc">Cap nhat trang thai giao hang, ma van don va thong tin tracking.</p>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>Danh sach don hang</h2>
          <div className="admin-panel-actions">
            <button type="button" className="btn btn-domora-outline" onClick={() => setIsFilterOpen((current) => !current)}>
              Loc
            </button>
          </div>
        </div>

        {isFilterOpen && (
          <div className="admin-filter-panel">
            <input
              className="form-control"
              name="keyword"
              value={filters.keyword}
              onChange={handleFilterChange}
              placeholder="Tim ma don, ten nguoi nhan, SDT"
            />
            <select className="form-select" name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">Tat ca trang thai giao hang</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select className="form-select" name="paymentStatus" value={filters.paymentStatus} onChange={handleFilterChange}>
              <option value="">Tat ca thanh toan</option>
              {["PENDING", "PAID", "FAILED", "REFUNDED", "CANCELLED"].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <div className="admin-empty-state">Dang tai don hang...</div>
        ) : error ? (
          <div className="admin-empty-state">{error}</div>
        ) : filteredOrders.length === 0 ? (
          <div className="admin-empty-state">Khong co don hang phu hop.</div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Don</th>
                    <th>Nguoi nhan</th>
                    <th>Thanh toan</th>
                    <th>Tong tien</th>
                    <th>Van chuyen</th>
                    <th>San pham</th>
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
                        <div className="admin-table-subtext">{order.shippingProvider || "Chua co don vi van chuyen"}</div>
                        <div className="admin-table-subtext">{order.trackingCode || "Chua co ma van don"}</div>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-dark mt-2"
                          onClick={() => void handleSelectOrder(order.id)}
                        >
                          {selectedOrderId === order.id ? "Dang chinh sua" : "Cap nhat van chuyen"}
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
              <h2>Cap nhat van chuyen cho {selectedOrder.orderCode || `#${selectedOrder.id}`}</h2>
              <p className="admin-page-desc">
                Trang thai hien tai: <strong>{deliveryDetail?.statusLabel || deliveryDetail?.shippingStatus || "Dang tai"}</strong>
              </p>
            </div>
          </div>

          {loadingDetail ? (
            <div className="admin-empty-state">Dang tai chi tiet van chuyen...</div>
          ) : detailError ? (
            <div className="admin-empty-state">{detailError}</div>
          ) : deliveryDetail ? (
            <>
              <div className="admin-delivery-summary">
                <div>
                  <span>Don vi van chuyen</span>
                  <strong>{deliveryDetail.shippingProvider || "Chua co"}</strong>
                </div>
                <div>
                  <span>Ma van don</span>
                  <strong>{deliveryDetail.trackingCode || "Chua co"}</strong>
                </div>
                <div>
                  <span>Da gui hang</span>
                  <strong>{formatDate(deliveryDetail.shippedAt)}</strong>
                </div>
                <div>
                  <span>Da giao</span>
                  <strong>{formatDate(deliveryDetail.deliveredAt)}</strong>
                </div>
              </div>

              <div className="admin-delivery-grid">
                <article className="admin-delivery-card">
                  <h3>Thong tin van chuyen</h3>
                  <div className="admin-form-grid">
                    <input
                      list="shipping-provider-options"
                      className="form-control"
                      placeholder="Don vi van chuyen"
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
                      placeholder="Ma van don"
                      value={shippingForm.trackingCode}
                      onChange={(event) =>
                        setShippingForm((current) => ({ ...current, trackingCode: event.target.value }))
                      }
                    />
                    <input
                      className="form-control"
                      placeholder="Lien ket tra cuu"
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
                      placeholder="Ghi chu van chuyen"
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
                      Luu thong tin van chuyen
                    </button>
                  </div>
                </article>

                <article className={`admin-delivery-card ${statusForm.status === "FAILED" ? "admin-delivery-card--warning" : ""}`}>
                  <h3>Trang thai giao hang</h3>
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
                        placeholder="Ly do giao that bai"
                        value={statusForm.failReason}
                        onChange={(event) =>
                          setStatusForm((current) => ({ ...current, failReason: event.target.value }))
                        }
                      />
                    ) : null}
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Ghi chu cap nhat"
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
                      Luu trang thai
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
