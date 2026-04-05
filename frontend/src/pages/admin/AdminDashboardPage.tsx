import { useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../../api/authApi";
import { getAdminOrders } from "../../api/adminOrderApi";
import type { OrderResponse } from "../../types/order";

const CHART_WINDOW_DAYS = 7;

function formatPrice(price: number) {
  return `${price.toLocaleString("vi-VN")} đ`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function toYmd(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function buildSparklinePoints(values: number[], width = 280, height = 120) {
  const max = Math.max(...values, 1);
  const stepX = values.length > 1 ? width / (values.length - 1) : width;

  return values
    .map((value, index) => {
      const x = Math.round(index * stepX);
      const y = Math.round(height - (value / max) * (height - 8));
      return `${x},${y}`;
    })
    .join(" ");
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");
        setOrders(await getAdminOrders());
      } catch (err) {
        setError(getApiErrorMessage(err, "Khong the tai bang dieu khien quan tri."));
      } finally {
        setLoading(false);
      }
    };

    void fetchOrders();
  }, []);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((order) => order.status === "PENDING").length;
    const completedOrders = orders.filter((order) => order.status === "COMPLETED").length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const codOrders = orders.filter((order) => order.paymentMethod === "COD").length;
    const vnpayPaidOrders = orders.filter(
      (order) => order.paymentMethod === "VNPAY" && order.paymentStatus === "PAID"
    ).length;
    const completionRate = totalOrders === 0 ? 0 : Math.round((completedOrders / totalOrders) * 100);

    return [
      { label: "Tong don hang", value: String(totalOrders), hint: "Don da phat sinh" },
      { label: "Dang xu ly", value: String(pendingOrders), hint: "Can theo doi ngay" },
      { label: "Thanh toan VNPay", value: String(vnpayPaidOrders), hint: "Giao dich thanh cong" },
      { label: "Don COD", value: String(codOrders), hint: "Thanh toan khi nhan hang" },
      { label: "Tong doanh thu", value: formatPrice(totalRevenue), hint: "Tinh theo tong don" },
      { label: "Ty le hoan tat", value: `${completionRate}%`, hint: "Trang thai COMPLETED" },
    ];
  }, [orders]);

  const statusData = useMemo(() => {
    return [
      { key: "PENDING", label: "Cho xu ly", value: orders.filter((order) => order.status === "PENDING").length },
      {
        key: "CONFIRMED",
        label: "Da xac nhan",
        value: orders.filter((order) => order.status === "CONFIRMED").length,
      },
      { key: "SHIPPING", label: "Dang giao", value: orders.filter((order) => order.status === "SHIPPING").length },
      {
        key: "COMPLETED",
        label: "Hoan thanh",
        value: orders.filter((order) => order.status === "COMPLETED").length,
      },
      {
        key: "CANCELLED",
        label: "Da huy",
        value: orders.filter((order) => order.status === "CANCELLED").length,
      },
    ];
  }, [orders]);

  const paymentData = useMemo(() => {
    const cod = orders.filter((order) => order.paymentMethod === "COD").length;
    const vnpayPaid = orders.filter(
      (order) => order.paymentMethod === "VNPAY" && order.paymentStatus === "PAID"
    ).length;
    const vnpayPending = orders.filter(
      (order) => order.paymentMethod === "VNPAY" && order.paymentStatus !== "PAID"
    ).length;
    return [
      { label: "COD", value: cod, color: "#b28b67" },
      { label: "VNPay Paid", value: vnpayPaid, color: "#7f9d6b" },
      { label: "VNPay Pending/Failed", value: vnpayPending, color: "#d28b5c" },
    ];
  }, [orders]);

  const trendData = useMemo(() => {
    const days: { key: string; label: string }[] = [];
    const today = new Date();
    for (let offset = CHART_WINDOW_DAYS - 1; offset >= 0; offset -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - offset);
      const key = toYmd(d);
      days.push({
        key,
        label: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
      });
    }

    const byDay = new Map<string, { orders: number; revenue: number }>();
    days.forEach((day) => byDay.set(day.key, { orders: 0, revenue: 0 }));

    orders.forEach((order) => {
      const key = toYmd(new Date(order.createdAt));
      const slot = byDay.get(key);
      if (slot) {
        slot.orders += 1;
        slot.revenue += order.totalAmount;
      }
    });

    return days.map((day) => ({
      label: day.label,
      orders: byDay.get(day.key)?.orders ?? 0,
      revenue: byDay.get(day.key)?.revenue ?? 0,
    }));
  }, [orders]);

  const revenuePoints = useMemo(
    () => buildSparklinePoints(trendData.map((item) => item.revenue)),
    [trendData]
  );
  const orderPoints = useMemo(() => buildSparklinePoints(trendData.map((item) => item.orders)), [trendData]);

  const maxStatusValue = Math.max(...statusData.map((item) => item.value), 1);
  const totalOrdersForDonut = statusData.reduce((sum, item) => sum + item.value, 0);

  const donutSegments = useMemo(() => {
    const palette = ["#c68b59", "#8c5f3c", "#d8ae7a", "#b66a49", "#6f4e37"];
    let cursor = 0;

    return statusData.map((item, index) => {
      const ratio = totalOrdersForDonut === 0 ? 0 : item.value / totalOrdersForDonut;
      const start = cursor;
      const end = cursor + ratio * 360;
      cursor = end;
      return {
        ...item,
        color: palette[index % palette.length],
        start,
        end,
      };
    });
  }, [statusData, totalOrdersForDonut]);

  const donutGradient = useMemo(() => {
    if (totalOrdersForDonut === 0) {
      return "conic-gradient(#e9eef4 0deg 360deg)";
    }
    return `conic-gradient(${donutSegments
      .map((segment) => `${segment.color} ${segment.start}deg ${segment.end}deg`)
      .join(", ")})`;
  }, [donutSegments, totalOrdersForDonut]);

  const paymentTotal = paymentData.reduce((sum, item) => sum + item.value, 0);

  const latestOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6),
    [orders]
  );

  return (
    <section className="admin-page admin-dashboard">
      <header className="admin-dashboard-hero">
        <div>
          <p className="admin-page-kicker">Bang dieu khien quan tri</p>
          <h1 className="admin-page-title">Domora Control Center</h1>
          <p className="admin-page-desc">
            Theo doi van hanh theo thoi gian thuc, uu tien xu ly don quan trong va kiem soat hieu suat
            ban hang.
          </p>
        </div>
      </header>

      {loading ? (
        <div className="admin-empty-state">Dang tai du lieu bang dieu khien...</div>
      ) : error ? (
        <div className="admin-empty-state">{error}</div>
      ) : (
        <>
          <div className="admin-stats-grid admin-stats-grid--dashboard">
            {stats.map((stat) => (
              <article className="admin-stat-card admin-stat-card--dashboard" key={stat.label}>
                <p>{stat.label}</p>
                <strong>{stat.value}</strong>
                <span>{stat.hint}</span>
              </article>
            ))}
          </div>

          <div className="admin-dashboard-grid admin-dashboard-grid--charts">
            <article className="admin-panel admin-panel--dashboard">
              <div className="admin-panel-head">
                <h2>Status Distribution</h2>
              </div>
              <div className="admin-donut-wrap">
                <div className="admin-donut" style={{ background: donutGradient }}>
                  <div className="admin-donut-center">
                    <strong>{totalOrdersForDonut}</strong>
                    <span>Total Orders</span>
                  </div>
                </div>
                <div className="admin-donut-legend">
                  {donutSegments.map((segment) => (
                    <div className="admin-donut-legend-item" key={segment.key}>
                      <i style={{ background: segment.color }}></i>
                      <span>{segment.label}</span>
                      <strong>{segment.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="admin-panel admin-panel--dashboard">
              <div className="admin-panel-head">
                <h2>Revenue Trend (7 ngay)</h2>
              </div>
              <div className="admin-sparkline-card">
                <svg viewBox="0 0 280 120" className="admin-sparkline">
                  <polyline className="admin-sparkline-line admin-sparkline-line--revenue" points={revenuePoints} />
                </svg>
                <div className="admin-sparkline-labels">
                  {trendData.map((item) => (
                    <span key={item.label}>{item.label}</span>
                  ))}
                </div>
              </div>
            </article>

            <article className="admin-panel admin-panel--dashboard">
              <div className="admin-panel-head">
                <h2>Order Trend (7 ngay)</h2>
              </div>
              <div className="admin-sparkline-card">
                <svg viewBox="0 0 280 120" className="admin-sparkline">
                  <polyline className="admin-sparkline-line admin-sparkline-line--orders" points={orderPoints} />
                </svg>
                <div className="admin-sparkline-labels">
                  {trendData.map((item) => (
                    <span key={item.label}>{item.label}</span>
                  ))}
                </div>
              </div>
            </article>

            <article className="admin-panel admin-panel--dashboard">
              <div className="admin-panel-head">
                <h2>Payment Mix</h2>
              </div>
              <div className="admin-payment-mix">
                <div className="admin-payment-track">
                  {paymentData.map((item) => (
                    <div
                      key={item.label}
                      className="admin-payment-segment"
                      style={{
                        width: `${paymentTotal === 0 ? 0 : (item.value / paymentTotal) * 100}%`,
                        background: item.color,
                      }}
                    ></div>
                  ))}
                </div>
                <div className="admin-payment-list">
                  {paymentData.map((item) => (
                    <div className="admin-payment-item" key={item.label}>
                      <div>
                        <i style={{ background: item.color }}></i>
                        <span>{item.label}</span>
                      </div>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </div>

          <div className="admin-panel admin-panel--dashboard">
            <div className="admin-panel-head">
              <h2>Order Pipeline</h2>
            </div>
            <div className="admin-kpi-stack">
              {statusData.map((item) => (
                <div className="admin-kpi-row" key={item.key}>
                  <div className="admin-kpi-label">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                  <div className="admin-kpi-track">
                    <div
                      className="admin-kpi-fill"
                      style={{ width: `${(item.value / maxStatusValue) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-panel admin-panel--dashboard">
            <div className="admin-panel-head">
              <h2>Don hang moi nhat</h2>
            </div>

            {orders.length === 0 ? (
              <div className="admin-empty-state">Chua co don hang nao.</div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Don</th>
                      <th>Ngay tao</th>
                      <th>Khach hang</th>
                      <th>Thanh toan</th>
                      <th>Trang thai</th>
                      <th>Tong tien</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestOrders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>{order.receiverName}</td>
                        <td>
                          {order.paymentMethod}
                          {order.paymentStatus ? ` / ${order.paymentStatus}` : ""}
                        </td>
                        <td>{order.status}</td>
                        <td>{formatPrice(order.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
