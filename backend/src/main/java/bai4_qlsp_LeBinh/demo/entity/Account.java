package bai4_qlsp_LeBinh.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "account")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "login_name", nullable = false, unique = true, length = 100)
    private String loginName;

    @Column(name = "email", unique = true, length = 150)
    private String email;

    @Column(name = "full_name", length = 150)
    private String fullName;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(name = "auth_provider", nullable = false, length = 30)
    private String authProvider = "LOCAL";

    @Column(name = "referral_code", unique = true, length = 8)
    private String referralCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referred_by_account_id")
    private Account referredBy;

    @Column(name = "affiliate_rewarded", nullable = false)
    private Boolean affiliateRewarded = false;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "account_role",
            joinColumns = @JoinColumn(name = "account_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();
}
