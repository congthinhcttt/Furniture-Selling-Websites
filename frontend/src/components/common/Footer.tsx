import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="domora-footer">
      <div className="container">
        <div className="row gy-5">
          <div className="col-lg-4">
            <Link className="footer-brand" to="/">
              DOMORA
            </Link>

            <p className="footer-text mt-3">
              Nội thất cao cấp dành cho không gian sống hiện đại. DOMORA mang đến những thiết kế
              ấm áp, tinh tế và bền vững cho tổ ấm của bạn.
            </p>

            <div className="d-flex gap-3 mt-4">
              <a href="#" className="social-link" aria-label="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="social-link" aria-label="Pinterest">
                <i className="bi bi-pinterest"></i>
              </a>
              <a href="#" className="social-link" aria-label="Youtube">
                <i className="bi bi-youtube"></i>
              </a>
            </div>
          </div>

          <div className="col-6 col-lg-2">
            <h5 className="footer-title">Khám phá</h5>
            <ul className="footer-links">
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/products">Sản phẩm</Link></li>
              <li><Link to="/categories">Danh mục</Link></li>
              <li><Link to="/cart">Giỏ hàng</Link></li>
            </ul>
          </div>

          <div className="col-6 col-lg-3">
            <h5 className="footer-title">Hỗ trợ</h5>
            <ul className="footer-links">
              <li><Link to="/login">Đăng nhập</Link></li>
              <li><Link to="/register">Đăng ký</Link></li>
              <li><Link to="/checkout">Thanh toán</Link></li>
              <li><a href="#">Chính sách bảo hành</a></li>
            </ul>
          </div>

          <div className="col-lg-3">
            <h5 className="footer-title">Liên hệ</h5>
            <ul className="footer-contact">
              <li>
                <i className="bi bi-geo-alt"></i>
                <span>123 Nguyễn Văn Cừ, TP. Hồ Chí Minh</span>
              </li>
              <li>
                <i className="bi bi-telephone"></i>
                <span>0123 456 789</span>
              </li>
              <li>
                <i className="bi bi-envelope"></i>
                <span>hello@domora.vn</span>
              </li>
              <li>
                <i className="bi bi-clock"></i>
                <span>08:00 - 21:00 mỗi ngày</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="mb-0">© 2026 DOMORA Luxury Interior. Mọi quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
