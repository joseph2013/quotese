/**
 * 名言卡片组件
 * 负责渲染名言卡片
 */

class QuoteCardComponent {
    /**
     * 渲染名言卡片
     * @param {Object} quote - 名言对象
     * @param {number} index - 索引，用于动画延迟
     * @param {Object} options - 配置选项
     * @param {boolean} options.showAuthorAvatar - 是否显示作者头像
     * @param {boolean} options.showActions - 是否显示操作按钮（分享、查看详情）
     * @param {boolean} options.highlightCurrentCategory - 是否高亮当前类别
     * @param {string} options.currentCategoryName - 当前类别名称
     * @returns {HTMLElement} - 名言卡片元素
     */
    static render(quote, index = 0, options = {}) {
        // 默认配置
        const defaultOptions = {
            showAuthorAvatar: false,
            showActions: false,
            highlightCurrentCategory: false,
            currentCategoryName: '',
            hideEmptyAvatar: false // 新增配置项，控制当作者头像为空时是否隐藏头像区域
        };

        // 合并配置
        const config = { ...defaultOptions, ...options };

        // 打印配置，便于调试
        console.log('QuoteCardComponent.render config:', config);

        // 创建名言卡片元素
        const quoteCard = document.createElement('div');
        quoteCard.className = `quote-card-component relative p-4 pl-6 sm:p-5 sm:pl-7 md:p-6 md:pl-8 quote-marks fade-in fade-in-delay-${index % 3} mb-3 sm:mb-4 card-hover-effect h-auto`;

        // 确保quote-marks样式与首页保持一致
        // 设置样式确保引号显示在最顶层
        quoteCard.style.overflow = 'visible'; // 确保引号不被截断
        quoteCard.style.minHeight = 'auto'; // 确保卡片高度能够自适应内容
        quoteCard.style.height = 'auto'; // 确保卡片高度能够自适应内容

        // 不再截断名言内容，确保完整显示
        const displayContent = quote.content;

        // 构建作者部分的HTML
        let authorHTML = '';
        if (config.showAuthorAvatar) {
            // 检查作者是否有头像
            const hasAvatar = quote.author.image && quote.author.image.trim() !== '';

            if (hasAvatar || !config.hideEmptyAvatar) {
                // 有头像时显示头像，或者配置为不隐藏空头像时
                if (hasAvatar) {
                    // 有头像时显示头像
                    authorHTML = `
                        <div class="flex items-center mt-3 sm:mt-4">
                            <div class="flex-shrink-0 mr-4">
                                <div class="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-600 dark:text-yellow-300 border-2 border-yellow-400 dark:border-yellow-600">
                                    <img src="${quote.author.image}" alt="${quote.author.name}" class="w-full h-full object-cover rounded-full" onerror="this.onerror=null; this.src=''; this.parentNode.innerHTML = '<span class=\'text-sm font-bold\'>${quote.author.name.charAt(0)}</span>'">
                                </div>
                            </div>
                            <div>
                                <a href="${window.UrlHandler.getAuthorUrl(quote.author)}" class="font-semibold text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors duration-300">${quote.author.name}</a>
                                <p class="text-sm text-gray-500 dark:text-gray-400">${quote.sources.map(source => source.name).join(', ')}</p>
                            </div>
                        </div>
                    `;
                } else {
                    // 没有头像但配置为不隐藏空头像时，显示首字母占位符
                    authorHTML = `
                        <div class="flex items-center mt-3 sm:mt-4">
                            <div class="flex-shrink-0 mr-4">
                                <div class="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-600 dark:text-yellow-300 border-2 border-yellow-400 dark:border-yellow-600">
                                    <span class='text-sm font-bold'>${quote.author.name.charAt(0)}</span>
                                </div>
                            </div>
                            <div>
                                <a href="${window.UrlHandler.getAuthorUrl(quote.author)}" class="font-semibold text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors duration-300">${quote.author.name}</a>
                                <p class="text-sm text-gray-500 dark:text-gray-400">${quote.sources.map(source => source.name).join(', ')}</p>
                            </div>
                        </div>
                    `;
                }
            } else {
                // 没有头像且配置为隐藏空头像时，不显示头像区域，只显示作者名称和来源
                authorHTML = `
                    <div class="flex items-center mt-3 sm:mt-4">
                        <div>
                            <a href="${window.UrlHandler.getAuthorUrl(quote.author)}" class="font-semibold text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors duration-300">${quote.author.name}</a>
                            <p class="text-sm text-gray-500 dark:text-gray-400">${quote.sources.map(source => source.name).join(', ')}</p>
                        </div>
                    </div>
                `;
            }
        } else {
            // 不显示头像的情况
            authorHTML = `
                <div class="flex items-center mt-3 sm:mt-4">
                    <div>
                        <a href="${window.UrlHandler.getAuthorUrl(quote.author)}" class="font-semibold text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors duration-300">${quote.author.name}</a>
                        <p class="text-sm text-gray-500 dark:text-gray-400">${quote.sources.map(source => source.name).join(', ')}</p>
                    </div>
                </div>
            `;
        }

        // 构建类别标签的HTML
        const categoriesHTML = quote.categories.map(category => {
            // 如果需要高亮当前类别，并且当前类别与该类别匹配，则使用高亮样式
            const isCurrentCategory = config.highlightCurrentCategory && category.name === config.currentCategoryName;
            const categoryClass = isCurrentCategory
                ? 'bg-yellow-300 text-yellow-900 dark:bg-yellow-700 dark:text-yellow-100 font-semibold'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800';

            return `<a href="${window.UrlHandler.getCategoryUrl(category)}" class="tag px-2 py-0.5 sm:px-3 sm:py-1 text-xs rounded-full ${categoryClass} transition-colors duration-300">${category.name}</a>`;
        }).join('');

        // 构建操作按钮的HTML
        let actionsHTML = '';
        // 强制禁用所有名言卡片的操作按钮
        // 如果是首页，则显示操作按钮
        const isIndexPage = window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '';

        if (isIndexPage && config.showActions) {
            actionsHTML = `
                <div class="absolute bottom-2 sm:bottom-3 right-2 sm:right-4 flex items-center space-x-1">
                    <button class="p-2 text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors duration-300 rounded-full hover:bg-yellow-50 dark:hover:bg-gray-700" title="Share" data-quote-id="${quote.id}">
                        <i class="fas fa-share-alt"></i>
                    </button>
                    <button class="p-2 text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors duration-300 rounded-full hover:bg-yellow-50 dark:hover:bg-gray-700" title="View Details" data-quote-id="${quote.id}">
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                </div>
            `;
        }

        // 创建名言卡片内容
        quoteCard.innerHTML = `
            <div class="relative z-10">
                <p class="text-base sm:text-lg md:text-xl font-serif leading-relaxed mb-3 sm:mb-4 whitespace-normal break-words">"${displayContent}"</p>
                ${authorHTML}
            </div>
            <div class="mt-3 sm:mt-4 flex flex-wrap gap-1 sm:gap-2">
                ${categoriesHTML}
            </div>
            ${actionsHTML}
        `;

        // 禁用名言卡片点击跳转到详情页
        // 移除点击事件和手型样式
        quoteCard.classList.remove('cursor-pointer');

        // 添加数据属性，便于调试
        quoteCard.setAttribute('data-quote-id', quote.id);

        return quoteCard;
    }

