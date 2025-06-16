/**
 * 模拟数据模块
 * 提供模拟数据用于开发和测试
 */

const MockData = {
    // 模拟名言数据
    quotes: [
        {
            id: 1,
            content: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
            author: { id: 1, name: "Nelson Mandela" },
            categories: [{ id: 1, name: "inspiration" }, { id: 2, name: "life" }],
            sources: [{ id: 1, name: "Long Walk to Freedom" }],
            createdAt: "2023-01-15T12:00:00Z",
            updatedAt: "2023-01-15T12:00:00Z"
        },
        {
            id: 21,
            content: "There is nothing to writing. All you do is sit down at a typewriter and bleed.",
            author: { id: 21, name: "Ernest Hemingway" },
            categories: [{ id: 21, name: "writing" }, { id: 1, name: "inspiration" }],
            sources: [{ id: 21, name: "Interview" }],
            createdAt: "2023-02-04T12:00:00Z",
            updatedAt: "2023-02-04T12:00:00Z"
        },
        {
            id: 22,
            content: "If you want to be a writer, you must do two things above all others: read a lot and write a lot.",
            author: { id: 22, name: "Stephen King" },
            categories: [{ id: 21, name: "writing" }, { id: 16, name: "learning" }],
            sources: [{ id: 22, name: "On Writing: A Memoir of the Craft" }],
            createdAt: "2023-02-05T12:00:00Z",
            updatedAt: "2023-02-05T12:00:00Z"
        },
        {
            id: 23,
            content: "You can't wait for inspiration. You have to go after it with a club.",
            author: { id: 23, name: "Jack London" },
            categories: [{ id: 21, name: "writing" }, { id: 1, name: "inspiration" }],
            sources: [{ id: 23, name: "Essays" }],
            createdAt: "2023-02-06T12:00:00Z",
            updatedAt: "2023-02-06T12:00:00Z"
        },
        {
            id: 24,
            content: "The first draft of anything is shit.",
            author: { id: 21, name: "Ernest Hemingway" },
            categories: [{ id: 21, name: "writing" }, { id: 10, name: "perseverance" }],
            sources: [{ id: 21, name: "Interview" }],
            createdAt: "2023-02-07T12:00:00Z",
            updatedAt: "2023-02-07T12:00:00Z"
        },
        {
            id: 25,
            content: "Write drunk, edit sober.",
            author: { id: 21, name: "Ernest Hemingway" },
            categories: [{ id: 21, name: "writing" }, { id: 11, name: "humor" }],
            sources: [{ id: 21, name: "Interview" }],
            createdAt: "2023-02-08T12:00:00Z",
            updatedAt: "2023-02-08T12:00:00Z"
        },
        {
            id: 2,
            content: "The way to get started is to quit talking and begin doing.",
            author: { id: 2, name: "Walt Disney" },
            categories: [{ id: 1, name: "inspiration" }, { id: 3, name: "action" }],
            sources: [{ id: 2, name: "Interview" }],
            createdAt: "2023-01-16T12:00:00Z",
            updatedAt: "2023-01-16T12:00:00Z"
        },
        {
            id: 3,
            content: "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma – which is living with the results of other people's thinking.",
            author: { id: 3, name: "Steve Jobs" },
            categories: [{ id: 1, name: "inspiration" }, { id: 4, name: "time" }],
            sources: [{ id: 3, name: "Stanford Commencement Address" }],
            createdAt: "2023-01-17T12:00:00Z",
            updatedAt: "2023-01-17T12:00:00Z"
        },
        {
            id: 4,
            content: "If life were predictable it would cease to be life, and be without flavor.",
            author: { id: 4, name: "Eleanor Roosevelt" },
            categories: [{ id: 2, name: "life" }, { id: 5, name: "philosophy" }],
            sources: [{ id: 4, name: "As You Are" }],
            createdAt: "2023-01-18T12:00:00Z",
            updatedAt: "2023-01-18T12:00:00Z"
        },
        {
            id: 5,
            content: "If you look at what you have in life, you'll always have more. If you look at what you don't have in life, you'll never have enough.",
            author: { id: 5, name: "Oprah Winfrey" },
            categories: [{ id: 2, name: "life" }, { id: 6, name: "gratitude" }],
            sources: [{ id: 5, name: "Interview with Oprah Magazine" }],
            createdAt: "2023-01-19T12:00:00Z",
            updatedAt: "2023-01-19T12:00:00Z"
        },
        {
            id: 6,
            content: "If you set your goals ridiculously high and it's a failure, you will fail above everyone else's success.",
            author: { id: 6, name: "James Cameron" },
            categories: [{ id: 1, name: "inspiration" }, { id: 7, name: "success" }],
            sources: [{ id: 6, name: "Interview with The Guardian" }],
            createdAt: "2023-01-20T12:00:00Z",
            updatedAt: "2023-01-20T12:00:00Z"
        },
        {
            id: 7,
            content: "Life is what happens when you're busy making other plans.",
            author: { id: 7, name: "John Lennon" },
            categories: [{ id: 2, name: "life" }, { id: 4, name: "time" }],
            sources: [{ id: 7, name: "Beautiful Boy" }],
            createdAt: "2023-01-21T12:00:00Z",
            updatedAt: "2023-01-21T12:00:00Z"
        },
        {
            id: 8,
            content: "Spread love everywhere you go. Let no one ever come to you without leaving happier.",
            author: { id: 8, name: "Mother Teresa" },
            categories: [{ id: 8, name: "love" }, { id: 9, name: "kindness" }],
            sources: [{ id: 8, name: "A Gift for God" }],
            createdAt: "2023-01-22T12:00:00Z",
            updatedAt: "2023-01-22T12:00:00Z"
        },
        {
            id: 9,
            content: "When you reach the end of your rope, tie a knot in it and hang on.",
            author: { id: 9, name: "Franklin D. Roosevelt" },
            categories: [{ id: 1, name: "inspiration" }, { id: 10, name: "perseverance" }],
            sources: [{ id: 9, name: "Speech" }],
            createdAt: "2023-01-23T12:00:00Z",
            updatedAt: "2023-01-23T12:00:00Z"
        },
        {
            id: 10,
            content: "Always remember that you are absolutely unique. Just like everyone else.",
            author: { id: 10, name: "Margaret Mead" },
            categories: [{ id: 11, name: "humor" }, { id: 12, name: "identity" }],
            sources: [{ id: 10, name: "Coming of Age in Samoa" }],
            createdAt: "2023-01-24T12:00:00Z",
            updatedAt: "2023-01-24T12:00:00Z"
        },
        {
            id: 11,
            content: "Don't judge each day by the harvest you reap but by the seeds that you plant.",
            author: { id: 11, name: "Robert Louis Stevenson" },
            categories: [{ id: 1, name: "inspiration" }, { id: 13, name: "growth" }],
            sources: [{ id: 11, name: "Literary Works" }],
            createdAt: "2023-01-25T12:00:00Z",
            updatedAt: "2023-01-25T12:00:00Z"
        },
        {
            id: 12,
            content: "The future belongs to those who believe in the beauty of their dreams.",
            author: { id: 4, name: "Eleanor Roosevelt" },
            categories: [{ id: 1, name: "inspiration" }, { id: 14, name: "dreams" }],
            sources: [{ id: 12, name: "As You Are" }],
            createdAt: "2023-01-26T12:00:00Z",
            updatedAt: "2023-01-26T12:00:00Z"
        },
        {
            id: 13,
            content: "Tell me and I forget. Teach me and I remember. Involve me and I learn.",
            author: { id: 12, name: "Benjamin Franklin" },
            categories: [{ id: 15, name: "education" }, { id: 16, name: "learning" }],
            sources: [{ id: 13, name: "Poor Richard's Almanack" }],
            createdAt: "2023-01-27T12:00:00Z",
            updatedAt: "2023-01-27T12:00:00Z"
        },
        {
            id: 14,
            content: "The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart.",
            author: { id: 13, name: "Helen Keller" },
            categories: [{ id: 8, name: "love" }, { id: 17, name: "beauty" }],
            sources: [{ id: 14, name: "The Story of My Life" }],
            createdAt: "2023-01-28T12:00:00Z",
            updatedAt: "2023-01-28T12:00:00Z"
        },
        {
            id: 15,
            content: "It is during our darkest moments that we must focus to see the light.",
            author: { id: 14, name: "Aristotle" },
            categories: [{ id: 1, name: "inspiration" }, { id: 18, name: "hope" }],
            sources: [{ id: 15, name: "Nicomachean Ethics" }],
            createdAt: "2023-01-29T12:00:00Z",
            updatedAt: "2023-01-29T12:00:00Z"
        },
        {
            id: 16,
            content: "Whoever is happy will make others happy too.",
            author: { id: 15, name: "Anne Frank" },
            categories: [{ id: 19, name: "happiness" }, { id: 9, name: "kindness" }],
            sources: [{ id: 16, name: "The Diary of a Young Girl" }],
            createdAt: "2023-01-30T12:00:00Z",
            updatedAt: "2023-01-30T12:00:00Z"
        },
        {
            id: 17,
            content: "You will face many defeats in life, but never let yourself be defeated.",
            author: { id: 16, name: "Maya Angelou" },
            categories: [{ id: 1, name: "inspiration" }, { id: 10, name: "perseverance" }],
            sources: [{ id: 17, name: "I Know Why the Caged Bird Sings" }],
            createdAt: "2023-01-31T12:00:00Z",
            updatedAt: "2023-01-31T12:00:00Z"
        },
        {
            id: 18,
            content: "In the end, it's not the years in your life that count. It's the life in your years.",
            author: { id: 17, name: "Abraham Lincoln" },
            categories: [{ id: 2, name: "life" }, { id: 4, name: "time" }],
            sources: [{ id: 18, name: "Speech" }],
            createdAt: "2023-02-01T12:00:00Z",
            updatedAt: "2023-02-01T12:00:00Z"
        },
        {
            id: 19,
            content: "Never let the fear of striking out keep you from playing the game.",
            author: { id: 18, name: "Babe Ruth" },
            categories: [{ id: 1, name: "inspiration" }, { id: 20, name: "courage" }],
            sources: [{ id: 19, name: "Interview" }],
            createdAt: "2023-02-02T12:00:00Z",
            updatedAt: "2023-02-02T12:00:00Z"
        },
        {
            id: 20,
            content: "Many of life's failures are people who did not realize how close they were to success when they gave up.",
            author: { id: 19, name: "Thomas A. Edison" },
            categories: [{ id: 7, name: "success" }, { id: 10, name: "perseverance" }],
            sources: [{ id: 20, name: "Interview with New York Times" }],
            createdAt: "2023-02-03T12:00:00Z",
            updatedAt: "2023-02-03T12:00:00Z"
        }
    ],

    // 模拟类别数据
    categories: [
        { id: 1, name: "inspiration", count: 10 },
        { id: 2, name: "life", count: 8 },
        { id: 3, name: "action", count: 5 },
        { id: 4, name: "time", count: 6 },
        { id: 5, name: "philosophy", count: 7 },
        { id: 6, name: "gratitude", count: 4 },
        { id: 7, name: "success", count: 9 },
        { id: 8, name: "love", count: 12 },
        { id: 9, name: "kindness", count: 6 },
        { id: 10, name: "perseverance", count: 8 },
        { id: 11, name: "humor", count: 5 },
        { id: 12, name: "identity", count: 3 },
        { id: 13, name: "growth", count: 7 },
        { id: 14, name: "dreams", count: 6 },
        { id: 15, name: "education", count: 5 },
        { id: 16, name: "learning", count: 4 },
        { id: 17, name: "beauty", count: 6 },
        { id: 18, name: "hope", count: 7 },
        { id: 19, name: "happiness", count: 8 },
        { id: 20, name: "courage", count: 6 },
        { id: 21, name: "writing", count: 5 }
    ],

    // 模拟作者数据
    authors: [
        { id: 1, name: "Nelson Mandela", count: 5 },
        { id: 2, name: "Walt Disney", count: 4 },
        { id: 3, name: "Steve Jobs", count: 6 },
        { id: 4, name: "Eleanor Roosevelt", count: 7 },
        { id: 5, name: "Oprah Winfrey", count: 5 },
        { id: 6, name: "James Cameron", count: 3 },
        { id: 7, name: "John Lennon", count: 4 },
        { id: 8, name: "Mother Teresa", count: 6 },
        { id: 9, name: "Franklin D. Roosevelt", count: 4 },
        { id: 10, name: "Margaret Mead", count: 3 },
        { id: 11, name: "Robert Louis Stevenson", count: 2 },
        { id: 12, name: "Benjamin Franklin", count: 5 },
        { id: 13, name: "Helen Keller", count: 4 },
        { id: 14, name: "Aristotle", count: 6 },
        { id: 15, name: "Anne Frank", count: 3 },
        { id: 16, name: "Maya Angelou", count: 5 },
        { id: 17, name: "Abraham Lincoln", count: 4 },
        { id: 18, name: "Babe Ruth", count: 2 },
        { id: 19, name: "Thomas A. Edison", count: 3 },
        { id: 20, name: "Albert Einstein", count: 7 },
        { id: 21, name: "Ernest Hemingway", count: 8 },
        { id: 22, name: "Stephen King", count: 5 },
        { id: 23, name: "Jack London", count: 3 }
    ],

    // 模拟来源数据
    sources: [
        { id: 1, name: "Long Walk to Freedom", count: 3 },
        { id: 2, name: "Interview", count: 8 },
        { id: 3, name: "Stanford Commencement Address", count: 1 },
        { id: 4, name: "As You Are", count: 2 },
        { id: 5, name: "Interview with Oprah Magazine", count: 2 },
        { id: 6, name: "Interview with The Guardian", count: 3 },
        { id: 7, name: "Beautiful Boy", count: 1 },
        { id: 8, name: "A Gift for God", count: 2 },
        { id: 9, name: "Speech", count: 5 },
        { id: 10, name: "Coming of Age in Samoa", count: 1 },
        { id: 11, name: "Literary Works", count: 4 },
        { id: 12, name: "As You Are", count: 2 },
        { id: 13, name: "Poor Richard's Almanack", count: 3 },
        { id: 14, name: "The Story of My Life", count: 2 },
        { id: 15, name: "Nicomachean Ethics", count: 3 },
        { id: 16, name: "The Diary of a Young Girl", count: 1 },
        { id: 17, name: "I Know Why the Caged Bird Sings", count: 2 },
        { id: 18, name: "Speech", count: 4 },
        { id: 19, name: "Interview", count: 6 },
        { id: 20, name: "Interview with New York Times", count: 3 },
        { id: 21, name: "Interview", count: 5 },
        { id: 22, name: "On Writing: A Memoir of the Craft", count: 4 },
        { id: 23, name: "Essays", count: 2 }
    ],

    // 获取分页的名言列表
    getQuotes(page = 1, pageSize = 20, filters = {}) {
        let filteredQuotes = [...this.quotes];

        // 应用筛选条件
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filteredQuotes = filteredQuotes.filter(quote =>
                quote.content.toLowerCase().includes(searchTerm) ||
                quote.author.name.toLowerCase().includes(searchTerm) ||
                quote.categories.some(cat => cat.name.toLowerCase().includes(searchTerm)) ||
                quote.sources.some(src => src.name.toLowerCase().includes(searchTerm))
            );
        }

        if (filters.author) {
            filteredQuotes = filteredQuotes.filter(quote =>
                quote.author.name.toLowerCase() === filters.author.toLowerCase()
            );
        }

        if (filters.category) {
            filteredQuotes = filteredQuotes.filter(quote =>
                quote.categories.some(cat => cat.name.toLowerCase() === filters.category.toLowerCase())
            );
        }

        if (filters.source) {
            filteredQuotes = filteredQuotes.filter(quote =>
                quote.sources.some(src => src.name.toLowerCase() === filters.source.toLowerCase())
            );
        }

        if (filters.authorId) {
            filteredQuotes = filteredQuotes.filter(quote => quote.author.id === filters.authorId);
        }

        if (filters.categoryId) {
            filteredQuotes = filteredQuotes.filter(quote =>
                quote.categories.some(cat => cat.id === filters.categoryId)
            );
        }

        if (filters.sourceId) {
            filteredQuotes = filteredQuotes.filter(quote =>
                quote.sources.some(src => src.id === filters.sourceId)
            );
        }

        // 计算分页
        const totalCount = filteredQuotes.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginatedQuotes = filteredQuotes.slice(start, end);

        return {
            quotes: paginatedQuotes,
            totalCount,
            currentPage: page,
            pageSize,
            totalPages: Math.ceil(totalCount / pageSize),
            hasNextPage: end < totalCount,
            hasPreviousPage: page > 1
        };
    },

    // 获取单个名言
    getQuote(id) {
        // 如果没有提供 ID，返回第一个名言（用于测试）
        if (!id) {
            return this.quotes[0];
        }

        // 尝试匹配 ID
        const parsedId = parseInt(id);
        const quote = this.quotes.find(q => q.id === parsedId);

        // 如果没有匹配，返回第一个名言（用于测试）
        return quote || this.quotes[0];
    },

    // 获取类别列表
    getCategories(limit = 20) {
        const sortedCategories = [...this.categories].sort((a, b) => b.count - a.count);
        return {
            categories: sortedCategories.slice(0, limit),
            totalCount: this.categories.length
        };
    },

    // 获取作者列表
    getAuthors(limit = 20) {
        const sortedAuthors = [...this.authors].sort((a, b) => b.count - a.count);
        return {
            authors: sortedAuthors.slice(0, limit),
            totalCount: this.authors.length
        };
    },

    // 获取来源列表
    getSources(limit = 20) {
        const sortedSources = [...this.sources].sort((a, b) => b.count - a.count);
        return {
            sources: sortedSources.slice(0, limit),
            totalCount: this.sources.length
        };
    },

    // 获取热门类别列表
    getPopularCategories(limit = 20) {
        const sortedCategories = [...this.categories].sort((a, b) => b.count - a.count);
        return sortedCategories.slice(0, limit);
    },

    // 获取热门作者列表
    getPopularAuthors(limit = 20) {
        const sortedAuthors = [...this.authors].sort((a, b) => b.count - a.count);
        return sortedAuthors.slice(0, limit);
    },

    // 获取热门来源列表
    getPopularSources(limit = 20) {
        const sortedSources = [...this.sources].sort((a, b) => b.count - a.count);
        return sortedSources.slice(0, limit);
    },

    // 获取热门名言列表（按点赞数排序）
    getTopQuotes(page = 1, pageSize = 20, countOnly = false) {
        // 如果只需要返回总数，则使用简化的查询
        if (countOnly) {
            return {
                totalCount: this.quotes.length,
                currentPage: page,
                pageSize,
                totalPages: Math.ceil(this.quotes.length / pageSize)
            };
        }

        // 计算分页
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginatedQuotes = this.quotes.slice(start, end);

        return {
            quotes: paginatedQuotes,
            totalCount: this.quotes.length,
            currentPage: page,
            pageSize,
            totalPages: Math.ceil(this.quotes.length / pageSize),
            hasNextPage: end < this.quotes.length,
            hasPreviousPage: page > 1
        };
    },

    // 获取单个类别
    getCategory(id) {
        return this.categories.find(c => c.id === parseInt(id)) || null;
    },

    // 获取单个作者
    getAuthor(id) {
        return this.authors.find(a => a.id === parseInt(id)) || null;
    },

    // 获取单个来源
    getSource(id) {
        return this.sources.find(s => s.id === parseInt(id)) || null;
    },

    // 根据名称获取类别
    getCategoryByName(name) {
        // 如果没有提供名称，返回第一个类别（用于测试）
        if (!name) {
            return this.categories[0];
        }

        // 特殊处理“writing”类别
        if (name.toLowerCase() === 'writing') {
            return { id: 21, name: 'writing', count: 5 };
        }

        // 尝试精确匹配
        let category = this.categories.find(c => c.name.toLowerCase() === name.toLowerCase());

        // 如果没有精确匹配，尝试模糊匹配
        if (!category) {
            category = this.categories.find(c =>
                c.name.toLowerCase().includes(name.toLowerCase()) ||
                name.toLowerCase().includes(c.name.toLowerCase())
            );
        }

        // 如果还是没有匹配，返回第一个类别（用于测试）
        return category || this.categories[0];
    },

    // 根据名称获取作者
    getAuthorByName(name) {
        // 如果没有提供名称，返回第一个作者（用于测试）
        if (!name) {
            return this.authors[0];
        }

        // 尝试精确匹配
        let author = this.authors.find(a => a.name.toLowerCase() === name.toLowerCase());

        // 如果没有精确匹配，尝试模糊匹配
        if (!author) {
            author = this.authors.find(a =>
                a.name.toLowerCase().includes(name.toLowerCase()) ||
                name.toLowerCase().includes(a.name.toLowerCase())
            );
        }

        // 如果还是没有匹配，返回第一个作者（用于测试）
        return author || this.authors[0];
    },

    // 根据名称获取来源
    getSourceByName(name) {
        // 如果没有提供名称，返回第一个来源（用于测试）
        if (!name) {
            return this.sources[0];
        }

        // 尝试精确匹配
        let source = this.sources.find(s => s.name.toLowerCase() === name.toLowerCase());

        // 如果没有精确匹配，尝试模糊匹配
        if (!source) {
            source = this.sources.find(s =>
                s.name.toLowerCase().includes(name.toLowerCase()) ||
                name.toLowerCase().includes(s.name.toLowerCase())
            );
        }

        // 如果还是没有匹配，返回第一个来源（用于测试）
        return source || this.sources[0];
    }
};

// 导出模块
window.MockData = MockData;
