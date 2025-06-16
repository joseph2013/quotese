#!/usr/bin/env python3
"""
使用简单的SQL语句创建触发器，用于自动更新quotes_count字段
"""

import pymysql
from pymysql import Error

def connect_to_database():
    """连接到数据库"""
    try:
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password='password',
            database='quotes_db'
        )
        print("成功连接到MySQL数据库")
        return connection
    except Error as e:
        print(f"连接数据库时出错: {e}")
        return None

def execute_sql(connection, sql, description):
    """执行SQL语句"""
    cursor = None
    try:
        cursor = connection.cursor()
        cursor.execute(sql)
        connection.commit()
        print(f"{description}成功")
        return True
    except Error as e:
        print(f"{description}时出错: {e}")
        if connection:
            connection.rollback()
        return False
    finally:
        if cursor:
            cursor.close()

def main():
    """主函数"""
    # 连接到数据库
    connection = connect_to_database()
    if not connection:
        return
    
    try:
        # 删除已存在的触发器
        triggers = [
            "after_quote_insert", "after_quote_delete", "after_quote_update",
            "after_quote_category_insert", "after_quote_category_delete", "after_quote_category_update",
            "after_quote_source_insert", "after_quote_source_delete", "after_quote_source_update"
        ]
        
        for trigger in triggers:
            execute_sql(connection, f"DROP TRIGGER IF EXISTS {trigger}", f"删除触发器 {trigger}")
        
        # 创建quotes插入触发器
        execute_sql(connection, """
        CREATE TRIGGER after_quote_insert AFTER INSERT ON quotes
        FOR EACH ROW
        BEGIN
            IF NEW.author_id IS NOT NULL THEN
                UPDATE authors SET quotes_count = quotes_count + 1 WHERE id = NEW.author_id;
            END IF;
        END
        """, "创建quotes插入触发器")
        
        # 创建quotes删除触发器
        execute_sql(connection, """
        CREATE TRIGGER after_quote_delete AFTER DELETE ON quotes
        FOR EACH ROW
        BEGIN
            IF OLD.author_id IS NOT NULL THEN
                UPDATE authors SET quotes_count = quotes_count - 1 WHERE id = OLD.author_id;
            END IF;
        END
        """, "创建quotes删除触发器")
        
        # 创建quotes更新触发器
        execute_sql(connection, """
        CREATE TRIGGER after_quote_update AFTER UPDATE ON quotes
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
        END
        """, "创建quotes更新触发器")
        
        # 创建quote_categories插入触发器
        execute_sql(connection, """
        CREATE TRIGGER after_quote_category_insert AFTER INSERT ON quote_categories
        FOR EACH ROW
        BEGIN
            UPDATE categories SET quotes_count = quotes_count + 1 WHERE id = NEW.category_id;
        END
        """, "创建quote_categories插入触发器")
        
        # 创建quote_categories删除触发器
        execute_sql(connection, """
        CREATE TRIGGER after_quote_category_delete AFTER DELETE ON quote_categories
        FOR EACH ROW
        BEGIN
            UPDATE categories SET quotes_count = quotes_count - 1 WHERE id = OLD.category_id;
        END
        """, "创建quote_categories删除触发器")
        
        # 创建quote_categories更新触发器
        execute_sql(connection, """
        CREATE TRIGGER after_quote_category_update AFTER UPDATE ON quote_categories
        FOR EACH ROW
        BEGIN
            IF OLD.category_id <> NEW.category_id THEN
                UPDATE categories SET quotes_count = quotes_count - 1 WHERE id = OLD.category_id;
                UPDATE categories SET quotes_count = quotes_count + 1 WHERE id = NEW.category_id;
            END IF;
        END
        """, "创建quote_categories更新触发器")
        
        # 创建quote_sources插入触发器
        execute_sql(connection, """
        CREATE TRIGGER after_quote_source_insert AFTER INSERT ON quote_sources
        FOR EACH ROW
        BEGIN
            UPDATE sources SET quotes_count = quotes_count + 1 WHERE id = NEW.source_id;
        END
        """, "创建quote_sources插入触发器")
        
        # 创建quote_sources删除触发器
        execute_sql(connection, """
        CREATE TRIGGER after_quote_source_delete AFTER DELETE ON quote_sources
        FOR EACH ROW
        BEGIN
            UPDATE sources SET quotes_count = quotes_count - 1 WHERE id = OLD.source_id;
        END
        """, "创建quote_sources删除触发器")
        
        # 创建quote_sources更新触发器
        execute_sql(connection, """
        CREATE TRIGGER after_quote_source_update AFTER UPDATE ON quote_sources
        FOR EACH ROW
        BEGIN
            IF OLD.source_id <> NEW.source_id THEN
                UPDATE sources SET quotes_count = quotes_count - 1 WHERE id = OLD.source_id;
                UPDATE sources SET quotes_count = quotes_count + 1 WHERE id = NEW.source_id;
            END IF;
        END
        """, "创建quote_sources更新触发器")
        
        print("所有触发器创建完成")
    finally:
        connection.close()

if __name__ == "__main__":
    main()
