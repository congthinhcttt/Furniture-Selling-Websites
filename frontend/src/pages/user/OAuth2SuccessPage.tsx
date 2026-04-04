import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getApiErrorMessage } from "../../api/authApi";
import { useAuth } from "../../hooks/useAuth";

export default function OAuth2SuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setErrorMessage("Khong nhan duoc token dang nhap tu Google.");
      return;
    }

    const completeOAuthLogin = async () => {
      try {
        const auth = await loginWithToken(token, true);
        const isAdmin = auth.role === "ADMIN" || auth.role === "ROLE_ADMIN";
        navigate(isAdmin ? "/admin" : "/", { replace: true });
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, "Dang nhap Google that bai. Vui long thu lai."));
      }
    };

    void completeOAuthLogin();
  }, [loginWithToken, navigate, searchParams]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-image auth-image-login" />
          <div className="auth-form-section text-center text-md-start">
            <Link to="/" className="brand-logo">
              DOMORA<span className="brand-dot">.</span>
            </Link>

            <h2 className="auth-title">Dang hoan tat dang nhap</h2>
            <p className="auth-subtitle">He thong dang xac thuc tai khoan Google cua ban.</p>

            {errorMessage ? (
              <>
                <div className="alert alert-danger py-2 mb-4 auth-alert">{errorMessage}</div>
                <Link to="/login" className="btn auth-btn w-100">
                  Quay lai dang nhap
                </Link>
              </>
            ) : (
              <div className="alert alert-info py-2 mb-0 auth-alert">Vui long cho trong giay lat...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
