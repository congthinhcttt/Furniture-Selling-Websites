import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../../api/authApi";
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  restockAdminProduct,
  restockAdminProductsBulk,
  type AdminProductPayload,
  type ProductBulkRestockItemPayload,
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

interface BulkRestockRow {
  rowId: string;
  productId: string;
  quantity: string;
}

interface ProductFilterState {
  keyword: string;
  categoryId: string;
  stockStatus: "ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
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

const emptyFilter: ProductFilterState = {
  keyword: "",
  categoryId: "",
  stockStatus: "ALL",
};

const ADMIN_PRODUCTS_PER_PAGE = 8;

function formatPrice(price: number) {
  return `${price.toLocaleString("vi-VN")} d`;
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

function createEmptyBulkRow(seed: string) {
  return { rowId: `row-${seed}`, productId: "", quantity: "" };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductFormState>(emptyProductForm);
  const [restockForm, setRestockForm] = useState<RestockFormState>(emptyRestockForm);
  const [bulkRows, setBulkRows] = useState<BulkRestockRow[]>([
    createEmptyBulkRow("1"),
    createEmptyBulkRow("2"),
  ]);
  const [filters, setFilters] = useState<ProductFilterState>(emptyFilter);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [restockSubmitting, setRestockSubmitting] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [restockError, setRestockError] = useState("");
  const [bulkError, setBulkError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isBulkRestockModalOpen, setIsBulkRestockModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const [productData, categoryData] = await Promise.all([getAdminProducts(), getCategories()]);
        setProducts(productData);
        setCategories(categoryData);
      } catch (err) {
        setError(getApiErrorMessage(err, "Khong the tai du lieu san pham."));
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

  const filteredProducts = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return products.filter((product) => {
      const matchKeyword =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        (product.description || "").toLowerCase().includes(keyword);
      const matchCategory = !filters.categoryId || String(product.categoryId) === filters.categoryId;
      const matchStock =
        filters.stockStatus === "ALL" ||
        (filters.stockStatus === "IN_STOCK" && product.stockQuantity > 5) ||
        (filters.stockStatus === "LOW_STOCK" && product.stockQuantity > 0 && product.stockQuantity <= 5) ||
        (filters.stockStatus === "OUT_OF_STOCK" && product.stockQuantity === 0);

      return matchKeyword && matchCategory && matchStock;
    });
  }, [products, filters]);

  const totalPages = getTotalPages(filteredProducts.length, ADMIN_PRODUCTS_PER_PAGE);
  const safePage = clampPage(currentPage, totalPages);
  const paginatedProducts = useMemo(
    () => paginateItems(filteredProducts, safePage, ADMIN_PRODUCTS_PER_PAGE),
    [filteredProducts, safePage]
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

  const closeBulkRestockModal = () => {
    setIsBulkRestockModalOpen(false);
    setBulkRows([createEmptyBulkRow("1"), createEmptyBulkRow("2")]);
    setBulkError("");
  };

  const handleProductInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleRestockInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setRestockForm((current) => ({ ...current, [name]: value }));
  };

  const handleFilterInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
    setCurrentPage(1);
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
    setRestockForm({ productId: product ? String(product.id) : "", quantity: "" });
    setRestockError("");
    setIsRestockModalOpen(true);
  };

  const handleOpenBulkRestock = () => {
    setBulkRows([createEmptyBulkRow(String(Date.now())), createEmptyBulkRow(String(Date.now() + 1))]);
    setBulkError("");
    setIsBulkRestockModalOpen(true);
  };

  const handleBulkRowChange = (rowId: string, field: "productId" | "quantity", value: string) => {
    setBulkRows((current) => current.map((row) => (row.rowId === rowId ? { ...row, [field]: value } : row)));
  };

  const handleAddBulkRow = () => {
    setBulkRows((current) => [...current, createEmptyBulkRow(`${Date.now()}-${current.length}`)]);
  };

