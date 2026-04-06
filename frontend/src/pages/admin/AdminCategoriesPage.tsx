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
  const [isGroupFilterOpen, setIsGroupFilterOpen] = useState(false);
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);
  const [groupFilterKeyword, setGroupFilterKeyword] = useState("");
  const [categoryFilters, setCategoryFilters] = useState({
    keyword: "",
    groupId: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const [categoryData, groupData] = await Promise.all([getAdminCategories(), getAdminCategoryGroups()]);
        setCategories(categoryData);
        setGroups(groupData);
      } catch (err) {
        setError(getApiErrorMessage(err, "Khong the tai du lieu danh muc."));
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  const groupMap = useMemo(() => new Map(groups.map((group) => [group.id, group.name])), [groups]);
  const filteredGroups = useMemo(() => {
    const keyword = groupFilterKeyword.trim().toLowerCase();
    return groups.filter((group) => {
      if (!keyword) {
        return true;
      }
      return group.name.toLowerCase().includes(keyword) || (group.slug || "").toLowerCase().includes(keyword);
    });
  }, [groups, groupFilterKeyword]);

  const filteredCategories = useMemo(() => {
    const keyword = categoryFilters.keyword.trim().toLowerCase();
    return categories.filter((category) => {
      const matchKeyword =
        !keyword ||
        category.name.toLowerCase().includes(keyword) ||
        (category.slug || "").toLowerCase().includes(keyword);
      const matchGroup = !categoryFilters.groupId || String(category.groupId) === categoryFilters.groupId;
      return matchKeyword && matchGroup;
    });
  }, [categories, categoryFilters]);

  const totalGroupPages = getTotalPages(filteredGroups.length, ADMIN_GROUPS_PER_PAGE);
  const safeGroupPage = clampPage(groupPage, totalGroupPages);
  const paginatedGroups = paginateItems(filteredGroups, safeGroupPage, ADMIN_GROUPS_PER_PAGE);
  const totalCategoryPages = getTotalPages(filteredCategories.length, ADMIN_CATEGORIES_PER_PAGE);
  const safeCategoryPage = clampPage(categoryPage, totalCategoryPages);
  const paginatedCategories = paginateItems(filteredCategories, safeCategoryPage, ADMIN_CATEGORIES_PER_PAGE);

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
      setError("Vui long nhap ten danh muc va chon nhom.");
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
        setCategories((current) => current.map((category) => (category.id === editingCategoryId ? updated : category)));
      } else {
        const created = await createAdminCategory(payload);
        setCategories((current) => [created, ...current]);
      }
      setIsCategoryFormModalOpen(false);
      resetCategoryForm();
    } catch (err) {
      setError(getApiErrorMessage(err, "Khong the luu danh muc."));
    } finally {
      setSubmittingCategory(false);
    }
  };

  const handleGroupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!groupForm.name.trim()) {
      setError("Vui long nhap ten nhom danh muc.");
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
        setGroups((current) => current.map((group) => (group.id === editingGroupId ? updated : group)));
      } else {
        const created = await createAdminCategoryGroup(payload);
        setGroups((current) => [created, ...current]);
      }
      setIsGroupFormModalOpen(false);
      resetGroupForm();
    } catch (err) {
      setError(getApiErrorMessage(err, "Khong the luu nhom danh muc."));
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
      setError(getApiErrorMessage(err, "Khong the xoa danh muc."));
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
      setError(getApiErrorMessage(err, "Khong the xoa nhom danh muc."));
    } finally {
      setPendingDeleteKey(null);
    }
  };

  const renderGroupForm = () => (
    <form className="admin-form" onSubmit={handleGroupSubmit}>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <label className="form-label">Ten nhom</label>
        <input className="form-control" value={groupForm.name} onChange={(event) => setGroupForm((current) => ({ ...current, name: event.target.value }))} />
      </div>

      <div className="mb-3">
        <label className="form-label">Slug</label>
        <input className="form-control" value={groupForm.slug} onChange={(event) => setGroupForm((current) => ({ ...current, slug: event.target.value }))} />
      </div>

      <div className="mb-4">
        <label className="form-label">Anh banner</label>
        <input className="form-control" value={groupForm.bannerImage} onChange={(event) => setGroupForm((current) => ({ ...current, bannerImage: event.target.value }))} />
      </div>

      <div className="d-flex gap-2 flex-wrap">
        <button type="submit" className="btn btn-domora" disabled={submittingGroup}>
          {submittingGroup ? "Dang luu..." : editingGroupId ? "Cap nhat nhom" : "Tao nhom"}
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
            Huy sua
          </button>
        )}
      </div>
    </form>
  );

  const renderCategoryForm = () => (
    <form className="admin-form" onSubmit={handleCategorySubmit}>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <label className="form-label">Ten danh muc</label>
        <input className="form-control" value={categoryForm.name} onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))} />
      </div>

      <div className="mb-3">
        <label className="form-label">Slug</label>
        <input className="form-control" value={categoryForm.slug} onChange={(event) => setCategoryForm((current) => ({ ...current, slug: event.target.value }))} />
      </div>

      <div className="mb-4">
        <label className="form-label">Nhom danh muc</label>
        <select className="form-select" value={categoryForm.groupId} onChange={(event) => setCategoryForm((current) => ({ ...current, groupId: event.target.value }))}>
          <option value="">Chon nhom danh muc</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      <div className="d-flex gap-2 flex-wrap">
        <button type="submit" className="btn btn-domora" disabled={submittingCategory}>
          {submittingCategory ? "Dang luu..." : editingCategoryId ? "Cap nhat danh muc" : "Tao danh muc"}
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
            Huy sua
          </button>
        )}
      </div>
    </form>
  );

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Danh muc</p>
          <h1 className="admin-page-title">Quan ly danh muc</h1>
          <p className="admin-page-desc">Quan ly nhom danh muc va danh muc con cho he thong.</p>
        </div>
      </div>

      {loading ? (
        <div className="admin-empty-state">Dang tai du lieu danh muc...</div>
      ) : (
        <>
          <div className="admin-panel mb-4">
            <div className="admin-panel-head">
              <h2>Nhom danh muc</h2>
              <div className="admin-panel-actions">
                <button type="button" className="btn btn-domora-outline" onClick={() => setIsGroupFilterOpen((current) => !current)}>
                  Loc
                </button>
                <button type="button" className="btn btn-domora" onClick={handleCreateGroupClick}>
                  Them nhom
                </button>
              </div>
            </div>

            {isGroupFilterOpen && (
              <div className="admin-filter-panel">
                <input
                  className="form-control"
                  value={groupFilterKeyword}
                  onChange={(event) => {
                    setGroupFilterKeyword(event.target.value);
                    setGroupPage(1);
                  }}
                  placeholder="Tim theo ten nhom, slug"
                />
              </div>
            )}

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ten nhom</th>
                    <th>Slug</th>
                    <th>Banner</th>
                    <th>Thao tac</th>
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
                          <button type="button" className="btn btn-sm btn-domora-outline" onClick={() => handleEditGroup(group)}>
                            Sua
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            disabled={pendingDeleteKey === `group-${group.id}`}
                            onClick={() => handleDeleteGroup(group.id)}
                          >
                            {pendingDeleteKey === `group-${group.id}` ? "Dang xoa..." : "Xoa"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredGroups.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center">
                        Khong co nhom danh muc phu hop.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={safeGroupPage} totalPages={totalGroupPages} onPageChange={setGroupPage} />
          </div>

          <div className="admin-panel">
            <div className="admin-panel-head">
              <h2>Danh muc con</h2>
              <div className="admin-panel-actions">
                <button type="button" className="btn btn-domora-outline" onClick={() => setIsCategoryFilterOpen((current) => !current)}>
                  Loc
                </button>
                <button type="button" className="btn btn-domora" onClick={handleCreateCategoryClick}>
                  Them danh muc
                </button>
              </div>
            </div>

            {isCategoryFilterOpen && (
              <div className="admin-filter-panel">
                <input
                  className="form-control"
                  name="keyword"
                  value={categoryFilters.keyword}
                  onChange={(event) => {
                    const value = event.target.value;
                    setCategoryFilters((current) => ({ ...current, keyword: value }));
                    setCategoryPage(1);
                  }}
                  placeholder="Tim theo ten danh muc, slug"
                />
                <select
                  className="form-select"
                  name="groupId"
                  value={categoryFilters.groupId}
                  onChange={(event) => {
                    const value = event.target.value;
                    setCategoryFilters((current) => ({ ...current, groupId: value }));
                    setCategoryPage(1);
                  }}
                >
                  <option value="">Tat ca nhom</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ten danh muc</th>
                    <th>Slug</th>
                    <th>Nhom</th>
                    <th>Thao tac</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCategories.map((category) => (
                    <tr key={category.id}>
                      <td>{category.name}</td>
                      <td>{category.slug || "-"}</td>
                      <td>{category.groupName || (category.groupId ? groupMap.get(category.groupId) : "-")}</td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <button type="button" className="btn btn-sm btn-domora-outline" onClick={() => handleEditCategory(category)}>
                            Sua
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            disabled={pendingDeleteKey === `category-${category.id}`}
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            {pendingDeleteKey === `category-${category.id}` ? "Dang xoa..." : "Xoa"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCategories.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center">
                        Khong co danh muc phu hop.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={safeCategoryPage} totalPages={totalCategoryPages} onPageChange={setCategoryPage} />
          </div>
        </>
      )}

      <AdminFormModal
        title={editingGroupId ? "Cap nhat nhom danh muc" : "Them nhom danh muc"}
        open={isGroupFormModalOpen}
        onClose={() => {
          setIsGroupFormModalOpen(false);
          resetGroupForm();
        }}
      >
        {renderGroupForm()}
      </AdminFormModal>

      <AdminFormModal
        title={editingCategoryId ? "Cap nhat danh muc" : "Them danh muc"}
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
