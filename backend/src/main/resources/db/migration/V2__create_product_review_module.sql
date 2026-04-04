CREATE TABLE IF NOT EXISTS product_review (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    user_id INT NOT NULL,
    order_id BIGINT NOT NULL,
    order_item_id BIGINT NOT NULL,
    overall_rating INT NOT NULL,
    quality_rating INT NOT NULL,
    design_rating INT NOT NULL,
    comfort_rating INT NOT NULL,
    value_rating INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    content VARCHAR(2000) NOT NULL,
    anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL,
    admin_note VARCHAR(500) NULL,
    is_edited BOOLEAN NOT NULL DEFAULT FALSE,
    like_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME NULL,
    CONSTRAINT fk_product_review_product FOREIGN KEY (product_id) REFERENCES product(id),
    CONSTRAINT fk_product_review_user FOREIGN KEY (user_id) REFERENCES account(id),
    CONSTRAINT fk_product_review_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_product_review_order_item FOREIGN KEY (order_item_id) REFERENCES order_item(id),
    CONSTRAINT uq_product_review_user_product UNIQUE (user_id, product_id)
);

CREATE INDEX idx_review_product_status_created ON product_review(product_id, status, created_at);
CREATE INDEX idx_review_user_product_deleted ON product_review(user_id, product_id, deleted_at);
CREATE INDEX idx_review_status_deleted ON product_review(status, deleted_at);
CREATE INDEX idx_review_order_item ON product_review(order_item_id);

CREATE TABLE IF NOT EXISTS product_review_image (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    review_id BIGINT NOT NULL,
    image_url LONGTEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_product_review_image_review FOREIGN KEY (review_id) REFERENCES product_review(id) ON DELETE CASCADE
);

CREATE INDEX idx_review_image_review_sort ON product_review_image(review_id, sort_order);

CREATE TABLE IF NOT EXISTS review_helpful (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    review_id BIGINT NOT NULL,
    user_id INT NOT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_review_helpful_review FOREIGN KEY (review_id) REFERENCES product_review(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_helpful_user FOREIGN KEY (user_id) REFERENCES account(id),
    CONSTRAINT uq_review_helpful_review_user UNIQUE (review_id, user_id)
);

CREATE INDEX idx_review_helpful_review_user ON review_helpful(review_id, user_id);
