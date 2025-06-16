#!/bin/bash

# 更新网站地图脚本
# 此脚本应该定期运行（例如，每周一次）以更新网站地图

# 设置工作目录
cd "$(dirname "$0")"

# 激活虚拟环境（如果使用）
# source /path/to/your/virtualenv/bin/activate

# 运行生成网站地图的Python脚本
python generate_sitemap.py

# 记录日志
echo "$(date): 网站地图已更新" >> sitemap_update.log

# 如果需要，可以将网站地图提交给搜索引擎
# curl "http://www.google.com/ping?sitemap=https://quotese.com/sitemap.xml"
# curl "http://www.bing.com/ping?sitemap=https://quotese.com/sitemap.xml"

exit 0
