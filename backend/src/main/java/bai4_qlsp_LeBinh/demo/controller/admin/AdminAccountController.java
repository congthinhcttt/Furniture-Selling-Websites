package bai4_qlsp_LeBinh.demo.controller.admin;

import bai4_qlsp_LeBinh.demo.dto.request.AdminAccountRoleUpdateRequest;
import bai4_qlsp_LeBinh.demo.dto.response.AdminAccountResponse;
import bai4_qlsp_LeBinh.demo.dto.response.ApiResponse;
import bai4_qlsp_LeBinh.demo.service.AdminAccountManagementService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/accounts")
public class AdminAccountController {

    private final AdminAccountManagementService adminAccountManagementService;

    public AdminAccountController(AdminAccountManagementService adminAccountManagementService) {
        this.adminAccountManagementService = adminAccountManagementService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminAccountResponse>>> getAllAccounts() {
        return ResponseEntity.ok(
                ApiResponse.<List<AdminAccountResponse>>builder()
                        .success(true)
                        .message("Lay danh sach tai khoan thanh cong")
                        .data(adminAccountManagementService.getAllAccounts())
                        .build()
        );
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<ApiResponse<AdminAccountResponse>> updateRole(
            @PathVariable Integer id,
            @Valid @RequestBody AdminAccountRoleUpdateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<AdminAccountResponse>builder()
                        .success(true)
                        .message("Cap nhat role thanh cong")
                        .data(adminAccountManagementService.updateRole(id, request.getRole()))
                        .build()
        );
    }
}
