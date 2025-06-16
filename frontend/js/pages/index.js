/**
 * 首页控制器
 * 负责首页的数据加载和交互
 */

// 页面状态
const pageState = {
    currentPage: 1,
    pageSize: 20, // 每页显示20条名言，支持翻页
    totalPages: 0,
    totalQuotes: 0,
    isLoading: false
};

/**
 * 初始化首页
 */
async function initIndexPage() {
    try {
        // 清除缓存，确保使用最新的API数据
        console.log('清除名言缓存，确保显示类别和来源...');
        localStorage.removeItem('wisdomQuotes');

        // 获取当前页码
        const urlParams = new URLSearchParams(window.location.search);
        const page = parseInt(urlParams.get('page')) || 1;
        pageState.currentPage = page;

        // 控制Hero Section的显示
        toggleHeroSection(page === 1);

        // 如果是第一页，加载每日名言
        if (page === 1) {
            loadDailyQuote();
        }

        // 加载组件
        await loadPageComponents();

        // 加载数据
        await loadPageData();

        // 初始化事件监听器
        initEventListeners();

    } catch (error) {
        console.error('Error initializing index page:', error);
        showErrorMessage('Failed to initialize page. Please try refreshing.');
    }
}

/**
 * 加载页面组件
 */
async function loadPageComponents() {
    // 加载名言列表组件
    await ComponentLoader.loadComponent('quotes-container', 'quotes-list', {
        title: 'Famous Quotes'
    });

    // 加载分页组件
    await ComponentLoader.loadComponent('pagination-container', 'pagination');

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
        // 显示加载状态
        showLoadingState();

        // 从 localStorage 获取缓存的 wisdom 名言
        const cachedData = localStorage.getItem('wisdomQuotes');
        let wisdomQuotes = cachedData ? JSON.parse(cachedData) : null;

        // 如果没有缓存或缓存已过期，则重新加载数据
        if (!wisdomQuotes || Date.now() - wisdomQuotes.timestamp > 3600000) { // 1小时过期
            console.log('加载 wisdom 类别的名言数据...');

            // 获取 wisdom 类别下的名言总数
            const countResult = await window.ApiClient.getWisdomQuotes(1, 1);
            const totalCount = countResult.totalCount;
            console.log(`wisdom 类别下共有 ${totalCount} 条名言`);

            // 先加载第一批数据（200条），快速显示第一页
            console.log('加载第一批数据（200条）...');
            const firstBatchResult = await window.ApiClient.getWisdomQuotes(1, 200);
            let allQuotes = [...firstBatchResult.quotes];

            // 随机排序第一批数据
            const shuffledFirstBatch = shuffleArray([...allQuotes]);

            // 创建初始缓存，包含第一批数据
            wisdomQuotes = {
                quotes: shuffledFirstBatch,
                totalCount: totalCount,
                timestamp: Date.now(),
                isComplete: false // 标记缓存未完成
            };
            localStorage.setItem('wisdomQuotes', JSON.stringify(wisdomQuotes));

            // 计算当前页的数据
            const start = (page - 1) * pageSize;
            const end = Math.min(start + pageSize, wisdomQuotes.quotes.length);
            const pageQuotes = wisdomQuotes.quotes.slice(start, end);

            // 构建返回数据
            const quotesData = {
                quotes: pageQuotes,
                currentPage: page,
                pageSize: pageSize,
                totalPages: Math.ceil(Math.min(totalCount, 2000) / pageSize),
                totalCount: Math.min(totalCount, 2000)
            };

            // 渲染名言列表
            renderQuotes(quotesData.quotes);

            // 更新分页
            await updatePagination(quotesData);

            // 隐藏加载状态
            hideLoadingState();

            // 在后台继续加载剩余数据
            setTimeout(() => {
                loadRemainingQuotes(totalCount, allQuotes);
            }, 1000);

            return quotesData;
        } else {
            console.log(`使用缓存的 ${wisdomQuotes.quotes.length} 条 wisdom 名言`);

            // 如果缓存未完成，在后台继续加载剩余数据
            if (wisdomQuotes.isComplete === false) {
                setTimeout(() => {
                    loadRemainingQuotes(wisdomQuotes.totalCount, wisdomQuotes.quotes);
                }, 1000);
            }

            // 计算当前页的数据
            const start = (page - 1) * pageSize;
            const end = Math.min(start + pageSize, wisdomQuotes.quotes.length);
            const pageQuotes = wisdomQuotes.quotes.slice(start, end);

            // 构建返回数据
            const quotesData = {
                quotes: pageQuotes,
                currentPage: page,
                pageSize: pageSize,
                totalPages: Math.ceil(wisdomQuotes.totalCount / pageSize),
                totalCount: wisdomQuotes.totalCount
            };

            // 渲染名言列表
            renderQuotes(quotesData.quotes);

            // 更新分页
            await updatePagination(quotesData);

            // 隐藏加载状态
            hideLoadingState();

            return quotesData;
        }
    } catch (error) {
        console.error('Error loading quotes:', error);

        // 如果加载 wisdom 名言失败，回退到原来的方法
        console.log('回退到原来的加载方法...');
        try {
            // 获取前5000条名言，按点赞数排序
            const quotesData = await window.ApiClient.getTopQuotes(page, pageSize, false, true);

            // 渲染名言列表
            renderQuotes(quotesData.quotes);

            // 更新分页
            await updatePagination(quotesData);

            // 隐藏加载状态
            hideLoadingState();

            return quotesData;
        } catch (fallbackError) {
            console.error('Fallback loading also failed:', fallbackError);
            hideLoadingState();
            throw fallbackError;
        }
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

        // 从前100个作者中随机选取5个
        const randomAuthors = getRandomItems(popularAuthors, 5);

        // 渲染作者列表
        renderAuthors(randomAuthors);

        console.log('Random 5 authors from top 100:', randomAuthors);

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

        // 从前100个来源中随机选取5个
        const randomSources = getRandomItems(popularSources, 5);

        // 渲染来源列表
        renderSources(randomSources);

        console.log('Random 5 sources from top 100:', randomSources);

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
    // 在控制台输出名言数据，检查是否包含类别和来源
    console.log('Rendering quotes with categories and sources:', quotes);

    // 使用通用的名言卡片组件渲染名言列表
    window.QuoteCardComponent.renderList(quotes, 'quotes-list', {
        showAuthorAvatar: false,
        showActions: false,
        highlightCurrentCategory: false,
        emptyMessage: 'No quotes found.'
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
        const sourceItem = document.createElement('li');
        sourceItem.className = 'flex justify-between items-start py-1.5 px-2 rounded-md transition-colors duration-300';
        sourceItem.innerHTML = `
            <div class="flex items-start space-x-2 w-full">
                <div class="flex-grow pr-2">
                    <a href="${UrlHandler.getSourceUrl(source)}" class="hover:text-yellow-600 dark:hover:text-yellow-400 font-medium transition-colors duration-300" title="${source.name}">${source.name}</a>
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
    // 检查是否有足够的数据需要分页
    if (!quotesData || !quotesData.totalCount || quotesData.totalCount <= 0 || quotesData.totalPages <= 1) {
        // 没有数据或者只有一页数据，清空分页容器
        const paginationContainer = document.getElementById('pagination-container');
        if (paginationContainer) {
            paginationContainer.innerHTML = '';
        }
        // 重置分页组件
        window.paginationComponent = null;
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
 * 跳转到指定页码
 * @param {number} page - 页码
 */
async function goToPage(page) {
    if (page === pageState.currentPage || pageState.isLoading) return;

    pageState.currentPage = page;

    // 更新URL参数
    UrlHandler.updateQueryParam('page', page);

    // 控制Hero Section的显示
    toggleHeroSection(page === 1);

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
        // 创建骨架屏效果，显示多个加载中的名言卡片
        let skeletonHTML = '';
        for (let i = 0; i < 5; i++) {
            skeletonHTML += `
                <div class="quote-card-component relative p-4 pl-6 sm:p-5 sm:pl-7 md:p-6 md:pl-8 mb-3 sm:mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-md animate-pulse">
                    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-3"></div>
                    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-3"></div>
                    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3"></div>
                    <div class="flex justify-between items-center mt-4">
                        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        <div class="flex space-x-2">
                            <div class="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                            <div class="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        </div>
                    </div>
                </div>
            `;
        }

        quotesContainer.innerHTML = skeletonHTML;
    }

    // 显示分页加载状态
    const paginationContainer = document.getElementById('pagination-container');
    if (paginationContainer) {
        paginationContainer.innerHTML = `
            <div class="flex justify-center py-4">
                <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
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
 * 控制Hero Section的显示
 * @param {boolean} show - 是否显示Hero Section
 */
function toggleHeroSection(show) {
    const heroSection = document.querySelector('section[aria-labelledby="hero-heading"]');
    if (heroSection) {
        if (show) {
            heroSection.style.display = '';
        } else {
            heroSection.style.display = 'none';
        }
    }
}

/**
 * 初始化事件监听器
 */
function initEventListeners() {
    // 若有其他事件监听器，可以在这里添加

    // 禁用英雄名言卡片点击跳转到详情页
    const heroQuoteCard = document.getElementById('hero-quote-card');
    if (heroQuoteCard) {
        // 移除手型样式，使其看起来不像可点击的元素
        heroQuoteCard.style.cursor = 'default';
    }

    // 添加清除缓存的功能（仅在开发模式下可用）
    if (window.AppConfig && window.AppConfig.debug) {
        // 创建一个隐藏的按钮，只有当按下 Ctrl+Shift+C 时才会清除缓存
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                console.log('清除名言缓存...');
                localStorage.removeItem('wisdomQuotes');
                alert('名言缓存已清除，刷新页面以重新加载数据。');
            }
        });
    }
}

