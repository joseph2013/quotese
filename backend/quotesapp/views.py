from django.shortcuts import render
from django.http import JsonResponse
from django.db.models import Count
from .models import Authors, Categories, Sources, Quotes, QuoteCategories, QuoteSources


def author_quotes_chart_data(request):
    """获取作者名言数量分布数据"""
    authors_with_count = Authors.objects.annotate(quotes_count=Count('quotes'))

    # 统计不同名言数量范围的作者数量
    no_quotes = authors_with_count.filter(quotes_count=0).count()
    quotes_1_10 = authors_with_count.filter(quotes_count__gte=1, quotes_count__lte=10).count()
    quotes_11_50 = authors_with_count.filter(quotes_count__gte=11, quotes_count__lte=50).count()
    quotes_51_100 = authors_with_count.filter(quotes_count__gte=51, quotes_count__lte=100).count()
    quotes_100_plus = authors_with_count.filter(quotes_count__gt=100).count()

    data = {
        'labels': ['无名言', '1-10', '11-50', '51-100', '100+'],
        'data': [no_quotes, quotes_1_10, quotes_11_50, quotes_51_100, quotes_100_plus]
    }

    return JsonResponse(data)


def category_quotes_chart_data(request):
    """获取类别名言数量分布数据"""
    categories_with_count = Categories.objects.annotate(quotes_count=Count('quotecategories'))

    # 统计不同名言数量范围的类别数量
    no_quotes = categories_with_count.filter(quotes_count=0).count()
    quotes_1_10 = categories_with_count.filter(quotes_count__gte=1, quotes_count__lte=10).count()
    quotes_11_50 = categories_with_count.filter(quotes_count__gte=11, quotes_count__lte=50).count()
    quotes_51_100 = categories_with_count.filter(quotes_count__gte=51, quotes_count__lte=100).count()
    quotes_100_plus = categories_with_count.filter(quotes_count__gt=100).count()

    data = {
        'labels': ['无名言', '1-10', '11-50', '51-100', '100+'],
        'data': [no_quotes, quotes_1_10, quotes_11_50, quotes_51_100, quotes_100_plus]
    }

    return JsonResponse(data)


def source_quotes_chart_data(request):
    """获取来源名言数量分布数据"""
    sources_with_count = Sources.objects.annotate(quotes_count=Count('quotesources'))

    # 统计不同名言数量范围的来源数量
    no_quotes = sources_with_count.filter(quotes_count=0).count()
    quotes_1_10 = sources_with_count.filter(quotes_count__gte=1, quotes_count__lte=10).count()
    quotes_11_50 = sources_with_count.filter(quotes_count__gte=11, quotes_count__lte=50).count()
    quotes_51_100 = sources_with_count.filter(quotes_count__gte=51, quotes_count__lte=100).count()
    quotes_100_plus = sources_with_count.filter(quotes_count__gt=100).count()

    data = {
        'labels': ['无名言', '1-10', '11-50', '51-100', '100+'],
        'data': [no_quotes, quotes_1_10, quotes_11_50, quotes_51_100, quotes_100_plus]
    }

    return JsonResponse(data)