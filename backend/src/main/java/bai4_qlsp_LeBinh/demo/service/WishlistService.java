package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.response.WishlistItemResponse;
import bai4_qlsp_LeBinh.demo.entity.Account;
import bai4_qlsp_LeBinh.demo.entity.Product;
import bai4_qlsp_LeBinh.demo.entity.Wishlist;
import bai4_qlsp_LeBinh.demo.exception.ResourceNotFoundException;
import bai4_qlsp_LeBinh.demo.repository.AccountRepository;
import bai4_qlsp_LeBinh.demo.repository.ProductRepository;
import bai4_qlsp_LeBinh.demo.repository.WishlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WishlistService {

    private static final int SHORT_DESCRIPTION_LIMIT = 140;

    private final WishlistRepository wishlistRepository;
    private final AccountRepository accountRepository;
    private final ProductRepository productRepository;

    public WishlistService(WishlistRepository wishlistRepository,
                           AccountRepository accountRepository,
                           ProductRepository productRepository) {
        this.wishlistRepository = wishlistRepository;
        this.accountRepository = accountRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public WishlistItemResponse addToWishlist(Integer userId, Long productId) {
        Product product = getProductById(productId);

        return wishlistRepository.findByUserIdAndProductId(userId, productId)
                .map(this::mapToResponse)
                .orElseGet(() -> {
                    Wishlist wishlist = new Wishlist();
                    wishlist.setUser(getUserById(userId));
                    wishlist.setProduct(product);
                    return mapToResponse(wishlistRepository.save(wishlist));
                });
    }

    @Transactional
    public void removeFromWishlist(Integer userId, Long productId) {
        getProductById(productId);
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }

    @Transactional(readOnly = true)
    public List<WishlistItemResponse> getWishlistByUser(Integer userId) {
        return wishlistRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public boolean isInWishlist(Integer userId, Long productId) {
        getProductById(productId);
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }

    @Transactional(readOnly = true)
    public long countWishlist(Integer userId) {
        return wishlistRepository.countByUserId(userId);
    }

    private Account getUserById(Integer userId) {
        return accountRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản."));
    }

    private Product getProductById(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm."));
    }

    private WishlistItemResponse mapToResponse(Wishlist wishlist) {
        Product product = wishlist.getProduct();

        return WishlistItemResponse.builder()
                .productId(product.getId())
                .productName(product.getName())
                .price(product.getPrice())
                .image(product.getImage())
                .shortDescription(buildShortDescription(product.getDescription()))
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .createdAt(wishlist.getCreatedAt())
                .inWishlist(true)
                .build();
    }

    private String buildShortDescription(String description) {
        if (description == null || description.isBlank()) {
            return "Sản phẩm nội thất được tuyển chọn cho không gian sống hiện đại.";
        }

        String normalized = description.trim().replaceAll("\\s+", " ");
        if (normalized.length() <= SHORT_DESCRIPTION_LIMIT) {
            return normalized;
        }

        return normalized.substring(0, SHORT_DESCRIPTION_LIMIT).trim() + "...";
    }
}
