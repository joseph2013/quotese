/**
 * 名言详情页面控制器
 * 负责名言详情页面的数据加载和交互
 */

// 页面状态
const pageState = {
    quoteId: null,
    authorId: null,
    isLoading: false
};

/**
 * 初始化名言详情页面
 */
async function initQuotePage() {
    try {
        // 从URL获取名言ID
        const quoteId = window.UrlHandler.getQuoteIdFromUrl();
        if (!quoteId) {
            showErrorMessage('Quote not found. Please check the URL.');
            return;
        }

        pageState.quoteId = quoteId;

        // 加载组件
        await loadPageComponents();

        // 加载数据
        await loadPageData();

        // 初始化事件监听器
        initEventListeners();

    } catch (error) {
        console.error('Error initializing quote page:', error);
        showErrorMessage('Failed to initialize page. Please try refreshing.');
    }
}

/**
 * 加载页面组件
 */
async function loadPageComponents() {
    // 加载面包屑组件
    await ComponentLoader.loadComponent('breadcrumb-container', 'breadcrumb');

    // 初始化面包屑导航
    BreadcrumbComponent.init('breadcrumb-list');

    // 加载热门主题组件
    await ComponentLoader.loadComponent('popular-topics-container', 'popular-topics');
}

/**
 * 加载页面数据
 */
async function loadPageData() {
    // 显示加载状态
    showLoadingState();

    try {
        // 获取名言详情
        console.log('Getting quote by ID:', pageState.quoteId);
        const quote = await window.ApiClient.getQuote(pageState.quoteId);
        console.log('Quote result:', quote);
        if (!quote) {
            showErrorMessage(`Quote with ID ${pageState.quoteId} not found.`);
            hideLoadingState();
            return;
        }

        // 更新页面标题和描述
        updatePageMetadata(quote);

        // 渲染名言详情
        renderQuoteDetails(quote);

        // 保存作者ID
        pageState.authorId = quote.author.id;

        // 并行加载其他数据
        const [categoriesData, authorsData, sourcesData, relatedQuotesData] = await Promise.all([
            loadCategories(),
            loadAuthors(),
            loadSources(),
            loadRelatedQuotes()
        ]);

        // 隐藏加载状态
        hideLoadingState();

    } catch (error) {
        console.error('Error loading page data:', error);
        showErrorMessage('Failed to load data. Please try again later.');
        hideLoadingState();
    }
}

/**
 * 更新页面元数据
 * @param {Object} quote - 名言对象
 */
function updatePageMetadata(quote) {
    // 截断长名言
    const shortQuote = quote.content.length > 100
        ? quote.content.substring(0, 100) + '...'
        : quote.content;

    document.title = `"${shortQuote}" - ${quote.author.name} | Quotes Collection`;

    // 更新meta描述
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.content = `"${shortQuote}" - ${quote.author.name}. Explore this inspiring quote and more wisdom from ${quote.author.name}.`;
    }

    // 更新canonical链接
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
        canonicalLink.href = `https://quotese.com/quotes/${UrlHandler.slugify(quote.content.substring(0, 50))}-${quote.id}.html`;
    }

    // 添加Quote结构化数据
    addQuoteStructuredData(quote);

    // 更新社交媒体元数据
    if (window.SocialMetaUtil) {
        window.SocialMetaUtil.updateQuoteMetaTags(quote);
    }
}

/**
 * 渲染名言详情
 * @param {Object} quote - 名言对象
 */
