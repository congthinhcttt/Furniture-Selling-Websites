import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { forgotPasswordAccount, getApiErrorMessage } from "../../api/authApi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setErrorMessage("Vui lòng nhập email.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setMessage("");

      const serverMessage = await forgotPasswordAccount({ email: normalizedEmail });
      setMessage(serverMessage);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Không thể gửi yêu cầu quên mật khẩu. Vui lòng thử lại."));
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

            <h2 className="auth-title">Quên mật khẩu</h2>
            <p className="auth-subtitle">Nhập email để nhận link đặt lại mật khẩu qua Gmail.</p>

            {errorMessage && <div className="alert alert-danger py-2 mb-4 auth-alert">{errorMessage}</div>}
            {message && <div className="alert alert-success py-2 mb-4 auth-alert">{message}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label auth-label">Email</label>
                <input
                  type="email"
                  className="form-control auth-input"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Nhập email đăng ký"
                  required
                />
              </div>

              <button type="submit" className="btn auth-btn w-100" disabled={isSubmitting}>
                {isSubmitting ? "ĐANG GỬI..." : "GỬI LINK ĐẶT LẠI MẬT KHẨU"}
              </button>
            </form>

            <p className="text-center mt-4 text-muted small mb-0">
              Đã nhớ mật khẩu?{" "}
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
