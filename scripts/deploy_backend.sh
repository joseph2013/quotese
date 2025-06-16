#!/bin/bash

# 后端部署脚本
# 此脚本用于在服务器上部署后端

# 设置变量
DEPLOY_DIR="/var/www/quotese"
BACKEND_DIR="$DEPLOY_DIR/backend"
VENV_DIR="$DEPLOY_DIR/venv"
LOG_DIR="/var/log"
STATIC_DIR="$DEPLOY_DIR/static"

# 创建必要的目录
echo "创建必要的目录..."
sudo mkdir -p $BACKEND_DIR
sudo mkdir -p $VENV_DIR
sudo mkdir -p $STATIC_DIR
sudo mkdir -p $LOG_DIR/gunicorn
sudo mkdir -p $LOG_DIR/django

# 设置目录权限
echo "设置目录权限..."
sudo chown -R www-data:www-data $DEPLOY_DIR
sudo chown -R www-data:www-data $LOG_DIR/gunicorn
sudo chown -R www-data:www-data $LOG_DIR/django

# 复制后端文件
echo "复制后端文件..."
sudo cp -r backend/* $BACKEND_DIR/

# 创建虚拟环境并安装依赖
echo "创建虚拟环境并安装依赖..."
sudo python3 -m venv $VENV_DIR
sudo $VENV_DIR/bin/pip install --upgrade pip
sudo $VENV_DIR/bin/pip install -r $BACKEND_DIR/requirements.txt
sudo $VENV_DIR/bin/pip install gunicorn gevent

# 配置Gunicorn服务
echo "配置Gunicorn服务..."
sudo cp config/gunicorn.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable gunicorn
sudo systemctl start gunicorn

# 配置Nginx
echo "配置Nginx..."
sudo cp config/nginx_backend.conf /etc/nginx/sites-available/quotese_backend
sudo ln -sf /etc/nginx/sites-available/quotese_backend /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

echo "后端部署完成！"
