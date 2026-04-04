package bai4_qlsp_LeBinh.demo.controller.user;

import bai4_qlsp_LeBinh.demo.dto.request.CreateReviewRequest;
import bai4_qlsp_LeBinh.demo.dto.request.UpdateReviewRequest;
import bai4_qlsp_LeBinh.demo.dto.response.ApiResponse;
import bai4_qlsp_LeBinh.demo.dto.response.ReviewPageResponse;
import bai4_qlsp_LeBinh.demo.dto.response.ReviewResponse;
import bai4_qlsp_LeBinh.demo.dto.response.ReviewSummaryResponse;
import bai4_qlsp_LeBinh.demo.dto.response.ReviewableItemResponse;
import bai4_qlsp_LeBinh.demo.entity.Account;
import bai4_qlsp_LeBinh.demo.exception.UnauthorizedReviewAccessException;
import bai4_qlsp_LeBinh.demo.service.AccountService;
import bai4_qlsp_LeBinh.demo.service.UserReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserReviewController {

    private final UserReviewService userReviewService;
    private final AccountService accountService;

    public UserReviewController(UserReviewService userReviewService, AccountService accountService) {
        this.userReviewService = userReviewService;
        this.accountService = accountService;
    }

    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<ApiResponse<ReviewPageResponse>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "6") int size,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(required = false) Integer rating,
            @RequestParam(defaultValue = "false") boolean withImages,
            @RequestParam(defaultValue = "false") boolean longContentOnly,
            Authentication authentication
    ) {
        Integer currentUserId = authentication != null ? getCurrentAccount(authentication).getId() : null;

        return ResponseEntity.ok(ApiResponse.<ReviewPageResponse>builder()
                .success(true)
                .message("Lấy danh sách đánh giá thành công")
                .data(userReviewService.getProductReviews(
                        productId,
                        currentUserId,
                        page - 1,
                        size,
                        sort,
                        rating,
                        withImages,
                        longContentOnly
                ))
                .build());
    }

    @GetMapping("/products/{productId}/reviews/summary")
    public ResponseEntity<ApiResponse<ReviewSummaryResponse>> getProductReviewSummary(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.<ReviewSummaryResponse>builder()
                .success(true)
                .message("Lấy thống kê đánh giá thành công")
                .data(userReviewService.getProductReviewSummary(productId))
                .build());
    }

    @PostMapping("/reviews")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(Authentication authentication,
                                                                    @Valid @RequestBody CreateReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<ReviewResponse>builder()
                        .success(true)
                        .message("Tạo đánh giá thành công")
                        .data(userReviewService.createReview(getCurrentAccount(authentication).getId(), request))
                        .build());
    }

    @PutMapping("/reviews/{reviewId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(Authentication authentication,
                                                                    @PathVariable Long reviewId,
                                                                    @Valid @RequestBody UpdateReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.<ReviewResponse>builder()
                .success(true)
                .message("Cập nhật đánh giá thành công")
                .data(userReviewService.updateReview(getCurrentAccount(authentication).getId(), reviewId, request))
                .build());
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<ApiResponse<Object>> deleteReview(Authentication authentication,
                                                            @PathVariable Long reviewId) {
        userReviewService.deleteReview(getCurrentAccount(authentication).getId(), reviewId);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Xóa đánh giá thành công")
                .data(null)
                .build());
    }

    @PostMapping("/reviews/{reviewId}/helpful")
    public ResponseEntity<ApiResponse<ReviewResponse>> markHelpful(Authentication authentication,
                                                                   @PathVariable Long reviewId) {
        return ResponseEntity.ok(ApiResponse.<ReviewResponse>builder()
                .success(true)
                .message("Đã đánh dấu hữu ích")
                .data(userReviewService.markHelpful(getCurrentAccount(authentication).getId(), reviewId))
                .build());
    }

    @DeleteMapping("/reviews/{reviewId}/helpful")
    public ResponseEntity<ApiResponse<ReviewResponse>> unmarkHelpful(Authentication authentication,
                                                                     @PathVariable Long reviewId) {
        return ResponseEntity.ok(ApiResponse.<ReviewResponse>builder()
                .success(true)
                .message("Đã bỏ đánh dấu hữu ích")
                .data(userReviewService.unmarkHelpful(getCurrentAccount(authentication).getId(), reviewId))
                .build());
    }

    @GetMapping("/me/reviews")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getMyReviews(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<List<ReviewResponse>>builder()
                .success(true)
                .message("Lấy đánh giá của tôi thành công")
                .data(userReviewService.getMyReviews(getCurrentAccount(authentication).getId()))
                .build());
    }

    @GetMapping("/orders/{orderId}/reviewable-items")
    public ResponseEntity<ApiResponse<List<ReviewableItemResponse>>> getReviewableItems(Authentication authentication,
                                                                                        @PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.<List<ReviewableItemResponse>>builder()
                .success(true)
                .message("Lấy danh sách sản phẩm có thể đánh giá thành công")
                .data(userReviewService.getReviewableItems(getCurrentAccount(authentication).getId(), orderId))
                .build());
    }

    private Account getCurrentAccount(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new UnauthorizedReviewAccessException("Vui lòng đăng nhập để thực hiện thao tác này.");
        }
        return accountService.getAccountByLoginName(authentication.getName());
    }
}
