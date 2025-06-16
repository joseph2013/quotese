-- 删除已存在的触发器（如果有）
DROP TRIGGER IF EXISTS after_quote_insert;

-- 创建插入quotes时更新authors.quotes_count的触发器
DELIMITER $$
CREATE TRIGGER after_quote_insert
AFTER INSERT ON quotes
FOR EACH ROW
BEGIN
    IF NEW.author_id IS NOT NULL THEN
        UPDATE authors SET quotes_count = quotes_count + 1 WHERE id = NEW.author_id;
    END IF;
END$$
DELIMITER ;
