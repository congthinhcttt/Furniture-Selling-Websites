package bai4_qlsp_LeBinh.demo.service.impl;

import bai4_qlsp_LeBinh.demo.dto.response.AdminReviewPageResponse;
import bai4_qlsp_LeBinh.demo.dto.response.AdminReviewResponse;
import bai4_qlsp_LeBinh.demo.entity.ProductReview;
import bai4_qlsp_LeBinh.demo.entity.ReviewStatus;
import bai4_qlsp_LeBinh.demo.exception.ReviewNotFoundException;
import bai4_qlsp_LeBinh.demo.mapper.ProductReviewMapper;
import bai4_qlsp_LeBinh.demo.repository.ProductReviewRepository;
import bai4_qlsp_LeBinh.demo.service.AdminReviewService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AdminReviewServiceImpl implements AdminReviewService {

    private final ProductReviewRepository productReviewRepository;
    private final ProductReviewMapper productReviewMapper;

    public AdminReviewServiceImpl(ProductReviewRepository productReviewRepository,
                                  ProductReviewMapper productReviewMapper) {
        this.productReviewRepository = productReviewRepository;
        this.productReviewMapper = productReviewMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminReviewPageResponse getAdminReviews(String keyword,
                                                   Long productId,
                                                   Integer userId,
                                                   String status,
                                                   Integer rating,
                                                   LocalDate createdFrom,
                                                   LocalDate createdTo,
                                                   int page,
                                                   int size) {
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.max(1, Math.min(size, 30)),
                Sort.by(Sort.Order.desc("createdAt"))
        );
        Page<ProductReview> reviewPage = productReviewRepository.findAll(
                buildAdminSpecification(keyword, productId, userId, status, rating, createdFrom, createdTo),
                pageable
        );

        return AdminReviewPageResponse.builder()
                .items(reviewPage.getContent().stream().map(productReviewMapper::toAdminResponse).toList())
                .currentPage(reviewPage.getNumber() + 1)
                .pageSize(reviewPage.getSize())
                .totalItems(reviewPage.getTotalElements())
                .totalPages(reviewPage.getTotalPages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminReviewResponse getReviewDetail(Long reviewId) {
        return productReviewMapper.toAdminResponse(getReview(reviewId));
    }

    @Override
    @Transactional
    public AdminReviewResponse approveReview(Long reviewId, String adminNote) {
        return productReviewMapper.toAdminResponse(updateStatus(reviewId, ReviewStatus.APPROVED, adminNote));
    }

    @Override
    @Transactional
    public AdminReviewResponse rejectReview(Long reviewId, String adminNote) {
        return productReviewMapper.toAdminResponse(updateStatus(reviewId, ReviewStatus.REJECTED, adminNote));
    }

    @Override
    @Transactional
    public AdminReviewResponse hideReview(Long reviewId, String adminNote) {
        return productReviewMapper.toAdminResponse(updateStatus(reviewId, ReviewStatus.HIDDEN, adminNote));
    }

    @Override
    @Transactional
    public AdminReviewResponse unhideReview(Long reviewId, String adminNote) {
        return productReviewMapper.toAdminResponse(updateStatus(reviewId, ReviewStatus.APPROVED, adminNote));
    }

    @Override
    @Transactional
    public void softDeleteReview(Long reviewId) {
        ProductReview review = getReview(reviewId);
        review.setDeletedAt(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());
        productReviewRepository.save(review);
    }

    private Specification<ProductReview> buildAdminSpecification(String keyword,
                                                                 Long productId,
                                                                 Integer userId,
                                                                 String status,
                                                                 Integer rating,
                                                                 LocalDate createdFrom,
                                                                 LocalDate createdTo) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.isBlank()) {
                String likeValue = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("product").get("name")), likeValue),
                        cb.like(cb.lower(root.get("user").get("loginName")), likeValue),
                        cb.like(cb.lower(root.get("title")), likeValue)
                ));
            }

            if (productId != null) {
                predicates.add(cb.equal(root.get("product").get("id"), productId));
            }

            if (userId != null) {
                predicates.add(cb.equal(root.get("user").get("id"), userId));
            }

            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), ReviewStatus.valueOf(status.toUpperCase())));
            }

            if (rating != null) {
                predicates.add(cb.equal(root.get("overallRating"), rating));
            }

            if (createdFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), createdFrom.atStartOfDay()));
            }

            if (createdTo != null) {
                predicates.add(cb.lessThan(root.get("createdAt"), createdTo.plusDays(1).atStartOfDay()));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private ProductReview updateStatus(Long reviewId, ReviewStatus status, String adminNote) {
        ProductReview review = getReview(reviewId);
        review.setStatus(status);
        review.setAdminNote(adminNote != null ? adminNote.trim() : null);
        review.setUpdatedAt(LocalDateTime.now());
        return productReviewRepository.save(review);
    }

    private ProductReview getReview(Long reviewId) {
        return productReviewRepository.findWithDetailsById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException("Không tìm thấy đánh giá."));
    }
}
