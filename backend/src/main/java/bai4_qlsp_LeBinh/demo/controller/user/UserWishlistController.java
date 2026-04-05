package bai4_qlsp_LeBinh.demo.controller.user;

import bai4_qlsp_LeBinh.demo.dto.response.ApiResponse;
import bai4_qlsp_LeBinh.demo.dto.response.WishlistCheckResponse;
import bai4_qlsp_LeBinh.demo.dto.response.WishlistCountResponse;
import bai4_qlsp_LeBinh.demo.dto.response.WishlistItemResponse;
import bai4_qlsp_LeBinh.demo.entity.Account;
import bai4_qlsp_LeBinh.demo.service.AccountService;
import bai4_qlsp_LeBinh.demo.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/user/wishlist")
public class UserWishlistController {

    private final WishlistService wishlistService;
    private final AccountService accountService;

    public UserWishlistController(WishlistService wishlistService, AccountService accountService) {
        this.wishlistService = wishlistService;
        this.accountService = accountService;
    }

    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse<WishlistItemResponse>> addToWishlist(Authentication authentication,
                                                                          @PathVariable Long productId) {
        Integer userId = getCurrentAccount(authentication).getId();
        boolean alreadyExists = wishlistService.isInWishlist(userId, productId);
        WishlistItemResponse response = wishlistService.addToWishlist(userId, productId);

        return ResponseEntity.ok(
                ApiResponse.<WishlistItemResponse>builder()
                        .success(true)
                        .message(alreadyExists
                                ? "Sản phẩm đã có trong danh sách yêu thích"
                                : "Thêm vào yêu thích thành công")
                        .data(response)
                        .build()
        );
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Object>> removeFromWishlist(Authentication authentication,
                                                                 @PathVariable Long productId) {
        Integer userId = getCurrentAccount(authentication).getId();
        boolean existed = wishlistService.isInWishlist(userId, productId);
        wishlistService.removeFromWishlist(userId, productId);

        return ResponseEntity.ok(
                ApiResponse.builder()
                        .success(true)
                        .message(existed
                                ? "Xóa khỏi yêu thích thành công"
                                : "Sản phẩm chưa có trong danh sách yêu thích")
                        .data(null)
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WishlistItemResponse>>> getWishlist(Authentication authentication) {
        Integer userId = getCurrentAccount(authentication).getId();

        return ResponseEntity.ok(
                ApiResponse.<List<WishlistItemResponse>>builder()
                        .success(true)
                        .message("Lấy danh sách yêu thích thành công")
                        .data(wishlistService.getWishlistByUser(userId))
                        .build()
        );
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<ApiResponse<WishlistCheckResponse>> checkWishlist(Authentication authentication,
                                                                            @PathVariable Long productId) {
        Integer userId = getCurrentAccount(authentication).getId();
        boolean inWishlist = wishlistService.isInWishlist(userId, productId);

        return ResponseEntity.ok(
                ApiResponse.<WishlistCheckResponse>builder()
                        .success(true)
                        .message("Kiểm tra yêu thích thành công")
                        .data(WishlistCheckResponse.builder()
                                .productId(productId)
                                .inWishlist(inWishlist)
                                .build())
                        .build()
        );
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<WishlistCountResponse>> countWishlist(Authentication authentication) {
        Integer userId = getCurrentAccount(authentication).getId();

        return ResponseEntity.ok(
                ApiResponse.<WishlistCountResponse>builder()
                        .success(true)
                        .message("Lấy số lượng yêu thích thành công")
                        .data(WishlistCountResponse.builder()
                                .count(wishlistService.countWishlist(userId))
                                .build())
                        .build()
        );
    }

    private Account getCurrentAccount(Authentication authentication) {
        return accountService.getAccountByLoginName(authentication.getName());
    }
}
