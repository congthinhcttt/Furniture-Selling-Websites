import { type FormEvent, useEffect, useState } from "react";
import { getApiErrorMessage } from "../../api/authApi";
import AdminFormModal from "../../components/common/AdminFormModal";
import Pagination from "../../components/common/Pagination";
import {
  createAdminNews,
  deleteAdminNews,
  getAdminNews,
  type AdminNewsPayload,
  updateAdminNews,
} from "../../api/adminNewsApi";
import type { NewsArticle } from "../../types/news";
import { clampPage, getTotalPages, paginateItems } from "../../utils/pagination";

interface NewsFormState {
  topic: string;
  title: string;
  image: string;
  content: string;
}

const emptyForm: NewsFormState = {
  topic: "",
  title: "",
  image: "",
  content: "",
};

const ADMIN_NEWS_PER_PAGE = 8;

export default function AdminNewsPage() {
  const [newsItems, setNewsItems] = useState<NewsArticle[]>([]);
  const [form, setForm] = useState<NewsFormState>(emptyForm);
  const [editingNewsId, setEditingNewsId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError("");
        setNewsItems(await getAdminNews());
      } catch (err) {
        setError(getApiErrorMessage(err, "Không thể tải danh sách tin tức."));
      } finally {
        setLoading(false);
      }
    };

    void fetchNews();
  }, []);

  const totalPages = getTotalPages(newsItems.length, ADMIN_NEWS_PER_PAGE);
  const safePage = clampPage(currentPage, totalPages);
  const paginatedNewsItems = paginateItems(newsItems, safePage, ADMIN_NEWS_PER_PAGE);

  useEffect(() => {
    if (currentPage !== safePage) {
      setCurrentPage(safePage);
    }
  }, [currentPage, safePage]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingNewsId(null);
    setError("");
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    resetForm();
  };

  const handleCreateClick = () => {
    resetForm();
    setIsFormModalOpen(true);
  };

  const handleEdit = (item: NewsArticle) => {
    setForm({
      topic: item.topic,
      title: item.title,
      image: item.image || "",
      content: item.content,
    });
    setEditingNewsId(item.id);
    setIsFormModalOpen(true);
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.topic.trim() || !form.title.trim() || !form.content.trim()) {
      setError("Vui lòng nhập đầy đủ chủ đề, tiêu đề và nội dung tin tức.");
      return;
    }

    const payload: AdminNewsPayload = {
      topic: form.topic.trim(),
      title: form.title.trim(),
      image: form.image.trim(),
      content: form.content.trim(),
    };

    try {
      setSubmitting(true);
      setError("");

      if (editingNewsId) {
        const updated = await updateAdminNews(editingNewsId, payload);
        setNewsItems((current) =>
          current.map((item) => (item.id === editingNewsId ? updated : item))
        );
        resetForm();
      } else {
        const created = await createAdminNews(payload);
        setNewsItems((current) => [created, ...current]);
      }
      closeFormModal();
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể lưu tin tức."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (newsId: number) => {
    try {
      setPendingDeleteId(newsId);
      setError("");
      await deleteAdminNews(newsId);
      setNewsItems((current) => current.filter((item) => item.id !== newsId));
      if (editingNewsId === newsId) {
        resetForm();
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể xóa tin tức."));
    } finally {
      setPendingDeleteId(null);
    }
  };

  const renderForm = () => (
    <form className="admin-form" onSubmit={handleSubmit}>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <label className="form-label">Chủ đề</label>
        <input
          className="form-control"
          value={form.topic}
          onChange={(event) => setForm((current) => ({ ...current, topic: event.target.value }))}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Tiêu đề</label>
        <input
          className="form-control"
          value={form.title}
          onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Hình ảnh</label>
        <input
          className="form-control"
          value={form.image}
          onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
        />
      </div>

      <div className="mb-4">
        <label className="form-label">Nội dung</label>
        <textarea
          className="form-control"
          rows={8}
          value={form.content}
          onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
        />
      </div>

      <div className="d-flex gap-2 flex-wrap">
        <button type="submit" className="btn btn-domora" disabled={submitting}>
          {submitting ? "Đang lưu..." : editingNewsId ? "Cập nhật tin tức" : "Tạo tin tức"}
        </button>
        {editingNewsId && (
          <button type="button" className="btn btn-domora-outline" onClick={closeFormModal}>
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
          <p className="admin-page-kicker">Tin tức</p>
          <h1 className="admin-page-title">Quản lý tin tức</h1>
          <p className="admin-page-desc">
            Tạo, sửa và xóa bài viết tin tức để đồng bộ với giao diện người dùng.
          </p>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>Danh sách tin tức</h2>
          <div className="admin-panel-actions">
            <button type="button" className="btn btn-domora" onClick={handleCreateClick}>
              Thêm tin tức
            </button>
          </div>
        </div>

        {loading ? (
          <div className="admin-empty-state">Đang tải tin tức...</div>
        ) : newsItems.length === 0 ? (
          <div className="admin-empty-state">Chưa có bài viết nào.</div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tin tức</th>
                    <th>Chủ đề</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedNewsItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.title}</strong>
                        <div className="admin-table-subtext">{item.content.slice(0, 120)}...</div>
                      </td>
                      <td>{item.topic}</td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            type="button"
                            className="btn btn-sm btn-domora-outline"
                            onClick={() => handleEdit(item)}
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            disabled={pendingDeleteId === item.id}
                            onClick={() => handleDelete(item.id)}
                          >
                            {pendingDeleteId === item.id ? "Đang xóa..." : "Xóa"}
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
        title={editingNewsId ? "Cập nhật tin tức" : "Thêm tin tức"}
        open={isFormModalOpen}
        onClose={closeFormModal}
      >
        {renderForm()}
      </AdminFormModal>
    </section>
  );
}
