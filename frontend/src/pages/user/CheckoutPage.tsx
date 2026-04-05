import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyAddresses } from "../../api/addressApi";
import { getApiErrorMessage } from "../../api/authApi";
import { getMyCart, notifyCartUpdated } from "../../api/cartApi";
import { createOrder, createVnpayPayment } from "../../api/orderApi";
import { applyVoucher, getAvailableVouchers } from "../../api/voucherApi";
import type { SavedAddress } from "../../types/address";
import type { CartResponse } from "../../types/cart";
import type { VoucherApplyResponse, VoucherSummary } from "../../types/voucher";

type PaymentMethod = "COD" | "VNPAY" | "MOMO";

const paymentMethodOptions: Array<{
  value: PaymentMethod;
  label: string;
  description: string;
  disabled?: boolean;
}> = [
  {
    value: "COD",
    label: "Thanh toán khi nhận hàng",
    description: "Xác nhận đơn hàng ngay, thanh toán khi shipper giao đến.",
  },
  {
    value: "VNPAY",
    label: "VNPay",
    description: "Thanh toán online qua cổng thanh toán VNPay sandbox.",
  },
  {
    value: "MOMO",
    label: "MoMo",
    description: "Sắp hỗ trợ.",
    disabled: true,
  },
];

function formatPrice(price: number) {
  return `${price.toLocaleString("vi-VN")} đ`;
}

