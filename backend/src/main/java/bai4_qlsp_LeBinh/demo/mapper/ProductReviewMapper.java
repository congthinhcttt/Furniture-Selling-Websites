package bai4_qlsp_LeBinh.demo.mapper;

import bai4_qlsp_LeBinh.demo.dto.response.AdminReviewResponse;
import bai4_qlsp_LeBinh.demo.dto.response.ReviewResponse;
import bai4_qlsp_LeBinh.demo.entity.Account;
import bai4_qlsp_LeBinh.demo.entity.ProductReview;

public interface ProductReviewMapper {

    ReviewResponse toUserResponse(ProductReview review, Account currentUser);

    AdminReviewResponse toAdminResponse(ProductReview review);
}
