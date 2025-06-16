-- 删除已存在的触发器（如果有）
DROP TRIGGER IF EXISTS after_quote_category_update;

-- 创建更新quote_categories时更新categories.quotes_count的触发器
DELIMITER $$
CREATE TRIGGER after_quote_category_update
AFTER UPDATE ON quote_categories
FOR EACH ROW
BEGIN
    IF OLD.category_id <> NEW.category_id THEN
        UPDATE categories SET quotes_count = quotes_count - 1 WHERE id = OLD.category_id;
        UPDATE categories SET quotes_count = quotes_count + 1 WHERE id = NEW.category_id;
    END IF;
END$$
DELIMITER ;
