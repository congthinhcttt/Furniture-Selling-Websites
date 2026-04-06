package bai4_qlsp_LeBinh.demo.controller.user;

import bai4_qlsp_LeBinh.demo.dto.request.VoucherApplyRequest;
import bai4_qlsp_LeBinh.demo.dto.response.ApiResponse;
import bai4_qlsp_LeBinh.demo.dto.response.VoucherApplyResponse;
import bai4_qlsp_LeBinh.demo.dto.response.VoucherResponse;
import bai4_qlsp_LeBinh.demo.entity.Account;
import bai4_qlsp_LeBinh.demo.service.AccountService;
import bai4_qlsp_LeBinh.demo.service.VoucherService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/user/vouchers")
public class UserVoucherController {

    private final VoucherService voucherService;
    private final AccountService accountService;

    public UserVoucherController(VoucherService voucherService, AccountService accountService) {
        this.voucherService = voucherService;
        this.accountService = accountService;
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<VoucherResponse>>> getAvailableVouchers(Authentication authentication) {
        Integer accountId = resolveAccountId(authentication);
        return ResponseEntity.ok(ApiResponse.<List<VoucherResponse>>builder()
                .success(true)
                .message("Lay danh sach ma giam gia kha dung thanh cong")
                .data(voucherService.getAvailableVouchersForUser(accountId))
                .build());
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<VoucherApplyResponse>> applyVoucher(Authentication authentication,
                                                                          @RequestBody VoucherApplyRequest request) {
        Integer accountId = resolveAccountId(authentication);
        return ResponseEntity.ok(ApiResponse.<VoucherApplyResponse>builder()
                .success(true)
                .message("Ap dung ma giam gia thanh cong")
                .data(voucherService.applyVoucher(request.getCode(), request.getSubtotal(), accountId))
                .build());
    }

    private Integer resolveAccountId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return null;
        }
        Account account = accountService.getAccountByLoginName(authentication.getName());
        return account.getId();
    }
}
