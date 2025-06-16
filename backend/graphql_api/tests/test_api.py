#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
GraphQL API测试脚本

此脚本用于测试名言数据库的GraphQL API。
"""

import requests
import json
import argparse


def test_query(url, query, variables=None):
    """
    测试GraphQL查询
    """
    payload = {
        'query': query
    }
    
    if variables:
        payload['variables'] = variables
    
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"错误: {response.status_code}")
        print(response.text)
        return None


def print_result(result):
    """
    打印查询结果
    """
    print(json.dumps(result, ensure_ascii=False, indent=2))


def test_quotes_query(url):
    """
    测试名言查询
    """
    print("\n=== 测试名言查询 ===")
    query = """
    query {
      quotes(first: 5) {
        id
        content
        author {
          id
          name
        }
        categories {
          name
        }
        sources {
          name
        }
      }
    }
    """
    
    result = test_query(url, query)
    if result:
        print_result(result)


def test_authors_query(url):
    """
    测试作者查询
    """
    print("\n=== 测试作者查询 ===")
    query = """
    query {
      authors(first: 5) {
        id
        name
        createdAt
        updatedAt
      }
    }
    """
    
    result = test_query(url, query)
    if result:
        print_result(result)


def test_categories_query(url):
    """
    测试类别查询
    """
    print("\n=== 测试类别查询 ===")
    query = """
    query {
      categories(first: 5) {
        id
        name
        createdAt
        updatedAt
      }
    }
    """
    
    result = test_query(url, query)
    if result:
        print_result(result)


def test_sources_query(url):
    """
    测试来源查询
    """
    print("\n=== 测试来源查询 ===")
    query = """
    query {
      sources(first: 5) {
        id
        name
        createdAt
        updatedAt
      }
    }
    """
    
    result = test_query(url, query)
    if result:
        print_result(result)


def test_stats_query(url):
    """
    测试统计查询
    """
    print("\n=== 测试统计查询 ===")
    query = """
    query {
      authorsCount
      categoriesCount
      sourcesCount
      quotesCount
    }
    """
    
    result = test_query(url, query)
    if result:
        print_result(result)


def test_search_query(url, keyword):
    """
    测试搜索查询
    """
    print(f"\n=== 测试搜索查询: {keyword} ===")
    query = """
    query($keyword: String!) {
      quotes(search: $keyword, first: 5) {
        id
        content
        author {
          name
        }
      }
    }
    """
    
    variables = {
        'keyword': keyword
    }
    
    result = test_query(url, query, variables)
    if result:
        print_result(result)


def test_create_author(url, name):
    """
    测试创建作者
    """
    print(f"\n=== 测试创建作者: {name} ===")
    query = """
    mutation($name: String!) {
      createAuthor(input: {
        name: $name
      }) {
        author {
          id
          name
        }
      }
    }
    """
    
    variables = {
        'name': name
    }
    
    result = test_query(url, query, variables)
    if result:
        print_result(result)
        if 'data' in result and 'createAuthor' in result['data'] and result['data']['createAuthor']:
            return result['data']['createAuthor']['author']['id']
    
    return None


def test_create_quote(url, content, author_id=None):
    """
    测试创建名言
    """
    print(f"\n=== 测试创建名言 ===")
    query = """
    mutation($content: String!, $authorId: ID) {
      createQuote(input: {
        content: $content
        authorId: $authorId
      }) {
        quote {
          id
          content
          author {
            name
          }
        }
      }
    }
    """
    
    variables = {
        'content': content,
        'authorId': author_id
    }
    
    result = test_query(url, query, variables)
    if result:
        print_result(result)
        if 'data' in result and 'createQuote' in result['data'] and result['data']['createQuote']:
            return result['data']['createQuote']['quote']['id']
    
    return None


def main():
    """
    主函数
    """
    parser = argparse.ArgumentParser(description='测试GraphQL API')
    parser.add_argument('--url', default='http://localhost:8000/api/', help='GraphQL API URL')
    parser.add_argument('--all', action='store_true', help='运行所有测试')
    parser.add_argument('--quotes', action='store_true', help='测试名言查询')
    parser.add_argument('--authors', action='store_true', help='测试作者查询')
    parser.add_argument('--categories', action='store_true', help='测试类别查询')
    parser.add_argument('--sources', action='store_true', help='测试来源查询')
    parser.add_argument('--stats', action='store_true', help='测试统计查询')
    parser.add_argument('--search', help='测试搜索查询')
    parser.add_argument('--create-author', help='测试创建作者')
    parser.add_argument('--create-quote', help='测试创建名言')
    
    args = parser.parse_args()
    
    # 如果没有指定任何测试，则运行所有测试
    if not (args.all or args.quotes or args.authors or args.categories or args.sources or 
            args.stats or args.search or args.create_author or args.create_quote):
        args.all = True
    
    if args.all or args.quotes:
        test_quotes_query(args.url)
    
    if args.all or args.authors:
        test_authors_query(args.url)
    
    if args.all or args.categories:
        test_categories_query(args.url)
    
    if args.all or args.sources:
        test_sources_query(args.url)
    
    if args.all or args.stats:
        test_stats_query(args.url)
    
    if args.search:
        test_search_query(args.url, args.search)
    
    author_id = None
    if args.create_author:
        author_id = test_create_author(args.url, args.create_author)
    
    if args.create_quote:
        test_create_quote(args.url, args.create_quote, author_id)


if __name__ == "__main__":
    main()
