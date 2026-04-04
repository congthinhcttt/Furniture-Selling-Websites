import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getCategoryGroups } from "../../api/categoryApi";
import Pagination from "../../components/common/Pagination";
import { getProducts } from "../../api/productApi";
import type { CategoryGroup } from "../../types/categoryGroup";
import type { Product } from "../../types/product";
import { API_BASE_URL } from "../../config/runtime";
import { getColorSwatch } from "../../utils/color";
import { buildImageUrl } from "../../utils/image";
import { clampPage, getTotalPages, paginateItems } from "../../utils/pagination";

type SortType = "" | "priceAsc" | "priceDesc" | "newest";
type PriceFilter = "under5" | "5to10" | "10to20" | "over20";
const PRODUCTS_PER_PAGE = 12;

const priceLabels: Record<PriceFilter, string> = {
  under5: "Dưới 5 triệu",
  "5to10": "5 - 10 triệu",
  "10to20": "10 - 20 triệu",
  over20: "Trên 20 triệu",
};

const fallbackBannerBySlug: Record<string, string> = {
  "phong-khach":
    "linear-gradient(135deg, rgba(67, 48, 38, 0.84), rgba(140, 104, 78, 0.7))",
  "phong-ngu":
    "linear-gradient(135deg, rgba(58, 67, 87, 0.84), rgba(131, 145, 173, 0.7))",
  "phong-an":
    "linear-gradient(135deg, rgba(85, 66, 42, 0.84), rgba(173, 136, 94, 0.7))",
  "phong-lam-viec":
    "linear-gradient(135deg, rgba(35, 59, 70, 0.84), rgba(87, 127, 145, 0.7))",
  "tu-bep":
    "linear-gradient(135deg, rgba(84, 59, 46, 0.84), rgba(172, 127, 98, 0.7))",
};

function getDimensionLabel(product: Product) {
  return `${product.width} x ${product.length} cm`;
}

function formatPrice(price: number) {
  return `${price.toLocaleString("vi-VN")} đ`;
}

