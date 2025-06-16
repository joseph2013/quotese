-- 删除已存在的触发器（如果有）
DROP TRIGGER IF EXISTS after_quote_category_delete;

-- 创建删除quote_categories时更新categories.quotes_count的触发器
DELIMITER $$
CREATE TRIGGER after_quote_category_delete
AFTER DELETE ON quote_categories
FOR EACH ROW
BEGIN
    UPDATE categories SET quotes_count = quotes_count - 1 WHERE id = OLD.category_id;
END$$
DELIMITER ;