/**
 * 获取用户点赞的名言ID列表
 * @returns {Array} - 点赞的名言ID列表
 */
function getLikedQuotes() {
    const likedQuotes = localStorage.getItem('likedQuotes');
    return likedQuotes ? JSON.parse(likedQuotes) : [];
}

/**
 * 添加点赞的名言ID
 * @param {string} quoteId - 名言ID
 */
function addLikedQuote(quoteId) {
    const likedQuotes = getLikedQuotes();
    if (!likedQuotes.includes(quoteId)) {
        likedQuotes.push(quoteId);
        localStorage.setItem('likedQuotes', JSON.stringify(likedQuotes));
    }
}

/**
 * 移除点赞的名言ID
 * @param {string} quoteId - 名言ID
 */
function removeLikedQuote(quoteId) {
    const likedQuotes = getLikedQuotes();
    const index = likedQuotes.indexOf(quoteId);
    if (index !== -1) {
        likedQuotes.splice(index, 1);
        localStorage.setItem('likedQuotes', JSON.stringify(likedQuotes));
    }
}

/**
 * 在后台加载剩余的 wisdom 名言数据
 * @param {number} totalCount - 名言总数
 * @param {Array} existingQuotes - 已加载的名言数组
 */
async function loadRemainingQuotes(totalCount, existingQuotes) {
    try {
        console.log('在后台继续加载剩余数据...');

        // 计算已加载的数据量
        const loadedCount = existingQuotes.length;

        // 如果已经加载了足够的数据，则不需要继续加载
        if (loadedCount >= 2000) {
            console.log('已经加载了足够的数据，不需要继续加载');

            // 更新缓存状态为完成
            const cachedData = localStorage.getItem('wisdomQuotes');
            if (cachedData) {
                const wisdomQuotes = JSON.parse(cachedData);
                wisdomQuotes.isComplete = true;
                localStorage.setItem('wisdomQuotes', JSON.stringify(wisdomQuotes));
            }

            return;
        }

        // 计算需要加载的数据量
        const remainingCount = Math.min(totalCount, 2000) - loadedCount;

        // 计算需要加载的页数，每页100条
        const startPage = Math.floor(loadedCount / 100) + 1;
        const totalPages = Math.ceil(remainingCount / 100) + startPage - 1;

        let allQuotes = [...existingQuotes];

        // 分批加载数据，每批100条
        for (let i = startPage; i <= totalPages; i++) {
            console.log(`加载第 ${i}/${totalPages} 批数据...`);
            const result = await window.ApiClient.getWisdomQuotes(i, 100);
            allQuotes = [...allQuotes, ...result.quotes];

            // 如果已经加载了2000条，则停止加载
            if (allQuotes.length >= 2000) {
                allQuotes = allQuotes.slice(0, 2000);
                break;
            }
        }

        console.log(`成功加载全部 ${allQuotes.length} 条 wisdom 名言`);

        // 随机排序名言，确保每次加载的名言顺序不同
        const shuffledQuotes = shuffleArray([...allQuotes]);
        console.log('已对所有名言进行随机排序');

        // 更新缓存
        const wisdomQuotes = {
            quotes: shuffledQuotes,
            totalCount: shuffledQuotes.length,
            timestamp: Date.now(),
            isComplete: true // 标记缓存已完成
        };
        localStorage.setItem('wisdomQuotes', JSON.stringify(wisdomQuotes));

        console.log('后台数据加载完成，缓存已更新');
    } catch (error) {
        console.error('后台加载数据失败:', error);
    }
}

