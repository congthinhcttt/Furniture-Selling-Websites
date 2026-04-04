ALTER TABLE account
    ADD COLUMN google_id VARCHAR(255) NULL,
    ADD COLUMN auth_provider VARCHAR(30) NOT NULL DEFAULT 'LOCAL';

ALTER TABLE account
    ADD CONSTRAINT uk_account_google_id UNIQUE (google_id);
