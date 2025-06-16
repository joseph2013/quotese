from django.db import models
from django.utils.translation import gettext_lazy as _


class Authors(models.Model):
    """作者模型"""
    id = models.AutoField(primary_key=True)
    name = models.TextField(_('作者名称'))
    created_at = models.DateTimeField(_('创建时间'), blank=True, null=True)
    updated_at = models.DateTimeField(_('更新时间'), blank=True, null=True)
    quotes_count = models.IntegerField(_('名言数量'), default=0)

    class Meta:
        managed = False
        db_table = 'authors'
        verbose_name = _('作者')
        verbose_name_plural = _('作者')
        ordering = ['name']

    def __str__(self):
        return self.name


class Categories(models.Model):
    """类别模型"""
    id = models.AutoField(primary_key=True)
    name = models.TextField(_('类别名称'))
    created_at = models.DateTimeField(_('创建时间'), blank=True, null=True)
    updated_at = models.DateTimeField(_('更新时间'), blank=True, null=True)
    quotes_count = models.IntegerField(_('名言数量'), default=0)

    class Meta:
        managed = False
        db_table = 'categories'
        verbose_name = _('类别')
        verbose_name_plural = _('类别')
        ordering = ['name']

    def __str__(self):
        return self.name


class Sources(models.Model):
    """来源模型"""
    id = models.AutoField(primary_key=True)
    name = models.TextField(_('来源名称'))
    created_at = models.DateTimeField(_('创建时间'), blank=True, null=True)
    updated_at = models.DateTimeField(_('更新时间'), blank=True, null=True)
    quotes_count = models.IntegerField(_('名言数量'), default=0)

    class Meta:
        managed = False
        db_table = 'sources'
        verbose_name = _('来源')
        verbose_name_plural = _('来源')
        ordering = ['name']

    def __str__(self):
        return self.name


class Quotes(models.Model):
    """名言模型"""
    id = models.AutoField(primary_key=True)
    content = models.TextField(_('名言内容'))
    author = models.ForeignKey(Authors, models.DO_NOTHING, blank=True, null=True, verbose_name=_('作者'))
    created_at = models.DateTimeField(_('创建时间'), blank=True, null=True)
    updated_at = models.DateTimeField(_('更新时间'), blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'quotes'
        verbose_name = _('名言')
        verbose_name_plural = _('名言')
        ordering = ['-created_at']

    def __str__(self):
        return self.content[:50] + ('...' if len(self.content) > 50 else '')


class QuoteCategories(models.Model):
    """名言-类别关联模型"""
    id = models.AutoField(primary_key=True)
    quote = models.ForeignKey(Quotes, models.DO_NOTHING, verbose_name=_('名言'))
    category = models.ForeignKey(Categories, models.DO_NOTHING, verbose_name=_('类别'))
    created_at = models.DateTimeField(_('创建时间'), blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'quote_categories'
        verbose_name = _('名言-类别关联')
        verbose_name_plural = _('名言-类别关联')
        unique_together = ('quote', 'category')

    def __str__(self):
        return f'{self.quote} - {self.category}'


class QuoteSources(models.Model):
    """名言-来源关联模型"""
    id = models.AutoField(primary_key=True)
    quote = models.ForeignKey(Quotes, models.DO_NOTHING, verbose_name=_('名言'))
    source = models.ForeignKey(Sources, models.DO_NOTHING, verbose_name=_('来源'))
    created_at = models.DateTimeField(_('创建时间'), blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'quote_sources'
        verbose_name = _('名言-来源关联')
        verbose_name_plural = _('名言-来源关联')
        unique_together = ('quote', 'source')

    def __str__(self):
        return f'{self.quote} - {self.source}'


class QuotesWithAuthorId(models.Model):
    """带作者ID的名言模型"""
    id = models.AutoField(primary_key=True)
    quote = models.TextField(_('名言内容'))
    author_id = models.IntegerField(_('作者ID'), blank=True, null=True)
    created_at = models.DateTimeField(_('创建时间'), blank=True, null=True)
    updated_at = models.DateTimeField(_('更新时间'), blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'quotes_with_author_id'
        verbose_name = _('带作者ID的名言')
        verbose_name_plural = _('带作者ID的名言')
        ordering = ['-created_at']

    def __str__(self):
        return self.quote[:50] + ('...' if len(self.quote) > 50 else '')
