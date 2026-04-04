package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.response.VnpayCreatePaymentResponse;
import bai4_qlsp_LeBinh.demo.entity.Order;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    private final OrderService orderService;
    private final VnpayService vnpayService;
    private final String frontendResultUrl;

    public PaymentService(OrderService orderService,
                          VnpayService vnpayService,
                          @Value("${app.vnpay.frontend-result-url}") String frontendResultUrl) {
        this.orderService = orderService;
        this.vnpayService = vnpayService;
        this.frontendResultUrl = frontendResultUrl;
    }

    @Transactional
    public VnpayCreatePaymentResponse createVnpayPaymentUrl(Integer accountId, Long orderId, String clientIp) {
        Order order = orderService.getOrderEntityByIdForAccount(orderId, accountId);

        if ("PAID".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new RuntimeException("Don hang da thanh toan");
        }

        if (!"VNPAY".equalsIgnoreCase(order.getPaymentMethod())) {
            throw new RuntimeException("Don hang nay khong su dung phuong thuc thanh toan VNPay");
        }

        String txnRef = buildTxnRef(order.getId());
        order.setVnpTxnRef(txnRef);
        order.setPaymentStatus("PENDING");
        order.setResponseCode(null);
        order.setVnpTransactionNo(null);
        order.setBankCode(null);
        order.setPayDate(null);
        order.setUpdatedAt(LocalDateTime.now());
        orderService.saveOrder(order);

        String paymentUrl = vnpayService.createPaymentUrl(order, txnRef, clientIp);
        return VnpayCreatePaymentResponse.builder()
                .orderId(order.getId())
                .paymentUrl(paymentUrl)
                .vnpTxnRef(txnRef)
                .build();
    }

    @Transactional
    public PaymentProcessResult processReturn(Map<String, String> params) {
        return processCallback(params, false);
    }

    @Transactional
    public PaymentProcessResult processIpn(Map<String, String> params) {
        return processCallback(params, true);
    }

    public String buildFrontendResultUrl(PaymentProcessResult result) {
        return UriComponentsBuilder.fromUriString(frontendResultUrl)
                .queryParam("orderId", result.orderId())
                .queryParam("success", result.success())
                .queryParam("message", result.message())
                .queryParam("responseCode", result.responseCode())
                .queryParam("paymentStatus", result.paymentStatus())
                .build()
                .toUriString();
    }

    private PaymentProcessResult processCallback(Map<String, String> params, boolean ipnMode) {
        if (!vnpayService.verifyResponse(params)) {
            return new PaymentProcessResult(
                    false,
                    null,
                    "97",
                    "INVALID_CHECKSUM",
                    ipnMode ? "Invalid checksum" : "Chu ky VNPay khong hop le",
                    false
            );
        }

        String txnRef = params.get("vnp_TxnRef");
        if (txnRef == null || txnRef.isBlank()) {
            return new PaymentProcessResult(false, null, "01", "UNKNOWN", "Khong tim thay giao dich VNPay", false);
        }

        Order order;
        try {
            order = orderService.getOrderEntityByVnpTxnRef(txnRef);
        } catch (RuntimeException exception) {
            return new PaymentProcessResult(false, null, "01", "UNKNOWN", "Khong tim thay don hang", false);
        }

        String responseCode = params.getOrDefault("vnp_ResponseCode", "");
        String transactionStatus = params.getOrDefault("vnp_TransactionStatus", "");
        long callbackAmount = parseAmount(params.get("vnp_Amount"));

        if ("PAID".equalsIgnoreCase(order.getPaymentStatus())) {
            return new PaymentProcessResult(
                    true,
                    order.getId(),
                    responseCode,
                    order.getPaymentStatus(),
                    "Don hang da duoc thanh toan truoc do",
                    true
            );
        }

        if (callbackAmount != order.getTotalAmount()) {
            return new PaymentProcessResult(
                    false,
                    order.getId(),
                    "04",
                    order.getPaymentStatus(),
                    "So tien thanh toan khong hop le",
                    false
            );
        }

        order.setPaymentMethod("VNPAY");
        order.setResponseCode(responseCode);
        order.setVnpTransactionNo(params.get("vnp_TransactionNo"));
        order.setBankCode(params.get("vnp_BankCode"));
        order.setPayDate(vnpayService.parsePayDate(params.get("vnp_PayDate")));

        if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
            order.setPaymentStatus("PAID");
        } else {
            order.setPaymentStatus("FAILED");
        }

        orderService.saveOrder(order);

        boolean success = "PAID".equalsIgnoreCase(order.getPaymentStatus());
        return new PaymentProcessResult(
                success,
                order.getId(),
                responseCode,
                order.getPaymentStatus(),
                success ? "Thanh toan thanh cong" : "Thanh toan that bai",
                false
        );
    }

    private String buildTxnRef(Long orderId) {
        String random = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return orderId + "-" + random;
    }

    private long parseAmount(String rawAmount) {
        if (rawAmount == null || rawAmount.isBlank()) {
            return 0L;
        }
        return Long.parseLong(rawAmount) / 100;
    }

    public record PaymentProcessResult(
            boolean success,
            Long orderId,
            String responseCode,
            String paymentStatus,
            String message,
            boolean alreadyProcessed
    ) {
    }
}
