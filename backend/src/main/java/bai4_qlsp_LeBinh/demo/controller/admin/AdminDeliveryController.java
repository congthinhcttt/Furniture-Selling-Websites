package bai4_qlsp_LeBinh.demo.controller.admin;

import bai4_qlsp_LeBinh.demo.dto.request.UpdateDeliveryStatusRequest;
import bai4_qlsp_LeBinh.demo.dto.request.UpdateShippingDetailsRequest;
import bai4_qlsp_LeBinh.demo.dto.response.ApiResponse;
import bai4_qlsp_LeBinh.demo.dto.response.DeliverySummaryResponse;
import bai4_qlsp_LeBinh.demo.dto.response.DeliveryTrackingResponse;
import bai4_qlsp_LeBinh.demo.service.AdminDeliveryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminDeliveryController {

    private final AdminDeliveryService adminDeliveryService;

    public AdminDeliveryController(AdminDeliveryService adminDeliveryService) {
        this.adminDeliveryService = adminDeliveryService;
    }

    @GetMapping("/orders/{orderId}/delivery")
    public ResponseEntity<ApiResponse<DeliveryTrackingResponse>> getDelivery(@PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.<DeliveryTrackingResponse>builder()
                .success(true)
                .message("Lấy chi tiết vận chuyển thành công")
                .data(adminDeliveryService.getTracking(orderId))
                .build());
    }

    @GetMapping("/orders/{orderId}/delivery/summary")
    public ResponseEntity<ApiResponse<DeliverySummaryResponse>> getDeliverySummary(@PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.<DeliverySummaryResponse>builder()
                .success(true)
                .message("Lấy tóm tắt vận chuyển thành công")
                .data(adminDeliveryService.getSummary(orderId))
                .build());
    }

    @PutMapping("/orders/{orderId}/delivery/shipping-details")
    public ResponseEntity<ApiResponse<DeliveryTrackingResponse>> updateShippingDetails(@PathVariable Long orderId,
                                                                                       @RequestBody UpdateShippingDetailsRequest request,
                                                                                       Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<DeliveryTrackingResponse>builder()
                .success(true)
                .message("Cập nhật thông tin vận chuyển thành công")
                .data(adminDeliveryService.updateShippingDetails(orderId, request, authentication.getName()))
                .build());
    }

    @PutMapping("/orders/{orderId}/delivery/status")
    public ResponseEntity<ApiResponse<DeliveryTrackingResponse>> updateStatus(@PathVariable Long orderId,
                                                                              @Valid @RequestBody UpdateDeliveryStatusRequest request,
                                                                              Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.<DeliveryTrackingResponse>builder()
                .success(true)
                .message("Cập nhật trạng thái vận chuyển thành công")
                .data(adminDeliveryService.updateStatus(orderId, request, authentication.getName()))
                .build());
    }
}