function renderQuoteDetails(quote) {
    // 更新名言内容
    const contentElement = document.getElementById('quote-content');
    if (contentElement) {
        contentElement.textContent = `"${quote.content}"`;
    }

    // 更新作者信息
    const authorLinkElement = document.getElementById('author-link');
    if (authorLinkElement) {
        authorLinkElement.href = UrlHandler.getAuthorUrl(quote.author);
        authorLinkElement.textContent = quote.author.name;
    }

    // 更新作者首字母
    const authorInitialElement = document.getElementById('author-initial');
    if (authorInitialElement) {
        authorInitialElement.textContent = quote.author.name.charAt(0);
    }

    // 更新来源信息
    const sourceTextElement = document.getElementById('source-text');
    if (sourceTextElement) {
        sourceTextElement.innerHTML = quote.sources.map(source =>
            `<a href="${UrlHandler.getSourceUrl(source)}" class="hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors duration-300">${source.name}</a>`
        ).join(', ');
    }

    // 更新类别标签
    const categoriesContainer = document.getElementById('categories-container');
    if (categoriesContainer) {
        categoriesContainer.innerHTML = '';

        quote.categories.forEach(category => {
            const categoryTag = document.createElement('a');
            categoryTag.href = UrlHandler.getCategoryUrl(category);
            categoryTag.className = 'tag px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-300';
            categoryTag.textContent = category.name;

            categoriesContainer.appendChild(categoryTag);
        });
    }

    // 更新日期信息
    const dateElement = document.getElementById('quote-date');
    if (dateElement) {
        const date = new Date(quote.updatedAt || quote.createdAt);
        dateElement.textContent = `Updated: ${date.toLocaleDateString()}`;
    }

    // 更新相关名言标题
    const authorHeadingElement = document.getElementById('author-name-heading');
    if (authorHeadingElement) {
        authorHeadingElement.textContent = quote.author.name;
    }
}

/**
 * 加载类别列表
 * @returns {Promise<Object>} - 类别列表
 */
async function loadCategories() {
    try {
        // 获取类别列表
        const categoriesData = await window.ApiClient.getCategories(20);

        // 渲染类别列表
        renderCategories(categoriesData.categories);

        return categoriesData;
    } catch (error) {
        console.error('Error loading categories:', error);
        throw error;
    }
}

/**
 * 加载作者列表
 * @returns {Promise<Object>} - 作者列表
 */
async function loadAuthors() {
    try {
        // 获取作者列表
        const authorsData = await window.ApiClient.getAuthors(5);

        // 渲染作者列表
        renderAuthors(authorsData.authors);

        return authorsData;
    } catch (error) {
        console.error('Error loading authors:', error);
        throw error;
    }
}

/**
 * 加载来源列表
 * @returns {Promise<Object>} - 来源列表
 */
async function loadSources() {
    try {
        // 获取来源列表
        const sourcesData = await window.ApiClient.getSources(5);

        // 渲染来源列表
        renderSources(sourcesData.sources);

        return sourcesData;
    } catch (error) {
        console.error('Error loading sources:', error);
        throw error;
    }
}

/**
 * 加载相关名言
 * @returns {Promise<Object>} - 相关名言列表
 */
async function loadRelatedQuotes() {
    try {
        // 获取相关名言列表（同一作者的其他名言）
        const filters = { authorId: pageState.authorId };
        const quotesData = await window.ApiClient.getQuotes(1, 5, filters);

        // 过滤掉当前名言
        const relatedQuotes = quotesData.quotes.filter(quote => quote.id !== parseInt(pageState.quoteId));

        // 渲染相关名言列表
        renderRelatedQuotes(relatedQuotes);

        return quotesData;
    } catch (error) {
        console.error('Error loading related quotes:', error);
        throw error;
    }
}

/**
 * 渲染相关名言列表
 * @param {Array} quotes - 名言列表
 */
