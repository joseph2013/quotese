-- 删除已存在的触发器（如果有）
DROP TRIGGER IF EXISTS after_quote_delete;

-- 创建删除quotes时更新authors.quotes_count的触发器
DELIMITER $$
CREATE TRIGGER after_quote_delete
AFTER DELETE ON quotes
FOR EACH ROW
BEGIN
    IF OLD.author_id IS NOT NULL THEN
        UPDATE authors SET quotes_count = quotes_count - 1 WHERE id = OLD.author_id;
    END IF;
END$$
DELIMITER ;
