#!/usr/bin/env python3
"""
使用PyMySQL创建触发器，用于自动更新quotes_count字段
"""

import os
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

def execute_trigger_sql(connection, sql_content):
    """执行触发器SQL"""
    cursor = None
    try:
        cursor = connection.cursor()
        
        # 分割SQL语句
        statements = sql_content.split('DELIMITER')
        
        # 提取触发器定义
        for i in range(1, len(statements)):
            if '$$' in statements[i]:
                # 提取触发器定义
                trigger_def = statements[i].split('$$')[1].strip()
                
                # 执行触发器定义
                cursor.execute(trigger_def)
                print("触发器创建成功")
                
        connection.commit()
        return True
    except Error as e:
        print(f"执行触发器SQL时出错: {e}")
        if connection:
            connection.rollback()
        return False
    finally:
        if cursor:
            cursor.close()

def create_quote_insert_trigger(connection):
    """创建quotes插入触发器"""
    sql = """
    DROP TRIGGER IF EXISTS after_quote_insert;
    
    CREATE TRIGGER after_quote_insert
    AFTER INSERT ON quotes
    FOR EACH ROW
    BEGIN
        IF NEW.author_id IS NOT NULL THEN
            UPDATE authors SET quotes_count = quotes_count + 1 WHERE id = NEW.author_id;
        END IF;
    END;
    """
    print("创建quotes插入触发器...")
    cursor = None
    try:
        cursor = connection.cursor()
        cursor.execute("DROP TRIGGER IF EXISTS after_quote_insert")
        cursor.execute(sql)
        connection.commit()
        print("quotes插入触发器创建成功")
        return True
    except Error as e:
        print(f"创建quotes插入触发器时出错: {e}")
        if connection:
            connection.rollback()
        return False
    finally:
        if cursor:
            cursor.close()

def create_quote_delete_trigger(connection):
    """创建quotes删除触发器"""
    sql = """
    DROP TRIGGER IF EXISTS after_quote_delete;
    
    CREATE TRIGGER after_quote_delete
    AFTER DELETE ON quotes
    FOR EACH ROW
    BEGIN
        IF OLD.author_id IS NOT NULL THEN
            UPDATE authors SET quotes_count = quotes_count - 1 WHERE id = OLD.author_id;
        END IF;
    END;
    """
    print("创建quotes删除触发器...")
    cursor = None
    try:
        cursor = connection.cursor()
        cursor.execute("DROP TRIGGER IF EXISTS after_quote_delete")
        cursor.execute(sql)
        connection.commit()
        print("quotes删除触发器创建成功")
        return True
    except Error as e:
        print(f"创建quotes删除触发器时出错: {e}")
        if connection:
            connection.rollback()
        return False
    finally:
        if cursor:
            cursor.close()

def create_quote_update_trigger(connection):
    """创建quotes更新触发器"""
    sql = """
    DROP TRIGGER IF EXISTS after_quote_update;
    
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
    """
    print("创建quotes更新触发器...")
    cursor = None
    try:
        cursor = connection.cursor()
        cursor.execute("DROP TRIGGER IF EXISTS after_quote_update")
        cursor.execute(sql)
        connection.commit()
        print("quotes更新触发器创建成功")
        return True
    except Error as e:
        print(f"创建quotes更新触发器时出错: {e}")
        if connection:
            connection.rollback()
        return False
    finally:
        if cursor:
            cursor.close()

def create_quote_category_insert_trigger(connection):
    """创建quote_categories插入触发器"""
    sql = """
    DROP TRIGGER IF EXISTS after_quote_category_insert;
    
    CREATE TRIGGER after_quote_category_insert
    AFTER INSERT ON quote_categories
    FOR EACH ROW
    BEGIN
        UPDATE categories SET quotes_count = quotes_count + 1 WHERE id = NEW.category_id;
    END;
    """
    print("创建quote_categories插入触发器...")
    cursor = None
    try:
        cursor = connection.cursor()
        cursor.execute("DROP TRIGGER IF EXISTS after_quote_category_insert")
        cursor.execute(sql)
        connection.commit()
        print("quote_categories插入触发器创建成功")
        return True
    except Error as e:
        print(f"创建quote_categories插入触发器时出错: {e}")
        if connection:
            connection.rollback()
        return False
    finally:
        if cursor:
            cursor.close()

def create_quote_category_delete_trigger(connection):
    """创建quote_categories删除触发器"""
    sql = """
    DROP TRIGGER IF EXISTS after_quote_category_delete;
    
    CREATE TRIGGER after_quote_category_delete
    AFTER DELETE ON quote_categories
    FOR EACH ROW
    BEGIN
        UPDATE categories SET quotes_count = quotes_count - 1 WHERE id = OLD.category_id;
    END;
    """
    print("创建quote_categories删除触发器...")
    cursor = None
    try:
        cursor = connection.cursor()
        cursor.execute("DROP TRIGGER IF EXISTS after_quote_category_delete")
        cursor.execute(sql)
        connection.commit()
        print("quote_categories删除触发器创建成功")
        return True
    except Error as e:
        print(f"创建quote_categories删除触发器时出错: {e}")
        if connection:
            connection.rollback()
        return False
    finally:
        if cursor:
            cursor.close()

