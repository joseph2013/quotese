import graphene
from graphene_django.filter import DjangoFilterConnectionField
from graphql_relay import from_global_id
from django.db.models import Q
from django.core.exceptions import PermissionDenied

from quotesapp.models import Authors, Categories, Sources, Quotes, QuoteCategories, QuoteSources, QuotesWithAuthorId
from .types import (
    AuthorType, CategoryType, SourceType, QuoteType,
    QuoteCategoryType, QuoteSourceType, QuoteWithAuthorIdType
)


class Query(graphene.ObjectType):
    # 单个查询
    author = graphene.Field(AuthorType, id=graphene.ID())
    category = graphene.Field(CategoryType, id=graphene.ID())
    source = graphene.Field(SourceType, id=graphene.ID())
    quote = graphene.Field(QuoteType, id=graphene.ID())

    # 精确名称查询
    category_by_exact_name = graphene.Field(CategoryType, name=graphene.String(required=True))
    author_by_exact_name = graphene.Field(AuthorType, name=graphene.String(required=True))
    source_by_exact_name = graphene.Field(SourceType, name=graphene.String(required=True))

    # 列表查询
    authors = graphene.List(
        AuthorType,
        search=graphene.String(),
        first=graphene.Int(),
        skip=graphene.Int(),
        order_by=graphene.String(),
        order_direction=graphene.String(),
    )

    categories = graphene.List(
        CategoryType,
        search=graphene.String(),
        first=graphene.Int(),
        skip=graphene.Int(),
        order_by=graphene.String(),
        order_direction=graphene.String(),
    )

    sources = graphene.List(
        SourceType,
        search=graphene.String(),
        first=graphene.Int(),
        skip=graphene.Int(),
        order_by=graphene.String(),
        order_direction=graphene.String(),
    )

    quotes = graphene.List(
        QuoteType,
        # 基本筛选
        search=graphene.String(),        # 全文搜索（内容、作者、类别、来源）
        content=graphene.String(),      # 按名言内容筛选

        # 基于名称的筛选（用户友好）
        author=graphene.String(),       # 按作者名称筛选
        category=graphene.String(),     # 按类别名称筛选
        source=graphene.String(),       # 按来源名称筛选

        # 基于ID的筛选（系统内部使用）
        author_id=graphene.ID(),        # 按作者ID筛选
        category_id=graphene.ID(),      # 按类别ID筛选
        source_id=graphene.ID(),        # 按来源ID筛选

        # 语言筛选
        language=graphene.String(),     # 按语言筛选（如 'en', 'zh'）

        # 分页
        first=graphene.Int(),           # 返回结果数量
        skip=graphene.Int(),            # 跳过结果数量（用于分页）
        limit=graphene.Int(),           # 限制总数量（如只返回前10000条）
    )

    # 统计查询
    authors_count = graphene.Int()
    categories_count = graphene.Int()
    sources_count = graphene.Int()
    quotes_count = graphene.Int(limit=graphene.Int())

    # 筛选条件的计数字段
    filtered_quotes_count = graphene.Int(
        # 基本筛选
        search=graphene.String(),        # 全文搜索（内容、作者、类别、来源）
        content=graphene.String(),      # 按名言内容筛选

        # 基于名称的筛选（用户友好）
        author=graphene.String(),       # 按作者名称筛选
        category=graphene.String(),     # 按类别名称筛选
        source=graphene.String(),       # 按来源名称筛选

        # 基于ID的筛选（系统内部使用）
        author_id=graphene.ID(),        # 按作者ID筛选
        category_id=graphene.ID(),      # 按类别ID筛选
        source_id=graphene.ID(),        # 按来源ID筛选

        # 语言筛选
        language=graphene.String(),     # 按语言筛选（如 'en', 'zh'）

        # 限制总数量
        limit=graphene.Int(),           # 限制总数量（如只返回前10000条）
    )

    # 单个查询解析器
    def resolve_author(self, info, id):
        return Authors.objects.get(pk=id)

    def resolve_category(self, info, id):
        return Categories.objects.get(pk=id)

    def resolve_source(self, info, id):
        return Sources.objects.get(pk=id)

    def resolve_quote(self, info, id):
        return Quotes.objects.get(pk=id)

    # 精确名称查询解析器
    def resolve_category_by_exact_name(self, info, name):
        try:
            # 使用精确匹配，区分大小写
            return Categories.objects.get(name__exact=name)
        except Categories.DoesNotExist:
            # 如果精确匹配失败，尝试不区分大小写的匹配
            return Categories.objects.filter(name__iexact=name).first()

    def resolve_author_by_exact_name(self, info, name):
        try:
            # 使用精确匹配，区分大小写
            return Authors.objects.get(name__exact=name)
        except Authors.DoesNotExist:
            # 如果精确匹配失败，尝试不区分大小写的匹配
            return Authors.objects.filter(name__iexact=name).first()

    def resolve_source_by_exact_name(self, info, name):
        try:
            # 使用精确匹配，区分大小写
            return Sources.objects.get(name__exact=name)
        except Sources.DoesNotExist:
            # 如果精确匹配失败，尝试不区分大小写的匹配
            return Sources.objects.filter(name__iexact=name).first()

    # 列表查询解析器
    def resolve_authors(self, info, search=None, first=None, skip=None, order_by=None, order_direction=None, **kwargs):
        # 默认按名称排序
        if order_by == 'quotes_count':
            # 按名言数量排序
            if order_direction == 'desc':
                qs = Authors.objects.all().order_by('-quotes_count')
            else:
                qs = Authors.objects.all().order_by('quotes_count')
        else:
            # 默认按名称排序
            qs = Authors.objects.all().order_by('name')

        if search:
            qs = qs.filter(name__icontains=search)

        if skip:
            qs = qs[skip:]

        if first:
            qs = qs[:first]

        return qs

    def resolve_categories(self, info, search=None, first=None, skip=None, order_by=None, order_direction=None, **kwargs):
        # 默认按名称排序
        if order_by == 'quotes_count':
            # 按名言数量排序
            if order_direction == 'desc':
                qs = Categories.objects.all().order_by('-quotes_count')
            else:
                qs = Categories.objects.all().order_by('quotes_count')
        else:
            # 默认按名称排序
            qs = Categories.objects.all().order_by('name')

        if search:
            qs = qs.filter(name__icontains=search)

        if skip:
            qs = qs[skip:]

        if first:
            qs = qs[:first]

        return qs

    def resolve_sources(self, info, search=None, first=None, skip=None, order_by=None, order_direction=None, **kwargs):
        # 默认按名称排序
        if order_by == 'quotes_count':
            # 按名言数量排序
            if order_direction == 'desc':
                qs = Sources.objects.all().order_by('-quotes_count')
            else:
                qs = Sources.objects.all().order_by('quotes_count')
        else:
            # 默认按名称排序
            qs = Sources.objects.all().order_by('name')

        if search:
            qs = qs.filter(name__icontains=search)

        if skip:
            qs = qs[skip:]

        if first:
            qs = qs[:first]

        return qs

    def resolve_quotes(self, info, search=None, content=None, author=None, category=None, source=None,
                      author_id=None, category_id=None, source_id=None, language=None, first=None, skip=None, limit=None, **kwargs):
        qs = Quotes.objects.all().order_by('-created_at')

        # 全文搜索
        if search:
            qs = qs.filter(
                Q(content__icontains=search) |
                Q(author__name__icontains=search) |
                Q(quotecategories__category__name__icontains=search) |
                Q(quotesources__source__name__icontains=search)
            ).distinct()

        # 按内容筛选
        if content:
            qs = qs.filter(content__icontains=content)

        # 基于名称的筛选（用户友好）
        if author:
            qs = qs.filter(author__name__icontains=author)

        if category:
            qs = qs.filter(quotecategories__category__name__icontains=category).distinct()

        if source:
            qs = qs.filter(quotesources__source__name__icontains=source).distinct()

        # 基于ID的筛选（系统内部使用）
        if author_id:
            qs = qs.filter(author_id=author_id)

        if category_id:
            qs = qs.filter(quotecategories__category_id=category_id).distinct()

        if source_id:
            qs = qs.filter(quotesources__source_id=source_id).distinct()

        # 语言筛选
        if language:
            # 当前所有数据都是英文，所以如果请求英文，返回所有数据
            if language.lower() == 'en':
                pass  # 不需要额外的筛选
            elif language.lower() == 'zh':
                # 当前没有中文数据，返回空结果
                qs = qs.filter(id=-1)  # 使用一个不存在的ID来返回空结果
            # 可以根据需要添加更多语言的判断

        # 限制总数量
        if limit:
            qs = qs[:limit]

        # 分页
        if skip:
            qs = qs[skip:]

        if first:
            qs = qs[:first]

        return qs

    # 统计查询解析器
    def resolve_authors_count(self, info):
        return Authors.objects.count()

    def resolve_categories_count(self, info):
        return Categories.objects.count()

    def resolve_sources_count(self, info):
        return Sources.objects.count()

    def resolve_quotes_count(self, info, limit=None):
        if limit:
            return min(Quotes.objects.count(), limit)
        return Quotes.objects.count()

    def resolve_filtered_quotes_count(self, info, search=None, content=None, author=None, category=None, source=None,
                                    author_id=None, category_id=None, source_id=None, language=None, limit=None, **kwargs):
        # 使用与 resolve_quotes 相同的筛选逻辑
        qs = Quotes.objects.all()

        # 全文搜索
        if search:
            qs = qs.filter(
                Q(content__icontains=search) |
                Q(author__name__icontains=search) |
                Q(quotecategories__category__name__icontains=search) |
                Q(quotesources__source__name__icontains=search)
            ).distinct()

        # 按内容筛选
        if content:
            qs = qs.filter(content__icontains=content)

        # 基于名称的筛选（用户友好）
        if author:
            qs = qs.filter(author__name__icontains=author)

        if category:
            qs = qs.filter(quotecategories__category__name__icontains=category).distinct()

        if source:
            qs = qs.filter(quotesources__source__name__icontains=source).distinct()

        # 基于ID的筛选（系统内部使用）
        if author_id:
            qs = qs.filter(author_id=author_id)

        if category_id:
            qs = qs.filter(quotecategories__category_id=category_id).distinct()

        if source_id:
            qs = qs.filter(quotesources__source_id=source_id).distinct()

        # 语言筛选
        if language:
            # 当前所有数据都是英文，所以如果请求英文，返回所有数据
            if language.lower() == 'en':
                pass  # 不需要额外的筛选
            elif language.lower() == 'zh':
                # 当前没有中文数据，返回空结果
                qs = qs.filter(id=-1)  # 使用一个不存在的ID来返回空结果

        # 限制总数量
        if limit:
            return min(qs.count(), limit)

        return qs.count()


