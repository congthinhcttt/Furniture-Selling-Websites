import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    keyword: "",
    topic: "",
  });

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError("");
        setNewsItems(await getAdminNews());
      } catch (err) {
        setError(getApiErrorMessage(err, "Khong the tai danh sach tin tuc."));
      } finally {
        setLoading(false);
      }
    };

    void fetchNews();
  }, []);

  const filteredNewsItems = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return newsItems.filter((item) => {
      const matchKeyword =
        !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        item.content.toLowerCase().includes(keyword);
      const matchTopic = !filters.topic || item.topic === filters.topic;
      return matchKeyword && matchTopic;
    });
  }, [newsItems, filters]);

  const topicOptions = useMemo(
    () => Array.from(new Set(newsItems.map((item) => item.topic))).filter(Boolean),
    [newsItems]
  );

  const totalPages = getTotalPages(filteredNewsItems.length, ADMIN_NEWS_PER_PAGE);
  const safePage = clampPage(currentPage, totalPages);
  const paginatedNewsItems = paginateItems(filteredNewsItems, safePage, ADMIN_NEWS_PER_PAGE);

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

  const handleFilterChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
    setCurrentPage(1);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.topic.trim() || !form.title.trim() || !form.content.trim()) {
      setError("Vui long nhap day du chu de, tieu de va noi dung tin tuc.");
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
        setNewsItems((current) => current.map((item) => (item.id === editingNewsId ? updated : item)));
      } else {
        const created = await createAdminNews(payload);
        setNewsItems((current) => [created, ...current]);
      }
      closeFormModal();
    } catch (err) {
      setError(getApiErrorMessage(err, "Khong the luu tin tuc."));
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
      setError(getApiErrorMessage(err, "Khong the xoa tin tuc."));
    } finally {
      setPendingDeleteId(null);
    }
  };

  const renderForm = () => (
    <form className="admin-form" onSubmit={handleSubmit}>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <label className="form-label">Chu de</label>
        <input className="form-control" value={form.topic} onChange={(event) => setForm((current) => ({ ...current, topic: event.target.value }))} />
      </div>

      <div className="mb-3">
        <label className="form-label">Tieu de</label>
        <input className="form-control" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
      </div>

      <div className="mb-3">
        <label className="form-label">Hinh anh</label>
        <input className="form-control" value={form.image} onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))} />
      </div>

      <div className="mb-4">
        <label className="form-label">Noi dung</label>
        <textarea className="form-control" rows={8} value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} />
      </div>

      <div className="d-flex gap-2 flex-wrap">
        <button type="submit" className="btn btn-domora" disabled={submitting}>
          {submitting ? "Dang luu..." : editingNewsId ? "Cap nhat tin tuc" : "Tao tin tuc"}
        </button>
        {editingNewsId && (
          <button type="button" className="btn btn-domora-outline" onClick={closeFormModal}>
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
          <p className="admin-page-kicker">Tin tuc</p>
          <h1 className="admin-page-title">Quan ly tin tuc</h1>
          <p className="admin-page-desc">Tao, sua va xoa bai viet tin tuc.</p>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>Danh sach tin tuc</h2>
          <div className="admin-panel-actions">
            <button type="button" className="btn btn-domora-outline" onClick={() => setIsFilterOpen((current) => !current)}>
              Loc
            </button>
            <button type="button" className="btn btn-domora" onClick={handleCreateClick}>
              Them tin tuc
            </button>
          </div>
        </div>

        {isFilterOpen && (
          <div className="admin-filter-panel">
            <input
              className="form-control"
              name="keyword"
              value={filters.keyword}
              onChange={handleFilterChange}
              placeholder="Tim theo tieu de, noi dung"
            />
            <select className="form-select" name="topic" value={filters.topic} onChange={handleFilterChange}>
              <option value="">Tat ca chu de</option>
              {topicOptions.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <div className="admin-empty-state">Dang tai tin tuc...</div>
        ) : filteredNewsItems.length === 0 ? (
          <div className="admin-empty-state">Khong co bai viet phu hop.</div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tin tuc</th>
                    <th>Chu de</th>
                    <th>Thao tac</th>
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
                          <button type="button" className="btn btn-sm btn-domora-outline" onClick={() => handleEdit(item)}>
                            Sua
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            disabled={pendingDeleteId === item.id}
                            onClick={() => handleDelete(item.id)}
                          >
                            {pendingDeleteId === item.id ? "Dang xoa..." : "Xoa"}
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

      <AdminFormModal title={editingNewsId ? "Cap nhat tin tuc" : "Them tin tuc"} open={isFormModalOpen} onClose={closeFormModal}>
        {renderForm()}
      </AdminFormModal>
    </section>
  );
}
