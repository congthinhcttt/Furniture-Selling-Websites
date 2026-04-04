import {
  formatAbsoluteDateTime,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getPaymentStatusTone,
} from "../../utils/deliveryTracking";

interface PaymentInfoCardProps {
  paymentMethod: string;
  paymentStatus: string;
  deliveredAt?: string;
}

export default function PaymentInfoCard({ paymentMethod, paymentStatus, deliveredAt }: PaymentInfoCardProps) {
  const paymentTone = getPaymentStatusTone(paymentStatus);

  return (
    <article className="tracking-panel">
      <div className="tracking-panel__header">
        <div>
          <p className="tracking-panel__kicker">Thanh toán</p>
          <h3>{getPaymentMethodLabel(paymentMethod)}</h3>
        </div>
        <span className={`tracking-inline-status tracking-inline-status--${paymentTone}`}>
          {getPaymentStatusLabel(paymentStatus)}
        </span>
      </div>

      <div className="tracking-info-list">
        <div>
          <span>Phương thức</span>
          <strong>{getPaymentMethodLabel(paymentMethod)}</strong>
        </div>
        <div>
          <span>Trạng thái thanh toán</span>
          <strong>{getPaymentStatusLabel(paymentStatus)}</strong>
        </div>
        <div>
          <span>Thời điểm giao thành công</span>
          <strong>{deliveredAt ? formatAbsoluteDateTime(deliveredAt) : "Chưa hoàn tất giao hàng"}</strong>
        </div>
      </div>
    </article>
  );
}