function formatFilterLabel(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function ProductPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedGroupId = searchParams.get("groupId") || "";
  const selectedKeyword = searchParams.get("q")?.trim() || "";
  const selectedCategoryIds = searchParams.getAll("categoryIds");
  const selectedSort = (searchParams.get("sort") || "") as SortType;
  const selectedPrices = searchParams.getAll("prices") as PriceFilter[];
  const selectedColors = searchParams.getAll("colors");
  const selectedSizes = searchParams.getAll("sizes");
  const selectedPage = Number(searchParams.get("page") || "1");
  const categoryIdsKey = selectedCategoryIds.join(",");

  const selectedGroup = categoryGroups.find(
    (group) => String(group.id) === selectedGroupId
  );

  const hasActiveFilter =
    !!selectedKeyword ||
    selectedPrices.length > 0 ||
    selectedColors.length > 0 ||
    selectedSizes.length > 0 ||
    !!selectedSort;

  const productHeroStyle = selectedGroup?.bannerImage
    ? {
        background: `linear-gradient(to right, rgba(61, 40, 24, 0.72), rgba(61, 40, 24, 0.35)), url(${API_BASE_URL}/images/${selectedGroup.bannerImage}) center center / cover no-repeat`,
      }
    : selectedGroup?.slug && fallbackBannerBySlug[selectedGroup.slug]
      ? { background: fallbackBannerBySlug[selectedGroup.slug] }
      : undefined;

  useEffect(() => {
    const fetchCategoryGroups = async () => {
      try {
        const data = await getCategoryGroups();
        setCategoryGroups(data);
      } catch (err) {
        console.error(err);
        setCategoryGroups([]);
      }
    };

    fetchCategoryGroups();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          selectedCategoryIds.length > 0
            ? await getProducts({ categoryIds: selectedCategoryIds.map(Number) })
            : selectedGroupId
              ? await getProducts({ groupId: Number(selectedGroupId) })
              : await getProducts();

        setProducts(data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedGroupId, categoryIdsKey]);

  const colorOptions = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map((product) => product.color?.trim())
          .filter((value): value is string => Boolean(value))
      )
    );
  }, [products]);

  const sizeOptions = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map((product) => getDimensionLabel(product).trim())
          .filter((value): value is string => Boolean(value))
      )
    );
  }, [products]);

  const displayProducts = useMemo(() => {
    let result = [...products];

    if (selectedKeyword) {
      const normalizedKeyword = selectedKeyword.toLowerCase();
      result = result.filter((product) => {
        const haystacks = [
          product.name,
          product.categoryName,
          product.color,
          getDimensionLabel(product),
        ];
        return haystacks.some((value) =>
          value ? value.toLowerCase().includes(normalizedKeyword) : false
        );
      });
    }

    if (selectedPrices.length > 0) {
      result = result.filter((product) =>
        selectedPrices.some((priceKey) => {
          if (priceKey === "under5") {
            return product.price < 5000000;
          }
          if (priceKey === "5to10") {
            return product.price >= 5000000 && product.price <= 10000000;
          }
          if (priceKey === "10to20") {
            return product.price > 10000000 && product.price <= 20000000;
          }
          if (priceKey === "over20") {
            return product.price > 20000000;
          }
          return true;
        })
      );
    }

    if (selectedColors.length > 0) {
      result = result.filter((product) =>
        product.color ? selectedColors.includes(product.color) : false
      );
    }

    if (selectedSizes.length > 0) {
      result = result.filter((product) => selectedSizes.includes(getDimensionLabel(product)));
    }

    if (selectedSort === "priceAsc") {
      result.sort((a, b) => a.price - b.price);
    } else if (selectedSort === "priceDesc") {
      result.sort((a, b) => b.price - a.price);
    } else if (selectedSort === "newest") {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [products, selectedKeyword, selectedPrices, selectedColors, selectedSizes, selectedSort]);

  const totalPages = getTotalPages(displayProducts.length, PRODUCTS_PER_PAGE);
  const currentPage = clampPage(
    Number.isFinite(selectedPage) && selectedPage > 0 ? selectedPage : 1,
    totalPages
  );
  const paginatedProducts = useMemo(
    () => paginateItems(displayProducts, currentPage, PRODUCTS_PER_PAGE),
    [currentPage, displayProducts]
  );

  useEffect(() => {
    if (selectedPage !== currentPage) {
      const next = new URLSearchParams(searchParams);

      if (currentPage === 1) {
        next.delete("page");
      } else {
        next.set("page", String(currentPage));
      }

      setSearchParams(next, { replace: true });
    }
  }, [currentPage, searchParams, selectedPage, setSearchParams]);

  const updatePage = (page: number) => {
    const next = new URLSearchParams(searchParams);

    if (page <= 1) {
      next.delete("page");
    } else {
      next.set("page", String(page));
    }

    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateMultiValue = (key: string, value: string, checked: boolean) => {
    const next = new URLSearchParams(searchParams);
    const currentValues = next.getAll(key);

    next.delete(key);

    const updatedValues = checked
      ? [...currentValues, value]
      : currentValues.filter((item) => item !== value);

    updatedValues.forEach((item) => next.append(key, item));
    next.delete("page");
    setSearchParams(next);
  };

  const updateSort = (value: string) => {
    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set("sort", value);
    } else {
      next.delete("sort");
    }

    next.delete("page");
    setSearchParams(next);
  };

  const updateGroup = (groupId: string) => {
    const next = new URLSearchParams(searchParams);

    next.delete("categoryIds");

    if (groupId) {
      next.set("groupId", groupId);
    } else {
      next.delete("groupId");
    }

    next.delete("page");
    setSearchParams(next);
    setOpenDropdown(null);
  };

  const clearFilters = () => {
    const next = new URLSearchParams();

    if (selectedGroupId) {
      next.set("groupId", selectedGroupId);
    }

    if (selectedKeyword) {
      next.set("q", selectedKeyword);
    }

    setSearchParams(next);
  };

  return (
    <>
      <section className="product-hero">
        <div className="product-hero-background" style={productHeroStyle}></div>
        <div className="product-hero-overlay"></div>
        <div className="container product-hero-content">
          <p className="product-hero-subtitle">
            {selectedGroup ? "Danh mục nội thất" : "Bộ sưu tập cao cấp"}
          </p>
          <h1 className="product-hero-title">
            {selectedGroup ? selectedGroup.name : "Tất Cả Sản Phẩm"}
          </h1>
          <p className="product-hero-desc">
            {selectedGroup
              ? `Khám phá các danh mục nhỏ thuộc ${selectedGroup.name.toLowerCase()}, kèm bộ lọc giá, màu sắc và kích thước.`
              : "Trải nghiệm nội thất cao cấp cho không gian sống hiện đại và tinh tế."}
          </p>
        </div>
      </section>

      <section className="product-page-section">
        <div className="container">
          <div className="product-page-header">
            <div>
              <h2 className="collection-title">
                {selectedGroup ? selectedGroup.name : "Tất Cả Sản Phẩm"}
              </h2>
              {selectedGroup && (
                <p className="collection-subtitle">
                  Chọn danh mục nhỏ bên dưới để lọc nhanh sản phẩm theo không gian.
                </p>
              )}
            </div>

            <div className="sort-box">
              {selectedKeyword && (
                <p className="collection-subtitle mb-3">Kết quả tìm kiếm cho: "{selectedKeyword}"</p>
              )}
              <select
                className="form-select domora-select"
                value={selectedSort}
                onChange={(e) => updateSort(e.target.value)}
              >
                <option value="">Sắp xếp</option>
                <option value="priceAsc">Giá tăng dần</option>
                <option value="priceDesc">Giá giảm dần</option>
                <option value="newest">Mới nhất</option>
              </select>
            </div>
          </div>

          <div className="filter-bar">
            <div className="filter-label-wrap">
              <span className="filter-icon">
                <i className="bi bi-funnel"></i>
              </span>
              <span className="filter-label">Bộ lọc</span>
            </div>

            <div className="filter-form">
              <div className={`filter-dropdown ${openDropdown === "category" ? "open" : ""}`}>
                <button
                  type="button"
                  className="filter-toggle"
                  onClick={() =>
                    setOpenDropdown(openDropdown === "category" ? null : "category")
                  }
                >
                  Danh mục
                </button>

                <div className="filter-dropdown-menu">
                  {categoryGroups.length > 0 ? (
                    <>
                      <button
                        type="button"
                        className={`filter-option-btn ${!selectedGroupId ? "active" : ""}`}
                        onClick={() => updateGroup("")}
                      >
                        Tất cả sản phẩm
                      </button>

                      {categoryGroups.map((group) => (
                        <button
                          type="button"
                          className={`filter-option-btn ${selectedGroupId === String(group.id) ? "active" : ""}`}
                          key={group.id}
                          onClick={() => updateGroup(String(group.id))}
                        >
                          {group.name}
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="filter-check-item">Không có danh mục lớn</div>
                  )}
                </div>
              </div>

              <div className={`filter-dropdown ${openDropdown === "price" ? "open" : ""}`}>
                <button
                  type="button"
                  className="filter-toggle"
                  onClick={() => setOpenDropdown(openDropdown === "price" ? null : "price")}
                >
                  Giá sản phẩm
                </button>

                <div className="filter-dropdown-menu">
                  {Object.entries(priceLabels).map(([value, label]) => (
                    <label className="filter-check-item" key={value}>
                      <input
                        type="checkbox"
                        checked={selectedPrices.includes(value as PriceFilter)}
                        onChange={(e) => updateMultiValue("prices", value, e.target.checked)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={`filter-dropdown ${openDropdown === "color" ? "open" : ""}`}>
                <button
                  type="button"
                  className="filter-toggle"
                  onClick={() => setOpenDropdown(openDropdown === "color" ? null : "color")}
                >
                  Màu sắc
                </button>

                <div className="filter-dropdown-menu">
                  {colorOptions.length > 0 ? (
                    colorOptions.map((value) => (
                      <label className="filter-check-item" key={value}>
                        <input
                          type="checkbox"
                          checked={selectedColors.includes(value)}
                          onChange={(e) => updateMultiValue("colors", value, e.target.checked)}
                        />
                        <span>{formatFilterLabel(value)}</span>
                      </label>
                    ))
                  ) : (
                    <div className="filter-check-item">Chưa có dữ liệu màu sắc</div>
                  )}
                </div>
              </div>

              <div className={`filter-dropdown ${openDropdown === "size" ? "open" : ""}`}>
                <button
                  type="button"
                  className="filter-toggle"
                  onClick={() => setOpenDropdown(openDropdown === "size" ? null : "size")}
                >
                  Kích thước
                </button>

                <div className="filter-dropdown-menu">
                  {sizeOptions.length > 0 ? (
                    sizeOptions.map((value) => (
                      <label className="filter-check-item" key={value}>
                        <input
                          type="checkbox"
                          checked={selectedSizes.includes(value)}
                          onChange={(e) => updateMultiValue("sizes", value, e.target.checked)}
                        />
                        <span>{formatFilterLabel(value)}</span>
                      </label>
                    ))
                  ) : (
                    <div className="filter-check-item">Chưa có dữ liệu kích thước</div>
                  )}
                </div>
              </div>

              {hasActiveFilter && (
                <div className="filter-actions">
                  <button type="button" className="btn btn-domora-outline" onClick={clearFilters}>
                    Xóa lọc
                  </button>
                </div>
              )}
            </div>
          </div>

          {(selectedPrices.length > 0 ||
            selectedColors.length > 0 ||
            selectedSizes.length > 0) && (
            <div className="active-filters">
              {selectedPrices.map((price) => (
                <span className="active-filter-chip" key={`price-${price}`}>
                  GIÁ: {priceLabels[price]}
                </span>
              ))}

              {selectedKeyword && (
                <span className="active-filter-chip" key={`keyword-${selectedKeyword}`}>
                  TÌM: {selectedKeyword}
                </span>
              )}

              {selectedColors.map((color) => (
                <span className="active-filter-chip" key={`color-${color}`}>
                  MÀU: {formatFilterLabel(color)}
                </span>
              ))}

              {selectedSizes.map((size) => (
                <span className="active-filter-chip" key={`size-${size}`}>
                  KÍCH THƯỚC: {formatFilterLabel(size)}
                </span>
              ))}
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">Đang tải sản phẩm...</div>
          ) : error ? (
            <div className="empty-product-box text-center">
              <h4>Có lỗi xảy ra</h4>
              <p>{error}</p>
            </div>
          ) : displayProducts.length > 0 ? (
            <>
              <div className="product-results-meta">
                Hiển thị {paginatedProducts.length} / {displayProducts.length} sản phẩm
              </div>
            <div className="row g-4">
              {paginatedProducts.map((product) => (
                <div className="col-6 col-md-4 col-lg-3" key={product.id}>
                  <div className="product-card">
                    <div className="product-card-image-wrap">
                      <Link to={`/products/${product.id}`}>
                        <img
                          src={
                            buildImageUrl(
                              product.image,
                              "https://via.placeholder.com/400x320?text=%E1%BA%A2nh+ch%C6%B0a+c%C3%B3"
                            )
                          }
                          alt={product.name}
                          className="product-card-image"
                        />
                      </Link>
                    </div>

                    <div className="product-card-body">
                      <p className="product-category">{product.categoryName || "Nội thất"}</p>

                      <h3 className="product-name">
                        <Link to={`/products/${product.id}`}>{product.name}</Link>
                      </h3>

                      {product.color && (
                        <div className="product-card-color">
                          <span
                            className="product-card-color-dot"
                            style={getColorSwatch(product.color)}
                          ></span>
                          <span>{product.color}</span>
                        </div>
                      )}

                      <p className="product-card-size">{getDimensionLabel(product)}</p>

                      <p className="product-card-stock">
                        {product.stockQuantity > 0
                          ? `Còn ${product.stockQuantity} sản phẩm`
                          : "Tạm hết hàng"}
                      </p>

                      <div className="product-price-box">
                        <span className="product-price">{formatPrice(product.price)}</span>
                      </div>

                      <div className="product-card-actions">
                        <Link
                          to={`/products/${product.id}`}
                          className="btn btn-domora-outline btn-sm w-100"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={updatePage}
              />
            </>
          ) : (
            <div className="empty-product-box text-center">
              <h4>Chưa có sản phẩm phù hợp</h4>
              <p>Hãy thử thay đổi bộ lọc để xem thêm sản phẩm.</p>
              <button type="button" className="btn btn-domora" onClick={clearFilters}>
                Xem tất cả sản phẩm
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
