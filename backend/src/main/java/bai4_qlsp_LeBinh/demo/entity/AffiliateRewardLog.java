package bai4_qlsp_LeBinh.demo.entity;

import bai4_qlsp_LeBinh.demo.enums.AffiliateRewardLogStatus;
import bai4_qlsp_LeBinh.demo.enums.AffiliateRewardRole;
import bai4_qlsp_LeBinh.demo.enums.VoucherDiscountType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
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
@Table(name = "affiliate_reward_logs")
public class AffiliateRewardLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referral_id", nullable = false)
    private AffiliateReferral referral;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "beneficiary_user_id", nullable = false)
    private Account beneficiaryUser;

    @Enumerated(EnumType.STRING)
    @Column(name = "reward_role", nullable = false, length = 20)
    private AffiliateRewardRole rewardRole;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id")
    private Voucher voucher;

    @Enumerated(EnumType.STRING)
    @Column(name = "reward_type", nullable = false, length = 20)
    private VoucherDiscountType rewardType;

    @Column(name = "reward_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal rewardValue;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AffiliateRewardLogStatus status;

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
