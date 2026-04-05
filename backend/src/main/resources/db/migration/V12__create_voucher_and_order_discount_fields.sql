CREATE TABLE voucher (
    id BIGINT NOT NULL AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    discount_type VARCHAR(20) NOT NULL,
    discount_value BIGINT NOT NULL,
    min_order_value BIGINT NULL,
    max_discount BIGINT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    usage_limit INT NOT NULL DEFAULT 0,
    used_count INT NOT NULL DEFAULT 0,
    active BIT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT pk_voucher PRIMARY KEY (id),
    CONSTRAINT uk_voucher_code UNIQUE (code)
);

ALTER TABLE orders
    ADD COLUMN voucher_code VARCHAR(50) NULL,
    ADD COLUMN subtotal_amount BIGINT NULL,
    ADD COLUMN discount_amount BIGINT NULL DEFAULT 0,
    ADD COLUMN final_total BIGINT NULL;