function renderRelatedQuotes(quotes) {
    const relatedQuotesContainer = document.getElementById('related-quotes-container');
    if (!relatedQuotesContainer) return;

    // 清空容器
    relatedQuotesContainer.innerHTML = '';

    if (quotes.length === 0) {
        // 显示空状态
        relatedQuotesContainer.innerHTML = `
            <div class="text-center py-8">
                <p class="text-gray-500 dark:text-gray-400">No other quotes found by this author.</p>
            </div>
        `;
        return;
    }

    // 创建名言卡片
    quotes.forEach((quote, index) => {
        const quoteCard = document.createElement('div');
        quoteCard.className = `quote-card-component relative p-4 sm:p-5 md:p-6 quote-marks fade-in fade-in-delay-${index % 3} mb-4 sm:mb-6 card-hover-effect cursor-pointer`;

        // 截断长名言
        const displayContent = quote.content.length > 150
            ? quote.content.substring(0, 150) + '...'
            : quote.content;

        // 创建名言卡片内容
        quoteCard.innerHTML = `
            <div class="relative z-10">
                <p class="text-base sm:text-lg font-serif leading-relaxed mb-3 sm:mb-4">"${displayContent}"</p>
                <div class="flex items-center mt-3 sm:mt-4">
                    <div class="flex-shrink-0 mr-4">
                        <div class="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-600 dark:text-yellow-300 border-2 border-yellow-400 dark:border-yellow-600">
                            <span class="text-sm font-bold">${quote.author.name.charAt(0)}</span>
                        </div>
                    </div>
                    <div>
                        <a href="${UrlHandler.getAuthorUrl(quote.author)}" class="font-semibold text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors duration-300">${quote.author.name}</a>
                        <p class="text-sm text-gray-500 dark:text-gray-400">${quote.sources.map(source => source.name).join(', ')}</p>
                    </div>
                </div>
            </div>
            <div class="mt-3 sm:mt-4 flex flex-wrap gap-1 sm:gap-2">
                ${quote.categories.map(category =>
                    `<a href="${UrlHandler.getCategoryUrl(category)}" class="tag px-2 py-0.5 sm:px-3 sm:py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-300">${category.name}</a>`
                ).join('')}
            </div>
            <div class="absolute bottom-2 sm:bottom-3 right-2 sm:right-4 flex items-center space-x-1">
                <button class="p-2 text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors duration-300 rounded-full hover:bg-yellow-50 dark:hover:bg-gray-700" title="Share" data-quote-id="${quote.id}">
                    <i class="fas fa-share-alt"></i>
                </button>
                <button class="p-2 text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors duration-300 rounded-full hover:bg-yellow-50 dark:hover:bg-gray-700" title="View Details" data-quote-id="${quote.id}">
                    <i class="fas fa-external-link-alt"></i>
                </button>
            </div>
        `;

        // 添加到容器
        relatedQuotesContainer.appendChild(quoteCard);

        // 添加点击事件
        quoteCard.addEventListener('click', (e) => {
            // 只有在没有点击按钮或链接时才触发
            if (!e.target.closest('button') && !e.target.closest('a')) {
                window.location.href = UrlHandler.getQuoteUrl({
                    id: quote.id,
                    content: quote.content
                });
            }
        });
    });
}

/**
 * 渲染类别列表
 * @param {Array} categories - 类别列表
 */
function renderCategories(categories) {
    const categoriesContainer = document.getElementById('categories-container');
    if (!categoriesContainer) return;

    // 清空容器
    categoriesContainer.innerHTML = '';

    if (categories.length === 0) {
        categoriesContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No categories found.</p>';
        return;
    }

    // 按照引用数量排序
    const sortedCategories = [...categories].sort((a, b) => b.count - a.count);

    // 创建类别标签
    sortedCategories.forEach(category => {
        const categoryTag = document.createElement('a');
        categoryTag.href = UrlHandler.getCategoryUrl(category);
        categoryTag.className = 'tag px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-300';
        categoryTag.textContent = `${category.name} (${category.count})`;

        categoriesContainer.appendChild(categoryTag);
    });
}

/**
 * 渲染作者列表
 * @param {Array} authors - 作者列表
 */
