import graphene
from graphene_django import DjangoObjectType
from quotesapp.models import Authors, Categories, Sources, Quotes, QuoteCategories, QuoteSources, QuotesWithAuthorId


class AuthorType(DjangoObjectType):
    class Meta:
        model = Authors
        fields = ('id', 'name', 'created_at', 'updated_at', 'quotes_count')


class CategoryType(DjangoObjectType):
    class Meta:
        model = Categories
        fields = ('id', 'name', 'created_at', 'updated_at', 'quotes_count')


class SourceType(DjangoObjectType):
    class Meta:
        model = Sources
        fields = ('id', 'name', 'created_at', 'updated_at', 'quotes_count')


class QuoteType(DjangoObjectType):
    categories = graphene.List(CategoryType)
    sources = graphene.List(SourceType)
    language = graphene.String()

    class Meta:
        model = Quotes
        fields = ('id', 'content', 'author', 'created_at', 'updated_at')

    def resolve_categories(self, info):
        return Categories.objects.filter(quotecategories__quote=self)

    def resolve_sources(self, info):
        return Sources.objects.filter(quotesources__quote=self)

    def resolve_language(self, info):
        # 当前所有数据都是英文
        return 'en'


class QuoteCategoryType(DjangoObjectType):
    class Meta:
        model = QuoteCategories
        fields = ('id', 'quote', 'category', 'created_at')


class QuoteSourceType(DjangoObjectType):
    class Meta:
        model = QuoteSources
        fields = ('id', 'quote', 'source', 'created_at')


class QuoteWithAuthorIdType(DjangoObjectType):
    class Meta:
        model = QuotesWithAuthorId
        fields = ('id', 'quote', 'author_id', 'created_at', 'updated_at')
