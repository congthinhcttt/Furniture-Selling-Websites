import { type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getApiErrorMessage, registerAccount } from "../../api/authApi";
import { useAuth } from "../../hooks/useAuth";

export default function RegisterPage() {
  const { auth, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && auth?.token) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!loginName.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Mật khẩu cần ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const response = await registerAccount({
        loginName: loginName.trim(),
        password,
      });

      login({
        username: response.data.loginName,
        accountId: response.data.id,
        role: response.data.role || "USER",
        authProvider: response.data.authProvider || "LOCAL",
        token: response.data.token,
        tokenType: response.data.tokenType || "Bearer",
        expiresAt: response.data.expiresAt,
      });

      navigate("/", { replace: true });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Đăng ký thất bại. Vui lòng thử lại."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-image auth-image-register" />
          <div className="auth-form-section">
            <Link to="/" className="brand-logo">
              DOMORA<span className="brand-dot">.</span>
            </Link>

            <h2 className="auth-title">Tạo tài khoản mới</h2>
            <p className="auth-subtitle">Tham gia cộng đồng yêu nội thất hiện đại.</p>

            {errorMessage && <div className="alert alert-danger py-2 mb-4 auth-alert">{errorMessage}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3 text-start">
                <label className="form-label auth-label">Tên đăng nhập</label>
                <input
                  type="text"
                  className="form-control auth-input"
                  placeholder="Ví dụ: binhle123"
                  value={loginName}
                  onChange={(event) => setLoginName(event.target.value)}
                  required
                />
              </div>
              <div className="mb-3 text-start">
                <label className="form-label auth-label">Mật khẩu</label>
                <input
                  type="password"
                  className="form-control auth-input"
                  placeholder="********"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <div className="mb-4 text-start">
                <label className="form-label auth-label">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  className="form-control auth-input"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn auth-btn w-100 shadow-sm" disabled={isSubmitting}>
                {isSubmitting ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ TÀI KHOẢN"}
              </button>

              <p className="text-center mt-4 text-muted small mb-0">
                Đã có tài khoản?{" "}
                <Link to="/login" className="auth-link-strong">
                  Đăng nhập tại đây
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
