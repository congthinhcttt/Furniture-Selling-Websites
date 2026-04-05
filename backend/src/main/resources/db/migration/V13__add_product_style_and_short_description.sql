ALTER TABLE product
    ADD COLUMN short_description VARCHAR(255) NULL AFTER description,
    ADD COLUMN style VARCHAR(100) NULL AFTER warranty;
