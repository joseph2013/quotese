FROM python:3.9-slim

# 安装系统依赖（关键步骤）
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    default-libmysqlclient-dev \
    gcc \
    python3-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# 复制项目文件
COPY . .

# 创建静态文件目录
RUN mkdir -p /app/static

# 设置启动命令
CMD ["sh", "-c", "python manage.py collectstatic --noinput --settings=quotes_admin.settings_prod && python manage.py migrate --settings=quotes_admin.settings_prod && gunicorn quotes_admin.wsgi:application --bind 0.0.0.0:8000"]

EXPOSE 8000

