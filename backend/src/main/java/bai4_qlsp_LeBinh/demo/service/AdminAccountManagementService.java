package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.response.AdminAccountResponse;
import bai4_qlsp_LeBinh.demo.entity.Account;
import bai4_qlsp_LeBinh.demo.entity.Role;
import bai4_qlsp_LeBinh.demo.repository.AccountRepository;
import bai4_qlsp_LeBinh.demo.repository.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.Set;

@Service
public class AdminAccountManagementService {

    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;

    public AdminAccountManagementService(AccountRepository accountRepository, RoleRepository roleRepository) {
        this.accountRepository = accountRepository;
        this.roleRepository = roleRepository;
    }

    @Transactional(readOnly = true)
    public java.util.List<AdminAccountResponse> getAllAccounts() {
        return accountRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Account::getId))
                .map(this::mapToResponse)
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
        return mapToResponse(accountRepository.save(account));
    }

    private AdminAccountResponse mapToResponse(Account account) {
        String role = account.getRoles().stream()
                .map(Role::getName)
                .min(Comparator.naturalOrder())
                .orElse("USER");

        return AdminAccountResponse.builder()
                .id(account.getId())
                .loginName(account.getLoginName())
                .role(role)
                .build();
    }
}
