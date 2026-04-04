import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../../api/authApi";
import {
  clearMyCart,
  getMyCart,
  removeCartItem,
  updateCartItemQuantity,
} from "../../api/cartApi";
import type { CartResponse } from "../../types/cart";
import { buildImageUrl } from "../../utils/image";

function formatPrice(price: number) {
  return `${price.toLocaleString("vi-VN")} đ`;
}

function getImageUrl(image?: string) {
  return buildImageUrl(image, "https://via.placeholder.com/320x240?text=%E1%BA%A2nh+ch%C6%B0a+c%C3%B3");
}

export default function CartPage() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingProductId, setPendingProductId] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        setError("");
        setCart(await getMyCart());
      } catch (err) {
        setError(getApiErrorMessage(err, "Không thể tải giỏ hàng."));
      } finally {
        setLoading(false);
      }
    };

    void fetchCart();
  }, []);

  const handleQuantityChange = async (productId: number, nextQuantity: number) => {
    try {
      setPendingProductId(productId);
      setError("");
      const nextCart = await updateCartItemQuantity(productId, nextQuantity);
      setCart(nextCart);
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể cập nhật giỏ hàng."));
    } finally {
      setPendingProductId(null);
    }
  };

  const handleRemoveItem = async (productId: number) => {
    try {
      setPendingProductId(productId);
      setError("");
      await removeCartItem(productId);

      setCart((current) => {
        if (!current) {
          return current;
        }

        const items = current.items.filter((item) => item.productId !== productId);
        const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

        return { ...current, items, totalAmount };
      });
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể xóa sản phẩm khỏi giỏ hàng."));
    } finally {
      setPendingProductId(null);
    }
  };

  const handleClearCart = async () => {
    try {
      setClearing(true);
      setError("");
      await clearMyCart();
      setCart((current) =>
        current
          ? {
              ...current,
              items: [],
              totalAmount: 0,
            }
          : current
      );
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể xóa toàn bộ giỏ hàng."));
    } finally {
      setClearing(false);
    }
  };

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <section className="cart-page">
      <div className="container py-5">
        <div className="cart-page-header">
          <div>
            <p className="cart-page-subtitle">Đơn hàng của bạn</p>
            <h1 className="cart-page-title">Giỏ hàng</h1>
            <p className="cart-page-desc">
              Kiểm tra lại sản phẩm, điều chỉnh số lượng và chuyển sang bước thanh toán.
            </p>
          </div>
          <Link to="/products" className="btn btn-domora-outline">
            Tiếp tục mua sắm
          </Link>
        </div>

        {loading ? (
          <div className="cart-empty-state">
            <h3>Đang tải giỏ hàng...</h3>
          </div>
        ) : error ? (
          <div className="cart-empty-state">
            <h3>Không tải được giỏ hàng</h3>
            <p>{error}</p>
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="cart-empty-state">
            <h3>Giỏ hàng hiện đang trống</h3>
            <p>Hãy thêm một vài món nội thất yêu thích để tiếp tục.</p>
            <Link to="/products" className="btn btn-domora">
              Xem sản phẩm
            </Link>
          </div>
        ) : (
          <div className="row g-4 align-items-start">
            <div className="col-lg-8">
              <div className="cart-list-card">
                <div className="cart-list-head">
                  <span>{itemCount} sản phẩm trong giỏ</span>
                  <button
                    type="button"
                    className="btn btn-link cart-clear-btn"
                    onClick={handleClearCart}
                    disabled={clearing}
                  >
                    {clearing ? "Đang xóa..." : "Xóa tất cả"}
                  </button>
                </div>

                <div className="cart-list">
                  {cart.items.map((item) => {
                    const isPending = pendingProductId === item.productId;

                    return (
                      <article className="cart-item-card" key={item.productId}>
                        <Link
                          to={`/products/${item.productId}`}
                          className="cart-item-image-wrap"
                        >
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.productName}
                            className="cart-item-image"
                          />
                        </Link>

                        <div className="cart-item-content">
                          <div className="cart-item-main">
                            <div>
                              <p className="cart-item-label">Sản phẩm</p>
                              <Link
                                to={`/products/${item.productId}`}
                                className="cart-item-name"
                              >
                                {item.productName}
                              </Link>
                            </div>
                            <button
                              type="button"
                              className="cart-remove-btn"
                              onClick={() => handleRemoveItem(item.productId)}
                              disabled={isPending}
                            >
                              Xóa
                            </button>
                          </div>

                          <div className="cart-item-meta">
                            <div>
                              <span className="cart-item-meta-label">Đơn giá</span>
                              <strong>{formatPrice(item.price)}</strong>
                            </div>
                            <div>
                              <span className="cart-item-meta-label">Tạm tính</span>
                              <strong>{formatPrice(item.subtotal)}</strong>
                            </div>
                          </div>

                          <div className="cart-quantity-row">
                            <span className="cart-item-meta-label">Số lượng</span>
                            <div className="cart-quantity-control">
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(item.productId, item.quantity - 1)
                                }
                                disabled={isPending}
                              >
                                -
                              </button>
                              <span>{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(item.productId, item.quantity + 1)
                                }
                                disabled={isPending}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <aside className="cart-summary-card">
                <p className="cart-summary-label">Tổng kết</p>
                <h2 className="cart-summary-title">Thông tin thanh toán</h2>

                <div className="cart-summary-row">
                  <span>Tạm tính</span>
                  <strong>{formatPrice(cart.totalAmount)}</strong>
                </div>
                <div className="cart-summary-row">
                  <span>Vận chuyển</span>
                  <strong>Liên hệ</strong>
                </div>
                <div className="cart-summary-row total">
                  <span>Tổng cộng</span>
                  <strong>{formatPrice(cart.totalAmount)}</strong>
                </div>

                <Link to="/checkout" className="btn btn-domora w-100">
                  Tiếp tục thanh toán
                </Link>
                <Link to="/products" className="btn btn-domora-outline w-100">
                  Thêm sản phẩm khác
                </Link>
              </aside>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
