/**
 * 来源页面控制器
 * 负责来源页面的数据加载和交互
 */

// 页面状态
const pageState = {
    currentPage: 1,
    pageSize: 20,
    totalPages: 0,
    totalQuotes: 0,
    isLoading: false,
    sourceName: '',
    sourceId: null
};

/**
 * 初始化来源页面
 */
async function initSourcePage() {
    try {
        // 从URL获取来源名称
        const sourceName = window.UrlHandler.getSourceNameFromUrl();
        if (!sourceName) {
            showErrorMessage('Source not found. Please check the URL.');
            return;
        }

        pageState.sourceName = sourceName;

        // 获取页码参数
        const pageParam = UrlHandler.getQueryParam('page');
        if (pageParam) {
            pageState.currentPage = parseInt(pageParam) || 1;
        }

        // 更新页面标题和描述
        updatePageMetadata(sourceName);

        // 加载组件
        await loadPageComponents();

        // 获取来源ID
        // 首先尝试从 URL 中获取 ID
        const sourceId = window.UrlHandler.getSourceIdFromUrl();

        if (sourceId) {
            // 直接使用 URL 中的 ID
            console.log('Using source ID from URL:', sourceId);
            pageState.sourceId = sourceId;
        } else {
            // 如果 URL 中没有 ID，则通过名称查询
            console.log('Getting source by name:', sourceName);
            try {
                const source = await window.ApiClient.getSourceByName(sourceName);
                console.log('Source result:', source);
                if (!source) {
                    showErrorMessage(`Source "${sourceName}" not found.`);
                    return;
                }

                pageState.sourceId = source.id;
            } catch (sourceError) {
                console.error('Error getting source by name:', sourceError);
                showErrorMessage(`Failed to get source "${sourceName}". Please try refreshing.`);
                return;
            }
        }

        // 更新页面标题和来源信息
        updateSourceInfo(sourceName);

        // 加载数据
        await loadPageData();

        // 初始化事件监听器
        initEventListeners();

    } catch (error) {
        console.error('Error initializing source page:', error);
        showErrorMessage('Failed to initialize page. Please try refreshing.');
    }
}

/**
 * 更新页面元数据
 * @param {string} sourceName - 来源名称
 */
function updatePageMetadata(sourceName) {
    document.title = `${sourceName} Quotes - Quotes Collection`;

    // 更新meta描述
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.content = `Explore our collection of quotes from ${sourceName}. Find inspiration, wisdom, and insights from this source.`;
    }

    // 更新canonical链接
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
        canonicalLink.href = `https://quotese.com/sources/${UrlHandler.slugify(sourceName)}-${pageState.sourceId}.html`;
    }

    // 添加来源结构化数据
    addSourceStructuredData(sourceName, pageState.sourceId);

    // 更新社交媒体元数据
    if (window.SocialMetaUtil) {
        window.SocialMetaUtil.updateSourceMetaTags(
            { name: sourceName, id: pageState.sourceId },
            pageState.totalQuotes
        );
    }
}

/**
 * 更新来源信息
 * @param {string} sourceName - 来源名称
 */
