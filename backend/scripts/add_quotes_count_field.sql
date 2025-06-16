-- 为authors表添加quotes_count字段
ALTER TABLE authors ADD COLUMN quotes_count INT NOT NULL DEFAULT 0;

-- 为categories表添加quotes_count字段
ALTER TABLE categories ADD COLUMN quotes_count INT NOT NULL DEFAULT 0;

-- 为sources表添加quotes_count字段
ALTER TABLE sources ADD COLUMN quotes_count INT NOT NULL DEFAULT 0;

-- 更新authors表的quotes_count字段
UPDATE authors a SET quotes_count = (
    SELECT COUNT(*) FROM quotes q WHERE q.author_id = a.id
);

-- 更新categories表的quotes_count字段
UPDATE categories c SET quotes_count = (
    SELECT COUNT(*) FROM quote_categories qc WHERE qc.category_id = c.id
);

-- 更新sources表的quotes_count字段
UPDATE sources s SET quotes_count = (
    SELECT COUNT(*) FROM quote_sources qs WHERE qs.source_id = s.id
);
