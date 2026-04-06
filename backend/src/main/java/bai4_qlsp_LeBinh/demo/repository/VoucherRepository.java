package bai4_qlsp_LeBinh.demo.repository;

import bai4_qlsp_LeBinh.demo.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    Optional<Voucher> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsBySourceAndCreatedForUser_Id(String source, Integer userId);

    List<Voucher> findAllByActiveTrueOrderByCreatedAtDesc();

    List<Voucher> findAllByActiveTrueAndCreatedForUser_IdOrderByCreatedAtDesc(Integer userId);
}
