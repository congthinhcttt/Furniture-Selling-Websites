package bai4_qlsp_LeBinh.demo.repository;

import bai4_qlsp_LeBinh.demo.entity.AffiliateRewardLog;
import bai4_qlsp_LeBinh.demo.enums.AffiliateRewardLogStatus;
import bai4_qlsp_LeBinh.demo.enums.AffiliateRewardRole;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface AffiliateRewardLogRepository extends JpaRepository<AffiliateRewardLog, Long> {

    boolean existsByReferral_IdAndRewardRole(Long referralId, AffiliateRewardRole rewardRole);

    @EntityGraph(attributePaths = {"voucher", "beneficiaryUser"})
    List<AffiliateRewardLog> findByReferral_IdIn(Collection<Long> referralIds);

    long countByBeneficiaryUser_IdAndStatus(Integer beneficiaryUserId, AffiliateRewardLogStatus status);
}
