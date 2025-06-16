-- 删除已存在的触发器（如果有）
DROP TRIGGER IF EXISTS after_quote_source_delete;

-- 创建删除quote_sources时更新sources.quotes_count的触发器
DELIMITER $$
CREATE TRIGGER after_quote_source_delete
AFTER DELETE ON quote_sources
FOR EACH ROW
BEGIN
    UPDATE sources SET quotes_count = quotes_count - 1 WHERE id = OLD.source_id;
END$$
DELIMITER ;
