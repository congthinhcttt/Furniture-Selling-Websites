package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.response.AdminReviewPageResponse;
import bai4_qlsp_LeBinh.demo.dto.response.AdminReviewResponse;

import java.time.LocalDate;

public interface AdminReviewService {

    AdminReviewPageResponse getAdminReviews(String keyword,
                                            Long productId,
                                            Integer userId,
                                            String status,
                                            Integer rating,
                                            LocalDate createdFrom,
                                            LocalDate createdTo,
                                            int page,
                                            int size);

    AdminReviewResponse getReviewDetail(Long reviewId);

    AdminReviewResponse approveReview(Long reviewId, String adminNote);

    AdminReviewResponse rejectReview(Long reviewId, String adminNote);

    AdminReviewResponse hideReview(Long reviewId, String adminNote);

    AdminReviewResponse unhideReview(Long reviewId, String adminNote);

    void softDeleteReview(Long reviewId);
}
