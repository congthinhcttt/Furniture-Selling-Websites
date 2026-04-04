package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.request.CreateReviewRequest;
import bai4_qlsp_LeBinh.demo.dto.request.UpdateReviewRequest;
import bai4_qlsp_LeBinh.demo.dto.response.ReviewPageResponse;
import bai4_qlsp_LeBinh.demo.dto.response.ReviewResponse;
import bai4_qlsp_LeBinh.demo.dto.response.ReviewSummaryResponse;
import bai4_qlsp_LeBinh.demo.dto.response.ReviewableItemResponse;

import java.util.List;

public interface UserReviewService {

    ReviewPageResponse getProductReviews(Long productId,
                                         Integer currentUserId,
                                         int page,
                                         int size,
                                         String sort,
                                         Integer rating,
                                         boolean withImages,
                                         boolean longContentOnly);

    ReviewSummaryResponse getProductReviewSummary(Long productId);

    ReviewResponse createReview(Integer currentUserId, CreateReviewRequest request);

    ReviewResponse updateReview(Integer currentUserId, Long reviewId, UpdateReviewRequest request);

    void deleteReview(Integer currentUserId, Long reviewId);

    ReviewResponse markHelpful(Integer currentUserId, Long reviewId);

    ReviewResponse unmarkHelpful(Integer currentUserId, Long reviewId);

    List<ReviewResponse> getMyReviews(Integer currentUserId);

    List<ReviewableItemResponse> getReviewableItems(Integer currentUserId, Long orderId);
}