function getVoucherShortLabel(voucher: VoucherSummary) {
  if (voucher.discountType === "PERCENT") {
    const maxDiscount =
      voucher.maxDiscount && voucher.maxDiscount > 0
        ? `, tối đa ${formatPrice(voucher.maxDiscount)}`
        : "";
    return `Giảm ${voucher.discountValue}%${maxDiscount}`;
  }

  return `Giảm ${formatPrice(voucher.discountValue)}`;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [availableVouchers, setAvailableVouchers] = useState<VoucherSummary[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherMessage, setVoucherMessage] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherApplyResponse | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        setError("");
        setCart(await getMyCart());
      } catch (err) {
        setError(getApiErrorMessage(err, "Không thể tải giỏ hàng để thanh toán."));
      } finally {
        setLoading(false);
      }
    };

    void fetchCart();
  }, []);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const addresses = await getMyAddresses();
        setSavedAddresses(addresses);

        const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
        if (defaultAddress) {
          setSelectedAddressId(String(defaultAddress.id));
          setReceiverName(defaultAddress.fullName);
          setReceiverPhone(defaultAddress.phone);
          setShippingAddress(defaultAddress.addressLine);
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "Không thể tải địa chỉ giao hàng."));
      }
    };

    void fetchAddresses();
  }, []);

  useEffect(() => {
    const fetchAvailableVouchers = async () => {
      try {
        setAvailableVouchers(await getAvailableVouchers());
      } catch {
        setAvailableVouchers([]);
      }
    };

    void fetchAvailableVouchers();
  }, []);

  const selectedAddress = useMemo(
    () => savedAddresses.find((address) => String(address.id) === selectedAddressId) ?? null,
    [savedAddresses, selectedAddressId]
  );

  const subtotal = cart?.totalAmount ?? 0;
  const discountAmount = appliedVoucher?.discountAmount ?? 0;
  const finalTotal = appliedVoucher?.finalTotal ?? subtotal;

  const handleAddressChange = (addressId: string) => {
    setSelectedAddressId(addressId);
    const address = savedAddresses.find((item) => String(item.id) === addressId);
    if (!address) {
      return;
    }

    setReceiverName(address.fullName);
    setReceiverPhone(address.phone);
    setShippingAddress(address.addressLine);
  };

  const performApplyVoucher = async (code: string) => {
    const normalizedCode = code.trim().toUpperCase();

    if (!cart || cart.items.length === 0) {
      return;
    }

    if (!normalizedCode) {
      setVoucherMessage("Vui lòng nhập mã giảm giá.");
      setAppliedVoucher(null);
      return;
    }

    try {
      setVoucherLoading(true);
      setVoucherMessage("");
      const result = await applyVoucher({
        code: normalizedCode,
        subtotal,
      });
      setAppliedVoucher(result);
      setVoucherCode(result.code);
      setVoucherMessage(`Áp dụng thành công mã ${result.code}.`);
    } catch (err) {
      setAppliedVoucher(null);
      setVoucherMessage(getApiErrorMessage(err, "Không thể áp dụng mã giảm giá."));
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleApplyVoucher = async () => {
    await performApplyVoucher(voucherCode);
  };

  const handleQuickApplyVoucher = async (code: string) => {
    setVoucherCode(code);
    await performApplyVoucher(code);
  };

  const handleRemoveVoucher = () => {
    setVoucherCode("");
    setAppliedVoucher(null);
    setVoucherMessage("Đã xóa mã giảm giá.");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!receiverName.trim() || !receiverPhone.trim() || !shippingAddress.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin người nhận.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const order = await createOrder({
        receiverName: receiverName.trim(),
        receiverPhone: receiverPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        paymentMethod,
        note: note.trim(),
        voucherCode: appliedVoucher?.code,
      });

      notifyCartUpdated();

      if (paymentMethod === "VNPAY") {
        const payment = await createVnpayPayment({ orderId: order.id });
        window.location.href = payment.paymentUrl;
        return;
      }

      navigate("/account/orders", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể tạo đơn hàng."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="cart-page">
      <div className="container py-5">
        <div className="cart-page-header">
          <div>
            <p className="cart-page-subtitle">Bước cuối cùng</p>
            <h1 className="cart-page-title">Thanh toán</h1>
            <p className="cart-page-desc">
              Chọn địa chỉ nhận hàng, phương thức thanh toán và xác nhận đơn hàng.
            </p>
          </div>
          <Link to="/cart" className="btn btn-domora-outline">
            Quay lại giỏ hàng
          </Link>
        </div>

        {loading ? (
          <div className="cart-empty-state">
            <h3>Đang tải thông tin thanh toán...</h3>
          </div>
        ) : error && !cart ? (
          <div className="cart-empty-state">
            <h3>Không thể vào trang thanh toán</h3>
            <p>{error}</p>
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="cart-empty-state">
            <h3>Giỏ hàng đang trống</h3>
            <p>Bạn cần có sản phẩm trong giỏ hàng trước khi đặt hàng.</p>
            <Link to="/products" className="btn btn-domora">
              Xem sản phẩm
            </Link>
          </div>
        ) : (
          <div className="row g-4 align-items-start">
            <div className="col-lg-7">
              <form className="cart-list-card" onSubmit={handleSubmit}>
                <div className="cart-list-head">
                  <span>Thông tin người nhận</span>
                </div>

                {error && <div className="alert alert-danger mb-4">{error}</div>}

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                    <label className="form-label mb-0">Địa chỉ đã lưu</label>
                    <Link
                      to="/account/addresses"
                      state={{ fromCheckout: true }}
                      className="btn btn-domora-outline btn-sm"
                    >
                      Quản lý địa chỉ
                    </Link>
                  </div>

                  {savedAddresses.length > 0 ? (
                    <div className="cart-payment-methods">
                      {savedAddresses.map((address) => (
                        <label
                          key={address.id}
                          className={`cart-payment-option ${selectedAddressId === String(address.id) ? "active" : ""}`}
                        >
                          <input
                            type="radio"
                            name="savedAddress"
                            value={address.id}
                            checked={selectedAddressId === String(address.id)}
                            onChange={() => handleAddressChange(String(address.id))}
                          />
                          <div>
                            <strong>{address.label || address.fullName}</strong>
                            <p>
                              {address.fullName} • {address.phone}
                            </p>
                            <p className="mb-0">{address.addressLine}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="review-empty">
                      Bạn chưa lưu địa chỉ nào. Hãy vào mục <strong>Địa chỉ của tôi</strong> để
                      thêm địa chỉ dùng nhanh khi thanh toán.
                    </div>
                  )}
                </div>

                {selectedAddress && (
                  <div className="alert alert-light border mb-4">
                    Đang dùng địa chỉ: <strong>{selectedAddress.label || selectedAddress.fullName}</strong>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Tên người nhận</label>
                  <input
                    className="form-control auth-input"
                    value={receiverName}
                    onChange={(event) => setReceiverName(event.target.value)}
                    placeholder="Nhập tên người nhận"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Số điện thoại</label>
                  <input
                    className="form-control auth-input"
                    value={receiverPhone}
                    onChange={(event) => setReceiverPhone(event.target.value)}
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Địa chỉ nhận hàng</label>
                  <textarea
                    className="form-control auth-input"
                    rows={4}
                    value={shippingAddress}
                    onChange={(event) => setShippingAddress(event.target.value)}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Mã giảm giá</label>

                  <div className="voucher-promo-box">
                    <div className="voucher-promo-head">
                      <div>
                        <span className="voucher-promo-label">Khuyến mãi</span>
                        <h3>Chọn nhanh mã đang khả dụng</h3>
                      </div>
                      <span className="voucher-promo-count">{availableVouchers.length} mã</span>
                    </div>

                    {availableVouchers.length > 0 ? (
                      <div className="voucher-promo-list">
                        {availableVouchers.map((voucher) => (
                          <button
                            key={voucher.id}
                            type="button"
                            className={`voucher-promo-item ${voucherCode === voucher.code ? "active" : ""}`}
                            onClick={() => void handleQuickApplyVoucher(voucher.code)}
                            disabled={voucherLoading}
                          >
                            <div>
                              <strong>{voucher.code}</strong>
                              <p>{voucher.name}</p>
                              <span>{getVoucherShortLabel(voucher)}</span>
                            </div>
                            <small>
                              {voucher.minOrderValue && voucher.minOrderValue > 0
                                ? `Đơn từ ${formatPrice(voucher.minOrderValue)}`
                                : "Không yêu cầu tối thiểu"}
                            </small>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="voucher-promo-empty">
                        Hiện chưa có mã khuyến mãi khả dụng.
                      </div>
                    )}
                  </div>

                  <div className="voucher-apply-row">
                    <input
                      className="form-control auth-input"
                      value={voucherCode}
                      onChange={(event) => setVoucherCode(event.target.value.toUpperCase())}
                      placeholder="Nhập mã giảm giá"
                    />
                    <button
                      type="button"
                      className="btn btn-domora-outline"
                      onClick={() => void handleApplyVoucher()}
                      disabled={voucherLoading}
                    >
                      {voucherLoading ? "Đang áp dụng..." : "Áp dụng"}
                    </button>
                  </div>

                  {voucherMessage && (
                    <p className={`voucher-feedback ${appliedVoucher ? "success" : "error"}`}>
                      {voucherMessage}
                    </p>
                  )}

                  {appliedVoucher && (
                    <div className="voucher-result-card">
                      <div>
                        <strong>{appliedVoucher.name}</strong>
                        <p className="mb-0">
                          Mã {appliedVoucher.code} • Giảm thực tế{" "}
                          {formatPrice(appliedVoucher.discountAmount)}
                        </p>
                      </div>
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleRemoveVoucher}>
                        Bỏ mã
                      </button>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label">Phương thức thanh toán</label>
                  <div className="cart-payment-methods">
                    {paymentMethodOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`cart-payment-option ${paymentMethod === option.value ? "active" : ""} ${option.disabled ? "disabled" : ""}`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={option.value}
                          checked={paymentMethod === option.value}
                          onChange={() => setPaymentMethod(option.value)}
                          disabled={option.disabled}
                        />
                        <div>
                          <strong>{option.label}</strong>
                          <p>{option.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Ghi chú</label>
                  <textarea
                    className="form-control auth-input"
                    rows={3}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Thông tin thêm cho đơn hàng (không bắt buộc)"
                  />
                </div>

                <button type="submit" className="btn btn-domora" disabled={submitting}>
                  {submitting
                    ? "Đang xử lý..."
                    : paymentMethod === "VNPAY"
                      ? "Thanh toán với VNPay"
                      : "Đặt hàng với COD"}
                </button>
              </form>
            </div>

            <div className="col-lg-5">
              <aside className="cart-summary-card">
                <p className="cart-summary-label">Đơn hàng</p>
                <h2 className="cart-summary-title">Tóm tắt thanh toán</h2>

                <div className="cart-checkout-items">
                  {cart.items.map((item) => (
                    <div className="cart-summary-item" key={item.productId}>
                      <div>
                        <strong>{item.productName}</strong>
                        <div className="text-muted small">Số lượng: {item.quantity}</div>
                      </div>
                      <strong>{formatPrice(item.subtotal)}</strong>
                    </div>
                  ))}
                </div>

                <div className="cart-summary-row">
                  <span>Phương thức</span>
                  <strong>{paymentMethod}</strong>
                </div>
                <div className="cart-summary-row">
                  <span>Tạm tính</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
                <div className="cart-summary-row">
                  <span>Giảm giá</span>
                  <strong>- {formatPrice(discountAmount)}</strong>
                </div>
                <div className="cart-summary-row">
                  <span>Vận chuyển</span>
                  <strong>Liên hệ</strong>
                </div>
                <div className="cart-summary-row total">
                  <span>Tổng cộng</span>
                  <strong>{formatPrice(finalTotal)}</strong>
                </div>
              </aside>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
