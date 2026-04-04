import { useEffect, useMemo, useState } from "react";
import type { CreateReviewPayload, Review, ReviewableItem, UpdateReviewPayload } from "../../types/review";
import RatingStars from "./RatingStars";

interface ReviewFormProps {
  reviewableItems: ReviewableItem[];
  initialReview?: Review | null;
  submitting?: boolean;
  onSubmit: (payload: CreateReviewPayload | UpdateReviewPayload) => Promise<void> | void;
  onCancelEdit?: () => void;
}

interface ReviewFormState {
  orderId: string;
  orderItemId: string;
  overallRating: number;
  qualityRating: number;
  designRating: number;
  comfortRating: number;
  valueRating: number;
  title: string;
  content: string;
  images: string[];
  anonymous: boolean;
}

const emptyState: ReviewFormState = {
  orderId: "",
  orderItemId: "",
  overallRating: 5,
  qualityRating: 5,
  designRating: 5,
  comfortRating: 5,
  valueRating: 5,
  title: "",
  content: "",
  images: [],
  anonymous: false,
};

const criteria = [
  { key: "qualityRating", label: "Chất lượng", tip: "Độ bền, hoàn thiện, vật liệu." },
  { key: "designRating", label: "Thiết kế", tip: "Thẩm mỹ, độ phù hợp không gian." },
  { key: "comfortRating", label: "Tiện nghi", tip: "Trải nghiệm sử dụng thực tế." },
  { key: "valueRating", label: "Đáng tiền", tip: "Mức giá so với trải nghiệm nhận được." },
] as const;

function readFilesAsDataUrls(files: FileList) {
  return Promise.all(
    Array.from(files).map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    )
  );
}

