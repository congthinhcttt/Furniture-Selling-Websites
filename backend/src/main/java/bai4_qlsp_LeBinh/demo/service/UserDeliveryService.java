package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.response.DeliveryTimelineItemResponse;
import bai4_qlsp_LeBinh.demo.dto.response.DeliveryTrackingResponse;
import bai4_qlsp_LeBinh.demo.entity.Delivery;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@Service
public class UserDeliveryService {

    private final DeliveryTrackingService deliveryTrackingService;
    private final DeliverySseService deliverySseService;

    public UserDeliveryService(DeliveryTrackingService deliveryTrackingService, DeliverySseService deliverySseService) {
        this.deliveryTrackingService = deliveryTrackingService;
        this.deliverySseService = deliverySseService;
    }

    public DeliveryTrackingResponse getTracking(Integer accountId, Long orderId) {
        Delivery delivery = deliveryTrackingService.getDeliveryByOrderIdForAccount(orderId, accountId);
        return deliveryTrackingService.buildTrackingResponse(delivery);
    }

    public List<DeliveryTimelineItemResponse> getTimeline(Integer accountId, Long orderId) {
        Delivery delivery = deliveryTrackingService.getDeliveryByOrderIdForAccount(orderId, accountId);
        return deliveryTrackingService.getTimeline(delivery);
    }

    public SseEmitter subscribe(Integer accountId, Long orderId) {
        DeliveryTrackingResponse snapshot = getTracking(accountId, orderId);
        return deliverySseService.subscribe(orderId, snapshot);
    }
}