    /**
     * 渲染名言列表
     * @param {Array} quotes - 名言列表
     * @param {string} containerId - 容器ID
     * @param {Object} options - 配置选项
     * @param {boolean} options.showAuthorAvatar - 是否显示作者头像
     * @param {boolean} options.showActions - 是否显示操作按钮（分享、查看详情）
     * @param {boolean} options.highlightCurrentCategory - 是否高亮当前类别
     * @param {string} options.currentCategoryName - 当前类别名称
     * @param {boolean} options.hideEmptyAvatar - 当作者头像为空时是否隐藏头像区域
     */
    static renderList(quotes, containerId, options = {}) {
        // 打印选项，便于调试
        console.log('QuoteCardComponent.renderList options:', options);

        const quotesContainer = document.getElementById(containerId);
        if (!quotesContainer) {
            console.error(`Container with ID "${containerId}" not found!`);
            return;
        }

        // 清空容器
        quotesContainer.innerHTML = '';

        // 如果没有名言，显示空状态
        if (!quotes || quotes.length === 0) {
            const emptyMessage = options.emptyMessage || 'No quotes found.';
            quotesContainer.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-search text-5xl text-gray-400 mb-4 opacity-70"></i>
                    <p class="text-gray-500 dark:text-gray-400 text-lg">${emptyMessage}</p>
                </div>
            `;
            return;
        }

        // 渲染名言列表
        quotes.forEach((quote, index) => {
            const quoteCard = this.render(quote, index, options);
            quotesContainer.appendChild(quoteCard);
        });
    }
}

// 导出模块
window.QuoteCardComponent = QuoteCardComponent;
