package bai4_qlsp_LeBinh.demo.controller.user;

import bai4_qlsp_LeBinh.demo.dto.response.ApiResponse;
import bai4_qlsp_LeBinh.demo.dto.response.DeliveryTimelineItemResponse;
import bai4_qlsp_LeBinh.demo.dto.response.DeliveryTrackingResponse;
import bai4_qlsp_LeBinh.demo.entity.Account;
import bai4_qlsp_LeBinh.demo.service.AccountService;
import bai4_qlsp_LeBinh.demo.service.UserDeliveryService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/user/orders/{orderId}/tracking")
public class UserDeliveryController {

    private final UserDeliveryService userDeliveryService;
    private final AccountService accountService;

    public UserDeliveryController(UserDeliveryService userDeliveryService, AccountService accountService) {
        this.userDeliveryService = userDeliveryService;
        this.accountService = accountService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<DeliveryTrackingResponse>> getTracking(Authentication authentication,
                                                                            @PathVariable Long orderId) {
        Integer accountId = getCurrentAccount(authentication).getId();
        return ResponseEntity.ok(ApiResponse.<DeliveryTrackingResponse>builder()
                .success(true)
                .message("Lấy theo dõi giao hàng thành công")
                .data(userDeliveryService.getTracking(accountId, orderId))
                .build());
    }

    @GetMapping("/timeline")
    public ResponseEntity<ApiResponse<List<DeliveryTimelineItemResponse>>> getTimeline(Authentication authentication,
                                                                                       @PathVariable Long orderId) {
        Integer accountId = getCurrentAccount(authentication).getId();
        return ResponseEntity.ok(ApiResponse.<List<DeliveryTimelineItemResponse>>builder()
                .success(true)
                .message("Lấy lịch sử giao hàng thành công")
                .data(userDeliveryService.getTimeline(accountId, orderId))
                .build());
    }

    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamTracking(Authentication authentication, @PathVariable Long orderId) {
        Integer accountId = getCurrentAccount(authentication).getId();
        return userDeliveryService.subscribe(accountId, orderId);
    }

    private Account getCurrentAccount(Authentication authentication) {
        return accountService.getAccountByLoginName(authentication.getName());
    }
}
