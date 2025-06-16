# 名言网站部署指南

*文档日期: 2023年5月3日*

本文档提供了将名言网站部署到生产环境的详细步骤。

## 文件结构

```
quotese_0503/
├── frontend/                # 前端静态文件
│   ├── css/                 # CSS样式文件
│   ├── js/                  # JavaScript文件
│   ├── components/          # HTML组件
│   ├── index.html           # 首页
│   └── ...                  # 其他HTML页面
├── backend/                 # 后端文件
│   ├── quotes_admin/        # Django项目配置
│   ├── quotesapp/           # 数据模型应用
│   ├── graphql_api/         # GraphQL API应用
│   ├── users/               # 用户认证应用
│   ├── manage.py            # Django管理脚本
│   └── requirements.txt     # Python依赖项
├── config/                  # 配置文件
│   ├── nginx_backend.conf   # 后端Nginx配置
│   ├── nginx_frontend.conf  # 前端Nginx配置
│   └── gunicorn.service     # Gunicorn服务配置
├── scripts/                 # 部署脚本
│   ├── deploy_backend.sh    # 后端部署脚本
│   └── deploy_frontend.sh   # 前端部署脚本
└── docs/                    # 文档
    └── deployment_guide.md  # 本文档
```

## 部署步骤

### 准备工作

1. 确保服务器已安装以下软件：
   - Python 3.8+
   - Nginx
   - MySQL 8.0+

2. 创建MySQL数据库：
   ```sql
   CREATE DATABASE quotes_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'quotes_user'@'localhost' IDENTIFIED BY '设置一个强密码';
   GRANT ALL PRIVILEGES ON quotes_db.* TO 'quotes_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. 修改配置文件：
   - 编辑 `backend/quotes_admin/settings_prod.py`，设置正确的数据库密码
   - 编辑 `config/nginx_backend.conf` 和 `config/nginx_frontend.conf`，设置正确的域名

### 部署后端

1. 将整个 `quotese_0503` 目录上传到服务器

2. 执行后端部署脚本：
   ```bash
   cd quotese_0503
   chmod +x scripts/deploy_backend.sh
   ./scripts/deploy_backend.sh
   ```

3. 初始化数据库：
   ```bash
   cd /var/www/quotese
   source venv/bin/activate
   cd backend
   python manage.py migrate --settings=quotes_admin.settings_prod
   python manage.py collectstatic --noinput --settings=quotes_admin.settings_prod
   python manage.py createsuperuser --settings=quotes_admin.settings_prod
   ```

### 部署前端

1. 执行前端部署脚本：
   ```bash
   cd quotese_0503
   chmod +x scripts/deploy_frontend.sh
   ./scripts/deploy_frontend.sh
   ```

### 配置SSL证书（可选但推荐）

1. 安装Certbot：
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. 获取SSL证书：
   ```bash
   sudo certbot --nginx -d api.quotese.com
   sudo certbot --nginx -d quotese.com -d www.quotese.com
   ```

3. 按照Certbot的提示完成SSL证书的配置

### 测试部署

1. 访问前端网站：https://quotese.com
2. 访问后端API：https://api.quotese.com/api/
3. 访问管理后台：https://api.quotese.com/admin/

## 维护指南

### 更新网站

1. 更新前端：
   - 修改前端文件
   - 重新运行前端部署脚本

2. 更新后端：
   - 修改后端文件
   - 重新运行后端部署脚本
   - 如果有数据库变更，执行迁移：
     ```bash
     cd /var/www/quotese/backend
     source ../venv/bin/activate
     python manage.py migrate --settings=quotes_admin.settings_prod
     ```

### 备份数据库

```bash
sudo mysqldump -u root -p quotes_db > /var/backups/quotes_db_$(date +%Y%m%d).sql
```

### 监控日志

- Nginx日志：
  ```bash
  sudo tail -f /var/log/nginx/error.log
  sudo tail -f /var/log/nginx/access.log
  ```

- Gunicorn日志：
  ```bash
  sudo tail -f /var/log/gunicorn/error.log
  sudo tail -f /var/log/gunicorn/access.log
  ```

- Django日志：
  ```bash
  sudo tail -f /var/log/django/quotes_error.log
  ```

## 故障排除

### 后端无法启动

1. 检查Gunicorn服务状态：
   ```bash
   sudo systemctl status gunicorn
   ```

2. 查看Gunicorn日志：
   ```bash
   sudo tail -f /var/log/gunicorn/error.log
   ```

3. 检查Django设置：
   ```bash
   cd /var/www/quotese/backend
   source ../venv/bin/activate
   python manage.py check --settings=quotes_admin.settings_prod
   ```

### 前端无法访问

1. 检查Nginx配置：
   ```bash
   sudo nginx -t
   ```

2. 查看Nginx日志：
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. 确认静态文件权限：
   ```bash
   sudo ls -la /var/www/quotese/frontend
   ```

### 数据库连接问题

1. 检查数据库服务状态：
   ```bash
   sudo systemctl status mysql
   ```

2. 验证数据库连接：
   ```bash
   mysql -u quotes_user -p -h localhost quotes_db
   ```

3. 检查数据库设置：
   ```bash
   cat /var/www/quotese/backend/quotes_admin/settings_prod.py
   ```
