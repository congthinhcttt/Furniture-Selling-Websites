import { type FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { getApiErrorMessage, GOOGLE_LOGIN_URL, loginAccount } from "../../api/authApi";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const { auth, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdminAuth = auth?.role === "ADMIN" || auth?.role === "ROLE_ADMIN";

  if (!isLoading && auth?.token) {
    return <Navigate to={isAdminAuth ? "/admin" : "/"} replace />;
  }

  const redirectTo = (location.state as { from?: string } | null)?.from || "/";

  const completeLogin = (
    response: {
      id: number;
      loginName: string;
      email?: string;
      fullName?: string;
      avatarUrl?: string;
      role?: string;
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
      setErrorMessage("Vui long nhap day du tai khoan va mat khau.");
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
      setErrorMessage(getApiErrorMessage(error, "Dang nhap that bai. Vui long thu lai."));
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

            <h2 className="auth-title">Chao mung tro lai</h2>
            <p className="auth-subtitle">Vui long dang nhap de quan ly khong gian cua ban.</p>

            {errorMessage && <div className="alert alert-danger py-2 mb-4 auth-alert">{errorMessage}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label auth-label">Tai khoan</label>
                <input
                  type="text"
                  className="form-control auth-input"
                  placeholder="Nhap ten dang nhap"
                  value={loginName}
                  onChange={(event) => setLoginName(event.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label auth-label">Mat khau</label>
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
                    Ghi nho toi
                  </label>
                </div>
                <a href="#" className="auth-link-small">
                  Quen mat khau?
                </a>
              </div>

              <button type="submit" className="btn auth-btn w-100" disabled={isSubmitting}>
                {isSubmitting ? "DANG XU LY..." : "DANG NHAP NGAY"}
              </button>
            </form>

            <div className="auth-divider">
              <span>hoac</span>
            </div>

            <a href={GOOGLE_LOGIN_URL} className="btn auth-google-btn w-100">
              Dang nhap voi Google
            </a>

            <p className="text-center mt-4 text-muted small mb-0">
              Chua co tai khoan?{" "}
              <Link to="/register" className="auth-link-strong">
                Dang ky ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
