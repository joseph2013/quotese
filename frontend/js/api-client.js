/**
 * API客户端
 * 负责与后端API通信
 */
class ApiClient {
    /**
     * 构造函数
     * @param {string} apiEndpoint - API端点
     * @param {boolean} useMockData - 是否使用模拟数据（已禁用）
     */
    constructor(apiEndpoint, useMockData = false) {
        this.apiEndpoint = apiEndpoint;
        // 强制禁用模拟数据，始终使用真实API
        this.useMockData = false;
        this.cache = {};
    }

    /**
     * 发送GraphQL查询
     * @param {string} query - GraphQL查询
     * @param {Object} variables - 查询变量
     * @param {boolean} useCache - 是否使用缓存
     * @returns {Promise<Object>} - 查询结果
     */
    async query(query, variables = {}, useCache = true) {
        // 生成缓存键
        const cacheKey = JSON.stringify({ query, variables });

        // 如果使用缓存且缓存中有数据，则直接返回缓存数据
        if (useCache && this.cache[cacheKey]) {
            return this.cache[cacheKey];
        }

        try {
            // 发送请求
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    variables,
                }),
            });

            // 解析响应
            const result = await response.json();

            // 如果有错误，则抛出异常
            if (result.errors) {
                throw new Error(result.errors[0].message);
            }

            // 缓存结果
            if (useCache) {
                this.cache[cacheKey] = result.data;
            }

            return result.data;
        } catch (error) {
            console.error('GraphQL query error:', error);
            throw error;
        }
    }

    /**
     * 获取名言列表
     * @param {number} page - 页码
     * @param {number} pageSize - 每页数量
     * @param {Object} filters - 筛选条件
     * @param {boolean} useCache - 是否使用缓存
     * @returns {Promise<Object>} - 名言列表和分页信息
     */
    async getQuotes(page = 1, pageSize = 20, filters = {}, useCache = true) {
        // 如果使用模拟数据，则直接返回模拟数据
        if (this.useMockData) {
            return MockData.getQuotes(page, pageSize, filters);
        }

        // 计算跳过的数量
        const skip = (page - 1) * pageSize;

        // 构建查询
        const query = `
            query {
                quotes(
                    first: ${pageSize}
                    skip: ${skip}
                    ${filters.search ? `search: "${filters.search}"` : ''}
                    ${filters.authorId ? `authorId: "${filters.authorId}"` : ''}
                    ${filters.categoryId ? `categoryId: "${filters.categoryId}"` : ''}
                    ${filters.sourceId ? `sourceId: "${filters.sourceId}"` : ''}
                ) {
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
                filteredQuotesCount(
                    ${filters.search ? `search: "${filters.search}"` : ''}
                    ${filters.authorId ? `authorId: "${filters.authorId}"` : ''}
                    ${filters.categoryId ? `categoryId: "${filters.categoryId}"` : ''}
                    ${filters.sourceId ? `sourceId: "${filters.sourceId}"` : ''}
                )
            }
        `;

        try {
            const result = await this.query(query, {}, useCache);

            // 计算总页数
            const totalCount = result.filteredQuotesCount;
            const totalPages = Math.ceil(totalCount / pageSize);

            return {
                quotes: result.quotes,
                currentPage: page,
                pageSize,
                totalPages,
                totalCount
            };
        } catch (error) {
            console.error('Error getting quotes:', error);
            return {
                quotes: [],
                currentPage: page,
                pageSize,
                totalPages: 0,
                totalCount: 0
            };
        }
    }

    /**
     * 获取热门名言列表（按点赞数排序）
     * @param {number} page - 页码
     * @param {number} pageSize - 每页数量
     * @param {boolean} countOnly - 是否只返回总数
     * @param {boolean} useCache - 是否使用缓存
     * @returns {Promise<Object>} - 名言列表和分页信息
     */
    async getTopQuotes(page = 1, pageSize = 20, countOnly = false, useCache = true) {
        // 如果使用模拟数据，则直接返回模拟数据
        if (this.useMockData) {
            return MockData.getTopQuotes(page, pageSize);
        }

        // 计算跳过的数量
        const skip = (page - 1) * pageSize;

        // 限制总数量为5000条
        const limit = 5000;

        // 如果只需要返回总数，则使用简化的查询
        if (countOnly) {
            const countQuery = `
                query {
                    filteredQuotesCount(limit: ${limit})
                }
            `;

            try {
                const result = await this.query(countQuery, {}, useCache);
                return {
                    totalCount: result.filteredQuotesCount,
                    currentPage: page,
                    pageSize,
                    totalPages: Math.ceil(result.filteredQuotesCount / pageSize)
                };
            } catch (error) {
                console.error('Error getting top quotes count:', error);
                return {
                    totalCount: 0,
                    currentPage: page,
                    pageSize,
                    totalPages: 0
                };
            }
        }

        // 构建查询
        const query = `
            query {
                quotes(
                    first: ${pageSize}
                    skip: ${skip}
                    limit: ${limit}
                ) {
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
                filteredQuotesCount(limit: ${limit})
            }
        `;

        try {
            const result = await this.query(query, {}, useCache);

            // 计算总页数
            const totalCount = result.filteredQuotesCount;
            const totalPages = Math.ceil(totalCount / pageSize);

            return {
                quotes: result.quotes,
                currentPage: page,
                pageSize,
                totalPages,
                totalCount
            };
        } catch (error) {
            console.error('Error getting top quotes:', error);
            return {
                quotes: [],
                currentPage: page,
                pageSize,
                totalPages: 0,
                totalCount: 0
            };
        }
    }

    /**
     * 获取热门作者列表
     * @param {number} limit - 数量限制
     * @param {boolean} useCache - 是否使用缓存
     * @returns {Promise<Array>} - 作者列表
     */
    async getPopularAuthors(limit = 20, useCache = true) {
        // 如果使用模拟数据，则直接返回模拟数据
        if (this.useMockData) {
            return MockData.getPopularAuthors(limit);
        }

        // 构建查询
        const query = `
            query {
                authors(first: ${limit}, orderBy: "quotes_count", orderDirection: "desc") {
                    id
                    name
                    quotesCount
                }
            }
        `;

        try {
            const result = await this.query(query, {}, useCache);
            return result.authors.map(author => ({
                ...author,
                count: author.quotesCount
            }));
        } catch (error) {
            console.error('Error getting popular authors:', error);
            return [];
        }
    }

    /**
     * 获取热门类别列表
     * @param {number} limit - 数量限制
     * @param {boolean} useCache - 是否使用缓存
     * @returns {Promise<Array>} - 类别列表
     */
    async getPopularCategories(limit = 20, useCache = true) {
        // 如果使用模拟数据，则直接返回模拟数据
        if (this.useMockData) {
            return MockData.getPopularCategories(limit);
        }

        // 构建查询
        const query = `
            query {
                categories(first: ${limit}, orderBy: "quotes_count", orderDirection: "desc") {
                    id
                    name
                    quotesCount
                }
            }
        `;

        try {
            const result = await this.query(query, {}, useCache);
            return result.categories.map(category => ({
                ...category,
                count: category.quotesCount
            }));
        } catch (error) {
            console.error('Error getting popular categories:', error);
            return [];
        }
    }

    /**
     * 获取热门来源列表
     * @param {number} limit - 数量限制
     * @param {boolean} useCache - 是否使用缓存
     * @returns {Promise<Array>} - 来源列表
     */
    async getPopularSources(limit = 20, useCache = true) {
        // 如果使用模拟数据，则直接返回模拟数据
        if (this.useMockData) {
            return MockData.getPopularSources(limit);
        }

        // 构建查询
        const query = `
            query {
                sources(first: ${limit}, orderBy: "quotes_count", orderDirection: "desc") {
                    id
                    name
                    quotesCount
                }
            }
        `;

        try {
            const result = await this.query(query, {}, useCache);
            return result.sources.map(source => ({
                ...source,
                count: source.quotesCount
            }));
        } catch (error) {
            console.error('Error getting popular sources:', error);
            return [];
        }
    }

    /**
     * 获取统计信息
     * @param {boolean} useCache - 是否使用缓存
     * @returns {Promise<Object>} - 统计信息
     */
    async getStats(useCache = true) {
        // 如果使用模拟数据，则直接返回模拟数据
        if (this.useMockData) {
            return MockData.getStats();
        }

        // 构建查询
        const query = `
            query {
                authorsCount
                categoriesCount
                sourcesCount
                quotesCount
            }
        `;

        try {
            const result = await this.query(query, {}, useCache);
            return {
                authorsCount: result.authorsCount,
                categoriesCount: result.categoriesCount,
                sourcesCount: result.sourcesCount,
                quotesCount: result.quotesCount
            };
        } catch (error) {
            console.error('Error getting stats:', error);
            return {
                authorsCount: 0,
                categoriesCount: 0,
                sourcesCount: 0,
                quotesCount: 0
            };
        }
    }

    /**
     * 获取作者列表
     * @param {number} page - 页码
     * @param {number} pageSize - 每页数量
     * @param {string} search - 搜索关键词
     * @param {boolean} useCache - 是否使用缓存
     * @returns {Promise<Object>} - 作者列表和分页信息
     */
    async getAuthors(page = 1, pageSize = 20, search = '', useCache = true) {
        // 如果使用模拟数据，则直接返回模拟数据
        if (this.useMockData) {
            return MockData.getAuthors(page, pageSize, search);
        }

        // 计算跳过的数量
        const skip = (page - 1) * pageSize;

        // 构建查询
        const query = `
            query {
                authors(
                    first: ${pageSize}
                    skip: ${skip}
                    ${search ? `search: "${search}"` : ''}
                ) {
                    id
                    name
                    quotesCount
                }
                authorsCount
            }
        `;

        try {
            const result = await this.query(query, {}, useCache);

            // 计算总页数
            const totalCount = result.authorsCount;
            const totalPages = Math.ceil(totalCount / pageSize);

            return {
                authors: result.authors.map(author => ({
                    ...author,
                    count: author.quotesCount
                })),
                currentPage: page,
                pageSize,
                totalPages,
                totalCount
            };
        } catch (error) {
            console.error('Error getting authors:', error);
            return {
                authors: [],
                currentPage: page,
                pageSize,
                totalPages: 0,
                totalCount: 0
            };
        }
    }

    /**
     * 获取类别列表
     * @param {number} page - 页码
     * @param {number} pageSize - 每页数量
     * @param {string} search - 搜索关键词
     * @param {boolean} useCache - 是否使用缓存
     * @returns {Promise<Object>} - 类别列表和分页信息
     */
    async getCategories(page = 1, pageSize = 20, search = '', useCache = true) {
        // 如果使用模拟数据，则直接返回模拟数据
        if (this.useMockData) {
            return MockData.getCategories(page, pageSize, search);
        }

        // 计算跳过的数量
        const skip = (page - 1) * pageSize;

        // 构建查询
        const query = `
            query {
                categories(
                    first: ${pageSize}
                    skip: ${skip}
                    ${search ? `search: "${search}"` : ''}
                ) {
                    id
                    name
                    quotesCount
                }
                categoriesCount
            }
        `;

        try {
            const result = await this.query(query, {}, useCache);

            // 计算总页数
            const totalCount = result.categoriesCount;
            const totalPages = Math.ceil(totalCount / pageSize);

            return {
                categories: result.categories.map(category => ({
                    ...category,
                    count: category.quotesCount
                })),
                currentPage: page,
                pageSize,
                totalPages,
                totalCount
            };
        } catch (error) {
            console.error('Error getting categories:', error);
            return {
                categories: [],
                currentPage: page,
                pageSize,
                totalPages: 0,
                totalCount: 0
            };
        }
    }

    /**
     * 获取"wisdom"类别的名言列表
     * @param {number} page - 页码
     * @param {number} pageSize - 每页数量
     * @param {boolean} useCache - 是否使用缓存
     * @returns {Promise<Object>} - 名言列表和分页信息
     */
    async getWisdomQuotes(page = 1, pageSize = 20, useCache = true) {
        // 如果使用模拟数据，则直接返回模拟数据
        if (this.useMockData) {
            return MockData.getQuotes(page, pageSize, { categoryId: "140285" });
        }

        // 计算跳过的数量
        const skip = (page - 1) * pageSize;

        // 使用精简的查询，获取必要的字段，包括类别和来源
        const query = `
            query {
                quotes(
                    first: ${pageSize}
                    skip: ${skip}
                    categoryId: "140285"
                ) {
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
                }
                filteredQuotesCount(categoryId: "140285")
            }
        `;

        try {
            const result = await this.query(query, {}, useCache);

            // 计算总页数
            const totalCount = result.filteredQuotesCount;
            const totalPages = Math.ceil(totalCount / pageSize);

            // 处理结果，直接使用API返回的类别和来源数据
            const quotes = result.quotes;

            return {
                quotes,
                currentPage: page,
                pageSize,
                totalPages,
                totalCount
            };
        } catch (error) {
            console.error('Error getting wisdom quotes:', error);
            return {
                quotes: [],
                currentPage: page,
                pageSize,
                totalPages: 0,
                totalCount: 0
            };
        }
    }

    /**
     * 获取来源列表
     * @param {number} page - 页码
     * @param {number} pageSize - 每页数量
     * @param {string} search - 搜索关键词
     * @param {boolean} useCache - 是否使用缓存
     * @returns {Promise<Object>} - 来源列表和分页信息
     */
    async getSources(page = 1, pageSize = 20, search = '', useCache = true) {
        // 如果使用模拟数据，则直接返回模拟数据
        if (this.useMockData) {
            return MockData.getSources(page, pageSize, search);
        }

        // 计算跳过的数量
        const skip = (page - 1) * pageSize;

        // 构建查询
        const query = `
            query {
                sources(
                    first: ${pageSize}
                    skip: ${skip}
                    ${search ? `search: "${search}"` : ''}
                ) {
                    id
                    name
                    quotesCount
                }
                sourcesCount
            }
        `;

        try {
            const result = await this.query(query, {}, useCache);

            // 计算总页数
            const totalCount = result.sourcesCount;
            const totalPages = Math.ceil(totalCount / pageSize);

            return {
                sources: result.sources.map(source => ({
                    ...source,
                    count: source.quotesCount
                })),
                currentPage: page,
                pageSize,
                totalPages,
                totalCount
            };
        } catch (error) {
            console.error('Error getting sources:', error);
            return {
                sources: [],
                currentPage: page,
                pageSize,
                totalPages: 0,
                totalCount: 0
            };
        }
    }

    /**
     * 根据名称获取类别
     * @param {string} name - 类别名称
     * @param {boolean} useCache - 是否使用缓存
     * @returns {Promise<Object>} - 类别详情
     */
    async getCategoryByName(name, useCache = true) {
        // 如果使用模拟数据，则直接返回模拟数据
        if (this.useMockData) {
            return MockData.getCategoryByName(name);
        }

        // 使用精确名称查询API
        const query = `
            query {
                categoryByExactName(name: "${name}") {
                    id
                    name
                    createdAt
                    updatedAt
                    quotesCount
                }
            }
        `;

        try {
            const result = await this.query(query, {}, useCache);

            if (result.categoryByExactName) {
                const category = result.categoryByExactName;
                // 将quotesCount映射为count以保持API兼容性
                category.count = category.quotesCount || 0;
                console.log('Found exact match for category using new API:', category);
                return category;
            }

            console.log(`No category found for name: ${name} using new API, falling back to old method`);

            // 如果新API没有找到结果，则回退到旧方法
            // 实际API调用逻辑
            const fallbackQuery = `
                query {
                    categories(search: "${name}", first: 100) {
                        id
                        name
                        createdAt
                        updatedAt
                        quotesCount
                    }
                }
            `;

            const fallbackResult = await this.query(fallbackQuery, {}, useCache);

            // 如果找到匹配的类别
            if (fallbackResult.categories && fallbackResult.categories.length > 0) {
                // 尝试精确匹配
                const exactMatch = fallbackResult.categories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
                if (exactMatch) {
                    // 将quotesCount映射为count以保持API兼容性
                    exactMatch.count = exactMatch.quotesCount || 0;
                    console.log('Found exact match for category using old API:', exactMatch);
                    return exactMatch;
                }

                // 如果没有精确匹配，尝试匹配开头的类别
                const startsWithMatch = fallbackResult.categories.find(cat =>
                    cat.name.toLowerCase().startsWith(name.toLowerCase()) ||
                    name.toLowerCase().startsWith(cat.name.toLowerCase())
                );
                if (startsWithMatch) {
                    startsWithMatch.count = startsWithMatch.quotesCount || 0;
                    console.log('Found starts-with match for category using old API:', startsWithMatch);
                    return startsWithMatch;
                }

                // 如果还是没有匹配，返回第一个结果
                const category = fallbackResult.categories[0];
                // 将quotesCount映射为count以保持API兼容性
                category.count = category.quotesCount || 0;
                console.log('Using first result for category using old API:', category);
                return category;
            }

            return null;
        } catch (error) {
            console.error('Error getting category by name:', error);
            return null;
        }
    }



    /**
     * 根据名称获取作者
     * @param {string} name - 作者名称
     * @param {boolean} useCache - 是否使用缓存
     * @returns {Promise<Object>} - 作者详情
     */
    async getAuthorByName(name, useCache = true) {
        // 如果使用模拟数据，则直接返回模拟数据
        if (this.useMockData) {
            return MockData.getAuthorByName(name);
        }

        // 使用精确名称查询API
        const query = `
            query {
                authorByExactName(name: "${name}") {
                    id
                    name
                    createdAt
                    updatedAt
                    quotesCount
                }
            }
        `;

        try {
            const result = await this.query(query, {}, useCache);

            if (result.authorByExactName) {
                const author = result.authorByExactName;
                // 将quotesCount映射为count以保持API兼容性
                author.count = author.quotesCount || 0;
                console.log('Found exact match for author using new API:', author);
                return author;
            }

            console.log(`No author found for name: ${name} using new API, falling back to old method`);

            // 如果新API没有找到结果，则回退到旧方法
            // 特殊处理"einstein"作者
            if (name.toLowerCase() === 'einstein') {
                // 直接使用ID查询"Albert Einstein"作者
                const queryById = `
                    query {
                        author(id: 2013) {
                            id
                            name
                            createdAt
                            updatedAt
                            quotesCount
                        }
                    }
                `;

                const resultById = await this.query(queryById, {}, useCache);

                if (resultById.author) {
                    const author = resultById.author;
                    // 将quotesCount映射为count以保持API兼容性
                    author.count = author.quotesCount || 0;
                    return author;
                }
            }

            // 实际API调用逻辑
            const fallbackQuery = `
                query {
                    authors(search: "${name}", first: 100) {
                        id
                        name
                        createdAt
                        updatedAt
                        quotesCount
                    }
                }
            `;

            const fallbackResult = await this.query(fallbackQuery, {}, useCache);

            // 如果找到匹配的作者
            if (fallbackResult.authors && fallbackResult.authors.length > 0) {
                // 尝试精确匹配
                const exactMatch = fallbackResult.authors.find(auth => auth.name.toLowerCase() === name.toLowerCase());
                if (exactMatch) {
                    // 将quotesCount映射为count以保持API兼容性
                    exactMatch.count = exactMatch.quotesCount || 0;
                    console.log('Found exact match for author using old API:', exactMatch);
                    return exactMatch;
                }

                // 如果没有精确匹配，尝试匹配开头的作者
                const startsWithMatch = fallbackResult.authors.find(auth =>
                    auth.name.toLowerCase().startsWith(name.toLowerCase()) ||
                    name.toLowerCase().startsWith(auth.name.toLowerCase())
                );
                if (startsWithMatch) {
                    startsWithMatch.count = startsWithMatch.quotesCount || 0;
                    console.log('Found starts-with match for author using old API:', startsWithMatch);
                    return startsWithMatch;
                }

                // 如果还是没有匹配，返回第一个结果
                const author = fallbackResult.authors[0];
                // 将quotesCount映射为count以保持API兼容性
                author.count = author.quotesCount || 0;
                console.log('Using first result for author using old API:', author);
                return author;
            }

            return null;
        } catch (error) {
            console.error('Error getting author by name:', error);
            return null;
        }
    }



    /**
     * 根据名称获取来源
     * @param {string} name - 来源名称
     * @param {boolean} useCache - 是否使用缓存
     * @returns {Promise<Object>} - 来源详情
     */
    async getSourceByName(name, useCache = true) {
        // 如果使用模拟数据，则直接返回模拟数据
        if (this.useMockData) {
            return MockData.getSourceByName(name);
        }

        // 使用精确名称查询API
        const query = `
            query {
                sourceByExactName(name: "${name}") {
                    id
                    name
                    createdAt
                    updatedAt
                    quotesCount
                }
            }
        `;

        try {
            const result = await this.query(query, {}, useCache);

            if (result.sourceByExactName) {
                const source = result.sourceByExactName;
                // 将quotesCount映射为count以保持API兼容性
                source.count = source.quotesCount || 0;
                console.log('Found exact match for source using new API:', source);
                return source;
            }

            console.log(`No source found for name: ${name} using new API, falling back to old method`);

            // 如果新API没有找到结果，则回退到旧方法
            // 特殊处理"interview"来源
            if (name.toLowerCase() === 'interview') {
                // 直接使用ID查询"Interview"来源
                const queryById = `
                    query {
                        source(id: 22141) {
                            id
                            name
                            createdAt
                            updatedAt
                            quotesCount
                        }
                    }
                `;

                const resultById = await this.query(queryById, {}, useCache);

                if (resultById.source) {
                    const source = resultById.source;
                    // 将quotesCount映射为count以保持API兼容性
                    source.count = source.quotesCount || 0;
                    return source;
                }
            }

            // 实际API调用逻辑
            const fallbackQuery = `
                query {
                    sources(search: "${name}", first: 100) {
                        id
                        name
                        createdAt
                        updatedAt
                        quotesCount
                    }
                }
            `;

            const fallbackResult = await this.query(fallbackQuery, {}, useCache);

            // 如果找到匹配的来源
            if (fallbackResult.sources && fallbackResult.sources.length > 0) {
                // 尝试精确匹配
                const exactMatch = fallbackResult.sources.find(src => src.name.toLowerCase() === name.toLowerCase());
                if (exactMatch) {
                    // 将quotesCount映射为count以保持API兼容性
                    exactMatch.count = exactMatch.quotesCount || 0;
                    console.log('Found exact match for source using old API:', exactMatch);
                    return exactMatch;
                }

                // 如果没有精确匹配，尝试匹配开头的来源
                const startsWithMatch = fallbackResult.sources.find(src =>
                    src.name.toLowerCase().startsWith(name.toLowerCase()) ||
                    name.toLowerCase().startsWith(src.name.toLowerCase())
                );
                if (startsWithMatch) {
                    startsWithMatch.count = startsWithMatch.quotesCount || 0;
                    console.log('Found starts-with match for source using old API:', startsWithMatch);
                    return startsWithMatch;
                }

                // 如果还是没有匹配，返回第一个结果
                const source = fallbackResult.sources[0];
                // 将quotesCount映射为count以保持API兼容性
                source.count = source.quotesCount || 0;
                console.log('Using first result for source using old API:', source);
                return source;
            }

            return null;
        } catch (error) {
            console.error('Error getting source by name:', error);
            return null;
        }
    }


}

// 创建全局API客户端实例
// 如果存在全局配置，则使用配置中的设置
if (window.AppConfig) {
    // 强制禁用模拟数据，始终使用真实API
    window.ApiClient = new ApiClient(window.AppConfig.apiEndpoint, false);

    // 如果开启了调试模式，则输出配置信息
    if (window.AppConfig.debug) {
        console.log('API Client initialized with config:', {
            apiEndpoint: window.AppConfig.apiEndpoint,
            useMockData: false // 强制禁用模拟数据
        });
    }
} else {
    // 如果没有全局配置，则使用默认设置
    window.ApiClient = new ApiClient('http://43.153.11.77:8000/api/', false);
}
