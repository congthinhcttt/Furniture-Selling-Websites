interface DeliveryInfoCardProps {
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  note?: string;
}

export default function DeliveryInfoCard({
  receiverName,
  receiverPhone,
  shippingAddress,
  note,
}: DeliveryInfoCardProps) {
  return (
    <article className="tracking-panel">
      <div className="tracking-panel__header">
        <div>
          <p className="tracking-panel__kicker">Thông tin giao hàng</p>
          <h3>Người nhận và địa chỉ</h3>
        </div>
      </div>

      <div className="tracking-info-list">
        <div>
          <span>Người nhận</span>
          <strong>{receiverName}</strong>
        </div>
        <div>
          <span>Số điện thoại</span>
          <strong>{receiverPhone}</strong>
        </div>
        <div>
          <span>Địa chỉ giao</span>
          <strong>{shippingAddress}</strong>
        </div>
        <div>
          <span>Ghi chú đơn hàng</span>
          <strong>{note || "Không có ghi chú thêm."}</strong>
        </div>
      </div>
    </article>
  );
}
