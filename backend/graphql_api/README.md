# 名言数据库 GraphQL API

本文档介绍了名言数据库的GraphQL API使用方法。

## API端点

- **GraphiQL界面**: `/graphql/` - 提供交互式GraphQL查询界面，方便开发和测试
- **API端点**: `/api/` - 生产环境使用的API端点，不包含GraphiQL界面

## 认证

目前API不需要认证即可访问。在生产环境中，应该添加适当的认证机制。

## 查询示例

### 获取所有名言

```graphql
query {
  quotes {
    id
    content
    author {
      id
      name
    }
    categories {
      id
      name
    }
    sources {
      id
      name
    }
    createdAt
    updatedAt
  }
}
```

### 全文搜索

```graphql
query {
  quotes(search: "生活") {
    id
    content
    author {
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
```

> 注意：`search`参数会在名言内容、作者名称、类别名称和来源名称中进行搜索。

### 按作者筛选名言

#### 基于作者名称筛选（用户友好）

```graphql
query {
  quotes(author: "爱因斯坦") {
    id
    content
    author {
      name
    }
  }
}
```

#### 基于作者ID筛选（系统内部）

```graphql
query {
  quotes(authorId: 1) {
    id
    content
    createdAt
  }
}
```

### 按类别筛选名言

#### 基于类别名称筛选（用户友好）

```graphql
query {
  quotes(category: "哲学") {
    id
    content
    author {
      name
    }
  }
}
```

#### 基于类别ID筛选（系统内部）

```graphql
query {
  quotes(categoryId: 2) {
    id
    content
    author {
      name
    }
  }
}
```

### 按来源筛选名言

#### 基于来源名称筛选（用户友好）

```graphql
query {
  quotes(source: "书籍") {
    id
    content
    author {
      name
    }
  }
}
```

#### 基于来源ID筛选（系统内部）

```graphql
query {
  quotes(sourceId: 3) {
    id
    content
    author {
      name
    }
  }
}
```

### 按内容筛选名言

```graphql
query {
  quotes(content: "智慧") {
    id
    content
    author {
      name
    }
  }
}
```

### 按语言筛选名言

```graphql
query {
  quotes(language: "en") {
    id
    content
    author {
      name
    }
    language
  }
}
```

```graphql
query {
  quotes(language: "zh") {
    id
    content
    author {
      name
    }
    language
  }
}
```

> 注意：当前所有数据都是英文（language="en"），将来会添加中文数据（language="zh"）。

### 分页查询

```graphql
query {
  quotes(first: 10, skip: 20) {
    id
    content
    author {
      name
    }
  }
}
```

### 获取统计信息

```graphql
query {
  authorsCount
  categoriesCount
  sourcesCount
  quotesCount
}
```

## 变更示例

### 创建作者

```graphql
mutation {
  createAuthor(input: {
    name: "新作者"
  }) {
    author {
      id
      name
    }
  }
}
```

### 创建名言

```graphql
mutation {
  createQuote(input: {
    content: "这是一条新的名言。"
    authorId: 1
    categoryIds: [1, 2]
    sourceIds: [3]
  }) {
    quote {
      id
      content
      author {
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
}
```

### 更新名言

```graphql
mutation {
  updateQuote(id: 1, input: {
    content: "更新后的名言内容。"
    authorId: 2
    categoryIds: [3, 4]
    sourceIds: [1]
  }) {
    quote {
      id
      content
      author {
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
}
```

### 删除名言

```graphql
mutation {
  deleteQuote(id: 1) {
    success
  }
}
```

## 错误处理

GraphQL API会返回标准的GraphQL错误格式，包括错误消息和位置信息。

## 筛选参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| search | String | 全文搜索（内容、作者、类别、来源） |
| content | String | 按名言内容筛选 |
| author | String | 按作者名称筛选（用户友好） |
| category | String | 按类别名称筛选（用户友好） |
| source | String | 按来源名称筛选（用户友好） |
| language | String | 按语言筛选（如 'en', 'zh'），当前所有数据都是英文 |
| authorId | ID | 按作者ID筛选（系统内部） |
| categoryId | ID | 按类别ID筛选（系统内部） |
| sourceId | ID | 按来源ID筛选（系统内部） |
| first | Int | 返回结果数量（用于分页） |
| skip | Int | 跳过结果数量（用于分页） |

## 客户端集成

### Web前端

使用Apollo Client或Relay与GraphQL API集成：

```javascript
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:8000/api/',
  cache: new InMemoryCache()
});

client.query({
  query: gql`
    query {
      quotes(first: 10) {
        id
        content
        author {
          name
        }
      }
    }
  `
})
.then(result => console.log(result));
```

### 移动应用

使用Apollo iOS/Android或其他GraphQL客户端库与API集成。

### 微信小程序

在微信小程序中使用wx.request发送GraphQL请求：

```javascript
wx.request({
  url: 'http://your-api-domain/api/',
  method: 'POST',
  data: {
    query: `
      query {
        quotes(first: 10) {
          id
          content
          author {
            name
          }
        }
      }
    `
  },
  success(res) {
    console.log(res.data)
  }
})
```
