package bai4_qlsp_LeBinh.demo.controller.user;

import bai4_qlsp_LeBinh.demo.dto.request.CreateOrderRequest;
import bai4_qlsp_LeBinh.demo.dto.response.ApiResponse;
import bai4_qlsp_LeBinh.demo.dto.response.OrderResponse;
import bai4_qlsp_LeBinh.demo.entity.Account;
import bai4_qlsp_LeBinh.demo.service.AccountService;
import bai4_qlsp_LeBinh.demo.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/user/orders")
public class UserOrderController {

    private final OrderService orderService;
    private final AccountService accountService;

    public UserOrderController(OrderService orderService, AccountService accountService) {
        this.orderService = orderService;
        this.accountService = accountService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(Authentication authentication,
                                                                  @Valid @RequestBody CreateOrderRequest request) {
        Integer accountId = getCurrentAccount(authentication).getId();
        return ResponseEntity.ok(
                ApiResponse.<OrderResponse>builder()
                        .success(true)
                        .message("Tao don hang thanh cong")
                        .data(orderService.createOrder(accountId, request))
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(Authentication authentication) {
        Integer accountId = getCurrentAccount(authentication).getId();
        return ResponseEntity.ok(
                ApiResponse.<List<OrderResponse>>builder()
                        .success(true)
                        .message("Lay danh sach don hang thanh cong")
                        .data(orderService.getOrdersByAccountId(accountId))
                        .build()
        );
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(Authentication authentication,
                                                                   @PathVariable Long orderId) {
        Integer accountId = getCurrentAccount(authentication).getId();
        return ResponseEntity.ok(
                ApiResponse.<OrderResponse>builder()
                        .success(true)
                        .message("Lay chi tiet don hang thanh cong")
                        .data(orderService.getOrderByIdForAccount(orderId, accountId))
                        .build()
        );
    }

    private Account getCurrentAccount(Authentication authentication) {
        return accountService.getAccountByLoginName(authentication.getName());
    }
}
