ALTER TABLE affiliate_config
    ADD COLUMN referrer_voucher_name VARCHAR(120) NOT NULL DEFAULT 'Referral Reward Voucher',
    ADD COLUMN referrer_voucher_content VARCHAR(255) NULL,
    ADD COLUMN referee_voucher_name VARCHAR(120) NOT NULL DEFAULT 'Welcome Voucher',
    ADD COLUMN referee_voucher_content VARCHAR(255) NULL;

UPDATE affiliate_config
SET referrer_voucher_content = COALESCE(referrer_voucher_content, 'Voucher danh cho nguoi gioi thieu'),
    referee_voucher_content = COALESCE(referee_voucher_content, 'Voucher chao mung thanh vien moi');
