CREATE TABLE user_address (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    label VARCHAR(100) NULL,
    is_default BIT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_user_address_account FOREIGN KEY (account_id) REFERENCES account(id)
);

CREATE INDEX idx_user_address_account_updated ON user_address(account_id, updated_at DESC);
