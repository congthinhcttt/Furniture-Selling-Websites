package bai4_qlsp_LeBinh.demo.repository;

import bai4_qlsp_LeBinh.demo.entity.AffiliateReferral;
import bai4_qlsp_LeBinh.demo.enums.AffiliateReferralStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface AffiliateReferralRepository extends JpaRepository<AffiliateReferral, Long> {

    boolean existsByReferredUser_Id(Integer referredUserId);

    @EntityGraph(attributePaths = {"referrerUser", "referredUser"})
    List<AffiliateReferral> findByReferrerUser_IdOrderByCreatedAtDesc(Integer referrerUserId);

    @EntityGraph(attributePaths = {"referrerUser", "referredUser"})
    Page<AffiliateReferral> findByStatus(AffiliateReferralStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"referrerUser", "referredUser"})
    @Query("""
            select r
            from AffiliateReferral r
            where (:keyword is null
                or lower(r.referrerUser.loginName) like lower(concat('%', :keyword, '%'))
                or lower(r.referredUser.loginName) like lower(concat('%', :keyword, '%'))
                or lower(coalesce(r.referrerUser.email, '')) like lower(concat('%', :keyword, '%'))
                or lower(coalesce(r.referredUser.email, '')) like lower(concat('%', :keyword, '%'))
                or lower(r.referralCodeUsed) like lower(concat('%', :keyword, '%')))
            """)
    Page<AffiliateReferral> searchAll(@Param("keyword") String keyword, Pageable pageable);

    long countByReferrerUser_IdAndStatusIn(Integer referrerUserId, Collection<AffiliateReferralStatus> statuses);

    @Query("""
            select r.referrerUser.id as userId, count(r.id) as total
            from AffiliateReferral r
            where r.referrerUser.id in :userIds
              and r.status in :statuses
            group by r.referrerUser.id
            """)
    List<Object[]> countSuccessfulByReferrerIds(@Param("userIds") Collection<Integer> userIds,
                                                @Param("statuses") Collection<AffiliateReferralStatus> statuses);

    Optional<AffiliateReferral> findByReferredUser_Id(Integer referredUserId);
}
