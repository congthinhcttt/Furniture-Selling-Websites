package bai4_qlsp_LeBinh.demo.repository;

import bai4_qlsp_LeBinh.demo.entity.AffiliateConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AffiliateConfigRepository extends JpaRepository<AffiliateConfig, Long> {

    Optional<AffiliateConfig> findTopByOrderByUpdatedAtDescIdDesc();
}
