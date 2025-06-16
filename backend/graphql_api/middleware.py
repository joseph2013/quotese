from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils.functional import SimpleLazyObject
from django.contrib.auth import get_user_model


def get_jwt_user(request):
    """获取JWT用户"""
    # 如果用户已经通过Django会话认证，则使用该用户
    user = getattr(request, '_cached_user', None)
    if user is not None:
        return user

    # 使用JWT认证
    jwt_auth = JWTAuthentication()
    try:
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            auth_tuple = jwt_auth.authenticate(request)
            if auth_tuple is not None:
                user, _ = auth_tuple
                request._cached_user = user
                return user
    except Exception as e:
        # 认证失败，使用匿名用户
        pass

    # 如果没有认证成功，使用匿名用户
    user = AnonymousUser()
    request._cached_user = user
    return user


class JWTAuthenticationMiddleware:
    """JWT认证中间件，用于GraphQL API"""
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 使用SimpleLazyObject延迟加载用户，避免不必要的数据库查询
        request.user = SimpleLazyObject(lambda: get_jwt_user(request))
        response = self.get_response(request)
        return response