function renderAuthors(authors) {
    const authorsContainer = document.getElementById('authors-container');
    if (!authorsContainer) return;

    // 清空容器
    authorsContainer.innerHTML = '';

    if (authors.length === 0) {
        authorsContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No authors found.</p>';
        return;
    }

    // 按照引用数量排序
    const sortedAuthors = [...authors].sort((a, b) => b.count - a.count);

    // 创建作者列表项
    sortedAuthors.forEach(author => {
        const maxCount = sortedAuthors[0].count;
        const percentage = Math.round((author.count / maxCount) * 100);

        const authorItem = document.createElement('li');

        // 当前作者高亮显示
        if (author.id === pageState.authorId) {
            authorItem.className = 'flex justify-between items-center p-2 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800';
        } else {
            authorItem.className = 'flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300';
        }

        authorItem.innerHTML = `
            <div class="flex items-center space-x-2 w-full">
                <div class="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-600 dark:text-yellow-300 flex-shrink-0 border-2 border-yellow-400 dark:border-yellow-600">
                    <span class="text-xs font-bold">${author.name.charAt(0)}</span>
                </div>
                <div class="flex-grow ml-2">
                    <a href="${UrlHandler.getAuthorUrl(author)}" class="${author.id === pageState.authorId ? 'text-yellow-600 dark:text-yellow-400 font-semibold' : 'hover:text-yellow-600 dark:hover:text-yellow-400'} font-medium transition-colors duration-300">${author.name}</a>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                        <div class="bg-yellow-500 dark:bg-yellow-400 h-1.5 rounded-full" style="width: ${percentage}%"></div>
                    </div>
                </div>
                <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">${author.count}</span>
            </div>
        `;

        authorsContainer.appendChild(authorItem);
    });
}

/**
 * 渲染来源列表
 * @param {Array} sources - 来源列表
 */
function renderSources(sources) {
    const sourcesContainer = document.getElementById('sources-container');
    if (!sourcesContainer) return;

    // 清空容器
    sourcesContainer.innerHTML = '';

    if (sources.length === 0) {
        sourcesContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No sources found.</p>';
        return;
    }

    // 按照引用数量排序
    const sortedSources = [...sources].sort((a, b) => b.count - a.count);

    // 创建来源列表项
    sortedSources.forEach(source => {
        const sourceItem = document.createElement('li');
        sourceItem.className = 'flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300';

        // 根据来源类型选择不同的图标
        let iconClass = 'fas fa-book';

        if (source.name.toLowerCase().includes('speech') || source.name.toLowerCase().includes('address')) {
            iconClass = 'fas fa-microphone';
        } else if (source.name.toLowerCase().includes('interview')) {
            iconClass = 'fas fa-comments';
        } else if (source.name.toLowerCase().includes('letter') || source.name.toLowerCase().includes('correspondence')) {
            iconClass = 'fas fa-envelope';
        } else if (source.name.toLowerCase().includes('article') || source.name.toLowerCase().includes('magazine')) {
            iconClass = 'fas fa-newspaper';
        } else if (source.name.toLowerCase().includes('movie') || source.name.toLowerCase().includes('film')) {
            iconClass = 'fas fa-film';
        } else if (source.name.toLowerCase().includes('song') || source.name.toLowerCase().includes('music')) {
            iconClass = 'fas fa-music';
        }

        sourceItem.innerHTML = `
            <div class="flex items-center space-x-2 w-full">
                <div class="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-600 dark:text-yellow-300 flex-shrink-0">
                    <i class="${iconClass} text-xs"></i>
                </div>
                <div class="flex-grow">
                    <a href="${UrlHandler.getSourceUrl(source)}" class="hover:text-yellow-600 dark:hover:text-yellow-400 font-medium transition-colors duration-300">${source.name}</a>
                </div>
                <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">${source.count}</span>
            </div>
        `;

        sourcesContainer.appendChild(sourceItem);
    });
}

/**
 * 显示加载状态
 */
function showLoadingState() {
    pageState.isLoading = true;

    // 显示名言详情加载状态
    const quoteCardContainer = document.getElementById('quote-card-container');
    if (quoteCardContainer) {
        quoteCardContainer.innerHTML = `
            <div class="flex justify-center py-12">
                <div class="loading-spinner" role="status">
                    <span class="sr-only">Loading quote...</span>
                </div>
            </div>
        `;
    }

    // 显示相关名言加载状态
    const relatedQuotesContainer = document.getElementById('related-quotes-container');
    if (relatedQuotesContainer) {
        relatedQuotesContainer.innerHTML = `
            <div class="flex justify-center py-12">
                <div class="loading-spinner" role="status">
                    <span class="sr-only">Loading related quotes...</span>
                </div>
            </div>
        `;
    }
}

