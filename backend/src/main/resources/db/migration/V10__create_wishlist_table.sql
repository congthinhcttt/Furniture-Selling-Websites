CREATE TABLE wishlist (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_wishlist PRIMARY KEY (id),
    CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES account(id),
    CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES product(id),
    CONSTRAINT uk_wishlist_user_product UNIQUE (user_id, product_id)
);

CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX idx_wishlist_product_id ON wishlist(product_id);
