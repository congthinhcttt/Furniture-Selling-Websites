package bai4_qlsp_LeBinh.demo.repository;

import bai4_qlsp_LeBinh.demo.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    Optional<Delivery> findByOrderId(Long orderId);

    Optional<Delivery> findByOrderIdAndOrderAccountId(Long orderId, Integer accountId);

    @Query("""
            select d
            from Delivery d
            join fetch d.order o
            where d.id = :deliveryId
            """)
    Optional<Delivery> findDetailById(@Param("deliveryId") Long deliveryId);
}
