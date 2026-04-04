import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyAddresses } from "../../api/addressApi";
import { getApiErrorMessage } from "../../api/authApi";
import { getMyCart, notifyCartUpdated } from "../../api/cartApi";
import { createOrder, createVnpayPayment } from "../../api/orderApi";
import type { CartResponse } from "../../types/cart";
import type { SavedAddress } from "../../types/address";

type PaymentMethod = "COD" | "VNPAY" | "MOMO";

const paymentMethodOptions: Array<{
  value: PaymentMethod;
  label: string;
  description: string;
  disabled?: boolean;
}> = [
  {
    value: "COD",
    label: "Thanh toan khi nhan hang",
    description: "Xac nhan don hang ngay, thanh toan khi shipper giao den.",
  },
  {
    value: "VNPAY",
    label: "VNPay",
    description: "Thanh toan online qua cong thanh toan VNPay sandbox.",
  },
  {
    value: "MOMO",
    label: "MoMo",
    description: "Sap ho tro.",
    disabled: true,
  },
];

function formatPrice(price: number) {
  return `${price.toLocaleString("vi-VN")} d`;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        setError("");
        setCart(await getMyCart());
      } catch (err) {
        setError(getApiErrorMessage(err, "Khong the tai gio hang de thanh toan."));
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
        setError(getApiErrorMessage(err, "Khong the tai dia chi giao hang."));
      }
    };

    void fetchAddresses();
  }, []);

  const selectedAddress = useMemo(
    () => savedAddresses.find((address) => String(address.id) === selectedAddressId) ?? null,
    [savedAddresses, selectedAddressId]
  );

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!receiverName.trim() || !receiverPhone.trim() || !shippingAddress.trim()) {
      setError("Vui long nhap day du thong tin nguoi nhan.");
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
      });

      notifyCartUpdated();

      if (paymentMethod === "VNPAY") {
        const payment = await createVnpayPayment({ orderId: order.id });
        window.location.href = payment.paymentUrl;
        return;
      }

      navigate("/account/orders", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Khong the tao don hang."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="cart-page">
      <div className="container py-5">
        <div className="cart-page-header">
          <div>
            <p className="cart-page-subtitle">Buoc cuoi cung</p>
            <h1 className="cart-page-title">Thanh toan</h1>
            <p className="cart-page-desc">Chon dia chi nhan hang, phuong thuc thanh toan va xac nhan don hang.</p>
          </div>
          <Link to="/cart" className="btn btn-domora-outline">
            Quay lai gio hang
          </Link>
        </div>

        {loading ? (
          <div className="cart-empty-state">
            <h3>Dang tai thong tin thanh toan...</h3>
          </div>
        ) : error && !cart ? (
          <div className="cart-empty-state">
            <h3>Khong the vao trang thanh toan</h3>
            <p>{error}</p>
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="cart-empty-state">
            <h3>Gio hang dang trong</h3>
            <p>Ban can co san pham trong gio hang truoc khi dat hang.</p>
            <Link to="/products" className="btn btn-domora">
              Xem san pham
            </Link>
          </div>
        ) : (
          <div className="row g-4 align-items-start">
            <div className="col-lg-7">
              <form className="cart-list-card" onSubmit={handleSubmit}>
                <div className="cart-list-head">
                  <span>Thong tin nguoi nhan</span>
                </div>

                {error && <div className="alert alert-danger mb-4">{error}</div>}

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                    <label className="form-label mb-0">Dia chi da luu</label>
                    <Link to="/account/addresses" state={{ fromCheckout: true }} className="btn btn-domora-outline btn-sm">
                      Quan ly dia chi
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
                      Ban chua luu dia chi nao. Hay vao muc <strong>Dia chi cua toi</strong> de them dia chi dung nhanh
                      khi thanh toan.
                    </div>
                  )}
                </div>

                {selectedAddress && (
                  <div className="alert alert-light border mb-4">
                    Dang dung dia chi: <strong>{selectedAddress.label || selectedAddress.fullName}</strong>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Ten nguoi nhan</label>
                  <input
                    className="form-control auth-input"
                    value={receiverName}
                    onChange={(event) => setReceiverName(event.target.value)}
                    placeholder="Nhap ten nguoi nhan"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">So dien thoai</label>
                  <input
                    className="form-control auth-input"
                    value={receiverPhone}
                    onChange={(event) => setReceiverPhone(event.target.value)}
                    placeholder="Nhap so dien thoai"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Dia chi nhan hang</label>
                  <textarea
                    className="form-control auth-input"
                    rows={4}
                    value={shippingAddress}
                    onChange={(event) => setShippingAddress(event.target.value)}
                    placeholder="So nha, duong, phuong/xa, quan/huyen, tinh/thanh"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Phuong thuc thanh toan</label>
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
                  <label className="form-label">Ghi chu</label>
                  <textarea
                    className="form-control auth-input"
                    rows={3}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Thong tin them cho don hang (khong bat buoc)"
                  />
                </div>

                <button type="submit" className="btn btn-domora" disabled={submitting}>
                  {submitting
                    ? "Dang xu ly..."
                    : paymentMethod === "VNPAY"
                      ? "Thanh toan voi VNPay"
                      : "Dat hang voi COD"}
                </button>
              </form>
            </div>

            <div className="col-lg-5">
              <aside className="cart-summary-card">
                <p className="cart-summary-label">Don hang</p>
                <h2 className="cart-summary-title">Tom tat thanh toan</h2>

                <div className="cart-checkout-items">
                  {cart.items.map((item) => (
                    <div className="cart-summary-item" key={item.productId}>
                      <div>
                        <strong>{item.productName}</strong>
                        <div className="text-muted small">So luong: {item.quantity}</div>
                      </div>
                      <strong>{formatPrice(item.subtotal)}</strong>
                    </div>
                  ))}
                </div>

                <div className="cart-summary-row">
                  <span>Phuong thuc</span>
                  <strong>{paymentMethod}</strong>
                </div>
                <div className="cart-summary-row">
                  <span>Tam tinh</span>
                  <strong>{formatPrice(cart.totalAmount)}</strong>
                </div>
                <div className="cart-summary-row">
                  <span>Van chuyen</span>
                  <strong>Lien he</strong>
                </div>
                <div className="cart-summary-row total">
                  <span>Tong cong</span>
                  <strong>{formatPrice(cart.totalAmount)}</strong>
                </div>
              </aside>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
