SET @product_table_exists = (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'product'
);

SET @width_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'product'
      AND column_name = 'width'
);
SET @width_sql = IF(
    @product_table_exists = 1 AND @width_exists = 0,
    'ALTER TABLE product ADD COLUMN width INT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @width_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @length_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'product'
      AND column_name = 'length'
);
SET @length_sql = IF(
    @product_table_exists = 1 AND @length_exists = 0,
    'ALTER TABLE product ADD COLUMN length INT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @length_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @stock_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'product'
      AND column_name = 'stock_quantity'
);
SET @stock_sql = IF(
    @product_table_exists = 1 AND @stock_exists = 0,
    'ALTER TABLE product ADD COLUMN stock_quantity INT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @stock_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE product
SET width = 100
WHERE @product_table_exists = 1
  AND (width IS NULL OR width < 1);

UPDATE product
SET length = 100
WHERE @product_table_exists = 1
  AND (length IS NULL OR length < 1);

UPDATE product
SET stock_quantity = 10
WHERE @product_table_exists = 1
  AND (stock_quantity IS NULL OR stock_quantity < 0);

SET @width_not_null_sql = IF(
    @product_table_exists = 1,
    'ALTER TABLE product MODIFY COLUMN width INT NOT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @width_not_null_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @length_not_null_sql = IF(
    @product_table_exists = 1,
    'ALTER TABLE product MODIFY COLUMN length INT NOT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @length_not_null_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @stock_not_null_sql = IF(
    @product_table_exists = 1,
    'ALTER TABLE product MODIFY COLUMN stock_quantity INT NOT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @stock_not_null_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
