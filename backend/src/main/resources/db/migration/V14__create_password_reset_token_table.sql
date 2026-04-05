CREATE TABLE password_reset_token (
    id BIGINT NOT NULL AUTO_INCREMENT,
    account_id INT NOT NULL,
    token VARCHAR(120) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_password_reset_token_token (token),
    UNIQUE KEY uk_password_reset_token_account_id (account_id),
    CONSTRAINT fk_password_reset_token_account FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE
);
