package bai4_qlsp_LeBinh.demo.controller.user;

import bai4_qlsp_LeBinh.demo.dto.response.ApiResponse;
import bai4_qlsp_LeBinh.demo.dto.response.UserAffiliateInfoResponse;
import bai4_qlsp_LeBinh.demo.dto.response.UserReferralItemResponse;
import bai4_qlsp_LeBinh.demo.entity.Account;
import bai4_qlsp_LeBinh.demo.service.AccountService;
import bai4_qlsp_LeBinh.demo.service.AffiliateService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/user/affiliate")
public class UserAffiliateController {

    private final AffiliateService affiliateService;
    private final AccountService accountService;

    public UserAffiliateController(AffiliateService affiliateService, AccountService accountService) {
        this.affiliateService = affiliateService;
        this.accountService = accountService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserAffiliateInfoResponse>> getMyAffiliateInfo(Authentication authentication) {
        Integer accountId = resolveAccountId(authentication);
        return ResponseEntity.ok(ApiResponse.<UserAffiliateInfoResponse>builder()
                .success(true)
                .message("Lay thong tin affiliate thanh cong")
                .data(affiliateService.getMyAffiliateInfo(accountId))
                .build());
    }

    @GetMapping("/referrals")
    public ResponseEntity<ApiResponse<List<UserReferralItemResponse>>> getMyReferrals(Authentication authentication) {
        Integer accountId = resolveAccountId(authentication);
        return ResponseEntity.ok(ApiResponse.<List<UserReferralItemResponse>>builder()
                .success(true)
                .message("Lay lich su gioi thieu thanh cong")
                .data(affiliateService.getMyReferrals(accountId))
                .build());
    }

    private Integer resolveAccountId(Authentication authentication) {
        Account account = accountService.getAccountByLoginName(authentication.getName());
        return account.getId();
    }
}
