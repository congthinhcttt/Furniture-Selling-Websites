import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../api/authApi";
import {
  createAddress,
  deleteAddress,
  getMyAddresses,
  setDefaultAddress,
  updateAddress,
} from "../../api/addressApi";
import type { AddressFormPayload, SavedAddress } from "../../types/address";

const emptyForm: AddressFormPayload = {
  fullName: "",
  phone: "",
  addressLine: "",
  label: "",
  isDefault: false,
};

export default function AccountAddressesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromCheckout = Boolean((location.state as { fromCheckout?: boolean } | null)?.fromCheckout);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [form, setForm] = useState<AddressFormPayload>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError("");
      setAddresses(await getMyAddresses());
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể tải danh sách địa chỉ."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAddresses();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.fullName?.trim() || !form.phone?.trim() || !form.addressLine?.trim()) {
      setError("Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingId) {
        await updateAddress(editingId, form);
      } else {
        await createAddress(form);
      }

      await loadAddresses();
      resetForm();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể lưu địa chỉ."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (address: SavedAddress) => {
    setEditingId(address.id);
    setForm({
      fullName: address.fullName,
      phone: address.phone,
      addressLine: address.addressLine,
      label: address.label || "",
      isDefault: address.isDefault,
    });
    setError("");
  };

  return (
    <section className="info-page">
      <div className="container info-page-section">
        <div className="account-main-grid">
          <div className="info-card info-card-large">
            <div className="account-section-heading">
              <div>
                <p className="account-section-kicker">Sổ địa chỉ</p>
                <h2>Địa chỉ của tôi</h2>
              </div>
              <span className="account-section-chip">{addresses.length} địa chỉ</span>
            </div>

            <p className="account-note">
              Địa chỉ được lưu riêng theo từng tài khoản và sẽ được dùng khi thanh toán.
            </p>

            {fromCheckout && (
              <div className="alert alert-light border d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                <span>Bạn đang quản lý địa chỉ từ trang thanh toán.</span>
                <button type="button" className="btn btn-domora-outline btn-sm" onClick={() => navigate("/checkout")}>
                  Tiếp tục thanh toán
                </button>
              </div>
            )}

            <form className="review-form mb-4" onSubmit={handleSubmit}>
              <div className="review-form__heading">
                <div>
                  <p className="review-form__kicker">{editingId ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}</p>
                  <h3>{editingId ? "Cập nhật thông tin nhận hàng" : "Lưu địa chỉ để dùng nhanh khi thanh toán"}</h3>
                </div>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Họ tên người nhận</label>
                  <input
                    className="form-control"
                    value={form.fullName}
                    onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                    placeholder="Nhập họ tên"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Số điện thoại</label>
                  <input
                    className="form-control"
                    value={form.phone}
                    onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Nhãn gợi nhớ</label>
                  <input
                    className="form-control"
                    value={form.label}
                    onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
                    placeholder="Ví dụ: Nhà riêng, Công ty"
                  />
                </div>
                <div className="col-md-8">
                  <label className="form-label">Địa chỉ chi tiết</label>
                  <input
                    className="form-control"
                    value={form.addressLine}
                    onChange={(event) => setForm((current) => ({ ...current, addressLine: event.target.value }))}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                  />
                </div>
              </div>

              <div className="form-check mt-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="addressDefault"
                  checked={Boolean(form.isDefault)}
                  onChange={(event) => setForm((current) => ({ ...current, isDefault: event.target.checked }))}
                />
                <label className="form-check-label" htmlFor="addressDefault">
                  Đặt làm địa chỉ mặc định
                </label>
              </div>

              <div className="d-flex gap-2 flex-wrap mt-4">
                <button type="submit" className="btn btn-domora" disabled={submitting}>
                  {submitting ? "Đang lưu..." : editingId ? "Cập nhật địa chỉ" : "Lưu địa chỉ"}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-domora-outline" onClick={resetForm}>
                    Hủy sửa
                  </button>
                )}
                {fromCheckout && (
                  <button type="button" className="btn btn-domora-outline" onClick={() => navigate("/checkout")}>
                    Tiếp tục thanh toán
                  </button>
                )}
              </div>
            </form>

            {loading ? (
              <div className="review-empty">Đang tải địa chỉ...</div>
            ) : addresses.length === 0 ? (
              <div className="review-empty">Bạn chưa lưu địa chỉ nào.</div>
            ) : (
              <div className="account-review-grid">
                {addresses.map((address) => (
                  <article key={address.id} className="account-review-item">
                    <div className="account-review-item__head">
                      <div>
                        <h3>{address.label || address.fullName}</h3>
                        <p>
                          {address.fullName} • {address.phone}
                        </p>
                      </div>
                      <div className={`account-status-badge ${address.isDefault ? "approved" : "hidden"}`}>
                        {address.isDefault ? "Mặc định" : "Địa chỉ đã lưu"}
                      </div>
                    </div>

                    <p className="mb-3">{address.addressLine}</p>

                    <div className="account-review-item__actions">
                      {fromCheckout && (
                        <button type="button" className="btn btn-domora" onClick={() => navigate("/checkout")}>
                          Tiếp tục thanh toán
                        </button>
                      )}
                      {!address.isDefault && (
                        <button
                          type="button"
                          className="btn btn-domora-outline"
                          onClick={async () => {
                            await setDefaultAddress(address.id);
                            await loadAddresses();
                          }}
                        >
                          Đặt mặc định
                        </button>
                      )}
                      <button type="button" className="btn btn-domora-outline" onClick={() => handleEdit(address)}>
                        Chỉnh sửa
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={async () => {
                          await deleteAddress(address.id);
                          await loadAddresses();
                          if (editingId === address.id) {
                            resetForm();
                          }
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}