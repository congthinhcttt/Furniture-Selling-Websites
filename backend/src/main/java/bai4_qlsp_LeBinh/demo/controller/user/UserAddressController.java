package bai4_qlsp_LeBinh.demo.controller.user;

import bai4_qlsp_LeBinh.demo.dto.request.UserAddressRequest;
import bai4_qlsp_LeBinh.demo.dto.response.ApiResponse;
import bai4_qlsp_LeBinh.demo.dto.response.UserAddressResponse;
import bai4_qlsp_LeBinh.demo.entity.Account;
import bai4_qlsp_LeBinh.demo.service.AccountService;
import bai4_qlsp_LeBinh.demo.service.UserAddressService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
@RequestMapping("/api/user/addresses")
public class UserAddressController {

    private final UserAddressService userAddressService;
    private final AccountService accountService;

    public UserAddressController(UserAddressService userAddressService, AccountService accountService) {
        this.userAddressService = userAddressService;
        this.accountService = accountService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserAddressResponse>>> getMyAddresses(Authentication authentication) {
        Integer accountId = getCurrentAccount(authentication).getId();
        return ResponseEntity.ok(
                ApiResponse.<List<UserAddressResponse>>builder()
                        .success(true)
                        .message("Lay danh sach dia chi thanh cong")
                        .data(userAddressService.getAddressesByAccountId(accountId))
                        .build()
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserAddressResponse>> createAddress(Authentication authentication,
                                                                          @Valid @RequestBody UserAddressRequest request) {
        Integer accountId = getCurrentAccount(authentication).getId();
        return ResponseEntity.ok(
                ApiResponse.<UserAddressResponse>builder()
                        .success(true)
                        .message("Tao dia chi thanh cong")
                        .data(userAddressService.createAddress(accountId, request))
                        .build()
        );
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<ApiResponse<UserAddressResponse>> updateAddress(Authentication authentication,
                                                                          @PathVariable Long addressId,
                                                                          @Valid @RequestBody UserAddressRequest request) {
        Integer accountId = getCurrentAccount(authentication).getId();
        return ResponseEntity.ok(
                ApiResponse.<UserAddressResponse>builder()
                        .success(true)
                        .message("Cap nhat dia chi thanh cong")
                        .data(userAddressService.updateAddress(accountId, addressId, request))
                        .build()
        );
    }

    @PatchMapping("/{addressId}/default")
    public ResponseEntity<ApiResponse<UserAddressResponse>> setDefaultAddress(Authentication authentication,
                                                                              @PathVariable Long addressId) {
        Integer accountId = getCurrentAccount(authentication).getId();
        return ResponseEntity.ok(
                ApiResponse.<UserAddressResponse>builder()
                        .success(true)
                        .message("Cap nhat dia chi mac dinh thanh cong")
                        .data(userAddressService.setDefaultAddress(accountId, addressId))
                        .build()
        );
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(Authentication authentication,
                                                           @PathVariable Long addressId) {
        Integer accountId = getCurrentAccount(authentication).getId();
        userAddressService.deleteAddress(accountId, addressId);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Xoa dia chi thanh cong")
                        .build()
        );
    }

    private Account getCurrentAccount(Authentication authentication) {
        return accountService.getAccountByLoginName(authentication.getName());
    }
}
