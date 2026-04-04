package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.request.UpdateDeliveryStatusRequest;
import bai4_qlsp_LeBinh.demo.dto.request.UpdateShippingDetailsRequest;
import bai4_qlsp_LeBinh.demo.dto.response.DeliverySummaryResponse;
import bai4_qlsp_LeBinh.demo.dto.response.DeliveryTrackingResponse;
import bai4_qlsp_LeBinh.demo.entity.Delivery;
import bai4_qlsp_LeBinh.demo.entity.Order;
import org.springframework.stereotype.Service;

@Service
public class AdminDeliveryService {

    private final OrderService orderService;
    private final DeliveryTrackingService deliveryTrackingService;

    public AdminDeliveryService(OrderService orderService, DeliveryTrackingService deliveryTrackingService) {
        this.orderService = orderService;
        this.deliveryTrackingService = deliveryTrackingService;
    }

    public DeliveryTrackingResponse getTracking(Long orderId) {
        return deliveryTrackingService.buildTrackingResponse(deliveryTrackingService.getDeliveryByOrderId(orderId));
    }

    public DeliverySummaryResponse getSummary(Long orderId) {
        return deliveryTrackingService.buildSummary(deliveryTrackingService.getDeliveryByOrderId(orderId));
    }

    public DeliveryTrackingResponse updateShippingDetails(Long orderId, UpdateShippingDetailsRequest request, String adminLoginName) {
        Order order = orderService.getOrderEntityById(orderId);
        Delivery delivery = deliveryTrackingService.updateShippingDetails(order, request, adminLoginName, "ADMIN");
        return deliveryTrackingService.buildTrackingResponse(delivery);
    }

    public DeliveryTrackingResponse updateStatus(Long orderId, UpdateDeliveryStatusRequest request, String adminLoginName) {
        Order order = orderService.getOrderEntityById(orderId);
        Delivery delivery = deliveryTrackingService.updateStatus(order, request, adminLoginName, "ADMIN");
        return deliveryTrackingService.buildTrackingResponse(delivery);
    }
}
