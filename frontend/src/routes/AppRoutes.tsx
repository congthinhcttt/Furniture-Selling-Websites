import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";
import AdminAccountsPage from "../pages/admin/AdminAccountsPage";
import AdminAffiliateConfigPage from "../pages/admin/AdminAffiliateConfigPage";
import AdminCategoriesPage from "../pages/admin/AdminCategoriesPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminNewsPage from "../pages/admin/AdminNewsPage";
import AdminOrdersPage from "../pages/admin/AdminOrdersPage";
import AdminProductsPage from "../pages/admin/AdminProductsPage";
import AdminReviewsPage from "../pages/admin/AdminReviewsPage";
import AboutPage from "../pages/user/AboutPage";
import AccountAddressesPage from "../pages/user/AccountAddressesPage";
import AccountOrdersPage from "../pages/user/AccountOrdersPage";
import AccountProfilePage from "../pages/user/AccountProfilePage";
import AccountReviewsPage from "../pages/user/AccountReviewsPage";
import AccountWishlistPage from "../pages/user/AccountWishlistPage";
import CartPage from "../pages/user/CartPage";
import CheckoutPage from "../pages/user/CheckoutPage";
import ComparePage from "../pages/user/ComparePage";
import HomePage from "../pages/user/HomePage";
import NewsDetailPage from "../pages/user/NewsDetailPage";
import NewsPage from "../pages/user/NewsPage";
import OrderTrackingPage from "../pages/user/OrderTrackingPage";
import PaymentResultPage from "../pages/user/PaymentResultPage";
import ProductDetailPage from "../pages/user/ProductDetailPage";
import ProductPage from "../pages/user/ProductPage";
import PromotionPage from "../pages/user/PromotionPage";
import StorePage from "../pages/user/StorePage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import LoginPage from "../pages/auth/LoginPage";
import OAuth2SuccessPage from "../pages/auth/OAuth2SuccessPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<UserLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/promotions" element={<PromotionPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/stores" element={<StorePage />} />
          <Route path="/categories" element={<div className="container py-5">Trang danh mục</div>} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth2/success" element={<OAuth2SuccessPage />} />
        <Route path="/payment/vnpay/result" element={<PaymentResultPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<UserLayout />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/account/addresses" element={<AccountAddressesPage />} />
            <Route path="/account/profile" element={<AccountProfilePage />} />
            <Route path="/account/orders" element={<AccountOrdersPage />} />
            <Route path="/orders/:orderId/tracking" element={<OrderTrackingPage />} />
            <Route path="/account/reviews" element={<AccountReviewsPage />} />
            <Route path="/account/wishlist" element={<AccountWishlistPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="news" element={<AdminNewsPage />} />
            <Route path="accounts" element={<AdminAccountsPage />} />
            <Route path="affiliate-config" element={<AdminAffiliateConfigPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
