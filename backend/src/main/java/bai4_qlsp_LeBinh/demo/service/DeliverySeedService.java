package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.request.UpdateDeliveryStatusRequest;
import bai4_qlsp_LeBinh.demo.dto.request.UpdateShippingDetailsRequest;
import bai4_qlsp_LeBinh.demo.entity.Account;
import bai4_qlsp_LeBinh.demo.entity.Order;
import bai4_qlsp_LeBinh.demo.entity.OrderItem;
import bai4_qlsp_LeBinh.demo.entity.Product;
import bai4_qlsp_LeBinh.demo.repository.AccountRepository;
import bai4_qlsp_LeBinh.demo.repository.DeliveryRepository;
import bai4_qlsp_LeBinh.demo.repository.OrderItemRepository;
import bai4_qlsp_LeBinh.demo.repository.OrderRepository;
import bai4_qlsp_LeBinh.demo.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DeliverySeedService {

    private final DeliveryRepository deliveryRepository;
    private final AccountRepository accountRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final DeliveryTrackingService deliveryTrackingService;

    public DeliverySeedService(DeliveryRepository deliveryRepository,
                               AccountRepository accountRepository,
                               ProductRepository productRepository,
                               OrderRepository orderRepository,
                               OrderItemRepository orderItemRepository,
                               DeliveryTrackingService deliveryTrackingService) {
        this.deliveryRepository = deliveryRepository;
        this.accountRepository = accountRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.deliveryTrackingService = deliveryTrackingService;
    }

    @Transactional
    public void seedIfEmpty() {
        if (deliveryRepository.count() > 0) {
            return;
        }

        Optional<Account> accountOptional = accountRepository.findAll().stream().findFirst();
        Optional<Product> productOptional = productRepository.findAll().stream().findFirst();
        if (accountOptional.isEmpty() || productOptional.isEmpty()) {
            return;
        }

        List<Order> orders = ensureSampleOrders(accountOptional.get(), productOptional.get());
        if (orders.size() < 4) {
            return;
        }

        bootstrapReadyToShipOrder(orders.get(0));
        bootstrapShippedOrder(orders.get(1));
        bootstrapDeliveredOrder(orders.get(2));
        bootstrapFailedOrder(orders.get(3));
    }

    private List<Order> ensureSampleOrders(Account account, Product product) {
        List<Order> existingOrders = orderRepository.findByAccountIdOrderByCreatedAtDesc(account.getId());
        List<Order> result = new ArrayList<>(existingOrders);
        while (result.size() < 4) {
            result.add(createSeedOrder(account, product, result.size() + 1));
        }
        return result;
    }

    private Order createSeedOrder(Account account, Product product, int index) {
        Order order = new Order();
        order.setOrderCode("SHIPSEED" + index + System.currentTimeMillis());
        order.setAccount(account);
        order.setReceiverName(account.getFullName() != null ? account.getFullName() : account.getLoginName());
        order.setReceiverPhone("09090000" + index);
        order.setShippingAddress("123 Nguyễn Trãi, Quận 1, TP.HCM");
        order.setPaymentMethod(index % 2 == 0 ? "VNPAY" : "COD");
        order.setPaymentStatus(index % 2 == 0 ? "PAID" : "UNPAID");
        order.setNote("Đơn hàng mẫu để kiểm tra luồng vận chuyển qua đơn vị giao hàng.");
        order.setTotalAmount(product.getPrice());
        order.setStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now().minusDays(4L - index));
        order.setUpdatedAt(LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);

        OrderItem orderItem = new OrderItem();
        orderItem.setOrder(savedOrder);
        orderItem.setProduct(product);
        orderItem.setQuantity(1);
        orderItem.setUnitPrice(product.getPrice());
        orderItem.setSubtotal(product.getPrice());
        orderItemRepository.save(orderItem);
        return savedOrder;
    }

    private void bootstrapReadyToShipOrder(Order order) {
        deliveryTrackingService.initializeForNewOrder(order);
        updateStatus(order, "CONFIRMED", "Shop đã xác nhận đơn hàng.");
        updateStatus(order, "PREPARING", "Sản phẩm đang được đóng gói.");
        updateStatus(order, "READY_TO_SHIP", "Đơn hàng đã sẵn sàng bàn giao cho hãng vận chuyển.");
    }

    private void bootstrapShippedOrder(Order order) {
        bootstrapReadyToShipOrder(order);

        UpdateShippingDetailsRequest shippingDetails = new UpdateShippingDetailsRequest();
        shippingDetails.setShippingProvider("GHN");
        shippingDetails.setTrackingCode("SAMPLEGHN001");
        shippingDetails.setTrackingUrl("https://donhang.ghn.vn/?order_code=SAMPLEGHN001");
        shippingDetails.setShippedAt(LocalDateTime.now().minusHours(10));
        shippingDetails.setShippingNote("Đã bàn giao cho GHN tại kho TP.HCM.");
        deliveryTrackingService.updateShippingDetails(order, shippingDetails, "seed-admin", "ADMIN");
    }

    private void bootstrapDeliveredOrder(Order order) {
        bootstrapShippedOrder(order);
        updateStatus(order, "DELIVERING", "Đơn hàng đang được hãng vận chuyển giao tới khách.");

        UpdateDeliveryStatusRequest delivered = new UpdateDeliveryStatusRequest();
        delivered.setStatus("DELIVERED");
        delivered.setDeliveredAt(LocalDateTime.now().minusHours(2));
        delivered.setShippingNote("Khách đã nhận hàng thành công.");
        deliveryTrackingService.updateStatus(order, delivered, "seed-admin", "ADMIN");
    }

    private void bootstrapFailedOrder(Order order) {
        bootstrapShippedOrder(order);
        updateStatus(order, "DELIVERING", "Đơn hàng đang được hãng vận chuyển giao tới khách.");

        UpdateDeliveryStatusRequest failed = new UpdateDeliveryStatusRequest();
        failed.setStatus("FAILED");
        failed.setFailReason("Bưu tá giao không thành công, khách hẹn lại ngày nhận.");
        failed.setShippingNote("Đang chờ hãng vận chuyển giao lại.");
        deliveryTrackingService.updateStatus(order, failed, "seed-admin", "ADMIN");
    }

    private void updateStatus(Order order, String status, String note) {
        UpdateDeliveryStatusRequest request = new UpdateDeliveryStatusRequest();
        request.setStatus(status);
        request.setShippingNote(note);
        deliveryTrackingService.updateStatus(order, request, "seed-admin", "ADMIN");
    }
}
