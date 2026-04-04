export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";

export interface RatingBreakdownItem {
  star: number;
  count: number;
  percentage: number;
}

export interface ReviewSummary {
  productId: number;
  averageOverall: number;
  averageQuality: number;
  averageDesign: number;
  averageComfort: number;
  averageValue: number;
  totalReviews: number;
  totalWithImages: number;
  recommendationRate: number;
  ratingBreakdown: RatingBreakdownItem[];
}

export interface Review {
  id: number;
  productId: number;
  productName: string;
  userId: number;
  reviewerName: string;
  reviewerAvatar?: string | null;
  anonymous: boolean;
  displayName: string;
  orderId: number;
  orderItemId: number;
  overallRating: number;
  qualityRating: number;
  designRating: number;
  comfortRating: number;
  valueRating: number;
  title: string;
  content: string;
  images: string[];
  status: ReviewStatus;
  helpfulCount: number;
  helpfulByCurrentUser: boolean;
  edited: boolean;
  purchased: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewPageResponse {
  items: Review[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ReviewableItem {
  orderId: number;
  orderItemId: number;
  productId: number;
  productName: string;
  productImage?: string;
  quantity: number;
  canReview: boolean;
  reviewed: boolean;
  reviewId?: number | null;
}

export interface CreateReviewPayload {
  productId: number;
  orderId: number;
  orderItemId: number;
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

export interface UpdateReviewPayload {
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

export interface ReviewQueryParams {
  page?: number;
  size?: number;
  sort?: "newest" | "highest" | "lowest" | "helpful";
  rating?: number;
  withImages?: boolean;
  longContentOnly?: boolean;
}

export interface AdminReview {
  id: number;
  productId: number;
  productName: string;
  userId: number;
  username: string;
  orderId: number;
  orderItemId: number;
  overallRating: number;
  qualityRating: number;
  designRating: number;
  comfortRating: number;
  valueRating: number;
  title: string;
  content: string;
  anonymous: boolean;
  status: ReviewStatus;
  adminNote?: string | null;
  helpfulCount: number;
  edited: boolean;
  deleted: boolean;
  images: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface AdminReviewPageResponse {
  items: AdminReview[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface AdminReviewQueryParams {
  keyword?: string;
  productId?: number;
  userId?: number;
  status?: ReviewStatus | "";
  rating?: number;
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  size?: number;
}
