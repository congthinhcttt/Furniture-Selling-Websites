package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.request.LoginRequest;
import bai4_qlsp_LeBinh.demo.dto.request.RegisterRequest;
import bai4_qlsp_LeBinh.demo.dto.response.AuthResponse;
import bai4_qlsp_LeBinh.demo.dto.response.UserProfileResponse;
import bai4_qlsp_LeBinh.demo.entity.Account;
import bai4_qlsp_LeBinh.demo.entity.Role;
import bai4_qlsp_LeBinh.demo.repository.AccountRepository;
import bai4_qlsp_LeBinh.demo.repository.RoleRepository;
import bai4_qlsp_LeBinh.demo.security.AuthTokenService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
public class AuthService {

    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthTokenService authTokenService;

    public AuthService(AccountRepository accountRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       AuthTokenService authTokenService) {
        this.accountRepository = accountRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authTokenService = authTokenService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (accountRepository.existsByLoginName(request.getLoginName())) {
            throw new RuntimeException("Ten dang nhap da ton tai");
        }

        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new RuntimeException("Khong tim thay role USER"));

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);

        Account account = new Account();
        account.setLoginName(request.getLoginName().trim());
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setAuthProvider("LOCAL");
        account.setRoles(roles);

        Account saved = accountRepository.save(account);
        return buildAuthResponse(saved, "Dang ky thanh cong");
    }

    public AuthResponse login(LoginRequest request) {
        Account account = accountRepository.findByLoginName(request.getLoginName().trim())
                .orElseThrow(() -> new RuntimeException("Sai ten dang nhap hoac mat khau"));

        String storedPassword = account.getPassword();
        boolean passwordMatched = passwordEncoder.matches(request.getPassword(), storedPassword)
                || ("{plain}" + request.getPassword()).equals(storedPassword)
                || request.getPassword().equals(storedPassword);

        if (!passwordMatched) {
            throw new RuntimeException("Sai ten dang nhap hoac mat khau");
        }

        if (storedPassword != null && !storedPassword.startsWith("$2")) {
            account.setPassword(passwordEncoder.encode(request.getPassword()));
            account = accountRepository.save(account);
        }

        return buildAuthResponse(account, "Dang nhap thanh cong");
    }

    public UserProfileResponse getCurrentUser(String loginName) {
        Account account = accountRepository.findByLoginName(loginName)
                .orElseThrow(() -> new RuntimeException("Khong tim thay tai khoan"));

        return UserProfileResponse.builder()
                .id(account.getId())
                .loginName(account.getLoginName())
                .email(account.getEmail())
                .fullName(account.getFullName())
                .avatarUrl(account.getAvatarUrl())
                .role(extractPrimaryRole(account))
                .build();
    }

    public AuthResponse loginWithGoogle(String email, String fullName, String avatarUrl) {
        Account account = accountRepository.findByEmail(email)
                .or(() -> accountRepository.findByLoginName(email))
                .map(existingAccount -> updateGoogleAccount(existingAccount, email, fullName, avatarUrl))
                .orElseGet(() -> createGoogleAccount(email, fullName, avatarUrl));

        return buildAuthResponse(account, "Dang nhap Google thanh cong");
    }

    private AuthResponse buildAuthResponse(Account account, String message) {
        AuthTokenService.TokenPayload tokenPayload = authTokenService.generateToken(account);

        return AuthResponse.builder()
                .id(account.getId())
                .loginName(account.getLoginName())
                .email(account.getEmail())
                .fullName(account.getFullName())
                .avatarUrl(account.getAvatarUrl())
                .role(tokenPayload.role())
                .token(tokenPayload.token())
                .tokenType("Bearer")
                .expiresAt(tokenPayload.expiresAt())
                .message(message)
                .build();
    }

    private String extractPrimaryRole(Account account) {
        return account.getRoles().stream()
                .map(Role::getName)
                .min(Comparator.naturalOrder())
                .orElse("USER");
    }

    private Account updateGoogleAccount(Account account, String email, String fullName, String avatarUrl) {
        account.setEmail(email);
        account.setFullName(fullName);
        account.setAvatarUrl(avatarUrl);
        account.setAuthProvider("GOOGLE");
        if (account.getLoginName() == null || account.getLoginName().isBlank()) {
            account.setLoginName(email);
        }
        return accountRepository.save(account);
    }

    private Account createGoogleAccount(String email, String fullName, String avatarUrl) {
        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new RuntimeException("Khong tim thay role USER"));

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);

        Account account = new Account();
        account.setLoginName(email);
        account.setEmail(email);
        account.setFullName(fullName);
        account.setAvatarUrl(avatarUrl);
        account.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        account.setAuthProvider("GOOGLE");
        account.setRoles(roles);
        return accountRepository.save(account);
    }
}
