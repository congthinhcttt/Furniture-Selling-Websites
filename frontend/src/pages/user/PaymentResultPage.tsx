import { Link, useSearchParams } from "react-router-dom";

function getPaymentBadgeClass(success: boolean, paymentStatus: string | null) {
  if (success || paymentStatus === "PAID") {
    return "approved";
  }

  if (paymentStatus === "PENDING") {
    return "pending";
  }

  return "rejected";
}

function getPaymentStatusLabel(success: boolean, paymentStatus: string | null) {
  if (paymentStatus === "PAID" || success) {
    return "Da thanh toan";
  }

  if (paymentStatus === "PENDING") {
    return "Dang cho thanh toan";
  }

  if (paymentStatus === "FAILED") {
    return "Thanh toan that bai";
  }

  return "Chua xac dinh";
}

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success") === "true";
  const orderId = searchParams.get("orderId");
  const message = searchParams.get("message") || (success ? "Thanh toan thanh cong." : "Thanh toan that bai.");
  const paymentStatus = searchParams.get("paymentStatus");
  const responseCode = searchParams.get("responseCode");
  const badgeClass = getPaymentBadgeClass(success, paymentStatus);
  const paymentLabel = getPaymentStatusLabel(success, paymentStatus);

  return (
    <section className="info-page">
      <div className="container info-page-section">
        <div className="account-main-grid">
          <div className="info-card info-card-large">
            <div className="account-section-heading">
              <div>
                <p className="account-section-kicker">Payment Result</p>
                <h2>{success ? "Xac nhan thanh toan thanh cong" : "Ket qua thanh toan"}</h2>
              </div>
              <span className={`account-status-badge ${badgeClass}`}>{paymentLabel}</span>
            </div>

            <p className="account-note">
              Trang ket qua nay duoc dong bo voi khu vuc theo doi don hang de ban co the kiem tra thanh toan nhanh hon.
            </p>

            <div className="account-review-item payment-result-card">
              <div className="payment-result-card__head">
                <div className={`payment-result-icon payment-result-icon--${success ? "success" : "failed"}`}>
                  {success ? "OK" : "!"}
                </div>
                <div>
                  <h3>{success ? "Thanh toan da duoc ghi nhan" : "Giao dich chua hoan tat"}</h3>
                  <p>{message}</p>
                </div>
              </div>

              <div className="account-order-highlight">
                <strong>Cap nhat don hang</strong>
                <p>
                  {success
                    ? "Don hang cua ban da duoc cap nhat trang thai thanh toan va co the theo doi tiep trong muc Don hang cua toi."
                    : "Ban co the kiem tra lai ma phan hoi ben duoi va thu thanh toan lai neu can."}
                </p>
              </div>

              <div className="account-grid payment-result-grid">
                {orderId && (
                  <div className="account-grid-item">
                    <span className="account-grid-label">Don hang</span>
                    <strong>#{orderId}</strong>
                  </div>
                )}

                <div className="account-grid-item">
                  <span className="account-grid-label">Trang thai thanh toan</span>
                  <strong className={`account-status-badge ${badgeClass}`}>{paymentLabel}</strong>
                </div>

                {responseCode && (
                  <div className="account-grid-item">
                    <span className="account-grid-label">Ma phan hoi VNPay</span>
                    <strong>{responseCode}</strong>
                  </div>
                )}

                <div className="account-grid-item">
                  <span className="account-grid-label">Buoc tiep theo</span>
                  <strong>{success ? "Theo doi tien trinh giao hang" : "Kiem tra va thanh toan lai"}</strong>
                </div>
              </div>

              <div className="payment-result-actions">
                <Link to="/account/orders" className="btn btn-domora">
                  Xem don hang
                </Link>
                <Link to="/" className="btn btn-domora-outline">
                  Ve trang chu
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
