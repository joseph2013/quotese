-- 删除已存在的触发器（如果有）
DROP TRIGGER IF EXISTS after_quote_category_insert;

-- 创建插入quote_categories时更新categories.quotes_count的触发器
DELIMITER $$
CREATE TRIGGER after_quote_category_insert
AFTER INSERT ON quote_categories
FOR EACH ROW
BEGIN
    UPDATE categories SET quotes_count = quotes_count + 1 WHERE id = NEW.category_id;
END$$
DELIMITER ;
