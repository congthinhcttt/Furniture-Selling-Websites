package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.response.AffiliateConfigSummaryResponse;
import bai4_qlsp_LeBinh.demo.dto.response.ReferralRewardInfoResponse;
import bai4_qlsp_LeBinh.demo.dto.response.UserAffiliateInfoResponse;
import bai4_qlsp_LeBinh.demo.dto.response.UserReferralItemResponse;
import bai4_qlsp_LeBinh.demo.entity.Account;
import bai4_qlsp_LeBinh.demo.entity.AffiliateConfig;
import bai4_qlsp_LeBinh.demo.entity.AffiliateReferral;
import bai4_qlsp_LeBinh.demo.entity.AffiliateRewardLog;
import bai4_qlsp_LeBinh.demo.entity.Voucher;
import bai4_qlsp_LeBinh.demo.enums.AffiliateReferralStatus;
import bai4_qlsp_LeBinh.demo.enums.AffiliateRewardLogStatus;
import bai4_qlsp_LeBinh.demo.enums.AffiliateRewardRole;
import bai4_qlsp_LeBinh.demo.exception.DuplicateAffiliateRewardException;
import bai4_qlsp_LeBinh.demo.exception.InvalidReferralCodeException;
import bai4_qlsp_LeBinh.demo.exception.SelfReferralNotAllowedException;
import bai4_qlsp_LeBinh.demo.repository.AccountRepository;
import bai4_qlsp_LeBinh.demo.repository.AffiliateReferralRepository;
import bai4_qlsp_LeBinh.demo.repository.AffiliateRewardLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
public class AffiliateService {

    private static final Logger log = LoggerFactory.getLogger(AffiliateService.class);
    private static final Set<AffiliateReferralStatus> SUCCESSFUL_STATUSES = Set.of(
            AffiliateReferralStatus.SUCCESS,
            AffiliateReferralStatus.REWARDED
    );

    private final AccountRepository accountRepository;
    private final ReferralCodeGenerator referralCodeGenerator;
    private final AffiliateConfigService affiliateConfigService;
    private final AffiliateReferralRepository affiliateReferralRepository;
    private final AffiliateRewardLogRepository affiliateRewardLogRepository;
    private final VoucherService voucherService;
    private final String frontendBaseUrl;

