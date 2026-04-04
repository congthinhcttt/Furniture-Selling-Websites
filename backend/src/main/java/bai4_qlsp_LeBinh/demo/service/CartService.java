package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.request.CartItemRequest;
import bai4_qlsp_LeBinh.demo.dto.response.CartItemResponse;
import bai4_qlsp_LeBinh.demo.dto.response.CartResponse;
import bai4_qlsp_LeBinh.demo.entity.Account;
import bai4_qlsp_LeBinh.demo.entity.Cart;
import bai4_qlsp_LeBinh.demo.entity.CartItem;
import bai4_qlsp_LeBinh.demo.entity.Product;
import bai4_qlsp_LeBinh.demo.repository.AccountRepository;
import bai4_qlsp_LeBinh.demo.repository.CartItemRepository;
import bai4_qlsp_LeBinh.demo.repository.CartRepository;
import bai4_qlsp_LeBinh.demo.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final AccountRepository accountRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       AccountRepository accountRepository,
                       ProductRepository productRepository,
                       ProductService productService) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.accountRepository = accountRepository;
        this.productRepository = productRepository;
        this.productService = productService;
    }

    @Transactional(readOnly = true)
    public CartResponse getCartByAccountId(Integer accountId) {
        Cart cart = getOrCreateCart(accountId);
        List<CartItemResponse> items = cartItemRepository.findByCartId(cart.getId())
                .stream()
                .map(this::mapItemToResponse)
                .toList();

        long totalAmount = items.stream()
                .mapToLong(CartItemResponse::getSubtotal)
                .sum();

        return CartResponse.builder()
                .cartId(cart.getId())
                .accountId(accountId)
                .items(items)
                .totalAmount(totalAmount)
                .build();
    }

    @Transactional
    public CartResponse addToCart(Integer accountId, CartItemRequest request) {
        Cart cart = getOrCreateCart(accountId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Khong tim thay san pham voi id: " + request.getProductId()));

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), request.getProductId())
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setCart(cart);
                    newItem.setProduct(product);
                    newItem.setQuantity(0);
                    return newItem;
                });

        int nextQuantity = item.getQuantity() + request.getQuantity();
        productService.ensureStockAvailable(product, nextQuantity);
        item.setQuantity(nextQuantity);
        cartItemRepository.save(item);

        return getCartByAccountId(accountId);
    }

    @Transactional
    public CartResponse updateCartItem(Integer accountId, Long productId, Integer quantity) {
        Cart cart = getOrCreateCart(accountId);

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay san pham trong gio hang"));

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            productService.ensureStockAvailable(item.getProduct(), quantity);
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return getCartByAccountId(accountId);
    }

    @Transactional
    public void removeCartItem(Integer accountId, Long productId) {
        Cart cart = getOrCreateCart(accountId);

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay san pham trong gio hang"));

        cartItemRepository.delete(item);
    }

    @Transactional
    public void clearCart(Integer accountId) {
        Cart cart = getOrCreateCart(accountId);
        cartItemRepository.deleteByCartId(cart.getId());
    }

    private Cart getOrCreateCart(Integer accountId) {
        return cartRepository.findByAccountId(accountId)
                .orElseGet(() -> {
                    Account account = accountRepository.findById(accountId)
                            .orElseThrow(() -> new RuntimeException("Khong tim thay tai khoan voi id: " + accountId));

                    Cart cart = new Cart();
                    cart.setAccount(account);
                    return cartRepository.save(cart);
                });
    }

    private CartItemResponse mapItemToResponse(CartItem item) {
        long subtotal = item.getProduct().getPrice() * item.getQuantity();

        return CartItemResponse.builder()
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .image(item.getProduct().getImage())
                .price(item.getProduct().getPrice())
                .quantity(item.getQuantity())
                .subtotal(subtotal)
                .build();
    }
}
