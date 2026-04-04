package bai4_qlsp_LeBinh.demo.enums;

public enum DeliveryStatus {
    PENDING("Chờ xác nhận"),
    CONFIRMED("Đã xác nhận"),
    PREPARING("Đang chuẩn bị"),
    READY_TO_SHIP("Sẵn sàng bàn giao"),
    SHIPPED("Đã gửi hàng"),
    DELIVERING("Đang giao hàng"),
    DELIVERED("Đã giao thành công"),
    FAILED("Giao thất bại"),
    CANCELLED("Đã hủy");

    private final String label;

    DeliveryStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static DeliveryStatus fromLegacyOrderStatus(String status) {
        if (status == null || status.isBlank()) {
            return PENDING;
        }

        return switch (status.trim().toUpperCase()) {
            case "PENDING", "PENDING_CONFIRMATION" -> PENDING;
            case "CONFIRMED" -> CONFIRMED;
            case "PREPARING" -> PREPARING;
            case "READY_TO_SHIP", "SHIPPER_ASSIGNED" -> READY_TO_SHIP;
            case "SHIPPED", "PICKED_UP" -> SHIPPED;
            case "DELIVERING", "SHIPPING", "IN_TRANSIT", "NEARBY" -> DELIVERING;
            case "COMPLETED", "DELIVERED" -> DELIVERED;
            case "FAILED", "DELIVERY_FAILED", "RETURNED" -> FAILED;
            case "CANCELLED" -> CANCELLED;
            default -> PENDING;
        };
    }

    public String toLegacyOrderStatus() {
        return switch (this) {
            case PENDING -> "PENDING";
            case CONFIRMED, PREPARING, READY_TO_SHIP -> "CONFIRMED";
            case SHIPPED, DELIVERING -> "SHIPPING";
            case DELIVERED -> "COMPLETED";
            case FAILED, CANCELLED -> "CANCELLED";
        };
    }
}
