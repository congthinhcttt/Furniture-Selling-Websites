import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { getLowStockProducts } from "../api/adminProductApi";
import { useAuth } from "../hooks/useAuth";
import type { LowStockProduct } from "../types/product";

const LOW_STOCK_THRESHOLD = 5;

export default function AdminLayout() {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isAlertLoading, setIsAlertLoading] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const alertMenuRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const fetchLowStock = async () => {
    try {
      setIsAlertLoading(true);
      setLowStockProducts(await getLowStockProducts(LOW_STOCK_THRESHOLD));
    } catch {
      setLowStockProducts([]);
    } finally {
      setIsAlertLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        event.target instanceof Node &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setIsAccountOpen(false);
      }

      if (
        alertMenuRef.current &&
        event.target instanceof Node &&
        !alertMenuRef.current.contains(event.target)
      ) {
        setIsAlertOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    void fetchLowStock();

    const intervalId = window.setInterval(() => {
      void fetchLowStock();
    }, 30000);

    const handleWindowFocus = () => {
      void fetchLowStock();
    };

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <p>Quản trị</p>
          <h2>Domora Admin</h2>
        </div>

        <nav className="admin-nav">
          <NavLink end className="admin-nav-link" to="/admin">
            Bảng điều khiển
          </NavLink>
          <NavLink className="admin-nav-link" to="/admin/orders">
            Đơn hàng
          </NavLink>
          <NavLink className="admin-nav-link" to="/admin/products">
            Sản phẩm
          </NavLink>
          <NavLink className="admin-nav-link" to="/admin/reviews">
            Đánh giá
          </NavLink>
          <NavLink className="admin-nav-link" to="/admin/categories">
            Danh mục
          </NavLink>
          <NavLink className="admin-nav-link" to="/admin/news">
            Tin tức
          </NavLink>
          <NavLink className="admin-nav-link" to="/admin/accounts">
            Tài khoản
          </NavLink>
        </nav>
      </aside>

      <div className="admin-content">
        <div className="admin-topbar">
          <div className="admin-alert-menu" ref={alertMenuRef}>
            <button
              type="button"
              className="admin-alert-trigger"
              onClick={() =>
                setIsAlertOpen((current) => {
                  const next = !current;
                  if (next) {
                    void fetchLowStock();
                  }
                  return next;
                })
              }
            >
              <span className="admin-alert-icon" aria-hidden="true">
                bell
              </span>
              <span className="visually-hidden">Thông báo</span>
              {lowStockProducts.length > 0 && (
                <span className="admin-alert-badge">{lowStockProducts.length}</span>
              )}
            </button>

            {isAlertOpen && (
              <div className="admin-alert-dropdown">
                <p className="admin-topbar-label">Sản phẩm sắp hết hàng</p>
                {isAlertLoading ? (
                  <div className="admin-alert-empty">Đang tải thông báo kho...</div>
                ) : lowStockProducts.length === 0 ? (
                  <div className="admin-alert-empty">Hiện chưa có sản phẩm nào sắp hết hàng.</div>
                ) : (
                  <div className="admin-alert-list">
                    {lowStockProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        className="admin-alert-item"
                        onClick={() => {
                          setIsAlertOpen(false);
                          navigate("/admin/products");
                        }}
                      >
                        <strong>{product.name}</strong>
                        <span>
                          Còn {product.stockQuantity} sản phẩm, {product.width} x {product.length} cm
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={`admin-account-menu ${isAccountOpen ? "open" : ""}`} ref={accountMenuRef}>
            <button
              type="button"
              className="admin-account-trigger"
              onClick={() => setIsAccountOpen((current) => !current)}
            >
              <span className="admin-account-avatar">
                {(auth?.username || "A").slice(0, 1).toUpperCase()}
              </span>
              <span className="admin-account-meta">
                <strong>{auth?.username || "Admin"}</strong>
                <small>{auth?.role || "ADMIN"}</small>
              </span>
              <span className="admin-account-caret">v</span>
            </button>

            {isAccountOpen && (
              <div className="admin-account-dropdown">
                <p className="admin-topbar-label">Tài khoản hiện tại</p>
                <strong>{auth?.username || "Admin"}</strong>
                <span>{auth?.role || "ADMIN"}</span>
                <NavLink className="btn btn-domora-outline btn-sm" to="/">
                  Về giao diện người dùng
                </NavLink>
                <button type="button" className="btn btn-domora btn-sm" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
