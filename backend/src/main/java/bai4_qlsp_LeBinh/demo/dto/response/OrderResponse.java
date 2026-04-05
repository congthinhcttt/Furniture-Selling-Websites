package bai4_qlsp_LeBinh.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private Long id;
    private String orderCode;
    private Integer accountId;
    private String receiverName;
    private String receiverPhone;
    private String shippingAddress;
    private String paymentMethod;
    private String paymentStatus;
    private String note;
    private String voucherCode;
    private Long subtotalAmount;
    private Long discountAmount;
    private Long finalTotal;
    private Long totalAmount;
    private String status;
    private String vnpTxnRef;
    private String vnpTransactionNo;
    private String bankCode;
    private String responseCode;
    private LocalDateTime payDate;
    private LocalDateTime createdAt;
    private String deliveryStatus;
    private String deliveryStatusLabel;
    private String shippingProvider;
    private String trackingCode;
    private String trackingUrl;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    private List<OrderItemResponse> items;
}
