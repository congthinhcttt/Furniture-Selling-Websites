package bai4_qlsp_LeBinh.demo.controller.user;

import bai4_qlsp_LeBinh.demo.dto.request.VoucherApplyRequest;
import bai4_qlsp_LeBinh.demo.dto.response.ApiResponse;
import bai4_qlsp_LeBinh.demo.dto.response.VoucherApplyResponse;
import bai4_qlsp_LeBinh.demo.dto.response.VoucherResponse;
import bai4_qlsp_LeBinh.demo.service.VoucherService;
import org.springframework.http.ResponseEntity;
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

    public UserVoucherController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<VoucherResponse>>> getAvailableVouchers() {
        return ResponseEntity.ok(ApiResponse.<List<VoucherResponse>>builder()
                .success(true)
                .message("Lấy danh sách mã giảm giá khả dụng thành công")
                .data(voucherService.getAvailableVouchers())
                .build());
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<VoucherApplyResponse>> applyVoucher(@RequestBody VoucherApplyRequest request) {
        return ResponseEntity.ok(ApiResponse.<VoucherApplyResponse>builder()
                .success(true)
                .message("Áp dụng mã giảm giá thành công")
                .data(voucherService.applyVoucher(request))
                .build());
    }
}
