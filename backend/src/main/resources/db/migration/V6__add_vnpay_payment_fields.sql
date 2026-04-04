ALTER TABLE orders
    ADD COLUMN payment_status VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
    ADD COLUMN vnp_txn_ref VARCHAR(100) NULL,
    ADD COLUMN vnp_transaction_no VARCHAR(100) NULL,
    ADD COLUMN bank_code VARCHAR(50) NULL,
    ADD COLUMN response_code VARCHAR(10) NULL,
    ADD COLUMN pay_date DATETIME NULL,
    ADD COLUMN updated_at DATETIME NULL;

ALTER TABLE orders
    ADD CONSTRAINT uk_orders_vnp_txn_ref UNIQUE (vnp_txn_ref);