    public AffiliateService(AccountRepository accountRepository,
                            ReferralCodeGenerator referralCodeGenerator,
                            AffiliateConfigService affiliateConfigService,
                            AffiliateReferralRepository affiliateReferralRepository,
                            AffiliateRewardLogRepository affiliateRewardLogRepository,
                            VoucherService voucherService,
                            @Value("${app.frontend.base-url:http://localhost:5173}") String frontendBaseUrl) {
        this.accountRepository = accountRepository;
        this.referralCodeGenerator = referralCodeGenerator;
        this.affiliateConfigService = affiliateConfigService;
        this.affiliateReferralRepository = affiliateReferralRepository;
        this.affiliateRewardLogRepository = affiliateRewardLogRepository;
        this.voucherService = voucherService;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    @Transactional
    public void ensureReferralCode(Account account) {
        if (StringUtils.hasText(account.getReferralCode())) {
            return;
        }
        account.setReferralCode(referralCodeGenerator.generateUniqueCode());
        accountRepository.save(account);
    }

    @Transactional
    public void processReferralForNewUser(Account newUser, String rawReferralCode) {
        if (!StringUtils.hasText(rawReferralCode)) {
            return;
        }

        String referralCode = referralCodeGenerator.normalizeCode(rawReferralCode);
        if (!referralCodeGenerator.isValidFormat(referralCode)) {
            throw new InvalidReferralCodeException("Mã giới thiệu phải gồm đúng 8 ký tự chữ cái (A-Z)");
        }

        AffiliateConfig config = affiliateConfigService.getConfigEntity();
        Account referrer = accountRepository.findByReferralCode(referralCode)
                .orElseThrow(() -> new InvalidReferralCodeException("Mã giới thiệu không hợp lệ"));

        validateReferral(newUser, referrer);

        if (affiliateReferralRepository.existsByReferredUser_Id(newUser.getId())) {
            throw new DuplicateAffiliateRewardException("Tài khoản này đã được gắn referral trước đó");
        }

        AffiliateReferral referral = new AffiliateReferral();
        referral.setReferrerUser(referrer);
        referral.setReferredUser(newUser);
        referral.setReferralCodeUsed(referralCode);
        referral.setStatus(AffiliateReferralStatus.SUCCESS);
        referral = affiliateReferralRepository.save(referral);

        newUser.setReferredBy(referrer);
        accountRepository.save(newUser);

        if (!Boolean.TRUE.equals(config.getEnabled())) {
            log.info("Affiliate disabled, skip reward for referral id={}", referral.getId());
            return;
        }

        rewardReferral(referral, config);
    }

    @Transactional(readOnly = true)
    public UserAffiliateInfoResponse getMyAffiliateInfo(Integer userId) {
        Account account = getAccount(userId);
        long totalSuccessfulReferrals = affiliateReferralRepository.countByReferrerUser_IdAndStatusIn(userId, SUCCESSFUL_STATUSES);
        long totalRewardsReceived = affiliateRewardLogRepository.countByBeneficiaryUser_IdAndStatus(
                userId,
                AffiliateRewardLogStatus.CREATED
        );

        AffiliateConfigSummaryResponse configSummary = affiliateConfigService.getConfigSummary();

        return UserAffiliateInfoResponse.builder()
                .userId(account.getId())
                .referralCode(account.getReferralCode())
                .referralLink(buildReferralLink(account.getReferralCode()))
                .totalSuccessfulReferrals(totalSuccessfulReferrals)
                .totalRewardsReceived(totalRewardsReceived)
                .affiliateEnabled(configSummary.getEnabled())
                .currentAffiliateConfigSummary(configSummary)
                .build();
    }

    @Transactional(readOnly = true)
    public List<UserReferralItemResponse> getMyReferrals(Integer userId) {
        List<AffiliateReferral> referrals = affiliateReferralRepository.findByReferrerUser_IdOrderByCreatedAtDesc(userId);
        Map<Long, List<AffiliateRewardLog>> logsByReferralId = loadRewardLogsByReferral(referrals.stream().map(AffiliateReferral::getId).toList());

        return referrals.stream()
                .map(referral -> mapToUserReferralItem(referral, logsByReferralId.getOrDefault(referral.getId(), List.of())))
                .toList();
    }

    @Transactional
    public int backfillMissingReferralCodes() {
        List<Integer> missingIds = accountRepository.findAccountIdsMissingReferralCode();
        if (missingIds.isEmpty()) {
            return 0;
        }

        List<Account> accounts = accountRepository.findByIdIn(missingIds);
        int updated = 0;
        for (Account account : accounts) {
            if (!StringUtils.hasText(account.getReferralCode())) {
                account.setReferralCode(referralCodeGenerator.generateUniqueCode());
                updated++;
            }
        }
        accountRepository.saveAll(accounts);
        return updated;
    }

    @Transactional(readOnly = true)
    public String buildReferralLink(String referralCode) {
        String base = frontendBaseUrl.endsWith("/") ? frontendBaseUrl.substring(0, frontendBaseUrl.length() - 1) : frontendBaseUrl;
        return base + "/register?ref=" + referralCode;
    }

    private void validateReferral(Account newUser, Account referrer) {
        if (Objects.equals(newUser.getId(), referrer.getId())) {
            throw new SelfReferralNotAllowedException("Không được tự giới thiệu chính mình");
        }

        if (newUser.getLoginName().equalsIgnoreCase(referrer.getLoginName())) {
            throw new SelfReferralNotAllowedException("Không được dùng mã giới thiệu của chính mình");
        }

        if (StringUtils.hasText(newUser.getEmail())
                && StringUtils.hasText(referrer.getEmail())
                && newUser.getEmail().trim().equalsIgnoreCase(referrer.getEmail().trim())) {
            throw new SelfReferralNotAllowedException("Email người giới thiệu và người được giới thiệu không được trùng nhau");
        }
    }

    private void rewardReferral(AffiliateReferral referral, AffiliateConfig config) {
        ensureRewardNotExists(referral.getId(), AffiliateRewardRole.REFERRER);

        Voucher referrerVoucher = voucherService.createAffiliateVoucher(
                referral.getReferrerUser(),
                config.getReferrerRewardType(),
                toMoney(config.getReferrerRewardValue()),
                toMoney(config.getMinOrderValue()),
                toMoney(config.getMaxDiscountValue()),
                config.getVoucherExpiryDays(),
                referral.getId(),
                "AFFILIATE_REFERRER",
                config.getReferrerVoucherName(),
                config.getReferrerVoucherContent()
        );
        AffiliateRewardLog referrerLog = new AffiliateRewardLog();
        referrerLog.setReferral(referral);
        referrerLog.setBeneficiaryUser(referral.getReferrerUser());
        referrerLog.setRewardRole(AffiliateRewardRole.REFERRER);
        referrerLog.setVoucher(referrerVoucher);
        referrerLog.setRewardType(config.getReferrerRewardType());
        referrerLog.setRewardValue(config.getReferrerRewardValue());
        referrerLog.setStatus(AffiliateRewardLogStatus.CREATED);
        affiliateRewardLogRepository.save(referrerLog);

        referral.setStatus(AffiliateReferralStatus.REWARDED);
        referral.setRewardedAt(LocalDateTime.now());
        affiliateReferralRepository.save(referral);

        referral.getReferredUser().setAffiliateRewarded(true);
        accountRepository.save(referral.getReferredUser());

        log.info("Rewarded referral id={} for referrer={} only",
                referral.getId(), referral.getReferrerUser().getId());
    }

    private void ensureRewardNotExists(Long referralId, AffiliateRewardRole role) {
        if (affiliateRewardLogRepository.existsByReferral_IdAndRewardRole(referralId, role)) {
            throw new DuplicateAffiliateRewardException("Referral da duoc cap thuong cho vai tro " + role);
        }
    }

    private Long toMoney(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }
        return amount.setScale(0, RoundingMode.HALF_UP).longValueExact();
    }