/**
 * 对数组进行随机排序（Fisher-Yates 洗牌算法）
 * @param {Array} array - 要排序的数组
 * @returns {Array} - 随机排序后的数组
 */
function shuffleArray(array) {
    // 复制数组，避免修改原数组
    const shuffled = [...array];

    // Fisher-Yates 洗牌算法
    for (let i = shuffled.length - 1; i > 0; i--) {
        // 生成一个随机索引，范围从 0 到 i
        const j = Math.floor(Math.random() * (i + 1));
        // 交换元素
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

/**
 * 从数组中随机选取指定数量的元素
 * @param {Array} items - 原始数组
 * @param {number} count - 需要选取的元素数量
 * @returns {Array} - 随机选取的元素数组
 */
function getRandomItems(items, count) {
    // 如果原始数组长度小于等于需要选取的数量，直接返回原始数组
    if (!items || items.length <= count) {
        return items || [];
    }

    // 复制原始数组，避免修改原始数组
    const itemsCopy = [...items];
    const result = [];

    // 随机选取指定数量的元素
    for (let i = 0; i < count; i++) {
        // 生成一个随机索引
        const randomIndex = Math.floor(Math.random() * itemsCopy.length);
        // 将随机选取的元素添加到结果数组
        result.push(itemsCopy[randomIndex]);
        // 从原始数组中移除已选取的元素，避免重复选取
        itemsCopy.splice(randomIndex, 1);
    }

    return result;
}

/**
 * 加载每日名言
 * 根据当前日期生成一个固定的随机数，确保同一天显示相同的名言
 */
async function loadDailyQuote() {
    try {
        // 获取当前日期并格式化为 YYYYMMDD
        const today = new Date();
        const dateString = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

        // 获取前5000条名言的数量
        const { totalCount } = await window.ApiClient.getTopQuotes(1, 1, true);

        // 使用日期字符串作为种子生成一个伪随机数
        // 这确保同一天生成相同的随机数
        let seed = 0;
        for (let i = 0; i < dateString.length; i++) {
            seed = ((seed << 5) - seed) + dateString.charCodeAt(i);
            seed = seed & seed; // Convert to 32bit integer
        }

        // 使用种子生成一个 0 到 totalCount-1 之间的随机数
        const randomIndex = Math.abs(seed) % totalCount;

        // 获取每日名言
        const { quotes } = await window.ApiClient.getTopQuotes(Math.floor(randomIndex / pageState.pageSize) + 1, pageState.pageSize, false);
        const dailyQuote = quotes[randomIndex % pageState.pageSize];

        // 更新英雄名言卡片
        updateHeroQuoteCard(dailyQuote);

        console.log('Daily quote loaded:', dailyQuote);
    } catch (error) {
        console.error('Error loading daily quote:', error);
        // 如果加载失败，使用默认名言
        const defaultQuote = {
            content: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
            author: { name: "Nelson Mandela", id: "1" },
            categories: [],
            sources: []
        };
        updateHeroQuoteCard(defaultQuote);
    }
}

/**
 * 更新英雄名言卡片
 * @param {Object} quote - 名言对象
 */
function updateHeroQuoteCard(quote) {
    const heroQuoteCard = document.getElementById('hero-quote-card');
    if (!heroQuoteCard) return;

    // 更新卡片内容
    const quoteContent = heroQuoteCard.querySelector('blockquote p');
    const quoteAuthor = heroQuoteCard.querySelector('figcaption');

    if (quoteContent) {
        quoteContent.textContent = `"${quote.content}"`;
    }

    if (quoteAuthor) {
        quoteAuthor.textContent = quote.author.name;
    }

    // 添加数据属性，便于调试
    heroQuoteCard.setAttribute('data-quote-id', quote.id);

    // 设置为默认样式，不再提示可点击
    heroQuoteCard.style.cursor = 'default';
}

/**
 * 显示随机名言
 */
async function showRandomQuote() {
    try {
        // 获取前5000条名言的数量
        const { totalCount } = await window.ApiClient.getTopQuotes(1, 1, true);

        // 生成随机索引
        const randomIndex = Math.floor(Math.random() * totalCount);

        // 获取随机名言
        const { quotes } = await window.ApiClient.getTopQuotes(Math.floor(randomIndex / pageState.pageSize) + 1, pageState.pageSize, false);
        const randomQuote = quotes[randomIndex % pageState.pageSize];

        // 显示随机名言模态框
        showQuoteModal(randomQuote);
    } catch (error) {
        console.error('Error showing random quote:', error);
        alert('Failed to load random quote. Please try again.');
    }
}

/**
 * 显示名言模态框
 * @param {Object} quote - 名言对象
 */
function showQuoteModal(quote) {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 fade-in';
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-2xl w-full mx-4 quote-marks relative">
            <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <i class="fas fa-times text-xl"></i>
            </button>
            <h3 class="text-xl font-bold mb-4 text-yellow-600 dark:text-yellow-400">Random Quote</h3>
            <p class="text-xl mb-6">"${quote.content}"</p>
            <div class="flex justify-between items-end">
                <div>
                    <p class="font-semibold text-yellow-600 dark:text-yellow-400">${quote.author.name}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">${quote.sources.map(source => source.name).join(', ')}</p>
                </div>
                <div class="flex space-x-2">
                    <button class="p-2 text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors duration-300 rounded-full hover:bg-yellow-50 dark:hover:bg-gray-700" title="Share">
                        <i class="fas fa-share-alt"></i>
                    </button>
                    <!-- 禁用跳转到名言详情页 -->
                    <button class="p-2 text-gray-400 dark:text-gray-600 cursor-not-allowed" title="View Details Disabled" disabled>
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                </div>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
                ${quote.categories.map(category =>
                    `<a href="${UrlHandler.getCategoryUrl(category)}" class="tag px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">${category.name}</a>`
                ).join('')}
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // 关闭模态框
    const closeBtn = modal.querySelector('button');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', initIndexPage);
