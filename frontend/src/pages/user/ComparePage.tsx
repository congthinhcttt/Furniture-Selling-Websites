import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../api/authApi";
import { addToCart } from "../../api/cartApi";
import { getCompareProducts } from "../../api/compareApi";
import type { CompareProduct } from "../../types/compare";
import { buildImageUrl } from "../../utils/image";
import {
  clearCompareProducts,
  getCompareProductIds,
  removeProductFromCompare,
} from "../../utils/compareStorage";
import { useAuth } from "../../hooks/useAuth";

function formatPrice(price?: number) {
  if (!price) {
    return "Đang cập nhật";
  }

  return `${price.toLocaleString("vi-VN")} đ`;
}

function getDisplayValue(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return "Đang cập nhật";
  }

  return String(value);
}

function getImageUrl(image?: string) {
  return buildImageUrl(image, "https://via.placeholder.com/320x240?text=%E1%BA%A2nh+ch%C6%B0a+c%C3%B3");
}

export default function ComparePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuth();
  const [productIds, setProductIds] = useState<number[]>(() => getCompareProductIds());
  const [products, setProducts] = useState<CompareProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingProductId, setPendingProductId] = useState<number | null>(null);

  useEffect(() => {
    const syncCompare = () => {
      setProductIds(getCompareProductIds());
    };

    window.addEventListener("compare-updated", syncCompare);
    return () => window.removeEventListener("compare-updated", syncCompare);
  }, []);

  useEffect(() => {
    const fetchCompareData = async () => {
      if (productIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setProducts(await getCompareProducts(productIds));
      } catch (err) {
        setProducts([]);
        setError(getApiErrorMessage(err, "Không thể tải dữ liệu so sánh."));
      } finally {
        setLoading(false);
      }
    };

    void fetchCompareData();
  }, [productIds]);

  const comparisonRows = useMemo(
    () => [
      {
        label: "Hình ảnh",
        render: (product: CompareProduct) => (
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className="compare-table-image"
          />
        ),
      },
      {
        label: "Tên sản phẩm",
        render: (product: CompareProduct) => (
          <Link to={`/products/${product.id}`} className="compare-product-name">
            {product.name}
          </Link>
        ),
      },
      { label: "Giá", render: (product: CompareProduct) => formatPrice(product.price) },
      { label: "Chất liệu", render: (product: CompareProduct) => getDisplayValue(product.material) },
      { label: "Kích thước", render: (product: CompareProduct) => getDisplayValue(product.dimensions) },
      { label: "Màu sắc", render: (product: CompareProduct) => getDisplayValue(product.color) },
      { label: "Bảo hành", render: (product: CompareProduct) => getDisplayValue(product.warranty) },
      { label: "Danh mục", render: (product: CompareProduct) => getDisplayValue(product.categoryName) },
      {
        label: "Mô tả ngắn",
        render: (product: CompareProduct) => getDisplayValue(product.shortDescription),
      },
      {
        label: "Tồn kho",
        render: (product: CompareProduct) => getDisplayValue(product.stockQuantity),
      },
    ],
    []
  );

  const handleRemove = (productId: number) => {
    setProductIds(removeProductFromCompare(productId));
  };

  const handleClearAll = () => {
    clearCompareProducts();
    setProductIds([]);
  };

  const handleAddToCart = async (productId: number) => {
    if (!auth?.token) {
      navigate("/login", { state: { from: `${location.pathname}${location.search}` } });
      return;
    }

    try {
      setPendingProductId(productId);
      setError("");
      await addToCart(productId, 1);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        navigate("/login", { state: { from: `${location.pathname}${location.search}` } });
        return;
      }

      setError(getApiErrorMessage(err, "Không thể thêm sản phẩm vào giỏ hàng."));
    } finally {
      setPendingProductId(null);
    }
  };

  return (
    <section className="compare-page">
      <div className="container py-5">
        <div className="compare-page-header">
          <div>
            <p className="compare-page-subtitle">Công cụ hỗ trợ chọn mua</p>
            <h1 className="compare-page-title">So sánh sản phẩm</h1>
            <p className="compare-page-desc">
              Đặt các sản phẩm cạnh nhau để xem nhanh điểm khác biệt trước khi quyết định.
            </p>
          </div>
          <div className="compare-page-actions">
            <Link to="/products" className="btn btn-domora-outline">
              Thêm sản phẩm
            </Link>
            {productIds.length > 0 && (
              <button type="button" className="btn btn-outline-danger" onClick={handleClearAll}>
                Xóa tất cả
              </button>
            )}
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="compare-empty-state">
            <h3>Đang tải dữ liệu so sánh...</h3>
          </div>
        ) : products.length === 0 ? (
          <div className="compare-empty-state">
            <div className="compare-empty-icon">
              <i className="bi bi-sliders2"></i>
            </div>
            <h3>Danh sách so sánh đang trống</h3>
            <p>Hãy thêm tối đa 4 sản phẩm để xem bảng so sánh chi tiết.</p>
            <Link to="/products" className="btn btn-domora">
              Chọn sản phẩm để so sánh
            </Link>
          </div>
        ) : (
          <>
            <div className="compare-toolbar">
              <span>Đang so sánh {products.length} sản phẩm</span>
            </div>

            <div className="compare-table-wrap">
              <table className="compare-table">
                <tbody>
                  <tr>
                    <th>Thao tác</th>
                    {products.map((product) => (
                      <td key={product.id}>
                        <div className="compare-actions-cell">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRemove(product.id)}
                          >
                            Xóa khỏi so sánh
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-domora"
                            onClick={() => handleAddToCart(product.id)}
                            disabled={pendingProductId === product.id}
                          >
                            {pendingProductId === product.id ? "Đang xử lý..." : "Thêm vào giỏ hàng"}
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {comparisonRows.map((row) => (
                    <tr key={row.label}>
                      <th>{row.label}</th>
                      {products.map((product) => (
                        <td key={`${row.label}-${product.id}`}>{row.render(product)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
