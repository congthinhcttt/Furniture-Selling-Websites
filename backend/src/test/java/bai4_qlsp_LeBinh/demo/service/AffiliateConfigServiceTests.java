package bai4_qlsp_LeBinh.demo.service;

import bai4_qlsp_LeBinh.demo.dto.request.AffiliateConfigUpdateRequest;
import bai4_qlsp_LeBinh.demo.entity.AffiliateConfig;
import bai4_qlsp_LeBinh.demo.enums.VoucherDiscountType;
import bai4_qlsp_LeBinh.demo.exception.InvalidAffiliateConfigException;
import bai4_qlsp_LeBinh.demo.repository.AffiliateConfigRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.List;

class AffiliateConfigServiceTests {

    @Test
    void updateConfig_shouldRejectPercentGreaterThan100() {
        AffiliateConfigRepository repository = Mockito.mock(AffiliateConfigRepository.class);
        AffiliateConfig existing = new AffiliateConfig();
        existing.setId(1L);
        existing.setEnabled(true);
        existing.setReferrerRewardType(VoucherDiscountType.PERCENT);
        existing.setReferrerRewardValue(BigDecimal.valueOf(30));
        existing.setRefereeRewardType(VoucherDiscountType.FIXED);
        existing.setRefereeRewardValue(BigDecimal.valueOf(10));
        existing.setVoucherExpiryDays(30);
        Mockito.when(repository.findAll()).thenReturn(List.of(existing));

        AffiliateConfigService service = new AffiliateConfigService(repository);
        AffiliateConfigUpdateRequest request = AffiliateConfigUpdateRequest.builder()
                .enabled(true)
                .referrerRewardType(VoucherDiscountType.PERCENT)
                .referrerRewardValue(BigDecimal.valueOf(120))
                .refereeRewardType(VoucherDiscountType.FIXED)
                .refereeRewardValue(BigDecimal.valueOf(10))
                .voucherExpiryDays(30)
                .build();

        Assertions.assertThrows(InvalidAffiliateConfigException.class,
                () -> service.updateConfig(request, null));
    }
}
