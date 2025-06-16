-- 为quotes表创建触发器，更新authors表的quotes_count字段

-- 插入quotes时更新authors.quotes_count
CREATE TRIGGER after_quote_insert
AFTER INSERT ON quotes
FOR EACH ROW
BEGIN
    IF NEW.author_id IS NOT NULL THEN
        UPDATE authors SET quotes_count = quotes_count + 1 WHERE id = NEW.author_id;
    END IF;
END;

-- 删除quotes时更新authors.quotes_count
CREATE TRIGGER after_quote_delete
AFTER DELETE ON quotes
FOR EACH ROW
BEGIN
    IF OLD.author_id IS NOT NULL THEN
        UPDATE authors SET quotes_count = quotes_count - 1 WHERE id = OLD.author_id;
    END IF;
END;

-- 更新quotes时更新authors.quotes_count
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
END;

-- 为quote_categories表创建触发器，更新categories表的quotes_count字段

-- 插入quote_categories时更新categories.quotes_count
CREATE TRIGGER after_quote_category_insert
AFTER INSERT ON quote_categories
FOR EACH ROW
BEGIN
    UPDATE categories SET quotes_count = quotes_count + 1 WHERE id = NEW.category_id;
END;

-- 删除quote_categories时更新categories.quotes_count
CREATE TRIGGER after_quote_category_delete
AFTER DELETE ON quote_categories
FOR EACH ROW
BEGIN
    UPDATE categories SET quotes_count = quotes_count - 1 WHERE id = OLD.category_id;
END;

-- 更新quote_categories时更新categories.quotes_count
CREATE TRIGGER after_quote_category_update
AFTER UPDATE ON quote_categories
FOR EACH ROW
BEGIN
    IF OLD.category_id <> NEW.category_id THEN
        UPDATE categories SET quotes_count = quotes_count - 1 WHERE id = OLD.category_id;
        UPDATE categories SET quotes_count = quotes_count + 1 WHERE id = NEW.category_id;
    END IF;
END;

-- 为quote_sources表创建触发器，更新sources表的quotes_count字段

-- 插入quote_sources时更新sources.quotes_count
CREATE TRIGGER after_quote_source_insert
AFTER INSERT ON quote_sources
FOR EACH ROW
BEGIN
    UPDATE sources SET quotes_count = quotes_count + 1 WHERE id = NEW.source_id;
END;

-- 删除quote_sources时更新sources.quotes_count
CREATE TRIGGER after_quote_source_delete
AFTER DELETE ON quote_sources
FOR EACH ROW
BEGIN
    UPDATE sources SET quotes_count = quotes_count - 1 WHERE id = OLD.source_id;
END;

-- 更新quote_sources时更新sources.quotes_count
CREATE TRIGGER after_quote_source_update
AFTER UPDATE ON quote_sources
FOR EACH ROW
BEGIN
    IF OLD.source_id <> NEW.source_id THEN
        UPDATE sources SET quotes_count = quotes_count - 1 WHERE id = OLD.source_id;
        UPDATE sources SET quotes_count = quotes_count + 1 WHERE id = NEW.source_id;
    END IF;
END;
