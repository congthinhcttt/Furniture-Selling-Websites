package bai4_qlsp_LeBinh.demo.repository;

import bai4_qlsp_LeBinh.demo.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Integer> {

    Optional<Account> findByLoginName(String loginName);

    Optional<Account> findByEmail(String email);

    boolean existsByLoginName(String loginName);

    boolean existsByEmail(String email);

    Optional<Account> findByReferralCode(String referralCode);

    boolean existsByReferralCode(String referralCode);

    @Query("""
            select a.id
            from Account a
            where a.referralCode is null or trim(a.referralCode) = ''
            """)
    List<Integer> findAccountIdsMissingReferralCode();

    List<Account> findByIdIn(Collection<Integer> ids);
}
