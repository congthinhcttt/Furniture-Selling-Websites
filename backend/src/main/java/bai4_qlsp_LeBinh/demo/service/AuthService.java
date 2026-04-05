package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.request.*;
import bai4_qlsp_LeBinh.demo.dto.response.AuthResponse;
import bai4_qlsp_LeBinh.demo.dto.response.UserProfileResponse;
import bai4_qlsp_LeBinh.demo.entity.Account;
import bai4_qlsp_LeBinh.demo.entity.PasswordResetToken;
import bai4_qlsp_LeBinh.demo.entity.Role;
import bai4_qlsp_LeBinh.demo.repository.AccountRepository;
import bai4_qlsp_LeBinh.demo.repository.PasswordResetTokenRepository;
import bai4_qlsp_LeBinh.demo.repository.RoleRepository;
import bai4_qlsp_LeBinh.demo.security.AuthTokenService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
public class AuthService {

    private static final long PASSWORD_RESET_EXPIRE_MINUTES = 15;
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthTokenService authTokenService;
    private final AvatarStorageService avatarStorageService;
    private final PasswordResetMailService passwordResetMailService;

    public AuthService(AccountRepository accountRepository,
                       RoleRepository roleRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       PasswordEncoder passwordEncoder,
                       AuthTokenService authTokenService,
                       AvatarStorageService avatarStorageService,
                       PasswordResetMailService passwordResetMailService) {
        this.accountRepository = accountRepository;
        this.roleRepository = roleRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authTokenService = authTokenService;
        this.avatarStorageService = avatarStorageService;
        this.passwordResetMailService = passwordResetMailService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (accountRepository.existsByLoginName(request.getLoginName())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }

        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new RuntimeException("Không tìm thấy role USER"));

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);

        Account account = new Account();
        account.setLoginName(request.getLoginName().trim());
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setAuthProvider("LOCAL");
        account.setRoles(roles);

        Account saved = accountRepository.save(account);
        return buildAuthResponse(saved, "Đăng ký thành công");
    }

    public AuthResponse login(LoginRequest request) {
        Account account = accountRepository.findByLoginName(request.getLoginName().trim())
                .orElseThrow(() -> new RuntimeException("Sai tên đăng nhập hoặc mật khẩu"));

        String storedPassword = account.getPassword();
        boolean passwordMatched = passwordEncoder.matches(request.getPassword(), storedPassword)
                || ("{plain}" + request.getPassword()).equals(storedPassword)
                || request.getPassword().equals(storedPassword);

        if (!passwordMatched) {
            throw new RuntimeException("Sai tên đăng nhập hoặc mật khẩu");
        }

        if (storedPassword != null && !storedPassword.startsWith("$2")) {
            account.setPassword(passwordEncoder.encode(request.getPassword()));
            account = accountRepository.save(account);
        }

        return buildAuthResponse(account, "Đăng nhập thành công");
    }

    @Transactional
    public void requestPasswordReset(ForgotPasswordEmailRequest request) {
        String email = request.getEmail().trim();
        Account account = accountRepository.findByEmail(email)
                .or(() -> accountRepository.findByLoginName(email))
                .orElse(null);

        if (account == null) {
            log.info("Không gửi email đặt lại mật khẩu: không tìm thấy tài khoản cho '{}'", email);
            throw new RuntimeException("Email chưa liên kết với tài khoản nào trong hệ thống");
        }

        if (!"LOCAL".equalsIgnoreCase(account.getAuthProvider())) {
            log.info("Không gửi email đặt lại mật khẩu: tài khoản '{}' không phải LOCAL (provider={})",
                    account.getLoginName(), account.getAuthProvider());
            throw new RuntimeException("Tài khoản này đăng nhập bằng Google/social, vui lòng đăng nhập bằng Google");
        }

        String targetEmail = StringUtils.hasText(account.getEmail()) ? account.getEmail().trim() : email;
        if (!targetEmail.contains("@")) {
            log.warn("Không gửi email đặt lại mật khẩu: email không hợp lệ cho tài khoản '{}': '{}'",
                    account.getLoginName(), targetEmail);
            throw new RuntimeException("Email tài khoản không hợp lệ để nhận thư đặt lại mật khẩu");
        }

        if (!StringUtils.hasText(account.getEmail())) {
            account.setEmail(targetEmail);
            accountRepository.save(account);
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByAccount_Id(account.getId())
                .orElseGet(() -> {
                    PasswordResetToken tokenEntity = new PasswordResetToken();
                    tokenEntity.setAccount(account);
                    return tokenEntity;
                });

        resetToken.setToken(UUID.randomUUID().toString());
        resetToken.setCreatedAt(LocalDateTime.now());
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(PASSWORD_RESET_EXPIRE_MINUTES));
        resetToken.setUsedAt(null);

        PasswordResetToken savedToken = passwordResetTokenRepository.save(resetToken);
        passwordResetMailService.sendPasswordResetEmail(targetEmail, savedToken.getToken());
        log.info("Đã gửi yêu cầu đặt lại mật khẩu cho tài khoản '{}' tới '{}'", account.getLoginName(), targetEmail);
    }

    @Transactional
    public void resetPasswordByToken(ResetPasswordByTokenRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Xác nhận mật khẩu mới không khớp");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken().trim())
                .orElseThrow(() -> new RuntimeException("Liên kết đặt lại mật khẩu không hợp lệ"));

        if (resetToken.getUsedAt() != null) {
            throw new RuntimeException("Liên kết đặt lại mật khẩu đã được sử dụng");
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Liên kết đặt lại mật khẩu đã hết hạn");
        }

        Account account = resetToken.getAccount();
        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);

        resetToken.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);
    }

    public UserProfileResponse getCurrentUser(String loginName) {
        Account account = accountRepository.findByLoginName(loginName)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        return UserProfileResponse.builder()
                .id(account.getId())
                .loginName(account.getLoginName())
                .email(account.getEmail())
                .fullName(account.getFullName())
                .avatarUrl(account.getAvatarUrl())
                .role(extractPrimaryRole(account))
                .authProvider(account.getAuthProvider())
                .build();
    }

    public UserProfileResponse updateCurrentUser(String loginName, UpdateUserProfileRequest request) {
        Account account = accountRepository.findByLoginName(loginName)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        String normalizedEmail = normalizeNullable(request.getEmail());
        if (StringUtils.hasText(normalizedEmail) && !normalizedEmail.equalsIgnoreCase(account.getEmail())) {
            boolean emailExists = accountRepository.existsByEmail(normalizedEmail);
            if (emailExists) {
                throw new RuntimeException("Email đã được sử dụng");
            }
        }

        account.setFullName(normalizeNullable(request.getFullName()));
        account.setEmail(normalizedEmail);
        if (request.getAvatarUrl() != null) {
            account.setAvatarUrl(normalizeNullable(request.getAvatarUrl()));
        }

        Account saved = accountRepository.save(account);
        return getCurrentUser(saved.getLoginName());
    }

    public void changePassword(String loginName, ChangePasswordRequest request) {
        Account account = accountRepository.findByLoginName(loginName)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Xác nhận mật khẩu mới không khớp");
        }

        if (!"LOCAL".equalsIgnoreCase(account.getAuthProvider())) {
            throw new RuntimeException("Tài khoản đăng nhập bằng social không thể đổi mật khẩu tại đây");
        }

        String storedPassword = account.getPassword();
        boolean passwordMatched = passwordEncoder.matches(request.getCurrentPassword(), storedPassword)
                || ("{plain}" + request.getCurrentPassword()).equals(storedPassword)
                || request.getCurrentPassword().equals(storedPassword);

        if (!passwordMatched) {
            throw new RuntimeException("Mật khẩu hiện tại không chính xác");
        }

        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);
    }

    public UserProfileResponse updateCurrentUserAvatar(String loginName, MultipartFile avatarFile) {
        Account account = accountRepository.findByLoginName(loginName)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        String avatarUrl = avatarStorageService.storeAvatar(avatarFile, account.getAvatarUrl());
        account.setAvatarUrl(avatarUrl);
        Account saved = accountRepository.save(account);
        return getCurrentUser(saved.getLoginName());
    }

    public AuthResponse loginWithGoogle(String email, String fullName, String avatarUrl) {
        Account account = accountRepository.findByEmail(email)
                .or(() -> accountRepository.findByLoginName(email))
                .map(existingAccount -> updateGoogleAccount(existingAccount, email, fullName, avatarUrl))
                .orElseGet(() -> createGoogleAccount(email, fullName, avatarUrl));

        return buildAuthResponse(account, "Đăng nhập Google thành công");
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
                .authProvider(account.getAuthProvider())
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
                .orElseThrow(() -> new RuntimeException("Không tìm thấy role USER"));

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

    private String normalizeNullable(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
