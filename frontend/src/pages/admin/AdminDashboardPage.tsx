import { useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../../api/authApi";
import { getAdminOrders } from "../../api/adminOrderApi";
import type { OrderResponse } from "../../types/order";

function formatPrice(price: number) {
  return `${price.toLocaleString("vi-VN")} đ`;
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
        setError(getApiErrorMessage(err, "Không thể tải bảng điều khiển quản trị."));
      } finally {
        setLoading(false);
      }
    };

    void fetchOrders();
  }, []);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((order) => order.status === "PENDING").length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const codOrders = orders.filter((order) => order.paymentMethod === "COD").length;

    return [
      { label: "Tổng đơn hàng", value: String(totalOrders) },
      { label: "Đang xử lý", value: String(pendingOrders) },
      { label: "Đơn COD", value: String(codOrders) },
      { label: "Tổng doanh thu", value: formatPrice(totalRevenue) },
    ];
  }, [orders]);

  const chartData = useMemo(
    () => [
      { label: "Chờ xử lý", value: orders.filter((order) => order.status === "PENDING").length },
      { label: "Đã xác nhận", value: orders.filter((order) => order.status === "CONFIRMED").length },
      { label: "Đang giao", value: orders.filter((order) => order.status === "SHIPPING").length },
      { label: "Hoàn thành", value: orders.filter((order) => order.status === "COMPLETED").length },
      { label: "Đã hủy", value: orders.filter((order) => order.status === "CANCELLED").length },
    ],
    [orders]
  );

  const maxChartValue = Math.max(...chartData.map((item) => item.value), 1);

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Bảng điều khiển quản trị</p>
          <h1 className="admin-page-title">Tổng quan hệ thống</h1>
          <p className="admin-page-desc">
            Theo dõi nhanh tình hình đơn hàng và các chỉ số vận hành quan trọng.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="admin-empty-state">Đang tải dữ liệu bảng điều khiển...</div>
      ) : error ? (
        <div className="admin-empty-state">{error}</div>
      ) : (
        <>
          <div className="admin-stats-grid">
            {stats.map((stat) => (
              <article className="admin-stat-card" key={stat.label}>
                <p>{stat.label}</p>
                <strong>{stat.value}</strong>
              </article>
            ))}
          </div>

          <div className="admin-panel">
            <div className="admin-panel-head">
              <h2>Đơn hàng mới nhất</h2>
            </div>

            {orders.length === 0 ? (
              <div className="admin-empty-state">Chưa có đơn hàng nào.</div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Đơn</th>
                      <th>Khách hàng</th>
                      <th>Thanh toán</th>
                      <th>Trạng thái</th>
                      <th>Tổng tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.receiverName}</td>
                        <td>{order.paymentMethod}</td>
                        <td>{order.status}</td>
                        <td>{formatPrice(order.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="admin-panel mt-4">
            <div className="admin-panel-head">
              <h2>Biểu đồ trạng thái đơn hàng</h2>
            </div>

            <div className="admin-chart">
              {chartData.map((item) => (
                <div className="admin-chart-item" key={item.label}>
                  <div className="admin-chart-bar-wrap">
                    <div
                      className="admin-chart-bar"
                      style={{ height: `${(item.value / maxChartValue) * 180}px` }}
                    ></div>
                  </div>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
