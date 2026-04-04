import { type FormEvent, useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../../api/authApi";
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  restockAdminProduct,
  type AdminProductPayload,
  updateAdminProduct,
} from "../../api/adminProductApi";
import { getCategories } from "../../api/categoryApi";
import AdminFormModal from "../../components/common/AdminFormModal";
import Pagination from "../../components/common/Pagination";
import type { Category } from "../../types/category";
import type { Product } from "../../types/product";
import { clampPage, getTotalPages, paginateItems } from "../../utils/pagination";

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  image: string;
  color: string;
  width: string;
  length: string;
  stockQuantity: string;
  categoryId: string;
}

interface RestockFormState {
  productId: string;
  quantity: string;
}

const emptyProductForm: ProductFormState = {
  name: "",
  description: "",
  price: "",
  image: "",
  color: "",
  width: "",
  length: "",
  stockQuantity: "",
  categoryId: "",
};

const emptyRestockForm: RestockFormState = {
  productId: "",
  quantity: "",
};

const ADMIN_PRODUCTS_PER_PAGE = 8;

function formatPrice(price: number) {
  return `${price.toLocaleString("vi-VN")} đ`;
}

function formatDimensions(product: Product) {
  return `${product.width} x ${product.length} cm`;
}

function mapProductToForm(product: Product): ProductFormState {
  return {
    name: product.name,
    description: product.description || "",
    price: String(product.price),
    image: product.image || "",
    color: product.color || "",
    width: String(product.width),
    length: String(product.length),
    stockQuantity: String(product.stockQuantity),
    categoryId: product.categoryId ? String(product.categoryId) : "",
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductFormState>(emptyProductForm);
  const [restockForm, setRestockForm] = useState<RestockFormState>(emptyRestockForm);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [restockSubmitting, setRestockSubmitting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [restockError, setRestockError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const [productData, categoryData] = await Promise.all([
          getAdminProducts(),
          getCategories(),
        ]);
        setProducts(productData);
        setCategories(categoryData);
      } catch (err) {
        setError(getApiErrorMessage(err, "Không thể tải dữ liệu sản phẩm."));
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  );
  const totalPages = getTotalPages(products.length, ADMIN_PRODUCTS_PER_PAGE);
  const safePage = clampPage(currentPage, totalPages);
  const paginatedProducts = useMemo(
    () => paginateItems(products, safePage, ADMIN_PRODUCTS_PER_PAGE),
    [products, safePage]
  );

  useEffect(() => {
    if (currentPage !== safePage) {
      setCurrentPage(safePage);
    }
  }, [currentPage, safePage]);

  const resetProductForm = () => {
    setForm(emptyProductForm);
    setEditingProductId(null);
    setError("");
  };

  const closeProductModal = () => {
    setIsFormModalOpen(false);
    resetProductForm();
  };

  const closeRestockModal = () => {
    setIsRestockModalOpen(false);
    setRestockForm(emptyRestockForm);
    setRestockError("");
  };

  const handleProductInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleRestockInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setRestockForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateClick = () => {
    resetProductForm();
    setIsFormModalOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setForm(mapProductToForm(product));
    setEditingProductId(product.id);
    setError("");
    setIsFormModalOpen(true);
  };

  const handleOpenRestock = (product?: Product) => {
    setRestockForm({
      productId: product ? String(product.id) : "",
      quantity: "",
    });
    setRestockError("");
    setIsRestockModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.price.trim() ||
      !form.categoryId ||
      !form.width.trim() ||
      !form.length.trim() ||
      !form.stockQuantity.trim()
    ) {
      setError("Vui lòng nhập đầy đủ tên, giá, danh mục, kích thước và tồn kho.");
      return;
    }

    const payload: AdminProductPayload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      image: form.image.trim(),
      color: form.color.trim(),
      width: Number(form.width),
      length: Number(form.length),
      stockQuantity: Number(form.stockQuantity),
      categoryId: Number(form.categoryId),
    };

    if (
      !Number.isFinite(payload.price) ||
      !Number.isFinite(payload.width) ||
      !Number.isFinite(payload.length) ||
      !Number.isFinite(payload.stockQuantity) ||
      !Number.isFinite(payload.categoryId)
    ) {
      setError("Dữ liệu sản phẩm không hợp lệ.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      if (editingProductId) {
        const updatedProduct = await updateAdminProduct(editingProductId, payload);
        setProducts((current) =>
          current.map((product) => (product.id === editingProductId ? updatedProduct : product))
        );
      } else {
        const createdProduct = await createAdminProduct(payload);
        setProducts((current) => [createdProduct, ...current]);
      }

      closeProductModal();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể lưu sản phẩm."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestockSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const product = products.find((item) => String(item.id) === restockForm.productId);
    const quantity = Number(restockForm.quantity);

    if (!product) {
      setRestockError("Vui lòng chọn sản phẩm cần nhập hàng.");
      return;
    }

    if (!restockForm.quantity.trim() || !Number.isFinite(quantity) || quantity < 1) {
      setRestockError("Số lượng nhập phải lớn hơn hoặc bằng 1.");
      return;
    }

    try {
      setRestockSubmitting(true);
      setRestockError("");
      const updatedProduct = await restockAdminProduct(product.id, { quantity });
      setProducts((current) =>
        current.map((item) => (item.id === updatedProduct.id ? updatedProduct : item))
      );
      closeRestockModal();
    } catch (err) {
      setRestockError(getApiErrorMessage(err, "Không thể nhập thêm hàng."));
    } finally {
      setRestockSubmitting(false);
    }
  };

  const handleDelete = async (productId: number) => {
    try {
      setPendingDeleteId(productId);
      setError("");
      await deleteAdminProduct(productId);
      setProducts((current) => current.filter((product) => product.id !== productId));
      if (editingProductId === productId) {
        resetProductForm();
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể xóa sản phẩm."));
    } finally {
      setPendingDeleteId(null);
    }
  };

  const selectedRestockProduct =
    products.find((product) => String(product.id) === restockForm.productId) || null;

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Sản phẩm</p>
          <h1 className="admin-page-title">Quản lý sản phẩm</h1>
          <p className="admin-page-desc">
            Quản lý màu sắc, kích thước, tồn kho và thông tin bán hàng của sản phẩm.
          </p>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>Danh sách sản phẩm</h2>
          <div className="admin-panel-actions">
            <button type="button" className="btn btn-domora-outline" onClick={() => handleOpenRestock()}>
              Nhập hàng
            </button>
            <button type="button" className="btn btn-domora" onClick={handleCreateClick}>
              Thêm sản phẩm
            </button>
          </div>
        </div>

        {error && !isFormModalOpen && <div className="alert alert-danger mb-3">{error}</div>}

        {loading ? (
          <div className="admin-empty-state">Đang tải sản phẩm...</div>
        ) : products.length === 0 ? (
          <div className="admin-empty-state">Chưa có sản phẩm nào.</div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Danh mục</th>
                    <th>Giá</th>
                    <th>Màu sắc</th>
                    <th>Chiều rộng</th>
                    <th>Chiều dài</th>
                    <th>Tồn kho</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <strong>{product.name}</strong>
                        {product.description && (
                          <div className="admin-table-subtext">{product.description}</div>
                        )}
                      </td>
                      <td>
                        {product.categoryName ||
                          (product.categoryId ? categoryMap.get(product.categoryId) : "")}
                      </td>
                      <td>{formatPrice(product.price)}</td>
                      <td>{product.color || "-"}</td>
                      <td>{product.width} cm</td>
                      <td>{product.length} cm</td>
                      <td>
                        <div>{product.stockQuantity}</div>
                        <div className="admin-table-subtext">{formatDimensions(product)}</div>
                      </td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            type="button"
                            className="btn btn-sm btn-domora-outline"
                            onClick={() => handleOpenRestock(product)}
                          >
                            Nhập hàng
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-domora-outline"
                            onClick={() => handleEditClick(product)}
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            disabled={pendingDeleteId === product.id}
                            onClick={() => handleDelete(product.id)}
                          >
                            {pendingDeleteId === product.id ? "Đang xóa..." : "Xóa"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      <AdminFormModal
        title={editingProductId ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
        open={isFormModalOpen}
        onClose={closeProductModal}
      >
        <form className="admin-form" onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="mb-3">
            <label className="form-label">Tên sản phẩm</label>
            <input className="form-control" name="name" value={form.name} onChange={handleProductInputChange} />
          </div>

          <div className="mb-3">
            <label className="form-label">Danh mục</label>
            <select
              className="form-select"
              name="categoryId"
              value={form.categoryId}
              onChange={handleProductInputChange}
            >
              <option value="">Chọn danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Giá</label>
            <input
              className="form-control"
              name="price"
              type="number"
              min="1"
              value={form.price}
              onChange={handleProductInputChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Hình ảnh</label>
            <input
              className="form-control"
              name="image"
              value={form.image}
              onChange={handleProductInputChange}
              placeholder="Tên file ảnh"
            />
          </div>

          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Màu sắc</label>
              <input className="form-control" name="color" value={form.color} onChange={handleProductInputChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Chiều rộng</label>
              <input
                className="form-control"
                name="width"
                type="number"
                min="1"
                value={form.width}
                onChange={handleProductInputChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Chiều dài</label>
              <input
                className="form-control"
                name="length"
                type="number"
                min="1"
                value={form.length}
                onChange={handleProductInputChange}
              />
            </div>
          </div>

          <div className="mt-3 mb-3">
            <label className="form-label">Số lượng trong kho</label>
            <input
              className="form-control"
              name="stockQuantity"
              type="number"
              min="0"
              value={form.stockQuantity}
              onChange={handleProductInputChange}
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Mô tả</label>
            <textarea
              className="form-control"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleProductInputChange}
            />
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <button type="submit" className="btn btn-domora" disabled={submitting}>
              {submitting ? "Đang lưu..." : editingProductId ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}
            </button>
            <button type="button" className="btn btn-domora-outline" onClick={closeProductModal}>
              Đóng
            </button>
          </div>
        </form>
      </AdminFormModal>

      <AdminFormModal
        title={selectedRestockProduct ? `Nhập hàng: ${selectedRestockProduct.name}` : "Nhập hàng"}
        open={isRestockModalOpen}
        onClose={closeRestockModal}
      >
        <form className="admin-form" onSubmit={handleRestockSubmit}>
          {restockError && <div className="alert alert-danger">{restockError}</div>}

          <div className="mb-3">
            <label className="form-label">Sản phẩm</label>
            <select
              className="form-select"
              name="productId"
              value={restockForm.productId}
              onChange={handleRestockInputChange}
            >
              <option value="">Chọn sản phẩm</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-restock-summary">
            <strong>{selectedRestockProduct?.name || "Chưa chọn sản phẩm"}</strong>
            {selectedRestockProduct && (
              <p className="admin-table-subtext mb-0">
                Tồn kho hiện tại: {selectedRestockProduct.stockQuantity} | Kích thước:{" "}
                {formatDimensions(selectedRestockProduct)}
              </p>
            )}
          </div>

          <div className="mb-4 mt-3">
            <label className="form-label">Số lượng nhập thêm</label>
            <input
              className="form-control"
              name="quantity"
              type="number"
              min="1"
              value={restockForm.quantity}
              onChange={handleRestockInputChange}
            />
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <button type="submit" className="btn btn-domora" disabled={restockSubmitting}>
              {restockSubmitting ? "Đang nhập..." : "Xác nhận nhập hàng"}
            </button>
            <button type="button" className="btn btn-domora-outline" onClick={closeRestockModal}>
              Đóng
            </button>
          </div>
        </form>
      </AdminFormModal>
    </section>
  );
}
