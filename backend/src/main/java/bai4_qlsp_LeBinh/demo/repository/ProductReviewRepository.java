package bai4_qlsp_LeBinh.demo.repository;

import bai4_qlsp_LeBinh.demo.entity.ProductReview;
import bai4_qlsp_LeBinh.demo.entity.ReviewStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long>, JpaSpecificationExecutor<ProductReview> {

    boolean existsByUserIdAndProductIdAndDeletedAtIsNull(Integer userId, Long productId);

    Optional<ProductReview> findByIdAndDeletedAtIsNull(Long id);

    Optional<ProductReview> findByUserIdAndProductIdAndDeletedAtIsNull(Integer userId, Long productId);

    @EntityGraph(attributePaths = {"product", "user", "order", "orderItem", "images"})
    List<ProductReview> findAllByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(Integer userId);

    @EntityGraph(attributePaths = {"product", "user", "order", "orderItem", "images"})
    Optional<ProductReview> findWithDetailsById(Long id);

    long countByProductIdAndStatusAndDeletedAtIsNull(Long productId, ReviewStatus status);

    long countByProductIdAndStatusAndOverallRatingAndDeletedAtIsNull(Long productId, ReviewStatus status, Integer overallRating);

    @Query("""
            select coalesce(avg(r.overallRating), 0),
                   coalesce(avg(r.qualityRating), 0),
                   coalesce(avg(r.designRating), 0),
                   coalesce(avg(r.comfortRating), 0),
                   coalesce(avg(r.valueRating), 0),
                   count(r),
                   coalesce(sum(case when r.overallRating >= 4 then 1 else 0 end), 0)
            from ProductReview r
            where r.product.id = :productId
              and r.status = :status
              and r.deletedAt is null
            """)
    List<Object[]> getReviewSummaryAggregates(@Param("productId") Long productId, @Param("status") ReviewStatus status);

    @Query("""
            select count(distinct r.id)
            from ProductReview r
            join r.images i
            where r.product.id = :productId
              and r.status = :status
              and r.deletedAt is null
            """)
    long countWithImages(@Param("productId") Long productId, @Param("status") ReviewStatus status);
}
