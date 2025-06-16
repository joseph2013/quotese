#!/usr/bin/env python3
"""
更新数据库结构，添加quotes_count字段并创建触发器
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

def execute_sql_file(connection, file_path):
    """执行SQL文件"""
    try:
        with open(file_path, 'r') as file:
            sql_script = file.read()

        # 分割SQL语句
        sql_statements = sql_script.split(';')

        cursor = connection.cursor()

        for statement in sql_statements:
            # 跳过空语句
            if statement.strip():
                # 执行SQL语句
                try:
                    cursor.execute(statement)
                    print(f"执行SQL语句: {statement[:50]}...")
                except Error as e:
                    print(f"执行SQL语句时出错: {e}")
                    print(f"问题语句: {statement}")
                    # 继续执行其他语句

        connection.commit()
        print(f"成功执行SQL文件: {file_path}")
        return True
    except Error as e:
        print(f"执行SQL文件时出错: {e}")
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
        # 获取脚本所在目录
        script_dir = os.path.dirname(os.path.abspath(__file__))

        # 执行添加quotes_count字段的SQL文件
        add_quotes_count_file = os.path.join(script_dir, 'add_quotes_count_field.sql')
        if not execute_sql_file(connection, add_quotes_count_file):
            return

        # 执行创建触发器的SQL文件
        create_triggers_file = os.path.join(script_dir, 'create_triggers.sql')
        if not execute_sql_file(connection, create_triggers_file):
            return

        print("数据库结构更新成功")
    finally:
        connection.close()

if __name__ == "__main__":
    main()
