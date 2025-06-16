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

    /**
     * 获取wisdom类别的名言列表
     * @param {number} page - 页码
     * @param {number} pageSize - 每页数量
     * @param {boolean} useCache - 是否使用缓存
     * @returns {Promise<Object>} - 名言列表和分页信息
     */
    async getWisdomQuotes(page = 1, pageSize = 20, useCache = true) {
        // 如果使用模拟数据，则直接返回模拟数据
        if (this.useMockData) {
            return MockData.getQuotes(page, pageSize, { categoryId: 'wisdom' });
        }

        // 计算跳过的数量
        const skip = (page - 1) * pageSize;

        // 构建查询
        const query = `
            query {
                quotes(
                    first: ${pageSize}
                    skip: ${skip}
                    categoryId: "104626"
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
                filteredQuotesCount(categoryId: "104626")
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
    window.ApiClient = new ApiClient('http://127.0.0.1:8001/api/', false);
}
/**
 * URL处理器
 * 负责处理SEO友好的URL生成和解析
 */

const UrlHandler = {
    /**
     * 将文本转换为URL友好的slug
     * @param {string} text - 要转换的文本
     * @returns {string} - URL友好的slug
     */
    slugify(text) {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')        // 将空格替换为连字符
            .replace(/[^\w\-]+/g, '')    // 删除非单词字符
            .replace(/\-\-+/g, '-')      // 将多个连字符替换为单个连字符
            .replace(/^-+/, '')          // 删除开头的连字符
            .replace(/-+$/, '');         // 删除结尾的连字符
    },

    /**
     * 生成作者页面的URL
     * @param {Object} author - 作者对象
     * @returns {string} - 作者页面的URL
     */
    getAuthorUrl(author) {
        const slug = this.slugify(author.name);
        // 使用查询参数而不是路径参数
        // 添加ID作为额外参数，但保持URL中显示名称
        return `/${this.getBasePath()}author.html?name=${encodeURIComponent(slug)}&id=${author.id}`;
    },

    /**
     * 获取基础路径
     * @returns {string} - 基础路径
     */
    getBasePath() {
        // 如果在开发环境中，返回空字符串
        // 如果在生产环境中，返回项目的基础路径
        return '';
    },

    /**
     * 生成类别页面的URL
     * @param {Object} category - 类别对象
     * @returns {string} - 类别页面的URL
     */
    getCategoryUrl(category) {
        const slug = this.slugify(category.name);
        // 使用查询参数而不是路径参数
        // 添加ID作为额外参数，但保持URL中显示名称
        return `/${this.getBasePath()}category.html?name=${encodeURIComponent(slug)}&id=${category.id}`;
    },

    /**
     * 生成来源页面的URL
     * @param {Object} source - 来源对象
     * @returns {string} - 来源页面的URL
     */
    getSourceUrl(source) {
        const slug = this.slugify(source.name);
        // 使用查询参数而不是路径参数
        // 添加ID作为额外参数，但保持URL中显示名称
        return `/${this.getBasePath()}source.html?name=${encodeURIComponent(slug)}&id=${source.id}`;
    },

    /**
     * 生成名言详情页面的URL
     * @param {Object} quote - 名言对象
     * @returns {string} - 名言详情页面的URL
     */
    getQuoteUrl(quote) {
        // 使用查询参数而不是路径参数
        return `/${this.getBasePath()}quote.html?id=${quote.id}`;
    },

    /**
     * 从URL中提取ID
     * @param {string} url - 包含ID的URL
     * @returns {string|null} - 提取的ID，如果没有找到则返回null
     */
    extractIdFromUrl(url) {
        // 匹配URL末尾的数字ID
        const match = url.match(/-(\d+)\.html$/);
        return match ? match[1] : null;
    },

    /**
     * 从当前URL中获取类别名称
     * @returns {string|null} - 类别名称，如果不是类别页面则返回null
     */
    getCategoryNameFromUrl() {
        // 首先尝试从查询参数中获取
        const nameParam = this.getQueryParam('name');
        if (nameParam) {
            return nameParam;
        }

        // 然后尝试从路径中获取
        const path = window.location.pathname;
        const match = path.match(/\/(?:[^\/]+\/)*categories\/([^\/]+)\.html$/);
        if (match) {
            return this.deslugify(match[1]);
        }
        return null;
    },

    /**
     * 从当前URL中获取作者名称
     * @returns {string|null} - 作者名称，如果不是作者页面则返回null
     */
    getAuthorNameFromUrl() {
        // 首先尝试从查询参数中获取
        const nameParam = this.getQueryParam('name');
        if (nameParam) {
            return nameParam;
        }

        // 然后尝试从路径中获取
        const path = window.location.pathname;
        const match = path.match(/\/(?:[^\/]+\/)*authors\/([^\/]+)\.html$/);
        if (match) {
            return this.deslugify(match[1]);
        }
        return null;
    },

    /**
     * 从当前URL中获取来源名称
     * @returns {string|null} - 来源名称，如果不是来源页面则返回null
     */
    getSourceNameFromUrl() {
        // 首先尝试从查询参数中获取
        const nameParam = this.getQueryParam('name');
        if (nameParam) {
            return nameParam;
        }

        // 然后尝试从路径中获取
        const path = window.location.pathname;
        const match = path.match(/\/(?:[^\/]+\/)*sources\/([^\/]+)\.html$/);
        if (match) {
            return this.deslugify(match[1]);
        }
        return null;
    },

    /**
     * 从当前URL中获取名言ID
     * @returns {string|null} - 名言ID，如果不是名言详情页面则返回null
     */
    getQuoteIdFromUrl() {
        // 首先尝试从查询参数中获取
        const idParam = this.getQueryParam('id');
        if (idParam) {
            return idParam;
        }

        // 然后尝试从路径中获取
        const path = window.location.pathname;
        const match = path.match(/\/(?:[^\/]+\/)*quotes\/[^\/]+-?(\d+)\.html$/);
        if (match) {
            return match[1];
        }
        return null;
    },

    /**
     * 从当前URL中获取类别ID
     * @returns {string|null} - 类别ID，如果不存在则返回null
     */
    getCategoryIdFromUrl() {
        return this.getQueryParam('id');
    },

    /**
     * 从当前URL中获取作者ID
     * @returns {string|null} - 作者ID，如果不存在则返回null
     */
    getAuthorIdFromUrl() {
        return this.getQueryParam('id');
    },

    /**
     * 从当前URL中获取来源ID
     * @returns {string|null} - 来源ID，如果不存在则返回null
     */
    getSourceIdFromUrl() {
        return this.getQueryParam('id');
    },

    /**
     * 从当前URL中获取类别ID
     * @returns {string|null} - 类别ID，如果不存在则返回null
     */
    getCategoryIdFromUrl() {
        return this.getQueryParam('id');
    },

    /**
     * 从当前URL中获取作者ID
     * @returns {string|null} - 作者ID，如果不存在则返回null
     */
    getAuthorIdFromUrl() {
        return this.getQueryParam('id');
    },

    /**
     * 从当前URL中获取来源ID
     * @returns {string|null} - 来源ID，如果不存在则返回null
     */
    getSourceIdFromUrl() {
        return this.getQueryParam('id');
    },

    /**
     * 将slug转换回可读文本（近似）
     * @param {string} slug - 要转换的slug
     * @returns {string} - 可读文本
     */
    deslugify(slug) {
        return slug
            .replace(/-/g, ' ')  // 将连字符替换为空格
            .replace(/\b\w/g, l => l.toUpperCase());  // 将每个单词的首字母大写
    },

    /**
     * 获取URL中的查询参数
     * @param {string} name - 参数名
     * @returns {string|null} - 参数值，如果不存在则返回null
     */
    getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },

    /**
     * 更新URL中的查询参数，不刷新页面
     * @param {string} name - 参数名
     * @param {string} value - 参数值
     */
    updateQueryParam(name, value) {
        const url = new URL(window.location.href);
        url.searchParams.set(name, value);
        window.history.pushState({}, '', url);
    },

    /**
     * 删除URL中的查询参数，不刷新页面
     * @param {string} name - 参数名
     */
    removeQueryParam(name) {
        const url = new URL(window.location.href);
        url.searchParams.delete(name);
        window.history.pushState({}, '', url);
    }
};

// 导出模块
window.UrlHandler = UrlHandler;
/**
 * 组件加载器
 * 负责加载HTML组件并处理组件初始化
 */

// 组件加载器对象
const ComponentLoader = {
    // 已加载的组件缓存
    componentCache: {},

    // 加载组件
    async loadComponent(containerId, componentName, params = {}, forceReload = false) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with ID "${containerId}" not found.`);
            return false;
        }

        // 如果强制重新加载，则清除缓存
        if (forceReload && this.componentCache[componentName]) {
            console.log(`Force reloading component: ${componentName}`);
            delete this.componentCache[componentName];
        }

        try {
            // 尝试从服务器加载组件
            let html;
            try {
                const response = await fetch(`components/${componentName}.html`);
                if (response.ok) {
                    html = await response.text();
                    this.componentCache[componentName] = html;
                } else {
                    throw new Error(`Failed to load component: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.warn(`Could not load component ${componentName} from server:`, error);

                // 如果服务器加载失败，使用备用组件
                html = this.getFallbackComponent(componentName);
                this.componentCache[componentName] = html;
            }

            // 替换模板变量
            Object.entries(params).forEach(([key, value]) => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                html = html.replace(regex, value || '');
            });

            // 插入HTML
            container.innerHTML = html;

            // 初始化组件
            this.initComponent(componentName, container, params);

            return true;
        } catch (error) {
            console.error(`Error loading component ${componentName}:`, error);
            container.innerHTML = `<div class="p-4 bg-red-100 text-red-800 rounded-md">Failed to load component: ${componentName}</div>`;
            return false;
        }
    },

    // 初始化组件
    initComponent(componentName, element, params) {
        // 检查是否有对应的初始化函数
        const initFunctionName = `init${this.capitalize(componentName)}Component`;

        // 如果全局范围内存在初始化函数，则调用它
        if (typeof window[initFunctionName] === 'function') {
            window[initFunctionName](element, params);
        } else {
            // 尝试加载组件的JavaScript文件
            this.loadComponentScript(componentName);
        }
    },

    // 加载组件的JavaScript文件
    loadComponentScript(componentName) {
        // 检查是否已经加载了合并后的JavaScript文件
        if (document.querySelector('script[src="js/dist/components.min.js"]')) {
            console.log(`Using combined components file for: ${componentName}`);
            return;
        }

        const scriptPath = `js/components/${componentName}.js`;

        // 检查脚本是否已加载
        if (document.querySelector(`script[src="${scriptPath}"]`)) {
            return;
        }

        // 创建脚本元素
        const script = document.createElement('script');
        script.src = scriptPath;
        script.onerror = () => console.warn(`Could not load component script: ${scriptPath}`);

        // 添加到文档
        document.body.appendChild(script);
    },

    // 将字符串首字母大写
    capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    // 获取备用组件内容
    getFallbackComponent(componentName) {
        // 为常用组件提供备用内容
        switch(componentName) {
            case 'navigation':
                return `
                <nav class="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
                    <div class="container mx-auto px-4 py-3">
                        <div class="flex justify-between items-center">
                            <!-- Logo -->
                            <div class="flex items-center space-x-2">
                                <i class="fas fa-quote-left text-yellow-500 text-2xl"></i>
                                <h1 class="text-xl font-bold">QuotesCollection</h1>
                            </div>

                            <!-- Navigation -->
                            <div class="hidden md:flex space-x-6">
                                <a href="index.html" class="nav-link font-medium text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300" data-page="home">Home</a>
                                <a href="authors.html" class="nav-link font-medium text-gray-600 hover:text-yellow-500 dark:text-gray-300 dark:hover:text-yellow-400" data-page="authors">Authors</a>
                                <a href="categories.html" class="nav-link font-medium text-gray-600 hover:text-yellow-500 dark:text-gray-300 dark:hover:text-yellow-400" data-page="categories">Categories</a>
                                <a href="sources.html" class="nav-link font-medium text-gray-600 hover:text-yellow-500 dark:text-gray-300 dark:hover:text-yellow-400" data-page="sources">Sources</a>
                            </div>

                            <!-- Search and Theme Toggle -->
                            <div class="flex items-center space-x-4">
                                <div class="relative hidden md:block">
                                    <input type="text" placeholder="Search quotes..." class="pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800 dark:text-gray-100">
                                    <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                                </div>
                                <button id="theme-toggle" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <i class="fas fa-moon text-gray-600 dark:hidden"></i>
                                    <i class="fas fa-sun text-yellow-300 hidden dark:block"></i>
                                </button>
                                <button class="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" id="mobile-menu-button">
                                    <i class="fas fa-bars text-gray-600 dark:text-gray-300"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Mobile Menu (Hidden by default) -->
                        <div id="mobile-menu" class="hidden md:hidden mt-4 pb-2">
                            <div class="relative mb-4">
                                <input type="text" placeholder="Search quotes..." class="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800 dark:text-gray-100">
                                <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                            </div>
                            <div class="flex flex-col space-y-3">
                                <a href="index.html" class="mobile-nav-link font-medium text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300" data-page="home">Home</a>
                                <a href="authors.html" class="mobile-nav-link font-medium text-gray-600 hover:text-yellow-500 dark:text-gray-300 dark:hover:text-yellow-400" data-page="authors">Authors</a>
                                <a href="categories.html" class="mobile-nav-link font-medium text-gray-600 hover:text-yellow-500 dark:text-gray-300 dark:hover:text-yellow-400" data-page="categories">Categories</a>
                                <a href="sources.html" class="mobile-nav-link font-medium text-gray-600 hover:text-yellow-500 dark:text-gray-300 dark:hover:text-yellow-400" data-page="sources">Sources</a>
                            </div>
                        </div>
                    </div>
                </nav>
                `;

            case 'footer':
                return `
                <footer class="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12">
                    <div class="container mx-auto px-4 py-8">
                        <div class="flex flex-col md:flex-row justify-between items-center">
                            <div class="mb-4 md:mb-0">
                                <div class="flex items-center space-x-2">
                                    <i class="fas fa-quote-left text-yellow-500 text-xl"></i>
                                    <span class="text-lg font-bold">QuotesCollection</span>
                                </div>
                                <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Wisdom from the ages, at your fingertips.</p>
                            </div>
                            <div class="flex flex-wrap justify-center gap-8">
                                <div>
                                    <h3 class="font-semibold mb-3 text-gray-800 dark:text-gray-200">Explore</h3>
                                    <ul class="space-y-2 text-sm">
                                        <li><a href="index.html" class="text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400">Home</a></li>
                                        <li><a href="authors.html" class="text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400">Authors</a></li>
                                        <li><a href="categories.html" class="text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400">Categories</a></li>
                                        <li><a href="sources.html" class="text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400">Sources</a></li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 class="font-semibold mb-3 text-gray-800 dark:text-gray-200">About</h3>
                                    <ul class="space-y-2 text-sm">
                                        <li><a href="#" class="text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400">About Us</a></li>
                                        <li><a href="#" class="text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400">Privacy Policy</a></li>
                                        <li><a href="#" class="text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400">Terms of Service</a></li>
                                        <li><a href="#" class="text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400">Contact</a></li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 class="font-semibold mb-3 text-gray-800 dark:text-gray-200">Connect</h3>
                                    <div class="flex space-x-4">
                                        <a href="#" class="text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400">
                                            <i class="fab fa-twitter text-lg"></i>
                                        </a>
                                        <a href="#" class="text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400">
                                            <i class="fab fa-facebook text-lg"></i>
                                        </a>
                                        <a href="#" class="text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400">
                                            <i class="fab fa-instagram text-lg"></i>
                                        </a>
                                        <a href="#" class="text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400">
                                            <i class="fab fa-github text-lg"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="border-t border-gray-200 dark:border-gray-800 mt-6 pt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                            <p>&copy; 2023 QuotesCollection. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
                `;

            case 'quotes-list':
                return `
                <div class="quotes-list-component">
                    <h2 class="text-2xl font-bold mb-6 flex items-center">
                        <i class="fas fa-quote-right text-yellow-500 mr-2" aria-hidden="true"></i>
                        Famous Quotes
                    </h2>

                    <div class="space-y-6" id="quotes-list" role="feed" aria-busy="true" aria-label="Quotes list">
                        <div class="quote-card-component p-6">
                            <p class="text-lg font-serif leading-relaxed mb-4">"The greatest glory in living lies not in never falling, but in rising every time we fall."</p>
                            <div class="flex items-center mt-4">
                                <div class="flex-shrink-0 mr-4">
                                    <div class="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-600 dark:text-yellow-300 border-2 border-yellow-400 dark:border-yellow-600">
                                        <span class="text-sm font-bold">N</span>
                                    </div>
                                </div>
                                <div>
                                    <a href="#" class="font-semibold text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors duration-300">Nelson Mandela</a>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Autobiography</p>
                                </div>
                            </div>
                            <div class="mt-4 flex flex-wrap gap-2">
                                <a href="#" class="tag px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-300">inspiration</a>
                                <a href="#" class="tag px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-300">life</a>
                            </div>
                        </div>
                        <div class="quote-card-component p-6">
                            <p class="text-lg font-serif leading-relaxed mb-4">"Two things are infinite: the universe and human stupidity; and I'm not sure about the universe."</p>
                            <div class="flex items-center mt-4">
                                <div class="flex-shrink-0 mr-4">
                                    <div class="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-600 dark:text-yellow-300 border-2 border-yellow-400 dark:border-yellow-600">
                                        <span class="text-sm font-bold">A</span>
                                    </div>
                                </div>
                                <div>
                                    <a href="#" class="font-semibold text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors duration-300">Albert Einstein</a>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Letters</p>
                                </div>
                            </div>
                            <div class="mt-4 flex flex-wrap gap-2">
                                <a href="#" class="tag px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-300">humor</a>
                                <a href="#" class="tag px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-300">science</a>
                            </div>
                        </div>
                    </div>
                </div>
                `;

            case 'pagination':
                return `
                <nav class="flex flex-col items-center mt-10 space-y-4" aria-label="Quotes pagination">
                    <div class="flex items-center space-x-1" role="navigation" aria-label="Pagination Navigation">
                        <button class="pagination-btn pagination-btn-disabled btn btn-icon btn-sm btn-gray disabled" aria-label="First page" aria-disabled="true">
                            <i class="fas fa-angle-double-left" aria-hidden="true"></i>
                        </button>
                        <button class="pagination-btn pagination-btn-disabled btn btn-icon btn-sm btn-gray disabled" aria-label="Previous page" aria-disabled="true">
                            <i class="fas fa-angle-left" aria-hidden="true"></i>
                        </button>
                        <button class="pagination-btn btn btn-sm btn-primary w-10 h-10" aria-label="Page 1" aria-current="page">1</button>
                        <button class="pagination-btn btn btn-sm btn-gray w-10 h-10" aria-label="Page 2">2</button>
                        <button class="pagination-btn btn btn-sm btn-gray w-10 h-10" aria-label="Page 3">3</button>
                        <span class="px-2 text-gray-600 dark:text-gray-400" aria-hidden="true">...</span>
                        <button class="pagination-btn btn btn-sm btn-gray w-10 h-10" aria-label="Page 10">10</button>
                        <button class="pagination-btn btn btn-icon btn-sm btn-gray" aria-label="Next page">
                            <i class="fas fa-angle-right" aria-hidden="true"></i>
                        </button>
                        <button class="pagination-btn btn btn-icon btn-sm btn-gray" aria-label="Last page">
                            <i class="fas fa-angle-double-right" aria-hidden="true"></i>
                        </button>
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400" aria-live="polite">
                        Showing <span class="font-medium">1-20</span> of <span class="font-medium">100</span> quotes
                    </div>
                </nav>
                `;

            case 'popular-topics':
                return `
                <!-- Popular Categories -->
                <section class="card-container mb-8 p-6" aria-labelledby="popular-categories-heading">
                    <h3 id="popular-categories-heading" class="text-xl font-bold mb-4 flex items-center">
                        <i class="fas fa-tags text-yellow-500 mr-2" aria-hidden="true"></i>
                        Popular Categories
                    </h3>
                    <div class="flex flex-wrap gap-2" role="list" aria-label="Popular categories list">
                        <a href="#" class="tag px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-300">love (42)</a>
                        <a href="#" class="tag px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-300">inspiration (36)</a>
                        <a href="#" class="tag px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-300">philosophy (28)</a>
                        <a href="#" class="tag px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-300">life (25)</a>
                        <a href="#" class="tag px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-300">truth (19)</a>
                    </div>
                </section>

                <!-- Popular Authors -->
                <section class="card-container mb-8 p-6" aria-labelledby="popular-authors-heading">
                    <h3 id="popular-authors-heading" class="text-xl font-bold mb-4 flex items-center">
                        <i class="fas fa-user-pen text-yellow-500 mr-2" aria-hidden="true"></i>
                        Popular Authors
                    </h3>
                    <ul class="space-y-3" role="list" aria-label="Popular authors list">
                        <li class="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300">
                            <div class="flex items-center space-x-2 w-full">
                                <div class="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-600 dark:text-yellow-300 flex-shrink-0 border-2 border-yellow-400 dark:border-yellow-600">
                                    <span class="text-xs font-bold">W</span>
                                </div>
                                <div class="flex-grow ml-2">
                                    <a href="#" class="hover:text-yellow-600 dark:hover:text-yellow-400 font-medium transition-colors duration-300">William Shakespeare</a>
                                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                                        <div class="bg-yellow-500 dark:bg-yellow-400 h-1.5 rounded-full" style="width: 100%"></div>
                                    </div>
                                </div>
                                <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">15</span>
                            </div>
                        </li>
                        <li class="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300">
                            <div class="flex items-center space-x-2 w-full">
                                <div class="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-600 dark:text-yellow-300 flex-shrink-0 border-2 border-yellow-400 dark:border-yellow-600">
                                    <span class="text-xs font-bold">H</span>
                                </div>
                                <div class="flex-grow ml-2">
                                    <a href="#" class="hover:text-yellow-600 dark:hover:text-yellow-400 font-medium transition-colors duration-300">Haruki Murakami</a>
                                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                                        <div class="bg-yellow-500 dark:bg-yellow-400 h-1.5 rounded-full" style="width: 80%"></div>
                                    </div>
                                </div>
                                <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">12</span>
                            </div>
                        </li>
                    </ul>
                </section>

                <!-- Popular Sources -->
                <section class="card-container p-6" aria-labelledby="popular-sources-heading">
                    <h3 id="popular-sources-heading" class="text-xl font-bold mb-4 flex items-center">
                        <i class="fas fa-book text-yellow-500 mr-2" aria-hidden="true"></i>
                        Popular Sources
                    </h3>
                    <ul class="space-y-3" role="list" aria-label="Popular sources list">
                        <li class="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300">
                            <div class="flex items-center space-x-2 w-full">
                                <div class="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-600 dark:text-yellow-300 flex-shrink-0">
                                    <i class="fas fa-book text-xs"></i>
                                </div>
                                <div class="flex-grow">
                                    <a href="#" class="hover:text-yellow-600 dark:hover:text-yellow-400 font-medium transition-colors duration-300">Holy Bible</a>
                                </div>
                                <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">8</span>
                            </div>
                        </li>
                        <li class="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300">
                            <div class="flex items-center space-x-2 w-full">
                                <div class="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-600 dark:text-yellow-300 flex-shrink-0">
                                    <i class="fas fa-book text-xs"></i>
                                </div>
                                <div class="flex-grow">
                                    <a href="#" class="hover:text-yellow-600 dark:hover:text-yellow-400 font-medium transition-colors duration-300">Cosmos</a>
                                </div>
                                <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">7</span>
                            </div>
                        </li>
                    </ul>
                </section>
                `;

            default:
                return `<div class="p-4 bg-yellow-100 text-yellow-800 rounded-md">Component '${componentName}' could not be loaded.</div>`;
        }
    },

    // 加载所有页面通用组件
    async loadCommonComponents() {
        await this.loadComponent('navigation-container', 'navigation');
        await this.loadComponent('footer-container', 'footer');
    }
};

// 将组件加载器对象赋值给全局变量
window.ComponentLoader = ComponentLoader;

// 页面加载时初始化通用组件
document.addEventListener('DOMContentLoaded', () => {
    ComponentLoader.loadCommonComponents();
});
/**
 * 主题切换模块
 * 负责处理网站的深色/浅色模式切换
 */

const ThemeModule = {
    // 初始化主题
    init() {
        const themeToggleBtn = document.getElementById('theme-toggle');
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

        // 全站默认使用light主题
        const currentTheme = 'light';

        // 设置初始主题
        this.setTheme(currentTheme);

        // 当按钮被点击时切换主题
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
                this.setTheme(newTheme);
            });
        }

        // 禁用系统主题变化监听和存储变化监听
        // 确保主题始终为light
    },

    // 设置主题
    setTheme(theme) {
        // 忽略传入的主题，始终使用light主题
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');

        // 保存主题偏好
        localStorage.setItem('theme', 'light');

        // 更新导航链接样式
        this.updateActiveNavLink();

        // 触发主题变化事件
        this.dispatchThemeChangeEvent(theme);
    },

    // 更新活动导航链接
    updateActiveNavLink() {
        // 获取当前页面路径
        const currentPath = window.location.pathname;
        const pageName = currentPath.split('/').pop();

        // 设置活动链接样式
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('data-page');
            const linkHref = link.getAttribute('href');

            // 检查是否是当前页面
            const isActive = (linkHref && linkHref.includes(pageName)) ||
                            (linkPage === 'home' && (pageName === 'index.html' || pageName === ''));

            // 更新样式
            if (isActive) {
                link.classList.add('text-yellow-500', 'dark:text-yellow-400');
                link.classList.remove('text-gray-600', 'dark:text-gray-300');
            } else {
                link.classList.remove('text-yellow-500', 'dark:text-yellow-400');
                link.classList.add('text-gray-600', 'dark:text-gray-300');
            }
        });

        // 同样更新移动导航链接
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        mobileNavLinks.forEach(link => {
            const linkPage = link.getAttribute('data-page');
            const linkHref = link.getAttribute('href');

            const isActive = (linkHref && linkHref.includes(pageName)) ||
                            (linkPage === 'home' && (pageName === 'index.html' || pageName === ''));

            if (isActive) {
                link.classList.add('text-yellow-500', 'dark:text-yellow-400');
                link.classList.remove('text-gray-600', 'dark:text-gray-300');
            } else {
                link.classList.remove('text-yellow-500', 'dark:text-yellow-400');
                link.classList.add('text-gray-600', 'dark:text-gray-300');
            }
        });
    },

    // 触发主题变化事件
    dispatchThemeChangeEvent(theme) {
        const event = new CustomEvent('themeChange', { detail: { theme } });
        document.dispatchEvent(event);
    },

    // 获取当前主题
    getCurrentTheme() {
        return document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    },

    // 检查是否是深色模式
    isDarkMode() {
        return this.getCurrentTheme() === 'dark';
    }
};

// 导出模块
window.ThemeModule = ThemeModule;

// 页面加载时初始化主题
document.addEventListener('DOMContentLoaded', () => {
    ThemeModule.init();
});
