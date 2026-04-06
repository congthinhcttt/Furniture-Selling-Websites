package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.response.AdminAffiliateReferralItemResponse;
import bai4_qlsp_LeBinh.demo.dto.response.AdminAffiliateReferralPageResponse;
import bai4_qlsp_LeBinh.demo.dto.response.ReferralRewardInfoResponse;
import bai4_qlsp_LeBinh.demo.entity.AffiliateReferral;
import bai4_qlsp_LeBinh.demo.entity.AffiliateRewardLog;
import bai4_qlsp_LeBinh.demo.enums.AffiliateReferralStatus;
import bai4_qlsp_LeBinh.demo.repository.AffiliateReferralRepository;
import bai4_qlsp_LeBinh.demo.repository.AffiliateRewardLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminAffiliateService {

    private final AffiliateReferralRepository affiliateReferralRepository;
    private final AffiliateRewardLogRepository affiliateRewardLogRepository;
    private final AffiliateService affiliateService;

    public AdminAffiliateService(AffiliateReferralRepository affiliateReferralRepository,
                                 AffiliateRewardLogRepository affiliateRewardLogRepository,
                                 AffiliateService affiliateService) {
        this.affiliateReferralRepository = affiliateReferralRepository;
        this.affiliateRewardLogRepository = affiliateRewardLogRepository;
        this.affiliateService = affiliateService;
    }

    @Transactional(readOnly = true)
    public AdminAffiliateReferralPageResponse getAllReferrals(String keyword, String status, int page, int size) {
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.max(1, Math.min(size, 50)),
                Sort.by(Sort.Order.desc("createdAt"))
        );

        Page<AffiliateReferral> resultPage;
        if (status != null && !status.isBlank()) {
            resultPage = affiliateReferralRepository.findByStatus(AffiliateReferralStatus.valueOf(status.trim().toUpperCase()), pageable);
        } else {
            String normalizedKeyword = keyword != null && !keyword.isBlank() ? keyword.trim() : null;
            resultPage = affiliateReferralRepository.searchAll(normalizedKeyword, pageable);
        }

        Map<Long, List<AffiliateRewardLog>> logsByReferral = loadLogs(resultPage.getContent().stream().map(AffiliateReferral::getId).toList());

        return AdminAffiliateReferralPageResponse.builder()
                .items(resultPage.getContent().stream()
                        .map(referral -> toItem(referral, logsByReferral.getOrDefault(referral.getId(), List.of())))
                        .toList())
                .currentPage(resultPage.getNumber() + 1)
                .pageSize(resultPage.getSize())
                .totalItems(resultPage.getTotalElements())
                .totalPages(resultPage.getTotalPages())
                .build();
    }

    @Transactional
    public int backfillReferralCodes() {
        return affiliateService.backfillMissingReferralCodes();
    }

    private AdminAffiliateReferralItemResponse toItem(AffiliateReferral referral, List<AffiliateRewardLog> logs) {
        return AdminAffiliateReferralItemResponse.builder()
                .referralId(referral.getId())
                .referrerUserId(referral.getReferrerUser().getId())
                .referrerLoginName(referral.getReferrerUser().getLoginName())
                .referrerEmail(referral.getReferrerUser().getEmail())
                .referredUserId(referral.getReferredUser().getId())
                .referredLoginName(referral.getReferredUser().getLoginName())
                .referredEmail(referral.getReferredUser().getEmail())
                .referralCodeUsed(referral.getReferralCodeUsed())
                .status(referral.getStatus())
                .createdAt(referral.getCreatedAt())
                .rewardedAt(referral.getRewardedAt())
                .rewards(logs.stream().map(this::toReward).toList())
                .build();
    }

    private ReferralRewardInfoResponse toReward(AffiliateRewardLog rewardLog) {
        return ReferralRewardInfoResponse.builder()
                .rewardRole(rewardLog.getRewardRole())
                .status(rewardLog.getStatus())
                .rewardType(rewardLog.getRewardType())
                .rewardValue(rewardLog.getRewardValue())
                .voucherId(rewardLog.getVoucher() != null ? rewardLog.getVoucher().getId() : null)
                .voucherCode(rewardLog.getVoucher() != null ? rewardLog.getVoucher().getCode() : null)
                .build();
    }

    private Map<Long, List<AffiliateRewardLog>> loadLogs(Collection<Long> referralIds) {
        if (referralIds.isEmpty()) {
            return Map.of();
        }
        List<AffiliateRewardLog> logs = affiliateRewardLogRepository.findByReferral_IdIn(referralIds);
        Map<Long, List<AffiliateRewardLog>> mapped = new HashMap<>();
        for (AffiliateRewardLog log : logs) {
            mapped.computeIfAbsent(log.getReferral().getId(), key -> new java.util.ArrayList<>()).add(log);
        }
        return mapped;
    }
}
