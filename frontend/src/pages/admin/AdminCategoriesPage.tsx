import { type FormEvent, useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../../api/authApi";
import AdminFormModal from "../../components/common/AdminFormModal";
import Pagination from "../../components/common/Pagination";
import {
  createAdminCategory,
  createAdminCategoryGroup,
  deleteAdminCategory,
  deleteAdminCategoryGroup,
  getAdminCategories,
  getAdminCategoryGroups,
  updateAdminCategory,
  updateAdminCategoryGroup,
} from "../../api/adminCategoryApi";
import type { Category } from "../../types/category";
import type { CategoryGroup } from "../../types/categoryGroup";
import { clampPage, getTotalPages, paginateItems } from "../../utils/pagination";

interface CategoryFormState {
  name: string;
  slug: string;
  groupId: string;
}

interface GroupFormState {
  name: string;
  slug: string;
  bannerImage: string;
}

const emptyCategoryForm: CategoryFormState = {
  name: "",
  slug: "",
  groupId: "",
};

const emptyGroupForm: GroupFormState = {
  name: "",
  slug: "",
  bannerImage: "",
};

const ADMIN_GROUPS_PER_PAGE = 6;
const ADMIN_CATEGORIES_PER_PAGE = 8;

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm);
  const [groupForm, setGroupForm] = useState<GroupFormState>(emptyGroupForm);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingCategory, setSubmittingCategory] = useState(false);
  const [submittingGroup, setSubmittingGroup] = useState(false);
  const [pendingDeleteKey, setPendingDeleteKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [groupPage, setGroupPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);
  const [isGroupFormModalOpen, setIsGroupFormModalOpen] = useState(false);
  const [isCategoryFormModalOpen, setIsCategoryFormModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const [categoryData, groupData] = await Promise.all([
          getAdminCategories(),
          getAdminCategoryGroups(),
        ]);
        setCategories(categoryData);
        setGroups(groupData);
      } catch (err) {
        setError(getApiErrorMessage(err, "Không thể tải dữ liệu danh mục."));
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  const groupMap = useMemo(() => new Map(groups.map((group) => [group.id, group.name])), [groups]);
  const totalGroupPages = getTotalPages(groups.length, ADMIN_GROUPS_PER_PAGE);
  const safeGroupPage = clampPage(groupPage, totalGroupPages);
  const paginatedGroups = paginateItems(groups, safeGroupPage, ADMIN_GROUPS_PER_PAGE);
  const totalCategoryPages = getTotalPages(categories.length, ADMIN_CATEGORIES_PER_PAGE);
  const safeCategoryPage = clampPage(categoryPage, totalCategoryPages);
  const paginatedCategories = paginateItems(categories, safeCategoryPage, ADMIN_CATEGORIES_PER_PAGE);

  useEffect(() => {
    if (groupPage !== safeGroupPage) {
      setGroupPage(safeGroupPage);
    }
  }, [groupPage, safeGroupPage]);

  useEffect(() => {
    if (categoryPage !== safeCategoryPage) {
      setCategoryPage(safeCategoryPage);
    }
  }, [categoryPage, safeCategoryPage]);

  const resetCategoryForm = () => {
    setCategoryForm(emptyCategoryForm);
    setEditingCategoryId(null);
    setError("");
  };

  const resetGroupForm = () => {
    setGroupForm(emptyGroupForm);
    setEditingGroupId(null);
    setError("");
  };

  const handleCreateGroupClick = () => {
    resetGroupForm();
    setIsGroupFormModalOpen(true);
  };

  const handleCreateCategoryClick = () => {
    resetCategoryForm();
    setIsCategoryFormModalOpen(true);
  };

  const handleEditGroup = (group: CategoryGroup) => {
    setGroupForm({
      name: group.name,
      slug: group.slug || "",
      bannerImage: group.bannerImage || "",
    });
    setEditingGroupId(group.id);
    setIsGroupFormModalOpen(true);
    setError("");
  };

  const handleEditCategory = (category: Category) => {
    setCategoryForm({
      name: category.name,
      slug: category.slug || "",
      groupId: category.groupId ? String(category.groupId) : "",
    });
    setEditingCategoryId(category.id);
    setIsCategoryFormModalOpen(true);
    setError("");
  };

  const handleCategorySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!categoryForm.name.trim() || !categoryForm.groupId) {
      setError("Vui lòng nhập tên danh mục và chọn nhóm.");
      return;
    }

    try {
      setSubmittingCategory(true);
      setError("");

      const payload = {
        name: categoryForm.name.trim(),
        slug: categoryForm.slug.trim(),
        groupId: Number(categoryForm.groupId),
      };

      if (editingCategoryId) {
        const updated = await updateAdminCategory(editingCategoryId, payload);
        setCategories((current) =>
          current.map((category) => (category.id === editingCategoryId ? updated : category))
        );
        resetCategoryForm();
      } else {
        const created = await createAdminCategory(payload);
        setCategories((current) => [created, ...current]);
      }
      setIsCategoryFormModalOpen(false);
      resetCategoryForm();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể lưu danh mục."));
    } finally {
      setSubmittingCategory(false);
    }
  };

  const handleGroupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!groupForm.name.trim()) {
      setError("Vui lòng nhập tên nhóm danh mục.");
      return;
    }

    try {
      setSubmittingGroup(true);
      setError("");

      const payload = {
        name: groupForm.name.trim(),
        slug: groupForm.slug.trim(),
        bannerImage: groupForm.bannerImage.trim(),
      };

      if (editingGroupId) {
        const updated = await updateAdminCategoryGroup(editingGroupId, payload);
        setGroups((current) =>
          current.map((group) => (group.id === editingGroupId ? updated : group))
        );
        resetGroupForm();
      } else {
        const created = await createAdminCategoryGroup(payload);
        setGroups((current) => [created, ...current]);
      }
      setIsGroupFormModalOpen(false);
      resetGroupForm();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể lưu nhóm danh mục."));
    } finally {
      setSubmittingGroup(false);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      setPendingDeleteKey(`category-${categoryId}`);
      setError("");
      await deleteAdminCategory(categoryId);
      setCategories((current) => current.filter((category) => category.id !== categoryId));
      if (editingCategoryId === categoryId) {
        resetCategoryForm();
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể xóa danh mục."));
    } finally {
      setPendingDeleteKey(null);
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    try {
      setPendingDeleteKey(`group-${groupId}`);
      setError("");
      await deleteAdminCategoryGroup(groupId);
      setGroups((current) => current.filter((group) => group.id !== groupId));
      if (editingGroupId === groupId) {
        resetGroupForm();
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể xóa nhóm danh mục."));
    } finally {
      setPendingDeleteKey(null);
    }
  };

  const renderGroupForm = () => (
    <form className="admin-form" onSubmit={handleGroupSubmit}>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <label className="form-label">Tên nhóm</label>
        <input
          className="form-control"
          value={groupForm.name}
          onChange={(event) => setGroupForm((current) => ({ ...current, name: event.target.value }))}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Slug</label>
        <input
          className="form-control"
          value={groupForm.slug}
          onChange={(event) => setGroupForm((current) => ({ ...current, slug: event.target.value }))}
        />
      </div>

      <div className="mb-4">
        <label className="form-label">Ảnh banner</label>
        <input
          className="form-control"
          value={groupForm.bannerImage}
          onChange={(event) =>
            setGroupForm((current) => ({ ...current, bannerImage: event.target.value }))
          }
        />
      </div>

      <div className="d-flex gap-2 flex-wrap">
        <button type="submit" className="btn btn-domora" disabled={submittingGroup}>
          {submittingGroup ? "Đang lưu..." : editingGroupId ? "Cập nhật nhóm" : "Tạo nhóm"}
        </button>
        {editingGroupId && (
          <button
            type="button"
            className="btn btn-domora-outline"
            onClick={() => {
              setIsGroupFormModalOpen(false);
              resetGroupForm();
            }}
          >
            Hủy sửa
          </button>
        )}
      </div>
    </form>
  );

  const renderCategoryForm = () => (
    <form className="admin-form" onSubmit={handleCategorySubmit}>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <label className="form-label">Tên danh mục</label>
        <input
          className="form-control"
          value={categoryForm.name}
          onChange={(event) =>
            setCategoryForm((current) => ({ ...current, name: event.target.value }))
          }
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Slug</label>
        <input
          className="form-control"
          value={categoryForm.slug}
          onChange={(event) =>
            setCategoryForm((current) => ({ ...current, slug: event.target.value }))
          }
        />
      </div>

      <div className="mb-4">
        <label className="form-label">Nhóm danh mục</label>
        <select
          className="form-select"
          value={categoryForm.groupId}
          onChange={(event) =>
            setCategoryForm((current) => ({ ...current, groupId: event.target.value }))
          }
        >
          <option value="">Chọn nhóm danh mục</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      <div className="d-flex gap-2 flex-wrap">
        <button type="submit" className="btn btn-domora" disabled={submittingCategory}>
          {submittingCategory
            ? "Đang lưu..."
            : editingCategoryId
              ? "Cập nhật danh mục"
              : "Tạo danh mục"}
        </button>
        {editingCategoryId && (
          <button
            type="button"
            className="btn btn-domora-outline"
            onClick={() => {
              setIsCategoryFormModalOpen(false);
              resetCategoryForm();
            }}
          >
            Hủy sửa
          </button>
        )}
      </div>
    </form>
  );

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Danh mục</p>
          <h1 className="admin-page-title">Quản lý danh mục</h1>
          <p className="admin-page-desc">
            Quản lý nhóm danh mục và danh mục sản phẩm để hệ thống admin và storefront đồng bộ.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="admin-empty-state">Đang tải dữ liệu danh mục...</div>
      ) : (
        <>
          <div className="admin-panel mb-4">
            <div className="admin-panel-head">
              <h2>Nhóm danh mục</h2>
              <div className="admin-panel-actions">
                <button type="button" className="btn btn-domora" onClick={handleCreateGroupClick}>
                  Thêm nhóm
                </button>
              </div>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tên nhóm</th>
                    <th>Slug</th>
                    <th>Banner</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedGroups.map((group) => (
                    <tr key={group.id}>
                      <td>{group.name}</td>
                      <td>{group.slug || "-"}</td>
                      <td>{group.bannerImage || "-"}</td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            type="button"
                            className="btn btn-sm btn-domora-outline"
                            onClick={() => handleEditGroup(group)}
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            disabled={pendingDeleteKey === `group-${group.id}`}
                            onClick={() => handleDeleteGroup(group.id)}
                          >
                            {pendingDeleteKey === `group-${group.id}` ? "Đang xóa..." : "Xóa"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {groups.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center">
                        Chưa có nhóm danh mục.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={safeGroupPage}
              totalPages={totalGroupPages}
              onPageChange={setGroupPage}
            />
          </div>

          <div className="admin-panel">
            <div className="admin-panel-head">
              <h2>Danh mục con</h2>
              <div className="admin-panel-actions">
                <button
                  type="button"
                  className="btn btn-domora"
                  onClick={handleCreateCategoryClick}
                >
                  Thêm danh mục
                </button>
              </div>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tên danh mục</th>
                    <th>Slug</th>
                    <th>Nhóm</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCategories.map((category) => (
                    <tr key={category.id}>
                      <td>{category.name}</td>
                      <td>{category.slug || "-"}</td>
                      <td>
                        {category.groupName ||
                          (category.groupId ? groupMap.get(category.groupId) : "-")}
                      </td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            type="button"
                            className="btn btn-sm btn-domora-outline"
                            onClick={() => handleEditCategory(category)}
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            disabled={pendingDeleteKey === `category-${category.id}`}
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            {pendingDeleteKey === `category-${category.id}` ? "Đang xóa..." : "Xóa"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center">
                        Chưa có danh mục nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={safeCategoryPage}
              totalPages={totalCategoryPages}
              onPageChange={setCategoryPage}
            />
          </div>
        </>
      )}

      <AdminFormModal
        title={editingGroupId ? "Cập nhật nhóm danh mục" : "Thêm nhóm danh mục"}
        open={isGroupFormModalOpen}
        onClose={() => {
          setIsGroupFormModalOpen(false);
          resetGroupForm();
        }}
      >
        {renderGroupForm()}
      </AdminFormModal>

      <AdminFormModal
        title={editingCategoryId ? "Cập nhật danh mục" : "Thêm danh mục"}
        open={isCategoryFormModalOpen}
        onClose={() => {
          setIsCategoryFormModalOpen(false);
          resetCategoryForm();
        }}
      >
        {renderCategoryForm()}
      </AdminFormModal>
    </section>
  );
}
