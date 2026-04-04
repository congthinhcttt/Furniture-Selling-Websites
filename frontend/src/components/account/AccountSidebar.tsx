import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const menuItems = [
  { label: "Thông tin cá nhân", to: "/account/profile" },
  { label: "Đơn hàng của tôi", to: "/account/orders" },
  { label: "Địa chỉ", disabled: true },
  { label: "Sản phẩm yêu thích", disabled: true },
  { label: "Đánh giá của tôi", to: "/account/reviews" },
];

export default function AccountSidebar() {
  const { auth } = useAuth();

  return (
    <aside className="account-sidebar-card">
      <div className="account-sidebar-user">
        <div className="account-avatar account-avatar--sm">{auth?.username?.slice(0, 1).toUpperCase() || "D"}</div>
        <div>
          <p className="account-hero-kicker">Tài khoản</p>
          <h2>{auth?.username || "Người dùng"}</h2>
        </div>
      </div>

      <nav className="account-menu" aria-label="Điều hướng tài khoản">
        {menuItems.map((item) =>
          item.disabled ? (
            <span key={item.label} className="account-menu__item account-menu__item--muted">
              {item.label}
            </span>
          ) : (
            <NavLink
              key={item.to}
              to={item.to!}
              className={({ isActive }) =>
                `account-menu__item${isActive ? " account-menu__item--active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          )
        )}
      </nav>

      <ul className="account-sidebar-list">
        <li>
          <span>Trạng thái</span>
          <strong>{auth?.token ? "Đã đăng nhập" : "Chưa kích hoạt"}</strong>
        </li>
        <li>
          <span>Mã tài khoản</span>
          <strong>#{auth?.accountId}</strong>
        </li>
        <li>
          <span>Vai trò</span>
          <strong>{auth?.role || "USER"}</strong>
        </li>
      </ul>
    </aside>
  );
}
