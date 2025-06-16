-- 删除已存在的触发器（如果有）
DROP TRIGGER IF EXISTS after_quote_update;

-- 创建更新quotes时更新authors.quotes_count的触发器
DELIMITER $$
CREATE TRIGGER after_quote_update
AFTER UPDATE ON quotes
FOR EACH ROW
BEGIN
    IF OLD.author_id <> NEW.author_id OR (OLD.author_id IS NULL AND NEW.author_id IS NOT NULL) OR (OLD.author_id IS NOT NULL AND NEW.author_id IS NULL) THEN
        IF OLD.author_id IS NOT NULL THEN
            UPDATE authors SET quotes_count = quotes_count - 1 WHERE id = OLD.author_id;
        END IF;
        IF NEW.author_id IS NOT NULL THEN
            UPDATE authors SET quotes_count = quotes_count + 1 WHERE id = NEW.author_id;
        END IF;
    END IF;
END$$
DELIMITER ;
