package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.request.CreateOrderRequest;
import bai4_qlsp_LeBinh.demo.dto.response.OrderItemResponse;
import bai4_qlsp_LeBinh.demo.dto.response.OrderResponse;
import bai4_qlsp_LeBinh.demo.entity.Account;
import bai4_qlsp_LeBinh.demo.entity.Cart;
import bai4_qlsp_LeBinh.demo.entity.CartItem;
import bai4_qlsp_LeBinh.demo.entity.Delivery;
import bai4_qlsp_LeBinh.demo.entity.Order;
import bai4_qlsp_LeBinh.demo.entity.OrderItem;
import bai4_qlsp_LeBinh.demo.entity.Product;
import bai4_qlsp_LeBinh.demo.repository.AccountRepository;
import bai4_qlsp_LeBinh.demo.repository.CartItemRepository;
import bai4_qlsp_LeBinh.demo.repository.CartRepository;
import bai4_qlsp_LeBinh.demo.repository.OrderItemRepository;
import bai4_qlsp_LeBinh.demo.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {
    private static final String PAYMENT_METHOD_COD = "COD";
    private static final String PAYMENT_METHOD_VNPAY = "VNPAY";

    private final AccountRepository accountRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductService productService;
    private final DeliveryTrackingService deliveryTrackingService;

    public OrderService(AccountRepository accountRepository,
                        CartRepository cartRepository,
                        CartItemRepository cartItemRepository,
                        OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        ProductService productService,
                        DeliveryTrackingService deliveryTrackingService) {
        this.accountRepository = accountRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productService = productService;
        this.deliveryTrackingService = deliveryTrackingService;
    }

    @Transactional
    public OrderResponse createOrder(Integer accountId, CreateOrderRequest request) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay tai khoan voi id: " + accountId));

        Cart cart = cartRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("Gio hang trong"));

        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Gio hang trong");
        }

        String paymentMethod = normalizePaymentMethod(request.getPaymentMethod());

        long totalAmount = cartItems.stream()
                .mapToLong(item -> item.getProduct().getPrice() * item.getQuantity())
                .sum();

        Order order = new Order();
        order.setOrderCode(generateOrderCode());
        order.setAccount(account);
        order.setReceiverName(request.getReceiverName());
        order.setReceiverPhone(request.getReceiverPhone());
        order.setShippingAddress(request.getShippingAddress());
        order.setPaymentMethod(paymentMethod);
        order.setPaymentStatus("UNPAID");
        order.setNote(request.getNote());
        order.setTotalAmount(totalAmount);
        order.setStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            productService.decreaseStock(product, cartItem.getQuantity());

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setSubtotal(product.getPrice() * cartItem.getQuantity());
            orderItemRepository.save(orderItem);
        }

        cartItemRepository.deleteByCartId(cart.getId());
        deliveryTrackingService.initializeForNewOrder(savedOrder);

        return getOrderById(savedOrder.getId());
    }

    @Transactional
    public List<OrderResponse> getOrdersByAccountId(Integer accountId) {
        return orderRepository.findByAccountIdOrderByCreatedAtDesc(accountId)
                .stream()
                .map(this::mapOrderToResponse)
                .toList();
    }

    @Transactional
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapOrderToResponse)
                .toList();
    }

    @Transactional
    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay don hang voi id: " + orderId));
        return mapOrderToResponse(order);
    }

    @Transactional
    public OrderResponse getOrderByIdForAccount(Long orderId, Integer accountId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay don hang voi id: " + orderId));

        if (!order.getAccount().getId().equals(accountId)) {
            throw new RuntimeException("Ban khong co quyen xem don hang nay");
        }

        return mapOrderToResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay don hang voi id: " + orderId));

        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());
        return mapOrderToResponse(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public Order getOrderEntityById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay don hang voi id: " + orderId));
    }

    @Transactional(readOnly = true)
    public Order getOrderEntityByIdForAccount(Long orderId, Integer accountId) {
        return orderRepository.findByIdAndAccountId(orderId, accountId)
                .orElseThrow(() -> new RuntimeException("Ban khong co quyen thao tac don hang nay"));
    }

    @Transactional(readOnly = true)
    public Order getOrderEntityByVnpTxnRef(String vnpTxnRef) {
        return orderRepository.findByVnpTxnRef(vnpTxnRef)
                .orElseThrow(() -> new RuntimeException("Khong tim thay don hang cho giao dich VNPay"));
    }

    @Transactional
    public Order saveOrder(Order order) {
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    private OrderResponse mapOrderToResponse(Order order) {
        List<OrderItemResponse> items = orderItemRepository.findByOrderId(order.getId())
                .stream()
                .map(item -> OrderItemResponse.builder()
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .image(item.getProduct().getImage())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .accountId(order.getAccount().getId())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .shippingAddress(order.getShippingAddress())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .note(order.getNote())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .vnpTxnRef(order.getVnpTxnRef())
                .vnpTransactionNo(order.getVnpTransactionNo())
                .bankCode(order.getBankCode())
                .responseCode(order.getResponseCode())
                .payDate(order.getPayDate())
                .createdAt(order.getCreatedAt())
                .deliveryStatus(getDeliveryStatus(order))
                .deliveryStatusLabel(getDeliveryStatusLabel(order))
                .shippingProvider(getShippingProvider(order))
                .trackingCode(getTrackingCode(order))
                .trackingUrl(getTrackingUrl(order))
                .shippedAt(getShippedAt(order))
                .deliveredAt(getDeliveredAt(order))
                .items(items)
                .build();
    }

    private String getDeliveryStatus(Order order) {
        Delivery delivery = deliveryTrackingService.ensureDelivery(order);
        return delivery.getCurrentStatus().name();
    }

    private String getDeliveryStatusLabel(Order order) {
        Delivery delivery = deliveryTrackingService.ensureDelivery(order);
        return delivery.getCurrentStatus().getLabel();
    }

    private String getShippingProvider(Order order) {
        return deliveryTrackingService.ensureDelivery(order).getShippingProvider();
    }

    private String getTrackingCode(Order order) {
        return deliveryTrackingService.ensureDelivery(order).getTrackingCode();
    }

    private String getTrackingUrl(Order order) {
        return deliveryTrackingService.ensureDelivery(order).getTrackingUrl();
    }

    private LocalDateTime getShippedAt(Order order) {
        return deliveryTrackingService.ensureDelivery(order).getShippedAt();
    }

    private LocalDateTime getDeliveredAt(Order order) {
        return deliveryTrackingService.ensureDelivery(order).getDeliveredAt();
    }

    private String normalizePaymentMethod(String paymentMethod) {
        String normalized = paymentMethod != null ? paymentMethod.trim().toUpperCase() : "";

        if (!PAYMENT_METHOD_COD.equals(normalized) && !PAYMENT_METHOD_VNPAY.equals(normalized)) {
            throw new RuntimeException("Phuong thuc thanh toan khong hop le");
        }

        return normalized;
    }

    private String generateOrderCode() {
        String orderCode;
        do {
            orderCode = "ORD" + System.currentTimeMillis();
        } while (orderRepository.existsByOrderCode(orderCode));
        return orderCode;
    }
}
