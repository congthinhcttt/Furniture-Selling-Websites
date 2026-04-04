package bai4_qlsp_LeBinh.demo.service.impl;

import bai4_qlsp_LeBinh.demo.dto.request.CreateReviewRequest;
import bai4_qlsp_LeBinh.demo.dto.request.UpdateReviewRequest;
import bai4_qlsp_LeBinh.demo.dto.response.RatingBreakdownItemResponse;
import bai4_qlsp_LeBinh.demo.dto.response.ReviewPageResponse;
import bai4_qlsp_LeBinh.demo.dto.response.ReviewResponse;
import bai4_qlsp_LeBinh.demo.dto.response.ReviewSummaryResponse;
import bai4_qlsp_LeBinh.demo.dto.response.ReviewableItemResponse;
import bai4_qlsp_LeBinh.demo.entity.Account;
import bai4_qlsp_LeBinh.demo.entity.Order;
import bai4_qlsp_LeBinh.demo.entity.OrderItem;
import bai4_qlsp_LeBinh.demo.entity.Product;
import bai4_qlsp_LeBinh.demo.entity.ProductReview;
import bai4_qlsp_LeBinh.demo.entity.ProductReviewImage;
import bai4_qlsp_LeBinh.demo.entity.ReviewHelpful;
import bai4_qlsp_LeBinh.demo.entity.ReviewStatus;
import bai4_qlsp_LeBinh.demo.exception.DuplicateReviewException;
import bai4_qlsp_LeBinh.demo.exception.ReviewNotAllowedException;
import bai4_qlsp_LeBinh.demo.exception.ReviewNotFoundException;
import bai4_qlsp_LeBinh.demo.exception.UnauthorizedReviewAccessException;
import bai4_qlsp_LeBinh.demo.mapper.ProductReviewMapper;
import bai4_qlsp_LeBinh.demo.repository.AccountRepository;
import bai4_qlsp_LeBinh.demo.repository.OrderItemRepository;
import bai4_qlsp_LeBinh.demo.repository.OrderRepository;
import bai4_qlsp_LeBinh.demo.repository.ProductRepository;
import bai4_qlsp_LeBinh.demo.repository.ProductReviewRepository;
import bai4_qlsp_LeBinh.demo.repository.ReviewHelpfulRepository;
import bai4_qlsp_LeBinh.demo.service.UserReviewService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class UserReviewServiceImpl implements UserReviewService {

    private static final Set<String> REVIEWABLE_ORDER_STATUSES = Set.of("COMPLETED", "DELIVERED");
    private static final int LONG_CONTENT_THRESHOLD = 120;

    private final ProductReviewRepository productReviewRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final AccountRepository accountRepository;
    private final ReviewHelpfulRepository reviewHelpfulRepository;
    private final ProductReviewMapper productReviewMapper;
    private final boolean autoApproveReview;

    public UserReviewServiceImpl(ProductReviewRepository productReviewRepository,
                                 ProductRepository productRepository,
                                 OrderRepository orderRepository,
                                 OrderItemRepository orderItemRepository,
                                 AccountRepository accountRepository,
                                 ReviewHelpfulRepository reviewHelpfulRepository,
                                 ProductReviewMapper productReviewMapper,
                                 @Value("${app.review.auto-approve:false}") boolean autoApproveReview) {
        this.productReviewRepository = productReviewRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.accountRepository = accountRepository;
        this.reviewHelpfulRepository = reviewHelpfulRepository;
        this.productReviewMapper = productReviewMapper;
        this.autoApproveReview = autoApproveReview;
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewPageResponse getProductReviews(Long productId,
                                                Integer currentUserId,
                                                int page,
                                                int size,
                                                String sort,
                                                Integer rating,
                                                boolean withImages,
                                                boolean longContentOnly) {
        ensureProductExists(productId);
        Account currentUser = currentUserId != null ? getAccount(currentUserId) : null;
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(1, Math.min(size, 20)), resolveSort(sort));
        Page<ProductReview> reviewPage = productReviewRepository.findAll(
                buildUserReviewSpecification(productId, rating, withImages, longContentOnly),
                pageable
        );

        return ReviewPageResponse.builder()
                .items(reviewPage.getContent().stream()
                        .map(review -> productReviewMapper.toUserResponse(review, currentUser))
                        .toList())
                .currentPage(reviewPage.getNumber() + 1)
                .pageSize(reviewPage.getSize())
                .totalItems(reviewPage.getTotalElements())
                .totalPages(reviewPage.getTotalPages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewSummaryResponse getProductReviewSummary(Long productId) {
        ensureProductExists(productId);
        List<Object[]> aggregates = productReviewRepository.getReviewSummaryAggregates(productId, ReviewStatus.APPROVED);
        Object[] aggregate = !aggregates.isEmpty()
                ? aggregates.get(0)
                : new Object[]{0d, 0d, 0d, 0d, 0d, 0L, 0L};

        if (aggregate.length < 7) {
            aggregate = new Object[]{0d, 0d, 0d, 0d, 0d, 0L, 0L};
        }

        long totalReviews = ((Number) aggregate[5]).longValue();
        long totalWithImages = productReviewRepository.countWithImages(productId, ReviewStatus.APPROVED);
        long recommendedCount = ((Number) aggregate[6]).longValue();

        List<RatingBreakdownItemResponse> breakdown = new ArrayList<>();
        for (int star = 5; star >= 1; star--) {
            long count = productReviewRepository.countByProductIdAndStatusAndOverallRatingAndDeletedAtIsNull(
                    productId,
                    ReviewStatus.APPROVED,
                    star
            );
            breakdown.add(RatingBreakdownItemResponse.builder()
                    .star(star)
                    .count(count)
                    .percentage(totalReviews == 0 ? 0 : round((double) count * 100 / totalReviews))
                    .build());
        }

        return ReviewSummaryResponse.builder()
                .productId(productId)
                .averageOverall(round(((Number) aggregate[0]).doubleValue()))
                .averageQuality(round(((Number) aggregate[1]).doubleValue()))
                .averageDesign(round(((Number) aggregate[2]).doubleValue()))
                .averageComfort(round(((Number) aggregate[3]).doubleValue()))
                .averageValue(round(((Number) aggregate[4]).doubleValue()))
                .totalReviews(totalReviews)
                .totalWithImages(totalWithImages)
                .recommendationRate(totalReviews == 0 ? 0 : round((double) recommendedCount * 100 / totalReviews))
                .ratingBreakdown(breakdown)
                .build();
    }

    @Override
    @Transactional
    public ReviewResponse createReview(Integer currentUserId, CreateReviewRequest request) {
        Account currentUser = getAccount(currentUserId);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ReviewNotAllowedException("Sản phẩm không tồn tại."));

        if (productReviewRepository.existsByUserIdAndProductIdAndDeletedAtIsNull(currentUserId, request.getProductId())) {
            throw new DuplicateReviewException("Bạn đã đánh giá sản phẩm này rồi. Hãy chỉnh sửa đánh giá hiện tại.");
        }

        OrderItem orderItem = validatePurchasedProduct(currentUserId, request.getOrderId(), request.getOrderItemId(), product.getId());
        LocalDateTime now = LocalDateTime.now();

        ProductReview review = new ProductReview();
        review.setProduct(product);
        review.setUser(currentUser);
        review.setOrder(orderItem.getOrder());
        review.setOrderItem(orderItem);
        review.setOverallRating(request.getOverallRating());
        review.setQualityRating(request.getQualityRating());
        review.setDesignRating(request.getDesignRating());
        review.setComfortRating(request.getComfortRating());
        review.setValueRating(request.getValueRating());
        review.setTitle(request.getTitle().trim());
        review.setContent(request.getContent().trim());
        review.setAnonymous(request.isAnonymous());
        review.setStatus(autoApproveReview ? ReviewStatus.APPROVED : ReviewStatus.PENDING);
        review.setEdited(false);
        review.setLikeCount(0);
        review.setCreatedAt(now);
        review.setUpdatedAt(now);
        replaceImages(review, request.getImages());

        return productReviewMapper.toUserResponse(productReviewRepository.save(review), currentUser);
    }

    @Override
    @Transactional
    public ReviewResponse updateReview(Integer currentUserId, Long reviewId, UpdateReviewRequest request) {
        Account currentUser = getAccount(currentUserId);
        ProductReview review = getUserOwnedReview(currentUserId, reviewId);

        if (review.getStatus() == ReviewStatus.HIDDEN || review.getStatus() == ReviewStatus.REJECTED) {
            throw new ReviewNotAllowedException("Đánh giá này đang bị khóa và không thể chỉnh sửa.");
        }

        review.setOverallRating(request.getOverallRating());
        review.setQualityRating(request.getQualityRating());
        review.setDesignRating(request.getDesignRating());
        review.setComfortRating(request.getComfortRating());
        review.setValueRating(request.getValueRating());
        review.setTitle(request.getTitle().trim());
        review.setContent(request.getContent().trim());
        review.setAnonymous(request.isAnonymous());
        review.setEdited(true);
        review.setUpdatedAt(LocalDateTime.now());
        review.setStatus(autoApproveReview ? ReviewStatus.APPROVED : ReviewStatus.PENDING);
        replaceImages(review, request.getImages());

        return productReviewMapper.toUserResponse(productReviewRepository.save(review), currentUser);
    }

    @Override
    @Transactional
    public void deleteReview(Integer currentUserId, Long reviewId) {
        ProductReview review = getUserOwnedReview(currentUserId, reviewId);
        review.setDeletedAt(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());
        productReviewRepository.save(review);
    }

    @Override
    @Transactional
    public ReviewResponse markHelpful(Integer currentUserId, Long reviewId) {
        Account currentUser = getAccount(currentUserId);
        ProductReview review = getApprovedReview(reviewId);

        if (review.getUser().getId().equals(currentUserId)) {
            throw new ReviewNotAllowedException("Bạn không thể đánh dấu hữu ích cho chính đánh giá của mình.");
        }

        if (!reviewHelpfulRepository.existsByReviewIdAndUserId(reviewId, currentUserId)) {
            ReviewHelpful helpful = new ReviewHelpful();
            helpful.setReview(review);
            helpful.setUser(currentUser);
            helpful.setCreatedAt(LocalDateTime.now());
            review.getHelpfulMarks().add(helpful);
            review.setLikeCount(review.getLikeCount() + 1);
            review = productReviewRepository.save(review);
        }

        return productReviewMapper.toUserResponse(review, currentUser);
    }

    @Override
    @Transactional
    public ReviewResponse unmarkHelpful(Integer currentUserId, Long reviewId) {
        Account currentUser = getAccount(currentUserId);
        ProductReview review = getApprovedReview(reviewId);

        ReviewHelpful helpful = reviewHelpfulRepository.findByReviewIdAndUserId(reviewId, currentUserId).orElse(null);
        if (helpful != null) {
            review.getHelpfulMarks().removeIf(item -> item.getId() != null && item.getId().equals(helpful.getId()));
            reviewHelpfulRepository.delete(helpful);
            review.setLikeCount(Math.max(0, review.getLikeCount() - 1));
        }

        review = productReviewRepository.save(review);
        return productReviewMapper.toUserResponse(review, currentUser);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getMyReviews(Integer currentUserId) {
        Account currentUser = getAccount(currentUserId);
        return productReviewRepository.findAllByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(currentUserId)
                .stream()
                .map(review -> productReviewMapper.toUserResponse(review, currentUser))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewableItemResponse> getReviewableItems(Integer currentUserId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ReviewNotAllowedException("Đơn hàng không tồn tại."));

        if (!order.getAccount().getId().equals(currentUserId)) {
            throw new UnauthorizedReviewAccessException("Bạn không có quyền xem đơn hàng này.");
        }

        boolean reviewableStatus = REVIEWABLE_ORDER_STATUSES.contains(order.getStatus().toUpperCase());

        return orderItemRepository.findByOrderId(orderId).stream()
                .map(item -> {
                    ProductReview review = productReviewRepository
                            .findByUserIdAndProductIdAndDeletedAtIsNull(currentUserId, item.getProduct().getId())
                            .orElse(null);

                    return ReviewableItemResponse.builder()
                            .orderId(orderId)
                            .orderItemId(item.getId())
                            .productId(item.getProduct().getId())
                            .productName(item.getProduct().getName())
                            .productImage(item.getProduct().getImage())
                            .quantity(item.getQuantity())
                            .canReview(reviewableStatus && review == null)
                            .reviewed(review != null)
                            .reviewId(review != null ? review.getId() : null)
                            .build();
                })
                .toList();
    }

    private Specification<ProductReview> buildUserReviewSpecification(Long productId,
                                                                     Integer rating,
                                                                     boolean withImages,
                                                                     boolean longContentOnly) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("product").get("id"), productId));
            predicates.add(cb.equal(root.get("status"), ReviewStatus.APPROVED));
            predicates.add(cb.isNull(root.get("deletedAt")));

            if (rating != null) {
                predicates.add(cb.equal(root.get("overallRating"), rating));
            }

            if (withImages) {
                predicates.add(cb.isNotEmpty(root.get("images")));
            }

            if (longContentOnly) {
                predicates.add(cb.greaterThanOrEqualTo(cb.length(root.get("content")), LONG_CONTENT_THRESHOLD));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private Sort resolveSort(String sort) {
        if ("highest".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Order.desc("overallRating"), Sort.Order.desc("createdAt"));
        }
        if ("lowest".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Order.asc("overallRating"), Sort.Order.desc("createdAt"));
        }
        if ("helpful".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Order.desc("likeCount"), Sort.Order.desc("createdAt"));
        }
        return Sort.by(Sort.Order.desc("createdAt"));
    }

    private Account getAccount(Integer accountId) {
        return accountRepository.findById(accountId)
                .orElseThrow(() -> new ReviewNotAllowedException("Tài khoản không tồn tại."));
    }

    private void ensureProductExists(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ReviewNotAllowedException("Sản phẩm không tồn tại.");
        }
    }

    private OrderItem validatePurchasedProduct(Integer currentUserId, Long orderId, Long orderItemId, Long productId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ReviewNotAllowedException("Đơn hàng không tồn tại."));

        if (!order.getAccount().getId().equals(currentUserId)) {
            throw new UnauthorizedReviewAccessException("Bạn không có quyền đánh giá từ đơn hàng này.");
        }

        if (!REVIEWABLE_ORDER_STATUSES.contains(order.getStatus().toUpperCase())) {
            throw new ReviewNotAllowedException("Chỉ đơn hàng đã hoàn tất mới được đánh giá.");
        }

        OrderItem orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new ReviewNotAllowedException("Không tìm thấy sản phẩm trong đơn hàng."));

        if (!orderItem.getOrder().getId().equals(orderId) || !orderItem.getProduct().getId().equals(productId)) {
            throw new ReviewNotAllowedException("Thông tin đánh giá không khớp với đơn hàng đã mua.");
        }

        return orderItem;
    }

    private ProductReview getUserOwnedReview(Integer currentUserId, Long reviewId) {
        ProductReview review = productReviewRepository.findByIdAndDeletedAtIsNull(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException("Không tìm thấy đánh giá."));

        if (!review.getUser().getId().equals(currentUserId)) {
            throw new UnauthorizedReviewAccessException("Bạn không có quyền thao tác đánh giá này.");
        }
        return review;
    }

    private ProductReview getApprovedReview(Long reviewId) {
        ProductReview review = productReviewRepository.findByIdAndDeletedAtIsNull(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException("Không tìm thấy đánh giá."));

        if (review.getStatus() != ReviewStatus.APPROVED) {
            throw new ReviewNotAllowedException("Chỉ có thể tương tác với đánh giá đã được duyệt.");
        }
        return review;
    }

    private void replaceImages(ProductReview review, List<String> imageUrls) {
        review.getImages().clear();

        List<String> safeImages = imageUrls == null ? List.of() : imageUrls.stream()
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .limit(8)
                .toList();

        for (int index = 0; index < safeImages.size(); index++) {
            ProductReviewImage image = new ProductReviewImage();
            image.setReview(review);
            image.setImageUrl(safeImages.get(index));
            image.setSortOrder(index + 1);
            image.setCreatedAt(LocalDateTime.now());
            review.getImages().add(image);
        }
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