function updateSourceInfo(sourceName) {
    // 更新来源名称
    const nameElement = document.getElementById('source-name');
    if (nameElement) {
        nameElement.textContent = sourceName;
    }

    // 更新来源图标
    const iconElement = document.getElementById('source-icon');
    if (iconElement) {
        // 根据来源类型选择不同的图标
        let iconClass = 'fas fa-book';

        if (sourceName.toLowerCase().includes('speech') || sourceName.toLowerCase().includes('address')) {
            iconClass = 'fas fa-microphone';
        } else if (sourceName.toLowerCase().includes('interview')) {
            iconClass = 'fas fa-comments';
        } else if (sourceName.toLowerCase().includes('letter') || sourceName.toLowerCase().includes('correspondence')) {
            iconClass = 'fas fa-envelope';
        } else if (sourceName.toLowerCase().includes('article') || sourceName.toLowerCase().includes('magazine')) {
            iconClass = 'fas fa-newspaper';
        } else if (sourceName.toLowerCase().includes('movie') || sourceName.toLowerCase().includes('film')) {
            iconClass = 'fas fa-film';
        } else if (sourceName.toLowerCase().includes('song') || sourceName.toLowerCase().includes('music')) {
            iconClass = 'fas fa-music';
        }

        iconElement.className = iconClass;
    }

    // 更新来源描述（如果有）
    const descriptionElement = document.getElementById('source-description');
    if (descriptionElement) {
        descriptionElement.textContent = `Explore quotes from ${sourceName}.`;
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

    // 加载名言列表组件
    await ComponentLoader.loadComponent('quotes-container', 'quotes-list', {
        title: `Quotes from ${pageState.sourceName}`
    });

    // 确保引用计数显示在标题右侧
    // 在组件加载完成后添加一个空的计数元素，稍后会被更新
    const quotesListTitle = document.getElementById('quotes-list-title');
    if (quotesListTitle && quotesListTitle.parentElement) {
        // 先检查是否已存在
        const existingCount = document.getElementById('quotes-count-display');
        if (!existingCount) {
            const countSpan = document.createElement('span');
            countSpan.id = 'quotes-count-display';
            countSpan.className = 'ml-2 text-sm text-gray-500 dark:text-gray-400 font-normal';
            countSpan.textContent = '(loading...)';
            quotesListTitle.parentElement.appendChild(countSpan);
            console.log('Added quotes-count-display placeholder during component loading');
        }
    }

    // 先创建一个空的分页容器，稍后根据数据情况加载分页组件
    const paginationContainer = document.getElementById('pagination-container');
    if (paginationContainer) {
        paginationContainer.innerHTML = '';
    }

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
        // 并行加载数据
        const [quotesData, categoriesData, authorsData, sourcesData] = await Promise.all([
            loadQuotes(pageState.currentPage, pageState.pageSize),
            loadCategories(),
            loadAuthors(),
            loadSources()
        ]);

        // 更新页面状态
        updatePageState(quotesData);

        // 更新引用计数
        updateQuoteCount(quotesData.totalCount);

        // 隐藏加载状态
        hideLoadingState();

    } catch (error) {
        console.error('Error loading page data:', error);
        showErrorMessage('Failed to load data. Please try again later.');
        hideLoadingState();
    }
}

/**
 * 加载名言列表
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @returns {Promise<Object>} - 名言列表和分页信息
 */
async function loadQuotes(page, pageSize) {
    try {
        // 获取名言列表
        const filters = { sourceId: pageState.sourceId };
        const quotesData = await window.ApiClient.getQuotes(page, pageSize, filters);

        // 渲染名言列表
        renderQuotes(quotesData.quotes);

        // 更新分页
        await updatePagination(quotesData);

        // 更新引用计数 - 确保在渲染完成后调用
        setTimeout(() => {
            updateQuoteCount(quotesData.totalCount);
            console.log('Delayed updateQuoteCount called with:', quotesData.totalCount);
        }, 100);

        return quotesData;
    } catch (error) {
        console.error('Error loading quotes:', error);
        throw error;
    }
}

/**
 * 加载类别列表
 * @returns {Promise<Object>} - 类别列表
 */
async function loadCategories() {
    try {
        // 获取热门类别列表（top 100）
        const popularCategories = await window.ApiClient.getPopularCategories(100);

        // 从前100个类别中随机选取20个
        const randomCategories = getRandomItems(popularCategories, 20);

        // 渲染类别列表
        renderCategories(randomCategories);

        console.log('Random 20 categories from top 100:', randomCategories);

        return {
            categories: randomCategories,
            totalCount: popularCategories.length
        };
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
        // 获取热门作者列表（top 100）
        const popularAuthors = await window.ApiClient.getPopularAuthors(100);

        // 从前100个作者中随机选取10个
        const randomAuthors = getRandomItems(popularAuthors, 10);

        // 渲染作者列表
        renderAuthors(randomAuthors);

        console.log('Random 10 authors from top 100:', randomAuthors);

        return {
            authors: randomAuthors,
            totalCount: popularAuthors.length
        };
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
        // 获取热门来源列表（top 100）
        const popularSources = await window.ApiClient.getPopularSources(100);

        // 从前100个来源中随机选取10个
        const randomSources = getRandomItems(popularSources, 10);

        // 渲染来源列表
        renderSources(randomSources);

        console.log('Random 10 sources from top 100:', randomSources);

        return {
            sources: randomSources,
            totalCount: popularSources.length
        };
    } catch (error) {
        console.error('Error loading sources:', error);
        throw error;
    }
}

/**
 * 渲染名言列表
 * @param {Array} quotes - 名言列表
 */
