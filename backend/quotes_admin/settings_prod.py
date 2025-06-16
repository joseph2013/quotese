from .settings import *
import os

# 关闭调试模式
DEBUG = False

# 允许的主机
ALLOWED_HOSTS = ['*'] #['api.quotese.com','localhost','127.0.0.1','123.145.194.25','43.153.11.77']

# 数据库设置
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'quotes_db',
        'USER': 'quotes_user',
        'PASSWORD': 'lixiaohua_2025',  # 部署时请修改为安全密码
        'HOST': 'db', #'172.20.0.2', #'localhost',
        'PORT': '3306',
        'OPTIONS': {
            'charset': 'utf8mb4',
        },
    }
}

# 静态文件设置
STATIC_ROOT = '/var/www/quotese/static/'
STATIC_URL = '/static/'

# 安全设置
SECURE_SSL_REDIRECT = False  # 先设置为False，等SSL配置好后再改为True
SESSION_COOKIE_SECURE = False  # 先设置为False，等SSL配置好后再改为True
CSRF_COOKIE_SECURE = False  # 先设置为False，等SSL配置好后再改为True
SECURE_HSTS_SECONDS = 0  # 先设置为0，等SSL配置好后再改为31536000

# CORS设置
CORS_ALLOW_ALL_ORIGINS = True  # 开发阶段先允许所有来源，生产环境再限制
# 生产环境设置
# CORS_ALLOW_ALL_ORIGINS = False
# CORS_ALLOWED_ORIGINS = [
#     'https://quotese.com',
#     'https://www.quotese.com',
# ]

# 日志设置
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'DEBUG',#'ERROR',
            'class': 'logging.FileHandler',
            'filename': './quotes_error.log',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'DEBUG',#'ERROR',
            'propagate': True,
        },
    },
}
