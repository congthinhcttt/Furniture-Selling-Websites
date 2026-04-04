package bai4_qlsp_LeBinh.demo.repository;

import bai4_qlsp_LeBinh.demo.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByAccountId(Integer accountId);

    List<Order> findByStatus(String status);

    List<Order> findByAccountIdOrderByCreatedAtDesc(Integer accountId);

    List<Order> findAllByOrderByCreatedAtDesc();

    Optional<Order> findByIdAndAccountId(Long id, Integer accountId);

    Optional<Order> findByVnpTxnRef(String vnpTxnRef);

    boolean existsByOrderCode(String orderCode);
}