# 输入类型
class AuthorInput(graphene.InputObjectType):
    name = graphene.String(required=True)


class CategoryInput(graphene.InputObjectType):
    name = graphene.String(required=True)


class SourceInput(graphene.InputObjectType):
    name = graphene.String(required=True)


class QuoteInput(graphene.InputObjectType):
    content = graphene.String(required=True)
    author_id = graphene.ID()
    category_ids = graphene.List(graphene.ID)
    source_ids = graphene.List(graphene.ID)
    language = graphene.String(description="名言的语言，如 'en', 'zh'")


# 作者变更
class CreateAuthor(graphene.Mutation):
    class Arguments:
        input = AuthorInput(required=True)

    author = graphene.Field(AuthorType)

    @staticmethod
    def mutate(root, info, input):
        # 检查用户是否已经认证
        if not info.context.user.is_authenticated:
            raise PermissionDenied("You must be logged in to create an author.")

        author = Authors.objects.create(name=input.name)
        return CreateAuthor(author=author)


class UpdateAuthor(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        input = AuthorInput(required=True)

    author = graphene.Field(AuthorType)

    @staticmethod
    def mutate(root, info, id, input):
        # 检查用户是否已经认证
        if not info.context.user.is_authenticated:
            raise PermissionDenied("You must be logged in to update an author.")

        author = Authors.objects.get(pk=id)
        author.name = input.name
        author.save()
        return UpdateAuthor(author=author)


class DeleteAuthor(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    @staticmethod
    def mutate(root, info, id):
        # 检查用户是否已经认证
        if not info.context.user.is_authenticated:
            raise PermissionDenied("You must be logged in to delete an author.")

        try:
            author = Authors.objects.get(pk=id)
            author.delete()
            return DeleteAuthor(success=True)
        except Authors.DoesNotExist:
            return DeleteAuthor(success=False)


# 类别变更
class CreateCategory(graphene.Mutation):
    class Arguments:
        input = CategoryInput(required=True)

    category = graphene.Field(CategoryType)

    @staticmethod
    def mutate(root, info, input):
        # 检查用户是否已经认证
        if not info.context.user.is_authenticated:
            raise PermissionDenied("You must be logged in to create a category.")

        category = Categories.objects.create(name=input.name)
        return CreateCategory(category=category)


class UpdateCategory(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        input = CategoryInput(required=True)

    category = graphene.Field(CategoryType)

    @staticmethod
    def mutate(root, info, id, input):
        # 检查用户是否已经认证
        if not info.context.user.is_authenticated:
            raise PermissionDenied("You must be logged in to update a category.")

        category = Categories.objects.get(pk=id)
        category.name = input.name
        category.save()
        return UpdateCategory(category=category)


class DeleteCategory(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    @staticmethod
    def mutate(root, info, id):
        # 检查用户是否已经认证
        if not info.context.user.is_authenticated:
            raise PermissionDenied("You must be logged in to delete a category.")

        try:
            category = Categories.objects.get(pk=id)
            category.delete()
            return DeleteCategory(success=True)
        except Categories.DoesNotExist:
            return DeleteCategory(success=False)


# 来源变更
class CreateSource(graphene.Mutation):
    class Arguments:
        input = SourceInput(required=True)

    source = graphene.Field(SourceType)

    @staticmethod
    def mutate(root, info, input):
        # 检查用户是否已经认证
        if not info.context.user.is_authenticated:
            raise PermissionDenied("You must be logged in to create a source.")

        source = Sources.objects.create(name=input.name)
        return CreateSource(source=source)


class UpdateSource(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        input = SourceInput(required=True)

    source = graphene.Field(SourceType)

    @staticmethod
    def mutate(root, info, id, input):
        # 检查用户是否已经认证
        if not info.context.user.is_authenticated:
            raise PermissionDenied("You must be logged in to update a source.")

        source = Sources.objects.get(pk=id)
        source.name = input.name
        source.save()
        return UpdateSource(source=source)


class DeleteSource(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    @staticmethod
    def mutate(root, info, id):
        # 检查用户是否已经认证
        if not info.context.user.is_authenticated:
            raise PermissionDenied("You must be logged in to delete a source.")

        try:
            source = Sources.objects.get(pk=id)
            source.delete()
            return DeleteSource(success=True)
        except Sources.DoesNotExist:
            return DeleteSource(success=False)


# 名言变更
class CreateQuote(graphene.Mutation):
    class Arguments:
        input = QuoteInput(required=True)

    quote = graphene.Field(QuoteType)

    @staticmethod
    def mutate(root, info, input):
        # 检查用户是否已经认证
        if not info.context.user.is_authenticated:
            raise PermissionDenied("You must be logged in to create a quote.")

        author = None
        if input.author_id:
            author = Authors.objects.get(pk=input.author_id)

        # 创建名言，默认为英文
        quote = Quotes.objects.create(
            content=input.content,
            author=author
        )

        # 注意：这里我们没有实际存储language字段，因为数据库中没有该字段
        # 如果将来需要添加该字段，需要修改数据库结构

        # 添加类别关联
        if input.category_ids:
            for category_id in input.category_ids:
                category = Categories.objects.get(pk=category_id)
                QuoteCategories.objects.create(
                    quote=quote,
                    category=category
                )

        # 添加来源关联
        if input.source_ids:
            for source_id in input.source_ids:
                source = Sources.objects.get(pk=source_id)
                QuoteSources.objects.create(
                    quote=quote,
                    source=source
                )

        return CreateQuote(quote=quote)


class UpdateQuote(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        input = QuoteInput(required=True)

    quote = graphene.Field(QuoteType)

    @staticmethod
    def mutate(root, info, id, input):
        # 检查用户是否已经认证
        if not info.context.user.is_authenticated:
            raise PermissionDenied("You must be logged in to update a quote.")

        quote = Quotes.objects.get(pk=id)
        quote.content = input.content

        if input.author_id:
            author = Authors.objects.get(pk=input.author_id)
            quote.author = author

        quote.save()

        # 更新类别关联
        if input.category_ids is not None:
            # 删除现有关联
            QuoteCategories.objects.filter(quote=quote).delete()

            # 添加新关联
            for category_id in input.category_ids:
                category = Categories.objects.get(pk=category_id)
                QuoteCategories.objects.create(
                    quote=quote,
                    category=category
                )

        # 更新来源关联
        if input.source_ids is not None:
            # 删除现有关联
            QuoteSources.objects.filter(quote=quote).delete()

            # 添加新关联
            for source_id in input.source_ids:
                source = Sources.objects.get(pk=source_id)
                QuoteSources.objects.create(
                    quote=quote,
                    source=source
                )

        return UpdateQuote(quote=quote)


class DeleteQuote(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    @staticmethod
    def mutate(root, info, id):
        # 检查用户是否已经认证
        if not info.context.user.is_authenticated:
            raise PermissionDenied("You must be logged in to delete a quote.")

        try:
            quote = Quotes.objects.get(pk=id)
            quote.delete()
            return DeleteQuote(success=True)
        except Quotes.DoesNotExist:
            return DeleteQuote(success=False)


class Mutation(graphene.ObjectType):
    # 作者变更
    create_author = CreateAuthor.Field()
    update_author = UpdateAuthor.Field()
    delete_author = DeleteAuthor.Field()

    # 类别变更
    create_category = CreateCategory.Field()
    update_category = UpdateCategory.Field()
    delete_category = DeleteCategory.Field()

    # 来源变更
    create_source = CreateSource.Field()
    update_source = UpdateSource.Field()
    delete_source = DeleteSource.Field()

    # 名言变更
    create_quote = CreateQuote.Field()
    update_quote = UpdateQuote.Field()
    delete_quote = DeleteQuote.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
