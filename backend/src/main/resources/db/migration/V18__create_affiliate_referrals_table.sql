CREATE TABLE affiliate_referrals (
    id BIGINT NOT NULL AUTO_INCREMENT,
    referrer_user_id INT NOT NULL,
    referred_user_id INT NOT NULL,
    referral_code_used VARCHAR(8) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at DATETIME NOT NULL,
    rewarded_at DATETIME NULL,
    note VARCHAR(255) NULL,
    CONSTRAINT pk_affiliate_referrals PRIMARY KEY (id),
    CONSTRAINT uk_affiliate_referrals_referred_user UNIQUE (referred_user_id),
    CONSTRAINT fk_affiliate_referrals_referrer
        FOREIGN KEY (referrer_user_id) REFERENCES account (id),
    CONSTRAINT fk_affiliate_referrals_referred
        FOREIGN KEY (referred_user_id) REFERENCES account (id)
);

CREATE INDEX idx_affiliate_referrals_referrer_user_id ON affiliate_referrals (referrer_user_id);
CREATE INDEX idx_affiliate_referrals_referral_code_used ON affiliate_referrals (referral_code_used);
CREATE INDEX idx_affiliate_referrals_status ON affiliate_referrals (status);