def create_quote_category_update_trigger(connection):
    """创建quote_categories更新触发器"""
    sql = """
    DROP TRIGGER IF EXISTS after_quote_category_update;
    
    CREATE TRIGGER after_quote_category_update
    AFTER UPDATE ON quote_categories
    FOR EACH ROW
    BEGIN
        IF OLD.category_id <> NEW.category_id THEN
            UPDATE categories SET quotes_count = quotes_count - 1 WHERE id = OLD.category_id;
            UPDATE categories SET quotes_count = quotes_count + 1 WHERE id = NEW.category_id;
        END IF;
    END;
    """
    print("创建quote_categories更新触发器...")
    cursor = None
    try:
        cursor = connection.cursor()
        cursor.execute("DROP TRIGGER IF EXISTS after_quote_category_update")
        cursor.execute(sql)
        connection.commit()
        print("quote_categories更新触发器创建成功")
        return True
    except Error as e:
        print(f"创建quote_categories更新触发器时出错: {e}")
        if connection:
            connection.rollback()
        return False
    finally:
        if cursor:
            cursor.close()

def create_quote_source_insert_trigger(connection):
    """创建quote_sources插入触发器"""
    sql = """
    DROP TRIGGER IF EXISTS after_quote_source_insert;
    
    CREATE TRIGGER after_quote_source_insert
    AFTER INSERT ON quote_sources
    FOR EACH ROW
    BEGIN
        UPDATE sources SET quotes_count = quotes_count + 1 WHERE id = NEW.source_id;
    END;
    """
    print("创建quote_sources插入触发器...")
    cursor = None
    try:
        cursor = connection.cursor()
        cursor.execute("DROP TRIGGER IF EXISTS after_quote_source_insert")
        cursor.execute(sql)
        connection.commit()
        print("quote_sources插入触发器创建成功")
        return True
    except Error as e:
        print(f"创建quote_sources插入触发器时出错: {e}")
        if connection:
            connection.rollback()
        return False
    finally:
        if cursor:
            cursor.close()

def create_quote_source_delete_trigger(connection):
    """创建quote_sources删除触发器"""
    sql = """
    DROP TRIGGER IF EXISTS after_quote_source_delete;
    
    CREATE TRIGGER after_quote_source_delete
    AFTER DELETE ON quote_sources
    FOR EACH ROW
    BEGIN
        UPDATE sources SET quotes_count = quotes_count - 1 WHERE id = OLD.source_id;
    END;
    """
    print("创建quote_sources删除触发器...")
    cursor = None
    try:
        cursor = connection.cursor()
        cursor.execute("DROP TRIGGER IF EXISTS after_quote_source_delete")
        cursor.execute(sql)
        connection.commit()
        print("quote_sources删除触发器创建成功")
        return True
    except Error as e:
        print(f"创建quote_sources删除触发器时出错: {e}")
        if connection:
            connection.rollback()
        return False
    finally:
        if cursor:
            cursor.close()

def create_quote_source_update_trigger(connection):
    """创建quote_sources更新触发器"""
    sql = """
    DROP TRIGGER IF EXISTS after_quote_source_update;
    
    CREATE TRIGGER after_quote_source_update
    AFTER UPDATE ON quote_sources
    FOR EACH ROW
    BEGIN
        IF OLD.source_id <> NEW.source_id THEN
            UPDATE sources SET quotes_count = quotes_count - 1 WHERE id = OLD.source_id;
            UPDATE sources SET quotes_count = quotes_count + 1 WHERE id = NEW.source_id;
        END IF;
    END;
    """
    print("创建quote_sources更新触发器...")
    cursor = None
    try:
        cursor = connection.cursor()
        cursor.execute("DROP TRIGGER IF EXISTS after_quote_source_update")
        cursor.execute(sql)
        connection.commit()
        print("quote_sources更新触发器创建成功")
        return True
    except Error as e:
        print(f"创建quote_sources更新触发器时出错: {e}")
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
        # 创建触发器
        create_quote_insert_trigger(connection)
        create_quote_delete_trigger(connection)
        create_quote_update_trigger(connection)
        create_quote_category_insert_trigger(connection)
        create_quote_category_delete_trigger(connection)
        create_quote_category_update_trigger(connection)
        create_quote_source_insert_trigger(connection)
        create_quote_source_delete_trigger(connection)
        create_quote_source_update_trigger(connection)
        
        print("所有触发器创建完成")
    finally:
        connection.close()

if __name__ == "__main__":
    main()
