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
      setError(getApiErrorMessage(err, "Khong the tai danh sach dia chi."));
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
      setError("Vui long nhap day du ho ten, so dien thoai va dia chi.");
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
      setError(getApiErrorMessage(err, "Khong the luu dia chi."));
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
                <p className="account-section-kicker">Address Book</p>
                <h2>Dia chi cua toi</h2>
              </div>
              <span className="account-section-chip">{addresses.length} dia chi</span>
            </div>

            <p className="account-note">
              Dia chi duoc luu rieng theo tung tai khoan va se duoc dung khi thanh toan.
            </p>

            {fromCheckout && (
              <div className="alert alert-light border d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                <span>Ban dang quan ly dia chi tu trang thanh toan.</span>
                <button type="button" className="btn btn-domora-outline btn-sm" onClick={() => navigate("/checkout")}>
                  Tiep tuc thanh toan
                </button>
              </div>
            )}

            <form className="review-form mb-4" onSubmit={handleSubmit}>
              <div className="review-form__heading">
                <div>
                  <p className="review-form__kicker">{editingId ? "Chinh sua dia chi" : "Them dia chi moi"}</p>
                  <h3>{editingId ? "Cap nhat thong tin nhan hang" : "Luu dia chi de dung nhanh khi thanh toan"}</h3>
                </div>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Ho ten nguoi nhan</label>
                  <input
                    className="form-control"
                    value={form.fullName}
                    onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                    placeholder="Nhap ho ten"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">So dien thoai</label>
                  <input
                    className="form-control"
                    value={form.phone}
                    onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="Nhap so dien thoai"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Nhan goi nho</label>
                  <input
                    className="form-control"
                    value={form.label}
                    onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
                    placeholder="Vi du: Nha rieng, Cong ty"
                  />
                </div>
                <div className="col-md-8">
                  <label className="form-label">Dia chi chi tiet</label>
                  <input
                    className="form-control"
                    value={form.addressLine}
                    onChange={(event) => setForm((current) => ({ ...current, addressLine: event.target.value }))}
                    placeholder="So nha, duong, phuong/xa, quan/huyen, tinh/thanh"
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
                  Dat lam dia chi mac dinh
                </label>
              </div>

              <div className="d-flex gap-2 flex-wrap mt-4">
                <button type="submit" className="btn btn-domora" disabled={submitting}>
                  {submitting ? "Dang luu..." : editingId ? "Cap nhat dia chi" : "Luu dia chi"}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-domora-outline" onClick={resetForm}>
                    Huy sua
                  </button>
                )}
                {fromCheckout && (
                  <button type="button" className="btn btn-domora-outline" onClick={() => navigate("/checkout")}>
                    Tiep tuc thanh toan
                  </button>
                )}
              </div>
            </form>

            {loading ? (
              <div className="review-empty">Dang tai dia chi...</div>
            ) : addresses.length === 0 ? (
              <div className="review-empty">Ban chua luu dia chi nao.</div>
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
                        {address.isDefault ? "Mac dinh" : "Dia chi da luu"}
                      </div>
                    </div>

                    <p className="mb-3">{address.addressLine}</p>

                    <div className="account-review-item__actions">
                      {fromCheckout && (
                        <button type="button" className="btn btn-domora" onClick={() => navigate("/checkout")}>
                          Tiep tuc thanh toan
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
                          Dat mac dinh
                        </button>
                      )}
                      <button type="button" className="btn btn-domora-outline" onClick={() => handleEdit(address)}>
                        Chinh sua
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
                        Xoa
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
