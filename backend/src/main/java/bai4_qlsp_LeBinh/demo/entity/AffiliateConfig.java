package bai4_qlsp_LeBinh.demo.entity;

import bai4_qlsp_LeBinh.demo.enums.VoucherDiscountType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "affiliate_config")
public class AffiliateConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Boolean enabled = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "referrer_reward_type", nullable = false, length = 20)
    private VoucherDiscountType referrerRewardType;

    @Column(name = "referrer_reward_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal referrerRewardValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "referee_reward_type", nullable = false, length = 20)
    private VoucherDiscountType refereeRewardType;

    @Column(name = "referee_reward_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal refereeRewardValue;

    @Column(name = "voucher_expiry_days", nullable = false)
    private Integer voucherExpiryDays;

    @Column(name = "min_order_value", precision = 12, scale = 2)
    private BigDecimal minOrderValue;

    @Column(name = "max_discount_value", precision = 12, scale = 2)
    private BigDecimal maxDiscountValue;

    @Column(name = "referrer_voucher_name", nullable = false, length = 120)
    private String referrerVoucherName;

    @Column(name = "referrer_voucher_content", length = 255)
    private String referrerVoucherContent;

    @Column(name = "referee_voucher_name", nullable = false, length = 120)
    private String refereeVoucherName;

    @Column(name = "referee_voucher_content", length = 255)
    private String refereeVoucherContent;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "description", length = 255)
    private String description;

    @PrePersist
    @PreUpdate
    public void touchUpdatedAt() {
        this.updatedAt = LocalDateTime.now();
    }
}
