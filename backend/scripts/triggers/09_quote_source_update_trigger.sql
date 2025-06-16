-- 删除已存在的触发器（如果有）
DROP TRIGGER IF EXISTS after_quote_source_update;

-- 创建更新quote_sources时更新sources.quotes_count的触发器
DELIMITER $$
CREATE TRIGGER after_quote_source_update
AFTER UPDATE ON quote_sources
FOR EACH ROW
BEGIN
    IF OLD.source_id <> NEW.source_id THEN
        UPDATE sources SET quotes_count = quotes_count - 1 WHERE id = OLD.source_id;
        UPDATE sources SET quotes_count = quotes_count + 1 WHERE id = NEW.source_id;
    END IF;
END$$
DELIMITER ;
