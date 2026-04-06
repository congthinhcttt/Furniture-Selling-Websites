package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.response.AdminAccountResponse;
import bai4_qlsp_LeBinh.demo.entity.Account;
import bai4_qlsp_LeBinh.demo.entity.Role;
import bai4_qlsp_LeBinh.demo.enums.AffiliateReferralStatus;
import bai4_qlsp_LeBinh.demo.repository.AccountRepository;
import bai4_qlsp_LeBinh.demo.repository.AffiliateReferralRepository;
import bai4_qlsp_LeBinh.demo.repository.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AdminAccountManagementService {

    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final AffiliateReferralRepository affiliateReferralRepository;

    public AdminAccountManagementService(AccountRepository accountRepository,
                                         RoleRepository roleRepository,
                                         AffiliateReferralRepository affiliateReferralRepository) {
        this.accountRepository = accountRepository;
        this.roleRepository = roleRepository;
        this.affiliateReferralRepository = affiliateReferralRepository;
    }

    @Transactional(readOnly = true)
    public java.util.List<AdminAccountResponse> getAllAccounts() {
        List<Account> accounts = accountRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Account::getId))
                .toList();
        Map<Integer, Long> successfulCounts = loadSuccessfulReferralCounts(accounts);

        return accounts.stream()
                .map(account -> mapToResponse(account, successfulCounts.getOrDefault(account.getId(), 0L)))
                .toList();
    }

    @Transactional
    public AdminAccountResponse updateRole(Integer accountId, String roleName) {
        String normalizedRole = roleName != null ? roleName.trim().toUpperCase() : "";

        if (!"USER".equals(normalizedRole) && !"ADMIN".equals(normalizedRole)) {
            throw new RuntimeException("Role khong hop le");
        }

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay tai khoan voi id: " + accountId));

        Role role = roleRepository.findByName(normalizedRole)
                .orElseThrow(() -> new RuntimeException("Khong tim thay role " + normalizedRole));

        account.setRoles(Set.of(role));
        Account saved = accountRepository.save(account);
        long successfulReferralCount = affiliateReferralRepository.countByReferrerUser_IdAndStatusIn(
                saved.getId(),
                List.of(AffiliateReferralStatus.SUCCESS, AffiliateReferralStatus.REWARDED)
        );
        return mapToResponse(saved, successfulReferralCount);
    }

    private AdminAccountResponse mapToResponse(Account account, Long successfulReferralCount) {
        String role = account.getRoles().stream()
                .map(Role::getName)
                .min(Comparator.naturalOrder())
                .orElse("USER");

        return AdminAccountResponse.builder()
                .id(account.getId())
                .loginName(account.getLoginName())
                .email(account.getEmail())
                .role(role)
                .referralCode(account.getReferralCode())
                .referredByUserId(account.getReferredBy() != null ? account.getReferredBy().getId() : null)
                .successfulReferralCount(successfulReferralCount != null ? successfulReferralCount : 0L)
                .build();
    }

    private Map<Integer, Long> loadSuccessfulReferralCounts(List<Account> accounts) {
        if (accounts.isEmpty()) {
            return Map.of();
        }

        List<Integer> userIds = accounts.stream().map(Account::getId).toList();
        List<Object[]> rows = affiliateReferralRepository.countSuccessfulByReferrerIds(
                userIds,
                List.of(AffiliateReferralStatus.SUCCESS, AffiliateReferralStatus.REWARDED)
        );
        return rows.stream().collect(Collectors.toMap(
                row -> (Integer) row[0],
                row -> (Long) row[1],
                (left, right) -> left
        ));
    }
}
