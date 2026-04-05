package bai4_qlsp_LeBinh.demo.controller.admin;

import bai4_qlsp_LeBinh.demo.dto.request.VoucherCreateRequest;
import bai4_qlsp_LeBinh.demo.dto.request.VoucherUpdateRequest;
import bai4_qlsp_LeBinh.demo.dto.response.ApiResponse;
import bai4_qlsp_LeBinh.demo.dto.response.VoucherResponse;
import bai4_qlsp_LeBinh.demo.service.VoucherService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/vouchers")
public class AdminVoucherController {

    private final VoucherService voucherService;

    public AdminVoucherController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VoucherResponse>> createVoucher(@RequestBody VoucherCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<VoucherResponse>builder()
                        .success(true)
                        .message("Tạo voucher thành công")
                        .data(voucherService.createVoucher(request))
                        .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VoucherResponse>> updateVoucher(@PathVariable Long id,
                                                                      @RequestBody VoucherUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.<VoucherResponse>builder()
                .success(true)
                .message("Cập nhật voucher thành công")
                .data(voucherService.updateVoucher(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteVoucher(@PathVariable Long id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Xóa voucher thành công")
                .data(null)
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<VoucherResponse>>> getAllVouchers() {
        return ResponseEntity.ok(ApiResponse.<List<VoucherResponse>>builder()
                .success(true)
                .message("Lấy danh sách voucher thành công")
                .data(voucherService.getAllVouchers())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VoucherResponse>> getVoucherById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<VoucherResponse>builder()
                .success(true)
                .message("Lấy chi tiết voucher thành công")
                .data(voucherService.getVoucherById(id))
                .build());
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<VoucherResponse>> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<VoucherResponse>builder()
                .success(true)
                .message("Cập nhật trạng thái voucher thành công")
                .data(voucherService.toggleStatus(id))
                .build());
    }
}
