interface ShippingCarrierCardProps {
  shippingProvider?: string;
  trackingCode?: string;
  trackingUrl?: string;
}

export default function ShippingCarrierCard({
  shippingProvider,
  trackingCode,
  trackingUrl,
}: ShippingCarrierCardProps) {
  const hasCarrierInfo = shippingProvider || trackingCode || trackingUrl;

  return (
    <article className="tracking-panel">
      <div className="tracking-panel__header">
        <div>
          <p className="tracking-panel__kicker">Đơn vị vận chuyển</p>
          <h3>{shippingProvider || "Đang cập nhật"}</h3>
        </div>
      </div>

      {hasCarrierInfo ? (
        <div className="tracking-info-list">
          <div>
            <span>Đơn vị vận chuyển</span>
            <strong>{shippingProvider || "Đang cập nhật"}</strong>
          </div>
          <div>
            <span>Mã vận đơn</span>
            <strong>{trackingCode || "Đang cập nhật"}</strong>
          </div>
          <div>
            <span>Liên kết tra cứu</span>
            <strong>
              {trackingUrl ? (
                <a href={trackingUrl} target="_blank" rel="noreferrer">
                  Mở trang tra cứu
                </a>
              ) : (
                "Shop sẽ bổ sung liên kết tra cứu khi có."
              )}
            </strong>
          </div>
        </div>
      ) : (
        <div className="tracking-empty-block">
          <div className="tracking-empty-block__icon" />
          <div>
            <strong>Chưa có thông tin vận đơn</strong>
            <p>Shop sẽ cập nhật đơn vị vận chuyển, mã vận đơn và liên kết tra cứu ngay khi gửi hàng.</p>
          </div>
        </div>
      )}
    </article>
  );
}
