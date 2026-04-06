import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../api/authApi";
import { getAdminAffiliateConfig, updateAdminAffiliateConfig } from "../../api/adminAffiliateApi";
import type { AffiliateConfigUpdatePayload } from "../../types/affiliate";

const discountTypeOptions = [
  { value: "PERCENT", label: "PERCENT" },
  { value: "FIXED", label: "FIXED" },
] as const;

const defaultForm: AffiliateConfigUpdatePayload = {
  enabled: true,
  referrerRewardType: "PERCENT",
  referrerRewardValue: 30,
  refereeRewardType: "PERCENT",
  refereeRewardValue: 10,
  voucherExpiryDays: 30,
  minOrderValue: 0,
  maxDiscountValue: null,
  referrerVoucherName: "Referral Reward Voucher",
  referrerVoucherContent: "Voucher danh cho nguoi gioi thieu",
  refereeVoucherName: "Welcome Voucher",
  refereeVoucherContent: "Voucher chao mung thanh vien moi",
  description: "",
};

export default function AdminAffiliateConfigPage() {
  const [form, setForm] = useState<AffiliateConfigUpdatePayload>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        setError("");
        const config = await getAdminAffiliateConfig();
        setForm({
          enabled: config.enabled,
          referrerRewardType: config.referrerRewardType,
          referrerRewardValue: config.referrerRewardValue,
          refereeRewardType: config.refereeRewardType,
          refereeRewardValue: config.refereeRewardValue,
          voucherExpiryDays: config.voucherExpiryDays,
          minOrderValue: config.minOrderValue ?? 0,
          maxDiscountValue: config.maxDiscountValue ?? null,
          referrerVoucherName: config.referrerVoucherName,
          referrerVoucherContent: config.referrerVoucherContent ?? "",
          refereeVoucherName: config.refereeVoucherName,
          refereeVoucherContent: config.refereeVoucherContent ?? "",
          description: config.description ?? "",
        });
      } catch (err) {
        setError(getApiErrorMessage(err, "Khong the tai cau hinh affiliate."));
      } finally {
        setLoading(false);
      }
    };

    void loadConfig();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await updateAdminAffiliateConfig({
        ...form,
        referrerVoucherName: form.referrerVoucherName.trim(),
        refereeVoucherName: form.refereeVoucherName.trim(),
        referrerVoucherContent: form.referrerVoucherContent?.trim() || "",
        refereeVoucherContent: form.refereeVoucherContent?.trim() || "",
        description: form.description?.trim() || "",
      });
      setMessage("Cap nhat cau hinh affiliate thanh cong.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Khong the cap nhat cau hinh affiliate."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Affiliate</p>
          <h1 className="admin-page-title">Cau hinh voucher gioi thieu</h1>
          <p className="admin-page-desc">
            Chinh noi dung voucher va % giam gia rieng cho nguoi gioi thieu va nguoi duoc gioi thieu.
          </p>
        </div>
      </div>

      <div className="admin-panel">
        {loading ? (
          <div className="admin-empty-state">Dang tai cau hinh affiliate...</div>
        ) : (
          <form className="admin-form admin-form-grid" onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <div>
              <label className="form-label">Bat/tat chuong trinh</label>
              <select
                className="form-select"
                value={form.enabled ? "true" : "false"}
                onChange={(event) => setForm((current) => ({ ...current, enabled: event.target.value === "true" }))}
              >
                <option value="true">Bat</option>
                <option value="false">Tat</option>
              </select>
            </div>

            <div>
              <label className="form-label">Voucher expiry days</label>
              <input
                type="number"
                min={1}
                className="form-control"
                value={form.voucherExpiryDays}
                onChange={(event) =>
                  setForm((current) => ({ ...current, voucherExpiryDays: Number(event.target.value) || 1 }))
                }
              />
            </div>

            <div>
              <label className="form-label">Min order value</label>
              <input
                type="number"
                min={0}
                className="form-control"
                value={form.minOrderValue ?? 0}
                onChange={(event) =>
                  setForm((current) => ({ ...current, minOrderValue: Number(event.target.value) || 0 }))
                }
              />
            </div>

            <div>
              <label className="form-label">Max discount value</label>
              <input
                type="number"
                min={0}
                className="form-control"
                value={form.maxDiscountValue ?? 0}
                onChange={(event) =>
                  setForm((current) => ({ ...current, maxDiscountValue: Number(event.target.value) || 0 }))
                }
              />
            </div>

            <div className="admin-restock-summary">
              <h3>Nguoi gioi thieu</h3>
              <div className="admin-form-grid">
                <div>
                  <label className="form-label">Loai giam gia</label>
                  <select
                    className="form-select"
                    value={form.referrerRewardType}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        referrerRewardType: event.target.value as "PERCENT" | "FIXED",
                      }))
                    }
                  >
                    {discountTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Gia tri giam</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0.01}
                    className="form-control"
                    value={form.referrerRewardValue}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        referrerRewardValue: Number(event.target.value) || 0.01,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Ten voucher</label>
                  <input
                    className="form-control"
                    value={form.referrerVoucherName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, referrerVoucherName: event.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Noi dung voucher</label>
                  <input
                    className="form-control"
                    value={form.referrerVoucherContent ?? ""}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, referrerVoucherContent: event.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="admin-restock-summary">
              <h3>Nguoi duoc gioi thieu</h3>
              <div className="admin-form-grid">
                <div>
                  <label className="form-label">Loai giam gia</label>
                  <select
                    className="form-select"
                    value={form.refereeRewardType}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        refereeRewardType: event.target.value as "PERCENT" | "FIXED",
                      }))
                    }
                  >
                    {discountTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Gia tri giam</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0.01}
                    className="form-control"
                    value={form.refereeRewardValue}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        refereeRewardValue: Number(event.target.value) || 0.01,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Ten voucher</label>
                  <input
                    className="form-control"
                    value={form.refereeVoucherName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, refereeVoucherName: event.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Noi dung voucher</label>
                  <input
                    className="form-control"
                    value={form.refereeVoucherContent ?? ""}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, refereeVoucherContent: event.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="form-label">Mo ta chuong trinh</label>
              <textarea
                className="form-control"
                rows={3}
                value={form.description ?? ""}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
            </div>

            <div className="admin-panel-actions">
              <button type="submit" className="btn btn-domora" disabled={saving}>
                {saving ? "Dang luu..." : "Luu cau hinh affiliate"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
