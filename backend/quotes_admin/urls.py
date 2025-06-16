"""
URL configuration for quotes_admin project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from graphql_api.views import GraphQLAPIView, api_example_view, api_docs_view
from graphql_api.schema import schema
from quotesapp.views import author_quotes_chart_data, category_quotes_chart_data, source_quotes_chart_data

# 自定义 admin 站点
admin.site.site_header = '名言数据库管理系统'
admin.site.site_title = '名言数据库管理'
admin.site.index_title = '管理面板'

# 添加图表数据 URL
# admin.site.urls 是一个元组，不能直接添加

urlpatterns = [
    path('admin/', admin.site.urls),
    path('graphql/', GraphQLAPIView.as_view(graphiql=True, schema=schema), name='graphql'),
    path('api/', GraphQLAPIView.as_view(graphiql=False, schema=schema), name='api'),
    path('api-example/', api_example_view, name='api-example'),
    path('api-docs/', api_docs_view, name='api-docs'),
    path('auth/', include('users.urls')),  # 用户认证API
    path('', api_example_view, name='home'),  # 默认首页

    # 图表数据 URL
    path('admin/author_quotes_chart_data/', author_quotes_chart_data, name='admin_author_quotes_chart_data'),
    path('admin/category_quotes_chart_data/', category_quotes_chart_data, name='admin_category_quotes_chart_data'),
    path('admin/source_quotes_chart_data/', source_quotes_chart_data, name='admin_source_quotes_chart_data'),
]
