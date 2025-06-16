#!/usr/bin/env python3
"""
创建触发器，用于自动更新quotes_count字段
"""

import os
import subprocess
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

def execute_sql_file_with_mysql_command(file_path):
    """使用mysql命令行工具执行SQL文件"""
    try:
        # 构建mysql命令
        command = [
            'mysql',
            '-h', 'localhost',
            '-u', 'root',
            '-ppassword',
            'quotes_db',
            '-e', f'source {file_path}'
        ]
        
        # 执行命令
        result = subprocess.run(command, capture_output=True, text=True)
        
        # 检查执行结果
        if result.returncode == 0:
            print(f"成功执行SQL文件: {file_path}")
            return True
        else:
            print(f"执行SQL文件时出错: {result.stderr}")
            return False
    except Exception as e:
        print(f"执行SQL文件时出错: {e}")
        return False

def main():
    """主函数"""
    # 获取脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    triggers_dir = os.path.join(script_dir, 'triggers')
    
    # 获取所有触发器SQL文件
    trigger_files = sorted([f for f in os.listdir(triggers_dir) if f.endswith('.sql')])
    
    # 执行每个触发器SQL文件
    for trigger_file in trigger_files:
        file_path = os.path.join(triggers_dir, trigger_file)
        print(f"正在执行触发器文件: {trigger_file}")
        if not execute_sql_file_with_mysql_command(file_path):
            print(f"创建触发器 {trigger_file} 失败")
        else:
            print(f"创建触发器 {trigger_file} 成功")
    
    print("触发器创建完成")

if __name__ == "__main__":
    main()
