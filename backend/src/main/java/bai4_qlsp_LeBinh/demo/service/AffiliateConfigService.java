package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.request.AffiliateConfigUpdateRequest;
import bai4_qlsp_LeBinh.demo.dto.response.AffiliateConfigResponse;
import bai4_qlsp_LeBinh.demo.dto.response.AffiliateConfigSummaryResponse;
import bai4_qlsp_LeBinh.demo.entity.AffiliateConfig;
import bai4_qlsp_LeBinh.demo.enums.VoucherDiscountType;
import bai4_qlsp_LeBinh.demo.exception.InvalidAffiliateConfigException;
import bai4_qlsp_LeBinh.demo.repository.AffiliateConfigRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class AffiliateConfigService {

    private final AffiliateConfigRepository affiliateConfigRepository;

    public AffiliateConfigService(AffiliateConfigRepository affiliateConfigRepository) {
        this.affiliateConfigRepository = affiliateConfigRepository;
    }

    @Transactional(readOnly = true)
    public AffiliateConfig getConfigEntity() {
        return affiliateConfigRepository.findTopByOrderByUpdatedAtDescIdDesc()
                .orElseThrow(() -> new InvalidAffiliateConfigException("Affiliate config chua duoc khoi tao"));
    }

    @Transactional(readOnly = true)
    public AffiliateConfigResponse getConfig() {
        return mapToResponse(getConfigEntity());
    }

    @Transactional(readOnly = true)
    public AffiliateConfigSummaryResponse getConfigSummary() {
        AffiliateConfig config = getConfigEntity();
        AffiliateConfigSummaryResponse response = new AffiliateConfigSummaryResponse();
        response.setEnabled(config.getEnabled());
        response.setReferrerRewardType(config.getReferrerRewardType());
        response.setReferrerRewardValue(config.getReferrerRewardValue());
        response.setRefereeRewardType(config.getRefereeRewardType());
        response.setRefereeRewardValue(config.getRefereeRewardValue());
        response.setVoucherExpiryDays(config.getVoucherExpiryDays());
        response.setMinOrderValue(config.getMinOrderValue());
        response.setMaxDiscountValue(config.getMaxDiscountValue());
        response.setReferrerVoucherName(config.getReferrerVoucherName());
        response.setReferrerVoucherContent(config.getReferrerVoucherContent());
        response.setRefereeVoucherName(config.getRefereeVoucherName());
        response.setRefereeVoucherContent(config.getRefereeVoucherContent());
        return response;
    }

    @Transactional
    public AffiliateConfigResponse updateConfig(AffiliateConfigUpdateRequest request, Authentication authentication) {
        validateConfig(request);

        AffiliateConfig config = getConfigEntity();
        config.setEnabled(request.getEnabled());
        config.setReferrerRewardType(request.getReferrerRewardType());
        config.setReferrerRewardValue(request.getReferrerRewardValue());
        config.setRefereeRewardType(request.getRefereeRewardType());
        config.setRefereeRewardValue(request.getRefereeRewardValue());
        config.setVoucherExpiryDays(request.getVoucherExpiryDays());
        config.setMinOrderValue(request.getMinOrderValue());
        config.setMaxDiscountValue(request.getMaxDiscountValue());
        config.setReferrerVoucherName(request.getReferrerVoucherName().trim());
        config.setReferrerVoucherContent(request.getReferrerVoucherContent() != null
                ? request.getReferrerVoucherContent().trim()
                : null);
        config.setRefereeVoucherName(request.getRefereeVoucherName().trim());
        config.setRefereeVoucherContent(request.getRefereeVoucherContent() != null
                ? request.getRefereeVoucherContent().trim()
                : null);
        config.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        config.setUpdatedBy(authentication != null ? authentication.getName() : "SYSTEM");

        return mapToResponse(affiliateConfigRepository.save(config));
    }

    private void validateConfig(AffiliateConfigUpdateRequest request) {
        validateReward(request.getReferrerRewardType(), request.getReferrerRewardValue(), "nguoi gioi thieu");
        validateReward(request.getRefereeRewardType(), request.getRefereeRewardValue(), "nguoi duoc gioi thieu");

        if (request.getVoucherExpiryDays() == null || request.getVoucherExpiryDays() <= 0) {
            throw new InvalidAffiliateConfigException("voucherExpiryDays phai lon hon 0");
        }

        if (request.getMinOrderValue() != null && request.getMinOrderValue().compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidAffiliateConfigException("minOrderValue khong duoc am");
        }

        if (request.getMaxDiscountValue() != null && request.getMaxDiscountValue().compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidAffiliateConfigException("maxDiscountValue khong duoc am");
        }

        if (request.getReferrerVoucherName() == null || request.getReferrerVoucherName().trim().isEmpty()) {
            throw new InvalidAffiliateConfigException("Ten voucher cho nguoi gioi thieu khong duoc de trong");
        }

        if (request.getRefereeVoucherName() == null || request.getRefereeVoucherName().trim().isEmpty()) {
            throw new InvalidAffiliateConfigException("Ten voucher cho nguoi duoc gioi thieu khong duoc de trong");
        }
    }

    private void validateReward(VoucherDiscountType rewardType, BigDecimal rewardValue, String roleName) {
        if (rewardType == null || rewardValue == null) {
            throw new InvalidAffiliateConfigException("Thieu cau hinh thuong cho " + roleName);
        }
        if (rewardValue.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidAffiliateConfigException("Gia tri thuong cho " + roleName + " phai lon hon 0");
        }
        if (rewardType == VoucherDiscountType.PERCENT
                && rewardValue.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new InvalidAffiliateConfigException("Thuong theo phan tram khong duoc vuot qua 100");
        }
    }

    private AffiliateConfigResponse mapToResponse(AffiliateConfig config) {
        AffiliateConfigResponse response = new AffiliateConfigResponse();
        response.setId(config.getId());
        response.setEnabled(config.getEnabled());
        response.setReferrerRewardType(config.getReferrerRewardType());
        response.setReferrerRewardValue(config.getReferrerRewardValue());
        response.setRefereeRewardType(config.getRefereeRewardType());
        response.setRefereeRewardValue(config.getRefereeRewardValue());
        response.setVoucherExpiryDays(config.getVoucherExpiryDays());
        response.setMinOrderValue(config.getMinOrderValue());
        response.setMaxDiscountValue(config.getMaxDiscountValue());
        response.setReferrerVoucherName(config.getReferrerVoucherName());
        response.setReferrerVoucherContent(config.getReferrerVoucherContent());
        response.setRefereeVoucherName(config.getRefereeVoucherName());
        response.setRefereeVoucherContent(config.getRefereeVoucherContent());
        response.setDescription(config.getDescription());
        response.setUpdatedAt(config.getUpdatedAt());
        response.setUpdatedBy(config.getUpdatedBy());
        return response;
    }
}
