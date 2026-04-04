import { useAuth } from "../../hooks/useAuth";

export default function AccountProfilePage() {
  const { auth } = useAuth();

  return (
    <section className="info-page">
      <div className="account-hero">
        <div className="container">
          <div className="account-hero-shell">
            <div className="account-avatar">{auth?.username?.slice(0, 1).toUpperCase() || "D"}</div>
            <div>
              <p className="account-hero-kicker">Tài khoản DOMORA</p>
              <h1 className="account-hero-title">{auth?.username}</h1>
              <p className="account-hero-desc">
                Quản lý hồ sơ, trạng thái bảo mật và toàn bộ hoạt động mua sắm của bạn tại DOMORA.
              </p>
            </div>
            <div className="account-hero-badge">{auth?.role || "USER"}</div>
          </div>
        </div>
      </div>

      <div className="container info-page-section">
        <div className="account-main-grid">
          <div className="info-card info-card-large">
            <div className="account-section-heading">
              <div>
                <p className="account-section-kicker">Hồ sơ</p>
                <h2>Chi tiết tài khoản</h2>
              </div>
              <span className="account-section-chip">Bảo mật</span>
            </div>

            <div className="account-grid">
              <div className="account-grid-item">
                <span className="account-grid-label">Tên đăng nhập</span>
                <strong>{auth?.username}</strong>
              </div>
              <div className="account-grid-item">
                <span className="account-grid-label">Loại tài khoản</span>
                <strong>{auth?.role || "USER"}</strong>
              </div>
              <div className="account-grid-item">
                <span className="account-grid-label">Phiên hiện tại</span>
                <strong>{auth?.token ? "Bearer token đang hoạt động" : "Không có token"}</strong>
              </div>
              <div className="account-grid-item">
                <span className="account-grid-label">Thiết bị</span>
                <strong>Trình duyệt web</strong>
              </div>
            </div>
          </div>

          <div className="account-stats-grid">
            <article className="account-stat-card">
              <span className="account-stat-label">Bảo mật</span>
              <strong className="account-stat-value">An toàn</strong>
              <p>Phiên đăng nhập của bạn đang được lưu và bảo vệ bằng token.</p>
            </article>

            <article className="account-stat-card">
              <span className="account-stat-label">Mua sắm</span>
              <strong className="account-stat-value">Sẵn sàng</strong>
              <p>Bạn có thể vào giỏ hàng, thanh toán và quản lý đơn hàng cá nhân.</p>
            </article>

            <article className="account-stat-card">
              <span className="account-stat-label">Đánh giá</span>
              <strong className="account-stat-value">Review Center</strong>
              <p>Viết và chỉnh sửa review trong mục Đánh giá của tôi sau khi đơn hàng hoàn tất.</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
