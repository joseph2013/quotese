#!/usr/bin/env python3
"""
验证触发器是否正常工作
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

def show_triggers(connection):
    """显示所有触发器"""
    cursor = None
    try:
        cursor = connection.cursor()
        cursor.execute("SHOW TRIGGERS")
        triggers = cursor.fetchall()
        print("数据库中的触发器:")
        for trigger in triggers:
            print(f"- {trigger[0]} ({trigger[1]} {trigger[2]} ON {trigger[3]})")
        return True
    except Error as e:
        print(f"显示触发器时出错: {e}")
        return False
    finally:
        if cursor:
            cursor.close()

def test_triggers(connection):
    """测试触发器是否正常工作"""
    cursor = None
    try:
        cursor = connection.cursor()
        
        # 获取当前计数
        cursor.execute("SELECT id, name, quotes_count FROM authors ORDER BY id LIMIT 1")
        author = cursor.fetchone()
        if not author:
            print("没有找到作者记录")
            return False
        
        author_id = author[0]
        author_name = author[1]
        original_count = author[2]
        
        print(f"测试作者: {author_name} (ID: {author_id})")
        print(f"原始名言数量: {original_count}")
        
        # 插入一条新的名言
        cursor.execute(
            "INSERT INTO quotes (content, author_id, created_at, updated_at) VALUES (%s, %s, NOW(), NOW())",
            ("这是一条测试名言", author_id)
        )
        quote_id = cursor.lastrowid
        
        # 检查计数是否增加
        cursor.execute("SELECT quotes_count FROM authors WHERE id = %s", (author_id,))
        new_count = cursor.fetchone()[0]
        print(f"插入名言后的数量: {new_count}")
        
        if new_count == original_count + 1:
            print("插入触发器工作正常")
        else:
            print("插入触发器可能有问题")
        
        # 删除这条名言
        cursor.execute("DELETE FROM quotes WHERE id = %s", (quote_id,))
        
        # 检查计数是否减少
        cursor.execute("SELECT quotes_count FROM authors WHERE id = %s", (author_id,))
        final_count = cursor.fetchone()[0]
        print(f"删除名言后的数量: {final_count}")
        
        if final_count == original_count:
            print("删除触发器工作正常")
        else:
            print("删除触发器可能有问题")
        
        # 测试类别触发器
        cursor.execute("SELECT id, name, quotes_count FROM categories ORDER BY id LIMIT 1")
        category = cursor.fetchone()
        if not category:
            print("没有找到类别记录")
            return False
        
        category_id = category[0]
        category_name = category[1]
        original_count = category[2]
        
        print(f"\n测试类别: {category_name} (ID: {category_id})")
        print(f"原始名言数量: {original_count}")
        
        # 插入一条新的名言
        cursor.execute(
            "INSERT INTO quotes (content, author_id, created_at, updated_at) VALUES (%s, %s, NOW(), NOW())",
            ("这是另一条测试名言", author_id)
        )
        quote_id = cursor.lastrowid
        
        # 关联到类别
        cursor.execute(
            "INSERT INTO quote_categories (quote_id, category_id, created_at) VALUES (%s, %s, NOW())",
            (quote_id, category_id)
        )
        
        # 检查计数是否增加
        cursor.execute("SELECT quotes_count FROM categories WHERE id = %s", (category_id,))
        new_count = cursor.fetchone()[0]
        print(f"关联名言后的数量: {new_count}")
        
        if new_count == original_count + 1:
            print("类别插入触发器工作正常")
        else:
            print("类别插入触发器可能有问题")
        
        # 删除关联
        cursor.execute("DELETE FROM quote_categories WHERE quote_id = %s AND category_id = %s", (quote_id, category_id))
        
        # 检查计数是否减少
        cursor.execute("SELECT quotes_count FROM categories WHERE id = %s", (category_id,))
        final_count = cursor.fetchone()[0]
        print(f"删除关联后的数量: {final_count}")
        
        if final_count == original_count:
            print("类别删除触发器工作正常")
        else:
            print("类别删除触发器可能有问题")
        
        # 删除测试名言
        cursor.execute("DELETE FROM quotes WHERE id = %s", (quote_id,))
        
        connection.commit()
        print("\n触发器测试完成")
        return True
    except Error as e:
        print(f"测试触发器时出错: {e}")
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
        # 显示所有触发器
        show_triggers(connection)
        
        # 测试触发器
        test_triggers(connection)
    finally:
        connection.close()

if __name__ == "__main__":
    main()
