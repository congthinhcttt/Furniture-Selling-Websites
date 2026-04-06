CREATE TABLE affiliate_reward_logs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    referral_id BIGINT NOT NULL,
    beneficiary_user_id INT NOT NULL,
    reward_role VARCHAR(20) NOT NULL,
    voucher_id BIGINT NULL,
    reward_type VARCHAR(20) NOT NULL,
    reward_value DECIMAL(10,2) NOT NULL,
    created_at DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message VARCHAR(500) NULL,
    CONSTRAINT pk_affiliate_reward_logs PRIMARY KEY (id),
    CONSTRAINT uk_affiliate_reward_logs_referral_role UNIQUE (referral_id, reward_role),
    CONSTRAINT fk_affiliate_reward_logs_referral
        FOREIGN KEY (referral_id) REFERENCES affiliate_referrals (id),
    CONSTRAINT fk_affiliate_reward_logs_beneficiary
        FOREIGN KEY (beneficiary_user_id) REFERENCES account (id),
    CONSTRAINT fk_affiliate_reward_logs_voucher
        FOREIGN KEY (voucher_id) REFERENCES voucher (id)
);

CREATE INDEX idx_affiliate_reward_logs_referral_id ON affiliate_reward_logs (referral_id);
CREATE INDEX idx_affiliate_reward_logs_beneficiary_user_id ON affiliate_reward_logs (beneficiary_user_id);
