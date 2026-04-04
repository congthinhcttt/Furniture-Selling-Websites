ALTER TABLE orders
    ADD COLUMN order_code VARCHAR(50) NULL AFTER id;

UPDATE orders
SET order_code = CONCAT('ORD', LPAD(id, 6, '0'))
WHERE order_code IS NULL;

ALTER TABLE orders
    MODIFY COLUMN order_code VARCHAR(50) NOT NULL,
    ADD CONSTRAINT uk_orders_order_code UNIQUE (order_code);

CREATE TABLE shipper (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    avatar_url VARCHAR(500) NULL,
    vehicle_type VARCHAR(50) NULL,
    vehicle_plate VARCHAR(30) NULL,
    active BIT NOT NULL DEFAULT b'1',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NULL
);

CREATE TABLE delivery (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    current_status VARCHAR(50) NOT NULL,
    shipper_id BIGINT NULL,
    eta_at DATETIME NULL,
    destination_latitude DECIMAL(10, 7) NULL,
    destination_longitude DECIMAL(10, 7) NULL,
    delivered_at DATETIME NULL,
    proof_image VARCHAR(500) NULL,
    proof_note TEXT NULL,
    fail_reason TEXT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NULL,
    CONSTRAINT uk_delivery_order_id UNIQUE (order_id),
    CONSTRAINT fk_delivery_order FOREIGN KEY (order_id) REFERENCES orders (id),
    CONSTRAINT fk_delivery_shipper FOREIGN KEY (shipper_id) REFERENCES shipper (id)
);

CREATE TABLE delivery_status_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    delivery_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    description TEXT NULL,
    note TEXT NULL,
    changed_by VARCHAR(150) NULL,
    changed_by_role VARCHAR(30) NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_delivery_status_history_delivery FOREIGN KEY (delivery_id) REFERENCES delivery (id)
);

CREATE TABLE shipper_location (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    delivery_id BIGINT NOT NULL,
    shipper_id BIGINT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    heading DECIMAL(5, 2) NULL,
    speed_kph DECIMAL(5, 2) NULL,
    recorded_at DATETIME NOT NULL,
    CONSTRAINT fk_shipper_location_delivery FOREIGN KEY (delivery_id) REFERENCES delivery (id),
    CONSTRAINT fk_shipper_location_shipper FOREIGN KEY (shipper_id) REFERENCES shipper (id)
);