function renderQuotes(quotes) {
    // 使用通用的名言卡片组件渲染名言列表
    window.QuoteCardComponent.renderList(quotes, 'quotes-list', {
        showAuthorAvatar: false, // 修改为false，不显示作者头像，参考首页左侧名言列表的实现方式
        showActions: false, // 禁用名言卡片右下角的分享和跳转按钮
        highlightCurrentCategory: false,
        hideEmptyAvatar: true, // 当作者头像为空时隐藏头像区域
        emptyMessage: `No quotes found from ${pageState.sourceName}.`
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

    // 类别是从前100个中随机选取的
    // 这里不需要排序

    // 创建类别标签
    categories.forEach(category => {
        // 确保类别有count属性
        const count = typeof category.count === 'number' ? category.count : 0;

        const categoryTag = document.createElement('a');
        categoryTag.href = UrlHandler.getCategoryUrl(category);
        categoryTag.className = 'tag px-3 py-1.5 text-sm rounded-lg bg-yellow-50 text-yellow-800 dark:bg-gray-800 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-gray-700 transition-colors duration-300';
        categoryTag.textContent = `${category.name} (${count})`;

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

    // 作者是从前100个中随机选取的
    const randomAuthors = authors;

    // 创建作者列表项
    randomAuthors.forEach(author => {
        const maxCount = randomAuthors[0].count;
        const percentage = Math.round((author.count / maxCount) * 100);

        const authorItem = document.createElement('li');
        authorItem.className = 'flex justify-between items-start py-1.5 px-2 rounded-md transition-colors duration-300';
        authorItem.innerHTML = `
            <div class="flex items-start space-x-2 w-full">
                <div class="flex-grow pr-2">
                    <a href="${UrlHandler.getAuthorUrl(author)}" class="hover:text-yellow-600 dark:hover:text-yellow-400 font-medium transition-colors duration-300" title="${author.name}">${author.name}</a>
                </div>
                <span class="text-sm text-gray-500 dark:text-gray-400 ml-2 mt-0.5 flex-shrink-0">${author.count}</span>
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

    // 来源是从前100个中随机选取的
    const randomSources = sources;

    // 创建来源列表项
    randomSources.forEach(source => {
        // 当前来源高亮显示
        let className = 'flex justify-between items-start py-1.5 px-2 rounded-md transition-colors duration-300';
        if (source.name === pageState.sourceName) {
            className = 'flex justify-between items-start py-1.5 px-2 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800';
        }

        const sourceItem = document.createElement('li');
        sourceItem.className = className;
        sourceItem.innerHTML = `
            <div class="flex items-start space-x-2 w-full">
                <div class="flex-grow pr-2">
                    <a href="${UrlHandler.getSourceUrl(source)}" class="${source.name === pageState.sourceName ? 'text-yellow-600 dark:text-yellow-400 font-semibold' : 'hover:text-yellow-600 dark:hover:text-yellow-400'} font-medium transition-colors duration-300" title="${source.name}">${source.name}</a>
                </div>
                <span class="text-sm text-gray-500 dark:text-gray-400 ml-2 mt-0.5 flex-shrink-0">${source.count}</span>
            </div>
        `;

        sourcesContainer.appendChild(sourceItem);
    });
}

/**
 * 更新分页
 * @param {Object} quotesData - 名言数据和分页信息
 */
async function updatePagination(quotesData) {
    // 检查是否有数据需要分页
    if (!quotesData || !quotesData.totalCount || quotesData.totalCount <= 0 || quotesData.totalPages <= 1) {
        // 没有数据或者只有一页数据，清空分页容器
        const paginationContainer = document.getElementById('pagination-container');
        if (paginationContainer) {
            paginationContainer.innerHTML = '';
        }
        return;
    }

    // 加载分页组件（如果还没有加载）
    const paginationContainer = document.getElementById('pagination-container');
    if (paginationContainer && paginationContainer.children.length === 0) {
        await ComponentLoader.loadComponent('pagination-container', 'pagination');
    }

    // 初始化分页组件
    if (!window.paginationComponent) {
        window.paginationComponent = new window.PaginationComponent({
            containerId: 'pagination-container',
            onPageChange: goToPage,
            showInfo: false // 不显示分页信息
        });
    }

    // 更新分页组件
    window.paginationComponent.update({
        currentPage: quotesData.currentPage,
        totalPages: quotesData.totalPages,
        totalItems: quotesData.totalCount,
        pageSize: quotesData.pageSize
    });
}

/**
 * 更新引用计数
 * @param {number} count - 引用数量
 */
function updateQuoteCount(count) {
    console.log('Updating quote count to:', count);

    // 先更新标题文本，确保标题正确显示
    const quotesListTitle = document.getElementById('quotes-list-title');
    if (quotesListTitle) {
        quotesListTitle.textContent = `Quotes from ${pageState.sourceName}`;
        console.log('Updated quotes-list-title to:', `Quotes from ${pageState.sourceName}`);
    } else {
        console.error('quotes-list-title element not found');
    }

    // 然后更新或创建计数元素
    let displayElement = document.getElementById('quotes-count-display');
    if (displayElement) {
        // 如果元素已存在，直接更新内容
        displayElement.textContent = `(${count})`;
        console.log('Updated existing quotes-count-display to:', `(${count} quotes)`);
    } else {
        // 如果元素不存在，创建并添加到标题旁边
        if (quotesListTitle && quotesListTitle.parentElement) {
            const countSpan = document.createElement('span');
            countSpan.id = 'quotes-count-display';
            countSpan.className = 'ml-2 text-sm text-gray-500 dark:text-gray-400 font-normal';
            countSpan.textContent = `(${count})`;
            quotesListTitle.parentElement.appendChild(countSpan);
            console.log('Created and appended quotes-count-display element');
        } else {
            console.error('Cannot create quotes-count-display: quotesListTitle or its parent not found');
        }
    }

    // 同时保持原有的引用计数更新（虽然已隐藏）
    let quoteCountElement = document.getElementById('quote-count');

    if (!quoteCountElement) {
        quoteCountElement = document.querySelector('#quote-count');
    }

    if (!quoteCountElement) {
        quoteCountElement = document.querySelector('span[id="quote-count"]');
    }

    console.log('Quote count element:', quoteCountElement);

    if (quoteCountElement) {
        // 直接设置内容
        quoteCountElement.textContent = count;
        console.log('Updated quote count to:', count);

        // 尝试使用innerHTML
        quoteCountElement.innerHTML = count;

        // 尝试使用父元素
        const parentElement = quoteCountElement.parentElement;
        if (parentElement) {
            parentElement.innerHTML = `<span id="quote-count">${count}</span> quotes from this source`;
            console.log('Updated parent element');
        }
    } else {
        console.error('Quote count element not found!');
    }
}

/**
 * 跳转到指定页码
 * @param {number} page - 页码
 */
async function goToPage(page) {
    if (page === pageState.currentPage || pageState.isLoading) return;

    pageState.currentPage = page;

    // 更新URL参数
    UrlHandler.updateQueryParam('page', page);

    // 重新加载数据
    await loadQuotes(page, pageState.pageSize);

    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 更新页面状态
 * @param {Object} quotesData - 名言数据和分页信息
 */
function updatePageState(quotesData) {
    pageState.currentPage = quotesData.currentPage;
    pageState.totalPages = quotesData.totalPages;
    pageState.totalQuotes = quotesData.totalCount;
}

/**
 * 显示加载状态
 */
function showLoadingState() {
    pageState.isLoading = true;

    // 显示名言列表加载状态
    const quotesContainer = document.getElementById('quotes-list');
    if (quotesContainer) {
        quotesContainer.innerHTML = `
            <div class="flex justify-center py-12">
                <div class="loading-spinner" role="status">
                    <span class="sr-only">Loading quotes...</span>
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
    const quotesContainer = document.getElementById('quotes-list');
    if (quotesContainer) {
        quotesContainer.innerHTML = `
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
    // 可以添加页面特定的事件监听器
}

/**
 * 从数组中随机选取指定数量的项目
 * @param {Array} array - 原始数组
 * @param {number} count - 需要选取的项目数量
 * @returns {Array} - 随机选取的项目数组
 */
function getRandomItems(array, count) {
    if (!array || array.length === 0) return [];
    if (count >= array.length) return array;

    // 复制数组，避免修改原始数组
    const arrayCopy = [...array];
    const result = [];

    // 随机选取指定数量的项目
    for (let i = 0; i < count; i++) {
        if (arrayCopy.length === 0) break;

        // 生成随机索引
        const randomIndex = Math.floor(Math.random() * arrayCopy.length);

        // 将随机项目添加到结果数组
        result.push(arrayCopy[randomIndex]);

        // 从原数组中移除已选项目，避免重复选择
        arrayCopy.splice(randomIndex, 1);
    }

    return result;
}

/**
 * 添加来源结构化数据
 * @param {string} sourceName - 来源名称
 * @param {string|number} sourceId - 来源ID
 */
function addSourceStructuredData(sourceName, sourceId) {
    // 移除旧的结构化数据
    const oldScript = document.getElementById('source-structured-data');
    if (oldScript) {
        oldScript.remove();
    }

    // 创建结构化数据
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "name": sourceName,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://quotese.com/sources/${UrlHandler.slugify(sourceName)}-${sourceId}.html`
        }
    };

    // 如果有引用数量，添加到结构化数据中
    if (pageState.totalQuotes > 0) {
        structuredData.description = `A collection of ${pageState.totalQuotes} quotes from ${sourceName}.`;
    }

    // 添加到页面
    const script = document.createElement('script');
    script.id = 'source-structured-data';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', initSourcePage);
