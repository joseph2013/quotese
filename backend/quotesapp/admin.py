from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.db.models import Count
from .models import Authors, Categories, Quotes, Sources, QuoteCategories, QuoteSources, QuotesWithAuthorId


class QuoteCategoriesInline(admin.TabularInline):
    model = QuoteCategories
    extra = 1


class QuoteSourcesInline(admin.TabularInline):
    model = QuoteSources
    extra = 1


@admin.register(Authors)
class AuthorsAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'quotes_count', 'created_at', 'updated_at')
    search_fields = ('name', 'bio')
    list_filter = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'

    ordering = ('-quotes_count',)


@admin.register(Categories)
class CategoriesAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'quotes_count', 'created_at', 'updated_at')
    search_fields = ('name', 'description')
    list_filter = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'
    ordering = ('-quotes_count',)


@admin.register(Sources)
class SourcesAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'quotes_count', 'created_at', 'updated_at')
    search_fields = ('name',)
    list_filter = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'
    ordering = ('-quotes_count',)


@admin.register(Quotes)
class QuotesAdmin(admin.ModelAdmin):
    list_display = ('id', 'content_short', 'author', 'created_at', 'updated_at')
    search_fields = ('content', 'author__name')
    list_filter = ('author', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'
    inlines = [QuoteCategoriesInline, QuoteSourcesInline]
    autocomplete_fields = ['author']

    def content_short(self, obj):
        return obj.content
    content_short.short_description = _('名言内容')




@admin.register(QuotesWithAuthorId)
class QuotesWithAuthorIdAdmin(admin.ModelAdmin):
    list_display = ('id', 'quote_short', 'author_id', 'created_at', 'updated_at')
    search_fields = ('quote', 'author_id')
    list_filter = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'

    def quote_short(self, obj):
        return obj.quote
    quote_short.short_description = _('名言内容')
