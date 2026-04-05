import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../../api/authApi";
import { getAvailableVouchers } from "../../api/voucherApi";
import { useAuth } from "../../hooks/useAuth";
import type { VoucherSummary } from "../../types/voucher";

function formatPrice(price: number) {
  return `${price.toLocaleString("vi-VN")} đ`;
}

function formatVoucherValue(voucher: VoucherSummary) {
  if (voucher.discountType === "PERCENT") {
    return `Giảm ${voucher.discountValue}%${
      voucher.maxDiscount ? `, tối đa ${formatPrice(voucher.maxDiscount)}` : ""
    }`;
  }

  return `Giảm ${formatPrice(voucher.discountValue)}`;
}

export default function PromotionPage() {
  const { auth } = useAuth();
  const [vouchers, setVouchers] = useState<VoucherSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true);
        setError("");
        setVouchers(await getAvailableVouchers());
      } catch (err) {
        setError(getApiErrorMessage(err, "Không thể tải danh sách khuyến mãi."));
      } finally {
        setLoading(false);
      }
    };

    void fetchVouchers();
  }, []);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => {
        setCopiedCode((current) => (current === code ? "" : current));
      }, 2000);
    } catch {
      setCopiedCode("");
    }
  };

  return (
    <section className="promotion-page">
      <div className="container py-5">
        <div className="promotion-hero">
          <span className="promotion-eyebrow">Ưu đãi DOMORA</span>
          <h1>Khuyến mãi đang áp dụng</h1>
          <p>
            Xem nhanh các mã giảm giá đang dùng được cho đơn nội thất, sao chép mã rồi áp dụng
            tại giỏ hàng hoặc trang thanh toán.
          </p>
          <div className="promotion-hero-actions">
            <Link to={auth?.token ? "/checkout" : "/login"} className="btn btn-domora">
              {auth?.token ? "Đến thanh toán" : "Đăng nhập để sử dụng"}
            </Link>
            <Link to="/products" className="btn btn-domora-outline">
              Xem sản phẩm
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="promotion-empty-state">
            <h3>Đang tải khuyến mãi...</h3>
          </div>
        ) : error ? (
          <div className="promotion-empty-state">
            <h3>Không thể tải khuyến mãi</h3>
            <p>{error}</p>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="promotion-empty-state">
            <h3>Hiện chưa có chương trình khuyến mãi</h3>
            <p>DOMORA sẽ cập nhật thêm ưu đãi mới trong thời gian tới.</p>
          </div>
        ) : (
          <div className="promotion-grid">
            {vouchers.map((voucher) => (
              <article className="promotion-card" key={voucher.id}>
                <div className="promotion-card-top">
                  <span className="promotion-badge">Mã giảm giá</span>
                  <strong className="promotion-code">{voucher.code}</strong>
                </div>

                <h2>{voucher.name}</h2>
                <p className="promotion-value">{formatVoucherValue(voucher)}</p>

                <div className="promotion-meta">
                  <div>
                    <span>Đơn tối thiểu</span>
                    <strong>
                      {voucher.minOrderValue ? formatPrice(voucher.minOrderValue) : "Không yêu cầu"}
                    </strong>
                  </div>
                  <div>
                    <span>Hạn sử dụng</span>
                    <strong>{new Date(voucher.endDate).toLocaleDateString("vi-VN")}</strong>
                  </div>
                </div>

                <ul className="promotion-note-list">
                  <li>Áp dụng cho đơn hàng đủ điều kiện.</li>
                  <li>Nhập mã tại giỏ hàng hoặc trang thanh toán.</li>
                  <li>Số lượng có hạn, hệ thống sẽ tự kiểm tra khi áp dụng.</li>
                </ul>

                <div className="promotion-actions">
                  <button
                    type="button"
                    className="btn btn-domora-outline"
                    onClick={() => void handleCopyCode(voucher.code)}
                  >
                    {copiedCode === voucher.code ? "Đã sao chép" : "Sao chép mã"}
                  </button>
                  <Link to={auth?.token ? "/checkout" : "/login"} className="btn btn-domora">
                    Sử dụng ngay
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
