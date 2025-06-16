import json
from django.views.decorators.csrf import csrf_exempt
from graphene_django.views import GraphQLView
from django.utils.decorators import method_decorator
from django.shortcuts import render
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication


@method_decorator(csrf_exempt, name='dispatch')
class GraphQLAPIView(GraphQLView):
    """
    GraphQL API视图，支持CSRF豁免和JWT认证
    """

    def execute_graphql_request(self, request, data, query, variables, operation_name, show_graphiql=False):
        # 处理JWT认证
        jwt_auth = JWTAuthentication()
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Bearer '):
                auth_tuple = jwt_auth.authenticate(request)
                if auth_tuple is not None:
                    user, _ = auth_tuple
                    request.user = user
        except Exception:
            pass

        return super().execute_graphql_request(
            request, data, query, variables, operation_name, show_graphiql
        )


def api_example_view(request):
    """
    GraphQL API示例页面
    """
    return render(request, 'graphql_api/index_new.html')


def api_docs_view(request):
    """
    GraphQL API文档页面
    """
    return render(request, 'graphql_api/docs.html')
