package bai4_qlsp_LeBinh.demo.repository;

import bai4_qlsp_LeBinh.demo.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    boolean existsByUserIdAndProductId(Integer userId, Long productId);

    List<Wishlist> findByUserId(Integer userId);

    long deleteByUserIdAndProductId(Integer userId, Long productId);

    long countByUserId(Integer userId);

    List<Wishlist> findAllByUserIdOrderByCreatedAtDesc(Integer userId);

    Optional<Wishlist> findByUserIdAndProductId(Integer userId, Long productId);
}
