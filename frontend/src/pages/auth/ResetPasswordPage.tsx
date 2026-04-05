import { type FormEvent, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getApiErrorMessage, resetPasswordByToken } from "../../api/authApi";

function useToken() {
  const location = useLocation();
  return useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get("token") || "").trim();
  }, [location.search]);
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const token = useToken();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setErrorMessage("Liên kết không hợp lệ hoặc thiếu token.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setErrorMessage("Vui lòng nhập đầy đủ mật khẩu mới.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Mật khẩu mới cần ít nhất 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Xác nhận mật khẩu không khớp.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setMessage("");

      await resetPasswordByToken({
        token,
        newPassword,
        confirmPassword,
      });

      setMessage("Đặt lại mật khẩu thành công. Đang chuyển về trang đăng nhập...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Không thể đặt lại mật khẩu. Vui lòng thử lại."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-image auth-image-login" />
          <div className="auth-form-section text-center text-md-start">
            <Link to="/" className="brand-logo">
              DOMORA<span className="brand-dot">.</span>
            </Link>

            <h2 className="auth-title">Đặt lại mật khẩu</h2>
            <p className="auth-subtitle">Tạo mật khẩu mới cho tài khoản của bạn.</p>

            {errorMessage && <div className="alert alert-danger py-2 mb-4 auth-alert">{errorMessage}</div>}
            {message && <div className="alert alert-success py-2 mb-4 auth-alert">{message}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label auth-label">Mật khẩu mới</label>
                <input
                  type="password"
                  className="form-control auth-input"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="********"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label auth-label">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  className="form-control auth-input"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="********"
                  required
                />
              </div>

              <button type="submit" className="btn auth-btn w-100" disabled={isSubmitting}>
                {isSubmitting ? "ĐANG CẬP NHẬT..." : "XÁC NHẬN ĐẶT LẠI MẬT KHẨU"}
              </button>
            </form>

            <p className="text-center mt-4 text-muted small mb-0">
              <Link to="/login" className="auth-link-strong">
                Quay lại đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
