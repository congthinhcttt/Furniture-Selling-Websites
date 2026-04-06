CREATE TABLE affiliate_config (
    id BIGINT NOT NULL AUTO_INCREMENT,
    enabled BIT NOT NULL,
    referrer_reward_type VARCHAR(20) NOT NULL,
    referrer_reward_value DECIMAL(10,2) NOT NULL,
    referee_reward_type VARCHAR(20) NOT NULL,
    referee_reward_value DECIMAL(10,2) NOT NULL,
    voucher_expiry_days INT NOT NULL,
    min_order_value DECIMAL(12,2) NULL,
    max_discount_value DECIMAL(12,2) NULL,
    updated_at DATETIME NOT NULL,
    updated_by VARCHAR(100) NULL,
    description VARCHAR(255) NULL,
    CONSTRAINT pk_affiliate_config PRIMARY KEY (id)
);
