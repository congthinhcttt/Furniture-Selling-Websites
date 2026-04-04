package bai4_qlsp_LeBinh.demo.controller.user;

import bai4_qlsp_LeBinh.demo.dto.request.CartItemRequest;
import bai4_qlsp_LeBinh.demo.dto.response.ApiResponse;
import bai4_qlsp_LeBinh.demo.dto.response.CartResponse;
import bai4_qlsp_LeBinh.demo.entity.Account;
import bai4_qlsp_LeBinh.demo.service.AccountService;
import bai4_qlsp_LeBinh.demo.service.CartService;
import jakarta.validation.Valid;
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

@RestController
@RequestMapping("/api/user/cart")
public class UserCartController {

    private final CartService cartService;
    private final AccountService accountService;

    public UserCartController(CartService cartService, AccountService accountService) {
        this.cartService = cartService;
        this.accountService = accountService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(Authentication authentication) {
        Integer accountId = getCurrentAccount(authentication).getId();
        return ResponseEntity.ok(
                ApiResponse.<CartResponse>builder()
                        .success(true)
                        .message("Lay gio hang thanh cong")
                        .data(cartService.getCartByAccountId(accountId))
                        .build()
        );
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(Authentication authentication,
                                                               @Valid @RequestBody CartItemRequest request) {
        Integer accountId = getCurrentAccount(authentication).getId();
        return ResponseEntity.ok(
                ApiResponse.<CartResponse>builder()
                        .success(true)
                        .message("Them vao gio hang thanh cong")
                        .data(cartService.addToCart(accountId, request))
                        .build()
        );
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(Authentication authentication,
                                                                    @PathVariable Long productId,
                                                                    @RequestParam Integer quantity) {
        Integer accountId = getCurrentAccount(authentication).getId();
        return ResponseEntity.ok(
                ApiResponse.<CartResponse>builder()
                        .success(true)
                        .message("Cap nhat gio hang thanh cong")
                        .data(cartService.updateCartItem(accountId, productId, quantity))
                        .build()
        );
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<Object>> removeCartItem(Authentication authentication,
                                                              @PathVariable Long productId) {
        Integer accountId = getCurrentAccount(authentication).getId();
        cartService.removeCartItem(accountId, productId);
        return ResponseEntity.ok(
                ApiResponse.builder()
                        .success(true)
                        .message("Xoa san pham khoi gio hang thanh cong")
                        .data(null)
                        .build()
        );
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<Object>> clearCart(Authentication authentication) {
        Integer accountId = getCurrentAccount(authentication).getId();
        cartService.clearCart(accountId);
        return ResponseEntity.ok(
                ApiResponse.builder()
                        .success(true)
                        .message("Xoa toan bo gio hang thanh cong")
                        .data(null)
                        .build()
        );
    }

    private Account getCurrentAccount(Authentication authentication) {
        return accountService.getAccountByLoginName(authentication.getName());
    }
}
