package bai4_qlsp_LeBinh.demo.entity;

import bai4_qlsp_LeBinh.demo.enums.AffiliateReferralStatus;
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

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "affiliate_referrals")
public class AffiliateReferral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referrer_user_id", nullable = false)
    private Account referrerUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referred_user_id", nullable = false)
    private Account referredUser;

    @Column(name = "referral_code_used", nullable = false, length = 8)
    private String referralCodeUsed;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AffiliateReferralStatus status = AffiliateReferralStatus.SUCCESS;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "rewarded_at")
    private LocalDateTime rewardedAt;

    @Column(length = 255)
    private String note;

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
