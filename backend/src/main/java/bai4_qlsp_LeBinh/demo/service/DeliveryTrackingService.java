package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.request.UpdateDeliveryStatusRequest;
import bai4_qlsp_LeBinh.demo.dto.request.UpdateShippingDetailsRequest;
import bai4_qlsp_LeBinh.demo.dto.response.DeliverySummaryResponse;
import bai4_qlsp_LeBinh.demo.dto.response.DeliveryTimelineItemResponse;
import bai4_qlsp_LeBinh.demo.dto.response.DeliveryTrackingResponse;
import bai4_qlsp_LeBinh.demo.entity.Delivery;
import bai4_qlsp_LeBinh.demo.entity.DeliveryStatusHistory;
import bai4_qlsp_LeBinh.demo.entity.Order;
import bai4_qlsp_LeBinh.demo.enums.DeliveryStatus;
import bai4_qlsp_LeBinh.demo.repository.DeliveryRepository;
import bai4_qlsp_LeBinh.demo.repository.DeliveryStatusHistoryRepository;
import bai4_qlsp_LeBinh.demo.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class DeliveryTrackingService {

    private static final String EVENT_TRACKING_UPDATED = "TRACKING_UPDATED";
    private static final Map<DeliveryStatus, Set<DeliveryStatus>> ALLOWED_TRANSITIONS =
            new EnumMap<>(DeliveryStatus.class);

    static {
        ALLOWED_TRANSITIONS.put(DeliveryStatus.PENDING, Set.of(DeliveryStatus.CONFIRMED, DeliveryStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(DeliveryStatus.CONFIRMED, Set.of(DeliveryStatus.PREPARING, DeliveryStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(DeliveryStatus.PREPARING, Set.of(DeliveryStatus.READY_TO_SHIP, DeliveryStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(DeliveryStatus.READY_TO_SHIP, Set.of(DeliveryStatus.SHIPPED, DeliveryStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(DeliveryStatus.SHIPPED,
                Set.of(DeliveryStatus.DELIVERING, DeliveryStatus.DELIVERED, DeliveryStatus.FAILED, DeliveryStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(DeliveryStatus.DELIVERING,
                Set.of(DeliveryStatus.DELIVERED, DeliveryStatus.FAILED, DeliveryStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(DeliveryStatus.DELIVERED, Set.of());
        ALLOWED_TRANSITIONS.put(DeliveryStatus.FAILED, Set.of(DeliveryStatus.DELIVERING, DeliveryStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(DeliveryStatus.CANCELLED, Set.of());
    }

    private final DeliveryRepository deliveryRepository;
    private final DeliveryStatusHistoryRepository historyRepository;
    private final DeliverySseService deliverySseService;
    private final OrderRepository orderRepository;

    public DeliveryTrackingService(DeliveryRepository deliveryRepository,
                                   DeliveryStatusHistoryRepository historyRepository,
                                   DeliverySseService deliverySseService,
                                   OrderRepository orderRepository) {
        this.deliveryRepository = deliveryRepository;
        this.historyRepository = historyRepository;
        this.deliverySseService = deliverySseService;
        this.orderRepository = orderRepository;
    }

    @Transactional
    public Delivery initializeForNewOrder(Order order) {
        return deliveryRepository.findByOrderId(order.getId()).orElseGet(() -> {
            Delivery delivery = new Delivery();
            delivery.setOrder(order);
            delivery.setCurrentStatus(DeliveryStatus.PENDING);
            delivery.setCreatedAt(LocalDateTime.now());
            delivery.setUpdatedAt(LocalDateTime.now());

            Delivery saved = deliveryRepository.save(delivery);
            appendHistory(saved, saved.getCurrentStatus(),
                    "Đơn hàng đã được tạo và đang chờ shop xác nhận.",
                    null,
                    "SYSTEM",
                    "SYSTEM");
            publish(saved);
            return saved;
        });
    }

    @Transactional
    public Delivery ensureDelivery(Order order) {
        return deliveryRepository.findByOrderId(order.getId()).orElseGet(() -> {
            Delivery delivery = new Delivery();
            delivery.setOrder(order);
            delivery.setCurrentStatus(DeliveryStatus.fromLegacyOrderStatus(order.getStatus()));
            delivery.setCreatedAt(order.getCreatedAt() != null ? order.getCreatedAt() : LocalDateTime.now());
            delivery.setUpdatedAt(LocalDateTime.now());

            Delivery saved = deliveryRepository.save(delivery);
            appendHistory(saved, saved.getCurrentStatus(),
                    "Khởi tạo thông tin vận chuyển từ đơn hàng hiện có.",
                    null,
                    "SYSTEM",
                    "SYSTEM");
            return saved;
        });
    }

    @Transactional(readOnly = true)
    public Delivery getDeliveryByOrderId(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        return ensureDelivery(order);
    }

    @Transactional(readOnly = true)
    public Delivery getDeliveryByOrderIdForAccount(Long orderId, Integer accountId) {
        Order order = orderRepository.findByIdAndAccountId(orderId, accountId)
                .orElseThrow(() -> new RuntimeException("Bạn không có quyền xem đơn hàng này"));
        return ensureDelivery(order);
    }

    @Transactional
    public Delivery updateShippingDetails(Order order,
                                          UpdateShippingDetailsRequest request,
                                          String changedBy,
                                          String changedByRole) {
        Delivery delivery = ensureDelivery(order);

        delivery.setShippingProvider(trimToNull(request.getShippingProvider()));
        delivery.setTrackingCode(trimToNull(request.getTrackingCode()));
        delivery.setTrackingUrl(trimToNull(request.getTrackingUrl()));
        delivery.setShippingNote(trimToNull(request.getShippingNote()));

        if (request.getShippedAt() != null) {
            delivery.setShippedAt(request.getShippedAt());
            if (delivery.getCurrentStatus() == DeliveryStatus.READY_TO_SHIP) {
                delivery.setCurrentStatus(DeliveryStatus.SHIPPED);
                syncOrderStatus(order, delivery.getCurrentStatus());
                appendHistory(delivery,
                        delivery.getCurrentStatus(),
                        "Đơn hàng đã được bàn giao cho đơn vị vận chuyển.",
                        request.getShippingNote(),
                        changedBy,
                        changedByRole);
            }
        }

        delivery.setUpdatedAt(LocalDateTime.now());
        Delivery saved = deliveryRepository.save(delivery);
        publish(saved);
        return saved;
    }

    @Transactional
    public Delivery updateStatus(Order order,
                                 UpdateDeliveryStatusRequest request,
                                 String changedBy,
                                 String changedByRole) {
        Delivery delivery = ensureDelivery(order);
        DeliveryStatus nextStatus = parseStatus(request.getStatus());

        validateTransition(delivery.getCurrentStatus(), nextStatus);
        validateStatusPayload(nextStatus, request);

        delivery.setCurrentStatus(nextStatus);
        delivery.setShippingNote(trimToNull(request.getShippingNote()));

        if (request.getShippedAt() != null) {
            delivery.setShippedAt(request.getShippedAt());
        } else if (nextStatus == DeliveryStatus.SHIPPED && delivery.getShippedAt() == null) {
            delivery.setShippedAt(LocalDateTime.now());
        }

        if (nextStatus == DeliveryStatus.DELIVERED) {
            delivery.setDeliveredAt(request.getDeliveredAt());
            delivery.setFailReason(null);
        } else if (nextStatus == DeliveryStatus.FAILED) {
            delivery.setFailReason(trimToNull(request.getFailReason()));
            delivery.setDeliveredAt(null);
        } else if (nextStatus != DeliveryStatus.DELIVERED) {
            delivery.setDeliveredAt(null);
            if (nextStatus != DeliveryStatus.FAILED) {
                delivery.setFailReason(null);
            }
        }

        delivery.setUpdatedAt(LocalDateTime.now());
        Delivery saved = deliveryRepository.save(delivery);
        syncOrderStatus(order, nextStatus);
        appendHistory(saved, nextStatus, buildStatusDescription(nextStatus), request.getShippingNote(), changedBy, changedByRole);
        publish(saved);
        return saved;
    }

    @Transactional(readOnly = true)
    public DeliveryTrackingResponse buildTrackingResponse(Delivery delivery) {
        Delivery managedDelivery = deliveryRepository.findDetailById(delivery.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin vận chuyển"));

        return DeliveryTrackingResponse.builder()
                .orderId(managedDelivery.getOrder().getId())
                .orderCode(managedDelivery.getOrder().getOrderCode())
                .shippingStatus(managedDelivery.getCurrentStatus().name())
                .statusLabel(managedDelivery.getCurrentStatus().getLabel())
                .shippedAt(managedDelivery.getShippedAt())
                .deliveredAt(managedDelivery.getDeliveredAt())
                .shippingProvider(managedDelivery.getShippingProvider())
                .trackingCode(managedDelivery.getTrackingCode())
                .trackingUrl(managedDelivery.getTrackingUrl())
                .shippingNote(managedDelivery.getShippingNote())
                .failReason(managedDelivery.getFailReason())
                .receiverName(managedDelivery.getOrder().getReceiverName())
                .receiverPhone(managedDelivery.getOrder().getReceiverPhone())
                .shippingAddress(managedDelivery.getOrder().getShippingAddress())
                .paymentMethod(managedDelivery.getOrder().getPaymentMethod())
                .paymentStatus(managedDelivery.getOrder().getPaymentStatus())
                .trackingTimeline(getTimeline(managedDelivery))
                .build();
    }

    @Transactional(readOnly = true)
    public DeliverySummaryResponse buildSummary(Delivery delivery) {
        Delivery managedDelivery = deliveryRepository.findDetailById(delivery.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin vận chuyển"));

        return DeliverySummaryResponse.builder()
                .orderId(managedDelivery.getOrder().getId())
                .orderCode(managedDelivery.getOrder().getOrderCode())
                .shippingStatus(managedDelivery.getCurrentStatus().name())
                .statusLabel(managedDelivery.getCurrentStatus().getLabel())
                .shippingProvider(managedDelivery.getShippingProvider())
                .trackingCode(managedDelivery.getTrackingCode())
                .shippedAt(managedDelivery.getShippedAt())
                .deliveredAt(managedDelivery.getDeliveredAt())
                .shippingNote(managedDelivery.getShippingNote())
                .build();
    }

    @Transactional(readOnly = true)
    public List<DeliveryTimelineItemResponse> getTimeline(Delivery delivery) {
        return historyRepository.findByDeliveryIdOrderByCreatedAtAsc(delivery.getId()).stream()
                .map(history -> DeliveryTimelineItemResponse.builder()
                        .status(history.getStatus().name())
                        .statusLabel(normalizeHistoryStatusLabel(history))
                        .description(normalizeHistoryText(history.getDescription()))
                        .note(normalizeHistoryText(history.getNote()))
                        .changedBy(history.getChangedBy())
                        .changedByRole(history.getChangedByRole())
                        .changedAt(history.getCreatedAt())
                        .build())
                .toList();
    }

    private DeliveryStatus parseStatus(String rawStatus) {
        try {
            return DeliveryStatus.valueOf(rawStatus.trim().toUpperCase());
        } catch (Exception exception) {
            throw new RuntimeException("Trạng thái giao hàng không hợp lệ");
        }
    }

    private void validateTransition(DeliveryStatus currentStatus, DeliveryStatus nextStatus) {
        if (currentStatus == nextStatus) {
            return;
        }

        if (!ALLOWED_TRANSITIONS.getOrDefault(currentStatus, Set.of()).contains(nextStatus)) {
            throw new RuntimeException("Không thể chuyển trạng thái từ " + currentStatus + " sang " + nextStatus);
        }
    }

    private void validateStatusPayload(DeliveryStatus nextStatus, UpdateDeliveryStatusRequest request) {
        if (nextStatus == DeliveryStatus.DELIVERED && request.getDeliveredAt() == null) {
            throw new RuntimeException("DELIVERED bắt buộc phải có deliveredAt");
        }

        if (nextStatus == DeliveryStatus.FAILED && isBlank(request.getFailReason())) {
            throw new RuntimeException("FAILED bắt buộc phải có failReason");
        }
    }

    private void appendHistory(Delivery delivery,
                               DeliveryStatus status,
                               String description,
                               String note,
                               String changedBy,
                               String changedByRole) {
        DeliveryStatusHistory history = new DeliveryStatusHistory();
        history.setDelivery(delivery);
        history.setStatus(status);
        history.setDescription(description);
        history.setNote(note);
        history.setChangedBy(changedBy);
        history.setChangedByRole(changedByRole);
        history.setCreatedAt(LocalDateTime.now());
        historyRepository.save(history);
    }

    private String buildStatusDescription(DeliveryStatus status) {
        return switch (status) {
            case PENDING -> "Đơn hàng đang chờ xác nhận.";
            case CONFIRMED -> "Shop đã xác nhận đơn hàng.";
            case PREPARING -> "Shop đang chuẩn bị hàng.";
            case READY_TO_SHIP -> "Đơn hàng đã sẵn sàng bàn giao cho đơn vị vận chuyển.";
            case SHIPPED -> "Đơn hàng đã được bàn giao cho đơn vị vận chuyển.";
            case DELIVERING -> "Đơn hàng đang được đơn vị vận chuyển giao tới khách.";
            case DELIVERED -> "Đơn hàng đã được giao thành công.";
            case FAILED -> "Đơn hàng giao không thành công.";
            case CANCELLED -> "Đơn hàng đã bị hủy.";
        };
    }

    private String normalizeHistoryStatusLabel(DeliveryStatusHistory history) {
        String description = normalizeHistoryText(history.getDescription());
        String note = normalizeHistoryText(history.getNote());

        if (containsLegacyCarrierTerms(description) || containsLegacyCarrierTerms(note)) {
            return switch (history.getStatus()) {
                case PENDING -> "Chờ xác nhận";
                case CONFIRMED -> "Đã xác nhận";
                case PREPARING -> "Đang chuẩn bị";
                case READY_TO_SHIP -> "Sẵn sàng bàn giao";
                case SHIPPED -> "Đã gửi hàng";
                case DELIVERING -> "Đang giao hàng";
                case DELIVERED -> "Đã giao thành công";
                case FAILED -> "Giao thất bại";
                case CANCELLED -> "Đã hủy";
            };
        }

        return history.getStatus().getLabel();
    }

    private String normalizeHistoryText(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }

        return value
                .replace("Tai xe", "Đơn vị vận chuyển")
                .replace("tai xe", "đơn vị vận chuyển")
                .replace("shipper", "đơn vị vận chuyển")
                .replace("shippers", "đơn vị vận chuyển")
                .replace("Da gan", "Đã gán")
                .replace("da gan", "đã gán")
                .replace("San sang giao", "Sẵn sàng bàn giao")
                .replace("san sang giao", "sẵn sàng bàn giao")
                .replace("Dang giao hang", "Đang giao hàng")
                .replace("dang giao hang", "đang giao hàng")
                .replace("Dang chuan bi hang", "Đang chuẩn bị hàng")
                .replace("dang chuan bi hang", "đang chuẩn bị hàng")
                .replace("Tai xe da lay hang khoi kho.", "Đơn vị vận chuyển đã tiếp nhận hàng tại kho.")
                .replace("Da gan shipper cho don hang.", "Đã cập nhật đơn vị vận chuyển cho đơn hàng.")
                .replace("Don hang da san sang de giao.", "Đơn hàng đã sẵn sàng bàn giao cho đơn vị vận chuyển.")
                .replace("Don hang dang tren duong giao den khach.", "Đơn hàng đang được vận chuyển tới khách.")
                .replace("Don hang dang duoc chuan bi.", "Đơn hàng đang được chuẩn bị.");
    }

    private boolean containsLegacyCarrierTerms(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }

        String normalized = value.toLowerCase();
        return normalized.contains("tai xe") || normalized.contains("shipper");
    }

    private void syncOrderStatus(Order order, DeliveryStatus status) {
        order.setStatus(status.toLegacyOrderStatus());
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
    }

    private void publish(Delivery delivery) {
        deliverySseService.publishUpdate(delivery.getOrder().getId(), EVENT_TRACKING_UPDATED, buildTrackingResponse(delivery));
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
