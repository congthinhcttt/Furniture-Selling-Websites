package bai4_qlsp_LeBinh.demo.repository;

import bai4_qlsp_LeBinh.demo.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {

    List<UserAddress> findByAccountIdOrderByIsDefaultDescUpdatedAtDesc(Long accountId);

    Optional<UserAddress> findByIdAndAccountId(Long id, Long accountId);

    boolean existsByAccountId(Long accountId);

    @Modifying
    @Query("update UserAddress ua set ua.isDefault = false where ua.account.id = :accountId")
    void clearDefaultByAccountId(Long accountId);
}
