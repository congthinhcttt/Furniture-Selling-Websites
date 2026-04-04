package bai4_qlsp_LeBinh.demo.controller.admin;

import bai4_qlsp_LeBinh.demo.dto.request.AdminReviewModerationRequest;
import bai4_qlsp_LeBinh.demo.dto.response.AdminReviewPageResponse;
import bai4_qlsp_LeBinh.demo.dto.response.AdminReviewResponse;
import bai4_qlsp_LeBinh.demo.dto.response.ApiResponse;
import bai4_qlsp_LeBinh.demo.service.AdminReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/reviews")
public class AdminReviewController {

    private final AdminReviewService adminReviewService;

    public AdminReviewController(AdminReviewService adminReviewService) {
        this.adminReviewService = adminReviewService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<AdminReviewPageResponse>> getReviews(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) LocalDate createdFrom,
            @RequestParam(required = false) LocalDate createdTo,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.<AdminReviewPageResponse>builder()
                .success(true)
                .message("Lấy danh sách đánh giá quản trị thành công")
                .data(adminReviewService.getAdminReviews(
                        keyword, productId, userId, status, rating, createdFrom, createdTo, page - 1, size
                ))
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminReviewResponse>> getReviewDetail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<AdminReviewResponse>builder()
                .success(true)
                .message("Lấy chi tiết đánh giá thành công")
                .data(adminReviewService.getReviewDetail(id))
                .build());
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<AdminReviewResponse>> approveReview(@PathVariable Long id,
                                                                          @Valid @RequestBody(required = false) AdminReviewModerationRequest request) {
        return ResponseEntity.ok(ApiResponse.<AdminReviewResponse>builder()
                .success(true)
                .message("Duyệt đánh giá thành công")
                .data(adminReviewService.approveReview(id, request != null ? request.getAdminNote() : null))
                .build());
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<AdminReviewResponse>> rejectReview(@PathVariable Long id,
                                                                         @Valid @RequestBody(required = false) AdminReviewModerationRequest request) {
        return ResponseEntity.ok(ApiResponse.<AdminReviewResponse>builder()
                .success(true)
                .message("Từ chối đánh giá thành công")
                .data(adminReviewService.rejectReview(id, request != null ? request.getAdminNote() : null))
                .build());
    }

    @PatchMapping("/{id}/hide")
    public ResponseEntity<ApiResponse<AdminReviewResponse>> hideReview(@PathVariable Long id,
                                                                       @Valid @RequestBody(required = false) AdminReviewModerationRequest request) {
        return ResponseEntity.ok(ApiResponse.<AdminReviewResponse>builder()
                .success(true)
                .message("Ẩn đánh giá thành công")
                .data(adminReviewService.hideReview(id, request != null ? request.getAdminNote() : null))
                .build());
    }

    @PatchMapping("/{id}/unhide")
    public ResponseEntity<ApiResponse<AdminReviewResponse>> unhideReview(@PathVariable Long id,
                                                                         @Valid @RequestBody(required = false) AdminReviewModerationRequest request) {
        return ResponseEntity.ok(ApiResponse.<AdminReviewResponse>builder()
                .success(true)
                .message("Hiện lại đánh giá thành công")
                .data(adminReviewService.unhideReview(id, request != null ? request.getAdminNote() : null))
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteReview(@PathVariable Long id) {
        adminReviewService.softDeleteReview(id);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Xóa mềm đánh giá thành công")
                .data(null)
                .build());
    }
}