  const handleRemoveBulkRow = (rowId: string) => {
    setBulkRows((current) => (current.length <= 1 ? current : current.filter((row) => row.rowId !== rowId)));
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
      setError("Vui long nhap day du thong tin bat buoc.");
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
      setError("Du lieu san pham khong hop le.");
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
      setError(getApiErrorMessage(err, "Khong the luu san pham."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestockSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const product = products.find((item) => String(item.id) === restockForm.productId);
    const quantity = Number(restockForm.quantity);

    if (!product) {
      setRestockError("Vui long chon san pham can nhap hang.");
      return;
    }

    if (!restockForm.quantity.trim() || !Number.isFinite(quantity) || quantity < 1) {
      setRestockError("So luong nhap phai lon hon hoac bang 1.");
      return;
    }

    try {
      setRestockSubmitting(true);
      setRestockError("");
      const updatedProduct = await restockAdminProduct(product.id, { quantity });
      setProducts((current) => current.map((item) => (item.id === updatedProduct.id ? updatedProduct : item)));
      closeRestockModal();
    } catch (err) {
      setRestockError(getApiErrorMessage(err, "Khong the nhap them hang."));
    } finally {
      setRestockSubmitting(false);
    }
  };

  const handleBulkRestockSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const items: ProductBulkRestockItemPayload[] = [];
    for (const row of bulkRows) {
      const productId = Number(row.productId);
      const quantity = Number(row.quantity);
      if (!row.productId || !row.quantity.trim() || !Number.isFinite(productId) || !Number.isFinite(quantity) || quantity < 1) {
        setBulkError("Moi dong can co san pham va so luong >= 1.");
        return;
      }
      items.push({ productId, quantity });
    }

    try {
      setBulkSubmitting(true);
      setBulkError("");
      const updatedProducts = await restockAdminProductsBulk({ items });
      const updatedMap = new Map(updatedProducts.map((item) => [item.id, item]));
      setProducts((current) => current.map((item) => updatedMap.get(item.id) || item));
      closeBulkRestockModal();
    } catch (err) {
      setBulkError(getApiErrorMessage(err, "Khong the nhap hang hang loat."));
    } finally {
      setBulkSubmitting(false);
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
      setError(getApiErrorMessage(err, "Khong the xoa san pham."));
    } finally {
      setPendingDeleteId(null);
    }
  };

  const selectedRestockProduct = products.find((product) => String(product.id) === restockForm.productId) || null;

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">San pham</p>
          <h1 className="admin-page-title">Quan ly san pham</h1>
          <p className="admin-page-desc">Quan ly ton kho, thong tin ban hang va nhap hang nhanh.</p>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>Danh sach san pham</h2>
          <div className="admin-panel-actions">
            <button type="button" className="btn btn-domora-outline" onClick={() => setIsFilterOpen((current) => !current)}>
              Loc
            </button>
            <button type="button" className="btn btn-domora-outline" onClick={() => handleOpenRestock()}>
              Nhap hang
            </button>
            <button type="button" className="btn btn-domora-outline" onClick={handleOpenBulkRestock}>
              Nhap hang hang loat
            </button>
            <button type="button" className="btn btn-domora" onClick={handleCreateClick}>
              Them san pham
            </button>
          </div>
        </div>

        {isFilterOpen && (
          <div className="admin-filter-panel">
            <input
              className="form-control"
              name="keyword"
              value={filters.keyword}
              onChange={handleFilterInputChange}
              placeholder="Tim theo ten, mo ta"
            />
            <select className="form-select" name="categoryId" value={filters.categoryId} onChange={handleFilterInputChange}>
              <option value="">Tat ca danh muc</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select className="form-select" name="stockStatus" value={filters.stockStatus} onChange={handleFilterInputChange}>
              <option value="ALL">Tat ca ton kho</option>
              <option value="IN_STOCK">Con hang (&gt;5)</option>
              <option value="LOW_STOCK">Sap het (1-5)</option>
              <option value="OUT_OF_STOCK">Het hang (0)</option>
            </select>
          </div>
        )}

        {error && !isFormModalOpen && <div className="alert alert-danger mb-3">{error}</div>}

        {loading ? (
          <div className="admin-empty-state">Dang tai san pham...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="admin-empty-state">Khong co san pham phu hop.</div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ten</th>
                    <th>Danh muc</th>
                    <th>Gia</th>
                    <th>Mau</th>
                    <th>Rong</th>
                    <th>Dai</th>
                    <th>Ton kho</th>
                    <th>Thao tac</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <strong>{product.name}</strong>
                        {product.description && <div className="admin-table-subtext">{product.description}</div>}
                      </td>
                      <td>{product.categoryName || (product.categoryId ? categoryMap.get(product.categoryId) : "")}</td>
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
                          <button type="button" className="btn btn-sm btn-domora-outline" onClick={() => handleOpenRestock(product)}>
                            Nhap hang
                          </button>
                          <button type="button" className="btn btn-sm btn-domora-outline" onClick={() => handleEditClick(product)}>
                            Sua
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            disabled={pendingDeleteId === product.id}
                            onClick={() => handleDelete(product.id)}
                          >
                            {pendingDeleteId === product.id ? "Dang xoa..." : "Xoa"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </div>

      <AdminFormModal title={editingProductId ? "Cap nhat san pham" : "Them san pham"} open={isFormModalOpen} onClose={closeProductModal}>
        <form className="admin-form" onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="mb-3">
            <label className="form-label">Ten san pham</label>
            <input className="form-control" name="name" value={form.name} onChange={handleProductInputChange} />
          </div>

          <div className="mb-3">
            <label className="form-label">Danh muc</label>
            <select className="form-select" name="categoryId" value={form.categoryId} onChange={handleProductInputChange}>
              <option value="">Chon danh muc</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Gia</label>
            <input className="form-control" name="price" type="number" min="1" value={form.price} onChange={handleProductInputChange} />
          </div>

          <div className="mb-3">
            <label className="form-label">Hinh anh</label>
            <input className="form-control" name="image" value={form.image} onChange={handleProductInputChange} />
          </div>

          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Mau sac</label>
              <input className="form-control" name="color" value={form.color} onChange={handleProductInputChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Chieu rong</label>
              <input className="form-control" name="width" type="number" min="1" value={form.width} onChange={handleProductInputChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Chieu dai</label>
              <input className="form-control" name="length" type="number" min="1" value={form.length} onChange={handleProductInputChange} />
            </div>
          </div>

          <div className="mt-3 mb-3">
            <label className="form-label">So luong trong kho</label>
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
            <label className="form-label">Mo ta</label>
            <textarea className="form-control" name="description" rows={4} value={form.description} onChange={handleProductInputChange} />
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <button type="submit" className="btn btn-domora" disabled={submitting}>
              {submitting ? "Dang luu..." : editingProductId ? "Cap nhat san pham" : "Tao san pham"}
            </button>
            <button type="button" className="btn btn-domora-outline" onClick={closeProductModal}>
              Dong
            </button>
          </div>
        </form>
      </AdminFormModal>

      <AdminFormModal title="Nhap hang hang loat" open={isBulkRestockModalOpen} onClose={closeBulkRestockModal}>
        <form className="admin-form" onSubmit={handleBulkRestockSubmit}>
          {bulkError && <div className="alert alert-danger">{bulkError}</div>}

          <div className="admin-bulk-restock-list">
            {bulkRows.map((row, index) => (
              <div key={row.rowId} className="admin-bulk-restock-row">
                <select
                  className="form-select"
                  value={row.productId}
                  onChange={(event) => handleBulkRowChange(row.rowId, "productId", event.target.value)}
                >
                  <option value="">Chon san pham</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <input
                  className="form-control"
                  type="number"
                  min="1"
                  value={row.quantity}
                  onChange={(event) => handleBulkRowChange(row.rowId, "quantity", event.target.value)}
                  placeholder="So luong"
                />
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleRemoveBulkRow(row.rowId)}
                  disabled={bulkRows.length === 1}
                >
                  Xoa dong {index + 1}
                </button>
              </div>
            ))}
          </div>

          <div className="d-flex gap-2 flex-wrap mt-3">
            <button type="button" className="btn btn-domora-outline" onClick={handleAddBulkRow}>
              Them dong
            </button>
            <button type="submit" className="btn btn-domora" disabled={bulkSubmitting}>
              {bulkSubmitting ? "Dang nhap..." : "Xac nhan nhap hang hang loat"}
            </button>
            <button type="button" className="btn btn-domora-outline" onClick={closeBulkRestockModal}>
              Dong
            </button>
          </div>
        </form>
      </AdminFormModal>

      <AdminFormModal
        title={selectedRestockProduct ? `Nhap hang: ${selectedRestockProduct.name}` : "Nhap hang"}
        open={isRestockModalOpen}
        onClose={closeRestockModal}
      >
        <form className="admin-form" onSubmit={handleRestockSubmit}>
          {restockError && <div className="alert alert-danger">{restockError}</div>}

          <div className="mb-3">
            <label className="form-label">San pham</label>
            <select className="form-select" name="productId" value={restockForm.productId} onChange={handleRestockInputChange}>
              <option value="">Chon san pham</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-restock-summary">
            <strong>{selectedRestockProduct?.name || "Chua chon san pham"}</strong>
            {selectedRestockProduct && (
              <p className="admin-table-subtext mb-0">
                Ton kho hien tai: {selectedRestockProduct.stockQuantity} | Kich thuoc: {formatDimensions(selectedRestockProduct)}
              </p>
            )}
          </div>

          <div className="mb-4 mt-3">
            <label className="form-label">So luong nhap them</label>
            <input className="form-control" name="quantity" type="number" min="1" value={restockForm.quantity} onChange={handleRestockInputChange} />
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <button type="submit" className="btn btn-domora" disabled={restockSubmitting}>
              {restockSubmitting ? "Dang nhap..." : "Xac nhan nhap hang"}
            </button>
            <button type="button" className="btn btn-domora-outline" onClick={closeRestockModal}>
              Dong
            </button>
          </div>
        </form>
      </AdminFormModal>
    </section>
  );
}
