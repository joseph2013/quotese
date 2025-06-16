#!/bin/bash

# 前端部署脚本
# 此脚本用于在服务器上部署前端

# 设置变量
DEPLOY_DIR="/var/www/quotese"
FRONTEND_DIR="$DEPLOY_DIR/frontend"

# 创建必要的目录
echo "创建必要的目录..."
sudo mkdir -p $FRONTEND_DIR

# 设置目录权限
echo "设置目录权限..."
sudo chown -R www-data:www-data $DEPLOY_DIR

# 复制前端文件
echo "复制前端文件..."
sudo cp -r frontend/* $FRONTEND_DIR/

# 配置Nginx
echo "配置Nginx..."
sudo cp config/nginx_frontend.conf /etc/nginx/sites-available/quotese_frontend
sudo ln -sf /etc/nginx/sites-available/quotese_frontend /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

echo "前端部署完成！"
