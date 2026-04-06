package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.request.ChangePasswordRequest;
import bai4_qlsp_LeBinh.demo.dto.request.ForgotPasswordEmailRequest;
import bai4_qlsp_LeBinh.demo.dto.request.LoginRequest;
import bai4_qlsp_LeBinh.demo.dto.request.RegisterRequest;
import bai4_qlsp_LeBinh.demo.dto.request.ResetPasswordByTokenRequest;
import bai4_qlsp_LeBinh.demo.dto.request.UpdateUserProfileRequest;
import bai4_qlsp_LeBinh.demo.dto.response.AuthResponse;
import bai4_qlsp_LeBinh.demo.dto.response.UserProfileResponse;
import bai4_qlsp_LeBinh.demo.entity.Account;
import bai4_qlsp_LeBinh.demo.entity.AffiliateConfig;
import bai4_qlsp_LeBinh.demo.entity.PasswordResetToken;
import bai4_qlsp_LeBinh.demo.entity.Role;
import bai4_qlsp_LeBinh.demo.repository.AccountRepository;
import bai4_qlsp_LeBinh.demo.repository.PasswordResetTokenRepository;
import bai4_qlsp_LeBinh.demo.repository.RoleRepository;
import bai4_qlsp_LeBinh.demo.security.AuthTokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private static final String WELCOME_VOUCHER_SOURCE = "WELCOME_NEW_USER";
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthTokenService authTokenService;
    private final AvatarStorageService avatarStorageService;
    private final PasswordResetMailService passwordResetMailService;
    private final AffiliateService affiliateService;
    private final AffiliateConfigService affiliateConfigService;
    private final VoucherService voucherService;

    public AuthService(AccountRepository accountRepository,
                       RoleRepository roleRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       PasswordEncoder passwordEncoder,
                       AuthTokenService authTokenService,
                       AvatarStorageService avatarStorageService,
                       PasswordResetMailService passwordResetMailService,
                       AffiliateService affiliateService,
                       AffiliateConfigService affiliateConfigService,
                       VoucherService voucherService) {
        this.accountRepository = accountRepository;
        this.roleRepository = roleRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authTokenService = authTokenService;
        this.avatarStorageService = avatarStorageService;
        this.passwordResetMailService = passwordResetMailService;
        this.affiliateService = affiliateService;
        this.affiliateConfigService = affiliateConfigService;
        this.voucherService = voucherService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String loginName = request.getLoginName().trim();
        if (accountRepository.existsByLoginName(loginName)) {
            throw new RuntimeException("Ten dang nhap da ton tai");
        }

        String normalizedEmail = normalizeNullable(request.getEmail());
        if (StringUtils.hasText(normalizedEmail) && accountRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException("Email da duoc su dung");
        }

        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new RuntimeException("Khong tim thay role USER"));

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);

        Account account = new Account();
        account.setLoginName(loginName);
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setEmail(normalizedEmail);
        account.setFullName(normalizeNullable(request.getFullName()));
        account.setAuthProvider("LOCAL");
        account.setRoles(roles);

        Account saved = accountRepository.save(account);
        affiliateService.ensureReferralCode(saved);
        grantWelcomeVoucherForNewUser(saved);
        affiliateService.processReferralForNewUser(saved, request.getReferralCode());
        return buildAuthResponse(saved, "Dang ky thanh cong");
    }

    @Transactional
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

        affiliateService.ensureReferralCode(account);
        return buildAuthResponse(account, "Dang nhap thanh cong");
    }

    @Transactional
    public void requestPasswordReset(ForgotPasswordEmailRequest request) {
        String email = request.getEmail().trim();
        Account account = accountRepository.findByEmail(email)
                .or(() -> accountRepository.findByLoginName(email))
                .orElse(null);

        if (account == null) {
            log.info("Khong gui email dat lai mat khau: khong tim thay tai khoan cho '{}'", email);
            throw new RuntimeException("Email chua lien ket voi tai khoan nao trong he thong");
        }

        if (!"LOCAL".equalsIgnoreCase(account.getAuthProvider())) {
            log.info("Khong gui email dat lai mat khau: tai khoan '{}' khong phai LOCAL (provider={})",
                    account.getLoginName(), account.getAuthProvider());
            throw new RuntimeException("Tai khoan nay dang nhap bang Google/social");
        }

        String targetEmail = StringUtils.hasText(account.getEmail()) ? account.getEmail().trim() : email;
        if (!targetEmail.contains("@")) {
            throw new RuntimeException("Email tai khoan khong hop le");
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
        log.info("Da gui yeu cau dat lai mat khau cho tai khoan '{}' toi '{}'", account.getLoginName(), targetEmail);
    }

    @Transactional
    public void resetPasswordByToken(ResetPasswordByTokenRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Xac nhan mat khau moi khong khop");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken().trim())
                .orElseThrow(() -> new RuntimeException("Lien ket dat lai mat khau khong hop le"));

        if (resetToken.getUsedAt() != null) {
            throw new RuntimeException("Lien ket dat lai mat khau da duoc su dung");
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Lien ket dat lai mat khau da het han");
        }

        Account account = resetToken.getAccount();
        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);

        resetToken.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);
    }

    @Transactional(readOnly = true)
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
                .authProvider(account.getAuthProvider())
                .build();
    }

    @Transactional
    public UserProfileResponse updateCurrentUser(String loginName, UpdateUserProfileRequest request) {
        Account account = accountRepository.findByLoginName(loginName)
                .orElseThrow(() -> new RuntimeException("Khong tim thay tai khoan"));

        String normalizedEmail = normalizeNullable(request.getEmail());
        if (StringUtils.hasText(normalizedEmail) && !normalizedEmail.equalsIgnoreCase(account.getEmail())) {
            boolean emailExists = accountRepository.existsByEmail(normalizedEmail);
            if (emailExists) {
                throw new RuntimeException("Email da duoc su dung");
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

    @Transactional
    public void changePassword(String loginName, ChangePasswordRequest request) {
        Account account = accountRepository.findByLoginName(loginName)
                .orElseThrow(() -> new RuntimeException("Khong tim thay tai khoan"));

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Xac nhan mat khau moi khong khop");
        }

        if (!"LOCAL".equalsIgnoreCase(account.getAuthProvider())) {
            throw new RuntimeException("Tai khoan social khong the doi mat khau tai day");
        }

        String storedPassword = account.getPassword();
        boolean passwordMatched = passwordEncoder.matches(request.getCurrentPassword(), storedPassword)
                || ("{plain}" + request.getCurrentPassword()).equals(storedPassword)
                || request.getCurrentPassword().equals(storedPassword);

        if (!passwordMatched) {
            throw new RuntimeException("Mat khau hien tai khong chinh xac");
        }

        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);
    }

    @Transactional
    public UserProfileResponse updateCurrentUserAvatar(String loginName, MultipartFile avatarFile) {
        Account account = accountRepository.findByLoginName(loginName)
                .orElseThrow(() -> new RuntimeException("Khong tim thay tai khoan"));

        String avatarUrl = avatarStorageService.storeAvatar(avatarFile, account.getAvatarUrl());
        account.setAvatarUrl(avatarUrl);
        Account saved = accountRepository.save(account);
        return getCurrentUser(saved.getLoginName());
    }

    @Transactional
    public AuthResponse loginWithGoogle(String email, String fullName, String avatarUrl) {
        Account account = accountRepository.findByEmail(email)
                .or(() -> accountRepository.findByLoginName(email))
                .map(existingAccount -> updateGoogleAccount(existingAccount, email, fullName, avatarUrl))
                .orElseGet(() -> createGoogleAccount(email, fullName, avatarUrl));

        affiliateService.ensureReferralCode(account);
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
        Account saved = accountRepository.save(account);
        affiliateService.ensureReferralCode(saved);
        return saved;
    }

    private String normalizeNullable(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private void grantWelcomeVoucherForNewUser(Account account) {
        if (account == null || account.getId() == null) {
            return;
        }
        if (voucherService.hasVoucherSourceForUser(WELCOME_VOUCHER_SOURCE, account.getId())) {
            return;
        }
        AffiliateConfig config = affiliateConfigService.getConfigEntity();
        voucherService.createAffiliateVoucher(
                account,
                config.getRefereeRewardType(),
                toMoney(config.getRefereeRewardValue()),
                toMoney(config.getMinOrderValue()),
                toMoney(config.getMaxDiscountValue()),
                config.getVoucherExpiryDays(),
                null,
                WELCOME_VOUCHER_SOURCE,
                config.getRefereeVoucherName(),
                config.getRefereeVoucherContent()
        );
    }

    private Long toMoney(java.math.BigDecimal amount) {
        if (amount == null || amount.compareTo(java.math.BigDecimal.ZERO) <= 0) {
            return null;
        }
        return amount.setScale(0, java.math.RoundingMode.HALF_UP).longValueExact();
    }
}