    private Account getAccount(Integer accountId) {
        return accountRepository.findById(accountId)
                .orElseThrow(() -> new InvalidReferralCodeException("Khong tim thay tai khoan"));
    }

    private Map<Long, List<AffiliateRewardLog>> loadRewardLogsByReferral(Collection<Long> referralIds) {
        if (referralIds.isEmpty()) {
            return Map.of();
        }
        List<AffiliateRewardLog> logs = affiliateRewardLogRepository.findByReferral_IdIn(referralIds);
        Map<Long, List<AffiliateRewardLog>> map = new HashMap<>();
        for (AffiliateRewardLog log : logs) {
            map.computeIfAbsent(log.getReferral().getId(), key -> new java.util.ArrayList<>()).add(log);
        }
        map.values().forEach(list -> list.sort(Comparator.comparing(AffiliateRewardLog::getCreatedAt)));
        return map;
    }

    private UserReferralItemResponse mapToUserReferralItem(AffiliateReferral referral, List<AffiliateRewardLog> logs) {
        Account referredUser = referral.getReferredUser();
        return UserReferralItemResponse.builder()
                .referralId(referral.getId())
                .referredUserId(referredUser.getId())
                .referredLoginName(referredUser.getLoginName())
                .referredEmailMasked(maskEmail(referredUser.getEmail()))
                .referralCodeUsed(referral.getReferralCodeUsed())
                .status(referral.getStatus())
                .createdAt(referral.getCreatedAt())
                .rewardedAt(referral.getRewardedAt())
                .rewards(logs.stream().map(this::mapReward).toList())
                .build();
    }

    private ReferralRewardInfoResponse mapReward(AffiliateRewardLog log) {
        return ReferralRewardInfoResponse.builder()
                .rewardRole(log.getRewardRole())
                .status(log.getStatus())
                .rewardType(log.getRewardType())
                .rewardValue(log.getRewardValue())
                .voucherId(log.getVoucher() != null ? log.getVoucher().getId() : null)
                .voucherCode(log.getVoucher() != null ? log.getVoucher().getCode() : null)
                .build();
    }

    private String maskEmail(String email) {
        if (!StringUtils.hasText(email) || !email.contains("@")) {
            return null;
        }
        String[] parts = email.split("@");
        String local = parts[0];
        String domain = parts[1];
        if (local.length() <= 2) {
            return "*@" + domain;
        }
        return local.substring(0, 2) + "***@" + domain;
    }
}
