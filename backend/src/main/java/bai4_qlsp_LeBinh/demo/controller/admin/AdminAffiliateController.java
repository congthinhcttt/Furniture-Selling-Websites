package bai4_qlsp_LeBinh.demo.controller.admin;

import bai4_qlsp_LeBinh.demo.dto.request.AffiliateConfigUpdateRequest;
import bai4_qlsp_LeBinh.demo.dto.response.AdminAffiliateReferralPageResponse;
import bai4_qlsp_LeBinh.demo.dto.response.AffiliateBackfillResponse;
import bai4_qlsp_LeBinh.demo.dto.response.AffiliateConfigResponse;
import bai4_qlsp_LeBinh.demo.dto.response.ApiResponse;
import bai4_qlsp_LeBinh.demo.service.AdminAffiliateService;
import bai4_qlsp_LeBinh.demo.service.AffiliateConfigService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/affiliate")
public class AdminAffiliateController {

    private final AffiliateConfigService affiliateConfigService;
    private final AdminAffiliateService adminAffiliateService;

    public AdminAffiliateController(AffiliateConfigService affiliateConfigService,
                                    AdminAffiliateService adminAffiliateService) {
        this.affiliateConfigService = affiliateConfigService;
        this.adminAffiliateService = adminAffiliateService;
    }

    @GetMapping("/config")
    public ResponseEntity<ApiResponse<AffiliateConfigResponse>> getConfig() {
        return ResponseEntity.ok(ApiResponse.<AffiliateConfigResponse>builder()
                .success(true)
                .message("Lay cau hinh affiliate thanh cong")
                .data(affiliateConfigService.getConfig())
                .build());
    }

    @PutMapping("/config")
    public ResponseEntity<ApiResponse<AffiliateConfigResponse>> updateConfig(
            @Valid @RequestBody AffiliateConfigUpdateRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.<AffiliateConfigResponse>builder()
                .success(true)
                .message("Cap nhat cau hinh affiliate thanh cong")
                .data(affiliateConfigService.updateConfig(request, authentication))
                .build());
    }

    @GetMapping("/referrals")
    public ResponseEntity<ApiResponse<AdminAffiliateReferralPageResponse>> getReferrals(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.<AdminAffiliateReferralPageResponse>builder()
                .success(true)
                .message("Lay danh sach referral thanh cong")
                .data(adminAffiliateService.getAllReferrals(keyword, status, page - 1, size))
                .build());
    }

    @PostMapping("/backfill-referral-codes")
    public ResponseEntity<ApiResponse<AffiliateBackfillResponse>> backfillReferralCodes() {
        int updatedCount = adminAffiliateService.backfillReferralCodes();
        return ResponseEntity.ok(ApiResponse.<AffiliateBackfillResponse>builder()
                .success(true)
                .message("Backfill referral code thanh cong")
                .data(AffiliateBackfillResponse.builder().updatedCount(updatedCount).build())
                .build());
    }
}
