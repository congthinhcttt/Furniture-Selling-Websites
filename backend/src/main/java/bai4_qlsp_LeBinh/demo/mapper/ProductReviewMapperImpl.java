package bai4_qlsp_LeBinh.demo.mapper;

import bai4_qlsp_LeBinh.demo.dto.response.AdminReviewResponse;
import bai4_qlsp_LeBinh.demo.dto.response.ReviewResponse;
import bai4_qlsp_LeBinh.demo.entity.Account;
import bai4_qlsp_LeBinh.demo.entity.ProductReview;
import bai4_qlsp_LeBinh.demo.entity.ReviewHelpful;
import org.springframework.stereotype.Component;

@Component
public class ProductReviewMapperImpl implements ProductReviewMapper {

    @Override
    public ReviewResponse toUserResponse(ProductReview review, Account currentUser) {
        String reviewerName = review.getUser().getLoginName();
        boolean helpfulByCurrentUser = currentUser != null && review.getHelpfulMarks().stream()
                .map(ReviewHelpful::getUser)
                .anyMatch(user -> user.getId().equals(currentUser.getId()));

        return ReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getName())
                .userId(review.getUser().getId())
                .reviewerName(reviewerName)
                .reviewerAvatar(null)
                .anonymous(review.isAnonymous())
                .displayName(review.isAnonymous() ? "Người dùng ẩn danh" : reviewerName)
                .orderId(review.getOrder().getId())
                .orderItemId(review.getOrderItem().getId())
                .overallRating(review.getOverallRating())
                .qualityRating(review.getQualityRating())
                .designRating(review.getDesignRating())
                .comfortRating(review.getComfortRating())
                .valueRating(review.getValueRating())
                .title(review.getTitle())
                .content(review.getContent())
                .images(review.getImages().stream().map(image -> image.getImageUrl()).toList())
                .status(review.getStatus())
                .helpfulCount(review.getLikeCount())
                .helpfulByCurrentUser(helpfulByCurrentUser)
                .edited(review.isEdited())
                .purchased(true)
                .featured(review.getLikeCount() >= 2 || review.getOverallRating() >= 5)
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }

    @Override
    public AdminReviewResponse toAdminResponse(ProductReview review) {
        return AdminReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getName())
                .userId(review.getUser().getId())
                .username(review.getUser().getLoginName())
                .orderId(review.getOrder().getId())
                .orderItemId(review.getOrderItem().getId())
                .overallRating(review.getOverallRating())
                .qualityRating(review.getQualityRating())
                .designRating(review.getDesignRating())
                .comfortRating(review.getComfortRating())
                .valueRating(review.getValueRating())
                .title(review.getTitle())
                .content(review.getContent())
                .anonymous(review.isAnonymous())
                .status(review.getStatus())
                .adminNote(review.getAdminNote())
                .helpfulCount(review.getLikeCount())
                .edited(review.isEdited())
                .deleted(review.getDeletedAt() != null)
                .images(review.getImages().stream().map(image -> image.getImageUrl()).toList())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .deletedAt(review.getDeletedAt())
                .build();
    }
}
