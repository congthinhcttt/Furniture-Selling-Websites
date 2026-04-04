import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ requireAdmin = false }: ProtectedRouteProps) {
  const { auth, isLoading } = useAuth();
  const location = useLocation();
  const isExpired = !!auth?.expiresAt && auth.expiresAt <= Math.floor(Date.now() / 1000);

  if (isLoading) {
    return <div className="container py-5">Đang tải phiên đăng nhập...</div>;
  }

  if (!auth?.token || isExpired) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requireAdmin && auth.role !== "ADMIN" && auth.role !== "ROLE_ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
