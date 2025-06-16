/**
 * 类别页面控制器
 * 负责类别页面的数据加载和交互
 */

// 页面状态
const pageState = {
    currentPage: 1,
    pageSize: 20,
    totalPages: 0,
    totalQuotes: 0,
    isLoading: false,
    categoryName: '',
    categoryId: null
};

// 将页面状态暴露给全局作用域
window.pageState = pageState;

/**
 * 初始化类别页面
 */
async function initCategoryPage() {
    try {
        // 从URL获取类别名称
        const categoryName = window.UrlHandler.getCategoryNameFromUrl();
        console.log('Category name from URL:', categoryName);
        if (!categoryName) {
            showErrorMessage('Category not found. Please check the URL.');
            return;
        }

        pageState.categoryName = categoryName;

        // 获取页码参数
        const pageParam = window.UrlHandler.getQueryParam('page');
        if (pageParam) {
            pageState.currentPage = parseInt(pageParam) || 1;
        }

        // 更新页面标题和描述
        updatePageMetadata(categoryName);

        // 加载组件
        await loadPageComponents();

        // 如果是"writing"类别，直接使用硬编码的ID
        if (categoryName.toLowerCase() === 'writing') {
            console.log('Using hardcoded ID for Writing category');
            pageState.categoryId = 142145;
            console.log('Category ID set to:', pageState.categoryId);

            // 更新页面标题
            updatePageTitle('Writing');

            // 加载数据
            await loadPageData();

            // 初始化事件监听器
            initEventListeners();

            return;
        }

        // 获取类别ID
        // 首先尝试从 URL 中获取 ID
        const categoryId = window.UrlHandler.getCategoryIdFromUrl();

        if (categoryId) {
            // 直接使用 URL 中的 ID
            console.log('Using category ID from URL:', categoryId);
            pageState.categoryId = categoryId;
        } else {
            // 如果 URL 中没有 ID，则通过名称查询
            console.log('Getting category by name:', categoryName);
            try {
                const category = await window.ApiClient.getCategoryByName(categoryName);
                console.log('Category result:', category);
                if (!category) {
                    showErrorMessage(`Category "${categoryName}" not found.`);
                    return;
                }

                pageState.categoryId = category.id;
                console.log('Category ID set to:', pageState.categoryId);
            } catch (categoryError) {
                console.error('Error getting category by name:', categoryError);
                showErrorMessage(`Failed to get category "${categoryName}". Please try refreshing.`);
                return;
            }
        }

        // 更新页面标题
        updatePageTitle(categoryName);

        // 加载数据
        await loadPageData();

        // 初始化事件监听器
        initEventListeners();
    } catch (error) {
        console.error('Error initializing category page:', error);
        showErrorMessage('Failed to initialize page. Please try refreshing.');
    }
}

/**
 * 更新页面元数据
 * @param {string} categoryName - 类别名称
 */
function updatePageMetadata(categoryName) {
    document.title = `Quotes about ${categoryName} | Wisdom Collection - quotese.com`;

    // 更新meta描述
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.content = `Explore our collection of quotes about ${categoryName}. Find inspiration, wisdom, and insights on this topic from great minds throughout history.`;
    }

    // 更新canonical链接
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
        canonicalLink.href = `https://quotese.com/categories/${window.UrlHandler.slugify(categoryName)}-${pageState.categoryId}.html`;
    }

    // 更新Open Graph标题
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
        ogTitle.content = `Quotes about ${categoryName} | Wisdom Collection - quotese.com`;
    }

    // 更新Open Graph描述
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
        ogDescription.content = `Explore our collection of quotes about ${categoryName}. Find inspiration, wisdom, and insights on this topic from great minds throughout history.`;
    }

    // 更新Twitter标题
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
        twitterTitle.content = `Quotes about ${categoryName} | Wisdom Collection`;
    }

    // 更新Twitter描述
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
        twitterDescription.content = `Explore our collection of quotes about ${categoryName}. Find inspiration, wisdom, and insights on this topic from great minds throughout history.`;
    }

    // 添加类别结构化数据
    addCategoryStructuredData(categoryName, pageState.categoryId);

    // 更新社交媒体元数据
    if (window.SocialMetaUtil) {
        window.SocialMetaUtil.updateCategoryMetaTags(
            { name: categoryName, id: pageState.categoryId },
            pageState.totalQuotes
        );
    }
}

/**
 * 更新页面标题
 * @param {string} categoryName - 类别名称
 */
function updatePageTitle(categoryName) {
    const titleElement = document.getElementById('category-name');
    if (titleElement) {
        titleElement.textContent = categoryName;
    }

    const inlineTitleElement = document.getElementById('category-name-inline');
    if (inlineTitleElement) {
        inlineTitleElement.textContent = categoryName;
    }
}

