import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../api/authApi";
import {
  approveAdminReview,
  deleteAdminReview,
  getAdminReviewById,
  getAdminReviews,
  hideAdminReview,
  rejectAdminReview,
  unhideAdminReview,
} from "../../api/adminReviewApi";
import AdminFormModal from "../../components/common/AdminFormModal";
import Pagination from "../../components/common/Pagination";
import type { AdminReview, AdminReviewQueryParams } from "../../types/review";

const defaultFilters: AdminReviewQueryParams = {
  keyword: "",
  status: "",
  page: 1,
  size: 10,
};

export default function AdminReviewsPage() {
  const [filters, setFilters] = useState<AdminReviewQueryParams>(defaultFilters);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReview, setSelectedReview] = useState<AdminReview | null>(null);
  const [note, setNote] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadReviews = async (nextFilters: AdminReviewQueryParams) => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminReviews(nextFilters);
      setReviews(response.items);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.totalItems);
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể tải danh sách đánh giá quản trị."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReviews(filters);
  }, [filters]);

  const openDetail = async (reviewId: number) => {
    try {
      const detail = await getAdminReviewById(reviewId);
      setSelectedReview(detail);
      setNote(detail.adminNote || "");
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể tải chi tiết đánh giá."));
    }
  };

  const handleModeration = async (reviewId: number, action: "approve" | "reject" | "hide" | "unhide" | "delete") => {
    try {
      setActionLoading(reviewId);
      let updated: AdminReview | null = null;

      if (action === "approve") updated = await approveAdminReview(reviewId, { adminNote: note });
      if (action === "reject") updated = await rejectAdminReview(reviewId, { adminNote: note });
      if (action === "hide") updated = await hideAdminReview(reviewId, { adminNote: note });
      if (action === "unhide") updated = await unhideAdminReview(reviewId, { adminNote: note });
      if (action === "delete") {
        await deleteAdminReview(reviewId);
      }

      if (updated) {
        setReviews((current) => current.map((review) => (review.id === reviewId ? updated! : review)));
        setSelectedReview(updated);
      } else {
        setReviews((current) => current.filter((review) => review.id !== reviewId));
        setSelectedReview(null);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Không thể cập nhật trạng thái đánh giá."));
    } finally {
      setActionLoading(null);
    }
  };

  const handleFilterChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFilters((current) => ({
      ...current,
      page: 1,
      [name]:
        name === "rating" || name === "productId" || name === "userId"
          ? (value ? Number(value) : undefined)
          : value,
    }));
  };

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-page-kicker">Đánh giá</p>
          <h1 className="admin-page-title">Quản lý review sản phẩm</h1>
          <p className="admin-page-desc">
            Kiểm duyệt đánh giá, ẩn nội dung không phù hợp và theo dõi chất lượng phản hồi khách hàng.
          </p>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>Danh sách review</h2>
          <div className="admin-panel-actions admin-review-filters">
            <input
              className="form-control"
              name="keyword"
              value={filters.keyword || ""}
              placeholder="Tìm theo sản phẩm, user, tiêu đề"
              onChange={handleFilterChange}
            />
            <select className="form-select" name="status" value={filters.status || ""} onChange={handleFilterChange}>
              <option value="">Tất cả trạng thái</option>
              {["PENDING", "APPROVED", "REJECTED", "HIDDEN"].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select
              className="form-select"
              name="rating"
              value={filters.rating || ""}
              onChange={handleFilterChange}
            >
              <option value="">Tất cả số sao</option>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} sao
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="admin-empty-state">Đang tải review...</div>
        ) : error ? (
          <div className="admin-empty-state">{error}</div>
        ) : reviews.length === 0 ? (
          <div className="admin-empty-state">Chưa có review nào phù hợp.</div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Người dùng</th>
                    <th>Sao</th>
                    <th>Trạng thái</th>
                    <th>Hữu ích</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id}>
                      <td>
                        <strong>{review.productName}</strong>
                        <div className="admin-table-subtext">{review.title}</div>
                      </td>
                      <td>{review.username}</td>
                      <td>{review.overallRating}/5</td>
                      <td>{review.status}</td>
                      <td>{review.helpfulCount}</td>
                      <td>{new Date(review.createdAt).toLocaleDateString("vi-VN")}</td>
                      <td>
                        <button className="btn btn-domora-outline btn-sm" type="button" onClick={() => openDetail(review.id)}>
                          Xem
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={filters.page || 1}
              totalPages={totalPages}
              onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
            />
            <div className="admin-table-subtext mt-3">Tổng cộng {totalItems} review.</div>
          </>
        )}
      </div>

      <AdminFormModal
        title={selectedReview ? `Review #${selectedReview.id}` : "Chi tiết review"}
        open={Boolean(selectedReview)}
        onClose={() => setSelectedReview(null)}
      >
        {selectedReview && (
          <div className="admin-review-detail">
            <div className="admin-review-detail__meta">
              <div>
                <strong>{selectedReview.productName}</strong>
                <p>User: {selectedReview.username}</p>
              </div>
              <span className="review-chip">{selectedReview.status}</span>
            </div>

            <div className="admin-review-detail__scores">
              <span>Tổng thể: {selectedReview.overallRating}/5</span>
              <span>Chất lượng: {selectedReview.qualityRating}/5</span>
              <span>Thiết kế: {selectedReview.designRating}/5</span>
              <span>Tiện nghi: {selectedReview.comfortRating}/5</span>
              <span>Đáng tiền: {selectedReview.valueRating}/5</span>
            </div>

            <h3>{selectedReview.title}</h3>
            <p>{selectedReview.content}</p>

            {selectedReview.images.length > 0 && (
              <div className="customer-images__grid">
                {selectedReview.images.map((image, index) => (
                  <img key={index} src={image} alt={`Review admin ${index + 1}`} />
                ))}
              </div>
            )}

            <div className="mb-3 mt-3">
              <label className="form-label">Ghi chú quản trị</label>
              <textarea
                className="form-control"
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-domora"
                disabled={actionLoading === selectedReview.id}
                onClick={() => handleModeration(selectedReview.id, "approve")}
              >
                Duyệt
              </button>
              <button
                type="button"
                className="btn btn-domora-outline"
                disabled={actionLoading === selectedReview.id}
                onClick={() =>
                  handleModeration(
                    selectedReview.id,
                    (selectedReview.status === "HIDDEN" ? "unhide" : "hide") as "hide" | "unhide"
                  )
                }
              >
                {selectedReview.status === "HIDDEN" ? "Hiện lại" : "Ẩn"}
              </button>
              <button
                type="button"
                className="btn btn-outline-danger"
                disabled={actionLoading === selectedReview.id}
                onClick={() => handleModeration(selectedReview.id, "reject")}
              >
                Từ chối
              </button>
              <button
                type="button"
                className="btn btn-outline-dark"
                disabled={actionLoading === selectedReview.id}
                onClick={() => handleModeration(selectedReview.id, "delete")}
              >
                Xóa mềm
              </button>
            </div>
          </div>
        )}
      </AdminFormModal>
    </section>
  );
}