export default function ReviewForm({
  reviewableItems,
  initialReview,
  submitting = false,
  onSubmit,
  onCancelEdit,
}: ReviewFormProps) {
  const [form, setForm] = useState<ReviewFormState>(emptyState);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialReview) {
      setForm({
        orderId: String(initialReview.orderId),
        orderItemId: String(initialReview.orderItemId),
        overallRating: initialReview.overallRating,
        qualityRating: initialReview.qualityRating,
        designRating: initialReview.designRating,
        comfortRating: initialReview.comfortRating,
        valueRating: initialReview.valueRating,
        title: initialReview.title,
        content: initialReview.content,
        images: initialReview.images,
        anonymous: initialReview.anonymous,
      });
      return;
    }

    const firstItem = reviewableItems[0];
    setForm({
      ...emptyState,
      orderId: firstItem ? String(firstItem.orderId) : "",
      orderItemId: firstItem ? String(firstItem.orderItemId) : "",
    });
  }, [initialReview, reviewableItems]);

  const selectedReviewableItem = useMemo(
    () => reviewableItems.find((item) => String(item.orderItemId) === form.orderItemId) || null,
    [form.orderItemId, reviewableItems]
  );

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" && "checked" in event.target ? event.target.checked : value,
    }));
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files || files.length === 0) {
      return;
    }

    const nextImages = await readFilesAsDataUrls(files);
    setForm((current) => ({
      ...current,
      images: [...current.images, ...nextImages].slice(0, 8),
    }));
  };

  const removeImage = (index: number) => {
    setForm((current) => ({
      ...current,
      images: current.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.title.trim() || !form.content.trim()) {
      setError("Vui lòng nhập tiêu đề và nội dung đánh giá.");
      return;
    }

    if (!initialReview && !selectedReviewableItem) {
      setError("Bạn cần chọn sản phẩm đã mua để đánh giá.");
      return;
    }

    if (initialReview) {
      await onSubmit({
        overallRating: form.overallRating,
        qualityRating: form.qualityRating,
        designRating: form.designRating,
        comfortRating: form.comfortRating,
        valueRating: form.valueRating,
        title: form.title.trim(),
        content: form.content.trim(),
        images: form.images,
        anonymous: form.anonymous,
      });
      return;
    }

    await onSubmit({
      productId: selectedReviewableItem!.productId,
      orderId: selectedReviewableItem!.orderId,
      orderItemId: selectedReviewableItem!.orderItemId,
      overallRating: form.overallRating,
      qualityRating: form.qualityRating,
      designRating: form.designRating,
      comfortRating: form.comfortRating,
      valueRating: form.valueRating,
      title: form.title.trim(),
      content: form.content.trim(),
      images: form.images,
      anonymous: form.anonymous,
    });
  };

  return (
    <form className="review-form" onSubmit={submitForm}>
      <div className="review-form__heading">
        <div>
          <p className="review-form__kicker">{initialReview ? "Chỉnh sửa đánh giá" : "Viết đánh giá"}</p>
          <h3>{initialReview ? "Cập nhật trải nghiệm của bạn" : "Chia sẻ trải nghiệm thực tế"}</h3>
        </div>
        {onCancelEdit && initialReview && (
          <button type="button" className="btn btn-domora-outline btn-sm" onClick={onCancelEdit}>
            Hủy sửa
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {!initialReview && (
        <div className="mb-3">
          <label className="form-label">Sản phẩm đã mua có thể đánh giá</label>
          <select className="form-select" name="orderItemId" value={form.orderItemId} onChange={handleChange}>
            <option value="">Chọn sản phẩm đã mua</option>
            {reviewableItems.map((item) => (
              <option key={item.orderItemId} value={item.orderItemId}>
                Đơn #{item.orderId} • {item.productName} x {item.quantity}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="review-form__row">
        <div className="review-form__field">
          <label className="form-label">Đánh giá tổng thể</label>
          <RatingStars
            value={form.overallRating}
            onChange={(value) => setForm((current) => ({ ...current, overallRating: value }))}
            size="lg"
          />
        </div>
      </div>

      <div className="review-form__criteria">
        {criteria.map((criterion) => (
          <div className="review-form__criterion" key={criterion.key}>
            <div className="review-form__criterion-head">
              <label>{criterion.label}</label>
              <span title={criterion.tip}>?</span>
            </div>
            <RatingStars
              value={form[criterion.key]}
              onChange={(value) => setForm((current) => ({ ...current, [criterion.key]: value }))}
            />
          </div>
        ))}
      </div>

      <div className="mb-3">
        <label className="form-label">Tiêu đề</label>
        <input
          className="form-control"
          name="title"
          maxLength={150}
          value={form.title}
          onChange={handleChange}
          placeholder="Ví dụ: Sofa đẹp, ngồi êm và rất chắc chắn"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Nội dung</label>
        <textarea
          className="form-control"
          rows={5}
          maxLength={2000}
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder="Mô tả cảm nhận thực tế sau khi sử dụng sản phẩm..."
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Ảnh review</label>
        <input className="form-control" type="file" accept="image/*" multiple onChange={handleImageChange} />
        {form.images.length > 0 && (
          <div className="review-form__images">
            {form.images.map((image, index) => (
              <div key={index} className="review-form__image-item">
                <img src={image} alt={`Ảnh review ${index + 1}`} />
                <button type="button" onClick={() => removeImage(index)}>
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-check mb-4">
        <input
          className="form-check-input"
          type="checkbox"
          id="reviewAnonymous"
          name="anonymous"
          checked={form.anonymous}
          onChange={handleChange}
        />
        <label className="form-check-label" htmlFor="reviewAnonymous">
          Ẩn tên khi hiển thị đánh giá
        </label>
      </div>

      <div className="d-flex gap-2 flex-wrap">
        <button type="submit" className="btn btn-domora" disabled={submitting}>
          {submitting ? "Đang gửi..." : initialReview ? "Cập nhật đánh giá" : "Gửi đánh giá"}
        </button>
      </div>
    </form>
  );
}
