#!/usr/bin/env python
"""
网站地图生成脚本
此脚本连接到数据库，获取所有名言、作者、类别和来源的信息，
然后生成一个完整的sitemap.xml文件。
"""

import os
import sys
import django
import datetime
from django.utils.text import slugify

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'quotes_admin.settings')
django.setup()

# 导入模型
from quotesapp.models import Quote, Author, Category, Source

def generate_sitemap():
    """生成网站地图XML文件"""
    
    # 网站基础URL
    base_url = "https://quotese.com"
    
    # 创建sitemap文件
    sitemap_path = "../quotes_website_new/sitemap.xml"
    
    # 获取当前日期作为lastmod
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    
    # 开始写入sitemap文件
    with open(sitemap_path, 'w') as f:
        # XML头部
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        f.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        
        # 添加首页
        f.write('  <url>\n')
        f.write(f'    <loc>{base_url}/</loc>\n')
        f.write(f'    <lastmod>{today}</lastmod>\n')
        f.write('    <changefreq>daily</changefreq>\n')
        f.write('    <priority>1.0</priority>\n')
        f.write('  </url>\n')
        
        # 添加类别列表页
        f.write('  <url>\n')
        f.write(f'    <loc>{base_url}/categories/</loc>\n')
        f.write(f'    <lastmod>{today}</lastmod>\n')
        f.write('    <changefreq>weekly</changefreq>\n')
        f.write('    <priority>0.8</priority>\n')
        f.write('  </url>\n')
        
        # 添加作者列表页
        f.write('  <url>\n')
        f.write(f'    <loc>{base_url}/authors/</loc>\n')
        f.write(f'    <lastmod>{today}</lastmod>\n')
        f.write('    <changefreq>weekly</changefreq>\n')
        f.write('    <priority>0.8</priority>\n')
        f.write('  </url>\n')
        
        # 添加来源列表页
        f.write('  <url>\n')
        f.write(f'    <loc>{base_url}/sources/</loc>\n')
        f.write(f'    <lastmod>{today}</lastmod>\n')
        f.write('    <changefreq>weekly</changefreq>\n')
        f.write('    <priority>0.8</priority>\n')
        f.write('  </url>\n')
        
        # 添加所有类别详情页
        categories = Category.objects.all()
        for category in categories:
            slug = slugify(category.name)
            f.write('  <url>\n')
            f.write(f'    <loc>{base_url}/categories/{slug}-{category.id}.html</loc>\n')
            f.write(f'    <lastmod>{today}</lastmod>\n')
            f.write('    <changefreq>weekly</changefreq>\n')
            f.write('    <priority>0.7</priority>\n')
            f.write('  </url>\n')
        
        # 添加所有作者详情页
        authors = Author.objects.all()
        for author in authors:
            slug = slugify(author.name)
            f.write('  <url>\n')
            f.write(f'    <loc>{base_url}/authors/{slug}-{author.id}.html</loc>\n')
            f.write(f'    <lastmod>{today}</lastmod>\n')
            f.write('    <changefreq>weekly</changefreq>\n')
            f.write('    <priority>0.7</priority>\n')
            f.write('  </url>\n')
        
        # 添加所有来源详情页
        sources = Source.objects.all()
        for source in sources:
            slug = slugify(source.name)
            f.write('  <url>\n')
            f.write(f'    <loc>{base_url}/sources/{slug}-{source.id}.html</loc>\n')
            f.write(f'    <lastmod>{today}</lastmod>\n')
            f.write('    <changefreq>weekly</changefreq>\n')
            f.write('    <priority>0.7</priority>\n')
            f.write('  </url>\n')
        
        # 添加所有名言详情页
        # 为了避免文件过大，可以限制数量或分批处理
        quotes = Quote.objects.all()[:10000]  # 限制为前10000条名言
        for quote in quotes:
            # 使用名言ID作为URL的一部分
            f.write('  <url>\n')
            f.write(f'    <loc>{base_url}/quote/{quote.id}.html</loc>\n')
            f.write(f'    <lastmod>{today}</lastmod>\n')
            f.write('    <changefreq>monthly</changefreq>\n')
            f.write('    <priority>0.6</priority>\n')
            f.write('  </url>\n')
        
        # XML尾部
        f.write('</urlset>')
    
    print(f"网站地图已生成: {sitemap_path}")
    print(f"总共包含: 4个固定页面 + {len(categories)}个类别页 + {len(authors)}个作者页 + {len(sources)}个来源页 + {len(quotes)}个名言页")

if __name__ == "__main__":
    generate_sitemap()
