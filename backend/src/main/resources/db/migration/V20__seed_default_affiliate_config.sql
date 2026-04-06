INSERT INTO affiliate_config (
    enabled,
    referrer_reward_type,
    referrer_reward_value,
    referee_reward_type,
    referee_reward_value,
    voucher_expiry_days,
    min_order_value,
    max_discount_value,
    updated_at,
    updated_by,
    description
) VALUES (
    1,
    'PERCENT',
    30.00,
    'FIXED',
    10.00,
    30,
    0.00,
    NULL,
    NOW(),
    'SYSTEM',
    'Default affiliate program config'
);
