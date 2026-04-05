import { type FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getApiErrorMessage, GOOGLE_LOGIN_URL, loginAccount } from "../../api/authApi";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const { auth, isLoading, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);

  const isAdminAuth = auth?.role === "ADMIN" || auth?.role === "ROLE_ADMIN";
  const redirectTo = (location.state as { from?: string } | null)?.from || "/";

  const completeLogin = (
    response: {
      id: number;
      loginName: string;
      email?: string;
      fullName?: string;
      avatarUrl?: string;
      role?: string;
      authProvider?: string;
      token?: string;
      tokenType?: string;
      expiresAt?: number;
    },
    persist = true
  ) => {
    login(
      {
        username: response.loginName,
        email: response.email,
        fullName: response.fullName,
        avatarUrl: response.avatarUrl,
        accountId: response.id,
        role: response.role || "USER",
        authProvider: response.authProvider || "LOCAL",
        token: response.token,
        tokenType: response.tokenType || "Bearer",
        expiresAt: response.expiresAt,
      },
      persist
    );

    const isAdminRole = response.role === "ADMIN" || response.role === "ROLE_ADMIN";
    const nextPath = redirectTo !== "/" ? redirectTo : isAdminRole ? "/admin" : "/";
    navigate(nextPath, { replace: true });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!loginName.trim() || !password.trim()) {
      setErrorMessage("Vui lòng nhập đầy đủ tài khoản và mật khẩu.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      const response = await loginAccount({
        loginName: loginName.trim(),
        password,
      });
      completeLogin(response.data, rememberMe);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Đăng nhập thất bại. Vui lòng thử lại."));
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

            {!isLoading && auth?.token && !isSwitchingAccount ? (
              <>
                <h2 className="auth-title">Bạn đang đăng nhập</h2>
                <p className="auth-subtitle">
                  Tài khoản hiện tại: <strong>{auth.fullName || auth.username}</strong>
                </p>
                <div className="auth-switch-panel">
                  <button
                    type="button"
                    className="btn auth-btn w-100"
                    onClick={() => navigate(isAdminAuth ? "/admin" : "/", { replace: true })}
                  >
                    TIẾP TỤC VỚI TÀI KHOẢN NÀY
                  </button>
                  <button
                    type="button"
                    className="btn auth-google-btn w-100"
                    onClick={() => {
                      logout();
                      setIsSwitchingAccount(true);
                    }}
                  >
                    ĐỔI TÀI KHOẢN
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="auth-title">Chào mừng trở lại</h2>
                <p className="auth-subtitle">Vui lòng đăng nhập để quản lý không gian của bạn.</p>

                {errorMessage && <div className="alert alert-danger py-2 mb-4 auth-alert">{errorMessage}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label auth-label">Tài khoản</label>
                    <input
                      type="text"
                      className="form-control auth-input"
                      placeholder="Nhập tên đăng nhập"
                      value={loginName}
                      onChange={(event) => setLoginName(event.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4">
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
                  <div className="d-flex justify-content-between align-items-center mb-4 auth-options">
                    <div className="form-check text-start">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(event) => setRememberMe(event.target.checked)}
                      />
                      <label className="form-check-label small" htmlFor="rememberMe">
                        Ghi nhớ tôi
                      </label>
                    </div>
                    <Link to="/forgot-password" className="auth-link-small">
                      Quên mật khẩu?
                    </Link>
                  </div>

                  <button type="submit" className="btn auth-btn w-100" disabled={isSubmitting}>
                    {isSubmitting ? "ĐANG XỬ LÝ..." : "ĐĂNG NHẬP NGAY"}
                  </button>
                </form>

                <div className="auth-divider">
                  <span>hoặc</span>
                </div>

                <a href={GOOGLE_LOGIN_URL} className="btn auth-google-btn w-100">
                  Đăng nhập với Google
                </a>

                <p className="text-center mt-4 text-muted small mb-0">
                  Chưa có tài khoản?{" "}
                  <Link to="/register" className="auth-link-strong">
                    Đăng ký ngay
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