/**
 * 隐藏加载状态
 */
function hideLoadingState() {
    pageState.isLoading = false;
}

/**
 * 显示错误消息
 * @param {string} message - 错误消息
 */
function showErrorMessage(message) {
    const quoteCardContainer = document.getElementById('quote-card-container');
    if (quoteCardContainer) {
        quoteCardContainer.innerHTML = `
            <div class="bg-red-100 text-red-800 p-4 rounded-md">
                <i class="fas fa-exclamation-circle mr-2"></i>
                ${message}
            </div>
        `;
    }
}

/**
 * 初始化事件监听器
 */
function initEventListeners() {
    // 分享按钮
    const shareButton = document.getElementById('share-button');
    if (shareButton) {
        shareButton.addEventListener('click', shareQuote);
    }

    // 复制按钮
    const copyButton = document.getElementById('copy-button');
    if (copyButton) {
        copyButton.addEventListener('click', copyQuoteToClipboard);
    }
}

/**
 * 分享名言
 */
function shareQuote() {
    // 如果支持Web Share API
    if (navigator.share) {
        const quoteContent = document.getElementById('quote-content').textContent;
        const authorName = document.getElementById('author-link').textContent;

        navigator.share({
            title: `Quote by ${authorName}`,
            text: `${quoteContent} - ${authorName}`,
            url: window.location.href
        })
        .then(() => console.log('Quote shared successfully'))
        .catch((error) => console.error('Error sharing quote:', error));
    } else {
        // 如果不支持Web Share API，复制链接到剪贴板
        copyToClipboard(window.location.href);

        // 显示提示
        alert('Link copied to clipboard!');
    }
}

/**
 * 复制名言到剪贴板
 */
function copyQuoteToClipboard() {
    const quoteContent = document.getElementById('quote-content').textContent;
    const authorName = document.getElementById('author-link').textContent;

    const textToCopy = `${quoteContent} - ${authorName}`;

    copyToClipboard(textToCopy);

    // 显示提示
    alert('Quote copied to clipboard!');
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 */
function copyToClipboard(text) {
    // 创建临时元素
    const tempElement = document.createElement('textarea');
    tempElement.value = text;
    tempElement.setAttribute('readonly', '');
    tempElement.style.position = 'absolute';
    tempElement.style.left = '-9999px';

    document.body.appendChild(tempElement);

    // 选择文本并复制
    tempElement.select();
    document.execCommand('copy');

    // 移除临时元素
    document.body.removeChild(tempElement);
}

/**
 * 添加Quote结构化数据
 * @param {Object} quote - 名言对象
 */
function addQuoteStructuredData(quote) {
    // 移除旧的结构化数据
    const oldScript = document.getElementById('quote-structured-data');
    if (oldScript) {
        oldScript.remove();
    }

    // 创建结构化数据
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Quotation",
        "text": quote.content,
        "author": {
            "@type": "Person",
            "name": quote.author.name,
            "url": `https://quotese.com${UrlHandler.getAuthorUrl(quote.author)}`
        },
        "dateCreated": quote.createdAt || new Date().toISOString(),
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://quotese.com${UrlHandler.getQuoteUrl(quote)}`
        }
    };

    // 添加来源信息（如果有）
    if (quote.sources && quote.sources.length > 0) {
        structuredData.isPartOf = {
            "@type": "CreativeWork",
            "name": quote.sources[0].name,
            "url": `https://quotese.com${UrlHandler.getSourceUrl(quote.sources[0])}`
        };
    }

    // 添加类别信息（如果有）
    if (quote.categories && quote.categories.length > 0) {
        structuredData.keywords = quote.categories.map(category => category.name).join(',');
    }

    // 添加到页面
    const script = document.createElement('script');
    script.id = 'quote-structured-data';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', initQuotePage);
