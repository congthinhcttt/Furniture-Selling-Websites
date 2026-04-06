ALTER TABLE account
    ADD COLUMN referral_code VARCHAR(8) NULL,
    ADD COLUMN referred_by_account_id INT NULL,
    ADD COLUMN affiliate_rewarded BIT NOT NULL DEFAULT 0;

ALTER TABLE account
    ADD CONSTRAINT uk_account_referral_code UNIQUE (referral_code);

ALTER TABLE account
    ADD CONSTRAINT fk_account_referred_by_account
        FOREIGN KEY (referred_by_account_id) REFERENCES account (id);

ALTER TABLE voucher
    ADD COLUMN created_for_user_id INT NULL,
    ADD COLUMN source VARCHAR(30) NOT NULL DEFAULT 'ADMIN',
    ADD COLUMN affiliate_referral_id BIGINT NULL;

ALTER TABLE voucher
    ADD CONSTRAINT fk_voucher_created_for_user
        FOREIGN KEY (created_for_user_id) REFERENCES account (id);

CREATE INDEX idx_voucher_created_for_user_id ON voucher (created_for_user_id);
CREATE INDEX idx_voucher_source ON voucher (source);