/**
 * 加载页面组件
 */
async function loadPageComponents() {
    try {
        console.log('Loading page components...');

        // 加载面包屑组件
        console.log('Loading breadcrumb component...');
        await ComponentLoader.loadComponent('breadcrumb-container', 'breadcrumb');

        // 初始化面包屑导航
        BreadcrumbComponent.init('breadcrumb-list');

        // 首先加载热门主题组件
        console.log('Loading popular-topics component...');
        const popularTopicsLoaded = await window.ComponentLoader.loadComponent('popular-topics-container', 'popular-topics');
        console.log('popular-topics component loaded:', popularTopicsLoaded);

        // 等待一小段时间，确保 DOM 元素完全渲染
        await new Promise(resolve => setTimeout(resolve, 100));

        // 确保热门主题组件已加载
        if (!document.getElementById('categories-container') ||
            !document.getElementById('authors-container') ||
            !document.getElementById('sources-container')) {
            console.warn('Popular topics containers not found, trying to load again...');
            // 尝试再次加载热门主题组件
            await window.ComponentLoader.loadComponent('popular-topics-container', 'popular-topics', {}, true);
            console.log('Popular topics component reloaded');

            // 再次等待一小段时间
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 更新quotes-list标题
        const quotesListTitle = document.getElementById('quotes-list-title');
        if (quotesListTitle) {
            quotesListTitle.textContent = `Quotes about ${pageState.categoryName}`;
            console.log('Updated quotes-list title to:', `Quotes about ${pageState.categoryName}`);
        }

        // 加载分页组件
        console.log('Loading pagination component...');
        const paginationLoaded = await window.ComponentLoader.loadComponent('pagination-container', 'pagination');
        console.log('pagination component loaded:', paginationLoaded);

        // 直接加载右侧数据
        console.log('Loading side data directly...');
        try {
            // 并行加载数据
            const [categoriesData, authorsData, sourcesData] = await Promise.all([
                loadCategories(),
                loadAuthors(),
                loadSources()
            ]);
            console.log('Side data loaded successfully:', {
                categories: categoriesData ? categoriesData.categories : [],
                authors: authorsData ? authorsData.authors : [],
                sources: sourcesData ? sourcesData.sources : []
            });
        } catch (sideDataError) {
            console.error('Error loading side data directly:', sideDataError);
            // 尝试单独加载每个数据
            loadCategories().catch(err => console.error('Error loading categories directly:', err));
            loadAuthors().catch(err => console.error('Error loading authors directly:', err));
            loadSources().catch(err => console.error('Error loading sources directly:', err));
        }

        console.log('All components loaded successfully.');
    } catch (error) {
        console.error('Error loading page components:', error);
    }
}

/**
 * 加载页面数据
 */
async function loadPageData() {
    // 显示加载状态
    showLoadingState();

    try {
        // 先加载名言数据
        console.log('Loading quotes data with categoryId:', pageState.categoryId);
        const quotesData = await loadQuotes(pageState.currentPage, pageState.pageSize);
        console.log('Quotes data loaded:', quotesData);

        // 更新页面状态
        updatePageState(quotesData);

        // 更新引用计数
        updateQuoteCount(quotesData.totalCount);

        // 同时保持原有的引用计数更新（虽然已隐藏）
        const quoteCountElement = document.getElementById('quote-count');
        if (quoteCountElement) {
            quoteCountElement.textContent = quotesData.totalCount;
            console.log('Updated quote count directly to:', quotesData.totalCount);
        } else {
            console.error('Quote count element not found in direct update!');
            // 尝试使用document.querySelector
            const countElement = document.querySelector('#quote-count');
            if (countElement) {
                countElement.textContent = quotesData.totalCount;
                console.log('Updated quote count using querySelector to:', quotesData.totalCount);
            } else {
                console.error('Quote count element not found using querySelector either!');
            }
        }

        // 检查右侧容器是否存在
        let categoriesContainer = document.getElementById('categories-container');
        let authorsContainer = document.getElementById('authors-container');
        let sourcesContainer = document.getElementById('sources-container');

        // 如果右侧容器不存在，尝试重新加载组件
        if (!categoriesContainer || !authorsContainer || !sourcesContainer) {
            console.warn('Side containers not found, trying to reload popular-topics component...');
            await window.ComponentLoader.loadComponent('popular-topics-container', 'popular-topics');

            // 等待一小段时间，确保 DOM 元素完全渲染
            await new Promise(resolve => setTimeout(resolve, 100));

            // 重新获取容器
            categoriesContainer = document.getElementById('categories-container');
            authorsContainer = document.getElementById('authors-container');
            sourcesContainer = document.getElementById('sources-container');

            console.log('Containers after reload:', {
                categoriesContainer: !!categoriesContainer,
                authorsContainer: !!authorsContainer,
                sourcesContainer: !!sourcesContainer
            });
        }

        // 如果右侧容器存在但为空，或者刚刚重新加载了组件，则加载数据
        if (categoriesContainer || authorsContainer || sourcesContainer) {
            console.log('Loading side data...');
            try {
                // 并行加载数据
                const [categoriesData, authorsData, sourcesData] = await Promise.all([
                    loadCategories(),
                    loadAuthors(),
                    loadSources()
                ]);
                console.log('Side data loaded successfully from loadPageData:', {
                    categories: categoriesData ? categoriesData.categories : [],
                    authors: authorsData ? authorsData.authors : [],
                    sources: sourcesData ? sourcesData.sources : []
                });
            } catch (sideDataError) {
                console.error('Error loading side data from loadPageData:', sideDataError);
                // 尝试单独加载每个数据
                loadCategories().catch(err => console.error('Error loading categories from loadPageData:', err));
                loadAuthors().catch(err => console.error('Error loading authors from loadPageData:', err));
                loadSources().catch(err => console.error('Error loading sources from loadPageData:', err));
            }
        } else {
            console.warn('Side containers still not found after reload attempt');
        }

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
        const filters = { categoryId: pageState.categoryId };
        console.log('Loading quotes with filters:', filters);
        const quotesData = await window.ApiClient.getQuotes(page, pageSize, filters);
        console.log('Quotes data received:', quotesData);

        // 检查quotes-list元素是否存在
        const quotesListElement = document.getElementById('quotes-list');
        console.log('quotes-list element:', quotesListElement);

        if (!quotesListElement) {
            console.error('quotes-list element not found, trying to load quotes-list component again');
            // 尝试再次加载名言列表组件
            await window.ComponentLoader.loadComponent('quotes-container', 'quotes-list', {
                title: `Quotes about ${pageState.categoryName}`
            });
        }

        // 渲染名言列表
        console.log('Rendering quotes:', quotesData.quotes);
        renderQuotes(quotesData.quotes);

        // 更新分页
        updatePagination(quotesData);

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
        console.log('Loading popular categories...');
        // 强制使用真实API数据
        window.ApiClient.useMockData = false;

        // 获取热门类别列表（top 100）
        const popularCategories = await window.ApiClient.getPopularCategories(100);
        console.log('Popular categories loaded:', popularCategories);

        if (!popularCategories || popularCategories.length === 0) {
            console.error('No popular categories returned from API');
            return { categories: [], totalCount: 0 };
        }

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
        return { categories: [], totalCount: 0 };
    }
}

/**
 * 加载作者列表
 * @returns {Promise<Object>} - 作者列表
 */
async function loadAuthors() {
    try {
        console.log('Loading popular authors...');
        // 强制使用真实API数据
        window.ApiClient.useMockData = false;

        // 获取热门作者列表（top 100）
        const popularAuthors = await window.ApiClient.getPopularAuthors(100);
        console.log('Popular authors loaded:', popularAuthors);

        if (!popularAuthors || popularAuthors.length === 0) {
            console.error('No popular authors returned from API');
            return { authors: [], totalCount: 0 };
        }

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
        return { authors: [], totalCount: 0 };
    }
}

/**
 * 加载来源列表
 * @returns {Promise<Object>} - 来源列表
 */
async function loadSources() {
    try {
        console.log('Loading popular sources...');
        // 强制使用真实API数据
        window.ApiClient.useMockData = false;

        // 获取热门来源列表（top 100）
        const popularSources = await window.ApiClient.getPopularSources(100);
        console.log('Popular sources loaded:', popularSources);

        if (!popularSources || popularSources.length === 0) {
            console.error('No popular sources returned from API');
            return { sources: [], totalCount: 0 };
        }

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
        return { sources: [], totalCount: 0 };
    }
}

/**
 * 渲染名言列表
 * @param {Array} quotes - 名言列表
 */
function renderQuotes(quotes) {
    console.log('Rendering quotes:', quotes);

    // 使用通用的名言卡片组件渲染名言列表
    window.QuoteCardComponent.renderList(quotes, 'quotes-list', {
        showAuthorAvatar: false, // 隐藏作者头像，与首页保持一致
        showActions: false, // 隐藏分享和跳转按钮，与首页保持一致
        highlightCurrentCategory: true,
        currentCategoryName: pageState.categoryName,
        emptyMessage: `No quotes found for "${pageState.categoryName}".`
    });

    console.log(`Rendered ${quotes ? quotes.length : 0} quotes using QuoteCardComponent`);
}

/**
 * 渲染类别列表
 * @param {Array} categories - 类别列表
 */
function renderCategories(categories) {
    const categoriesContainer = document.getElementById('categories-container');
    if (!categoriesContainer) {
        console.error('Categories container not found in renderCategories');
        return;
    }
    console.log('Rendering categories to container:', categoriesContainer);

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
        categoryTag.href = window.UrlHandler.getCategoryUrl(category);

        // 当前类别高亮显示
        if (category.name === pageState.categoryName) {
            categoryTag.className = 'tag px-3 py-1.5 text-sm rounded-lg bg-yellow-300 text-yellow-900 dark:bg-yellow-700 dark:text-yellow-100 font-semibold transition-colors duration-300';
        } else {
            categoryTag.className = 'tag px-3 py-1.5 text-sm rounded-lg bg-yellow-50 text-yellow-800 dark:bg-gray-800 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-gray-700 transition-colors duration-300';
        }

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
    if (!authorsContainer) {
        console.error('Authors container not found in renderAuthors');
        return;
    }
    console.log('Rendering authors to container:', authorsContainer);

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
                    <a href="${window.UrlHandler.getAuthorUrl(author)}" class="hover:text-yellow-600 dark:hover:text-yellow-400 font-medium transition-colors duration-300" title="${author.name}">${author.name}</a>
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
    if (!sourcesContainer) {
        console.error('Sources container not found in renderSources');
        return;
    }
    console.log('Rendering sources to container:', sourcesContainer);

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
                    <a href="${window.UrlHandler.getSourceUrl(source)}" class="hover:text-yellow-600 dark:hover:text-yellow-400 font-medium transition-colors duration-300" title="${source.name}">${source.name}</a>
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
function updatePagination(quotesData) {
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

    // 更新左侧名言列表区域顶部标题的右侧显示引用计数
    const quotesCountDisplay = document.getElementById('quotes-count-display');
    if (quotesCountDisplay) {
        quotesCountDisplay.textContent = `(${count})`;
        console.log('Updated quotes-count-display to:', `(${count} quotes)`);
    } else {
        console.error('quotes-count-display element not found');

        // 尝试在标题旁边创建计数元素
        const quotesListTitle = document.getElementById('quotes-list-title');
        if (quotesListTitle && quotesListTitle.parentElement) {
            const countSpan = document.createElement('span');
            countSpan.id = 'quotes-count-display';
            countSpan.className = 'ml-2 text-sm text-gray-500 dark:text-gray-400 font-normal';
            countSpan.textContent = `(${count})`;
            quotesListTitle.parentElement.appendChild(countSpan);
            console.log('Created and appended quotes-count-display element');
        }
    }

    // 更新标题文本，确保标题正确显示
    const quotesListTitle = document.getElementById('quotes-list-title');
    if (quotesListTitle) {
        quotesListTitle.textContent = `Quotes about ${pageState.categoryName}`;
        console.log('Updated quotes-list-title to:', `Quotes about ${pageState.categoryName}`);
    } else {
        console.error('quotes-list-title element not found');
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
            parentElement.innerHTML = `<span id="quote-count">${count}</span> quotes in this category`;
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
    window.UrlHandler.updateQueryParam('page', page);

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

// 将函数暴露给全局作用域
window.loadCategories = loadCategories;
window.loadAuthors = loadAuthors;
window.loadSources = loadSources;
window.renderCategories = renderCategories;
window.renderAuthors = renderAuthors;
window.renderSources = renderSources;

/**
 * 添加类别结构化数据
 * @param {string} categoryName - 类别名称
 * @param {string|number} categoryId - 类别ID
 */
function addCategoryStructuredData(categoryName, categoryId) {
    // 移除旧的结构化数据
    const oldScript = document.getElementById('category-structured-data');
    if (oldScript) {
        oldScript.remove();
    }

    // 创建结构化数据
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `Quotes about ${categoryName}`,
        "description": `A collection of quotes about ${categoryName} from famous authors and sources.`,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://quotese.com/categories/${window.UrlHandler.slugify(categoryName)}-${categoryId}.html`
        }
    };

    // 如果有引用数量，添加到结构化数据中
    if (pageState.totalQuotes > 0) {
        structuredData.numberOfItems = pageState.totalQuotes;
    }

    // 添加到页面
    const script = document.createElement('script');
    script.id = 'category-structured-data';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', initCategoryPage);
