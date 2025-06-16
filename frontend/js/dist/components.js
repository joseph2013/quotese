/**
 * 面包屑导航组件
 */
class BreadcrumbComponent {
  /**
   * 初始化面包屑导航
   * @param {string} containerId - 容器ID
   * @param {Array} items - 面包屑项目数组，每项包含name和url
   */
  static render(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 清空容器
    container.innerHTML = '';

    // 添加首页
    const homeItem = document.createElement('li');
    homeItem.innerHTML = `
      <a href="/" class="hover:text-yellow-600 dark:hover:text-yellow-400">Home</a>
    `;

    // 如果不只有首页，添加分隔符
    if (items.length > 0) {
      homeItem.innerHTML += `<span class="mx-2">/</span>`;
    }

    container.appendChild(homeItem);

    // 添加其他项目
    items.forEach((item, index) => {
      const listItem = document.createElement('li');

      // 最后一项不是链接
      if (index === items.length - 1) {
        listItem.innerHTML = `
          <span class="text-gray-700 dark:text-gray-300 font-medium">${item.name}</span>
        `;
      } else {
        listItem.innerHTML = `
          <a href="${item.url}" class="hover:text-yellow-600 dark:hover:text-yellow-400">${item.name}</a>
          <span class="mx-2">/</span>
        `;
      }

      container.appendChild(listItem);
    });

    // 添加结构化数据
    BreadcrumbComponent.addStructuredData([{name: 'Home', url: '/'}].concat(items));
  }

  /**
   * 添加结构化数据
   * @param {Array} items - 面包屑项目数组
   */
  static addStructuredData(items) {
    // 移除旧的结构化数据
    const oldScript = document.getElementById('breadcrumb-structured-data');
    if (oldScript) {
      oldScript.remove();
    }

    // 创建结构化数据
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": `https://example.com${item.url}`
      }))
    };

    // 添加到页面
    const script = document.createElement('script');
    script.id = 'breadcrumb-structured-data';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }

  /**
   * 根据当前页面类型和URL参数生成面包屑
   * @returns {Array} 面包屑项目数组
   */
  static generateBreadcrumbItems() {
    const path = window.location.pathname;
    const search = window.location.search;
    const urlParams = new URLSearchParams(search);
    const items = [];

    // 解析当前页面类型
    if (path.includes('author.html') || path.includes('/authors/')) {
      // 作者详情页
      const authorName = urlParams.get('name') || UrlHandler.getAuthorNameFromUrl();
      if (authorName) {
        // 移除作者列表页的超链接
        items.push({ name: 'Author', url: '#' });
        items.push({ name: authorName, url: UrlHandler.getAuthorUrl({ name: authorName }) });
      } else {
        // 作者列表页
        items.push({ name: 'Authors', url: '/authors' });
      }
    } else if (path.includes('category.html') || path.includes('/categories/')) {
      // 类别详情页
      const categoryName = urlParams.get('name') || UrlHandler.getCategoryNameFromUrl();
      if (categoryName) {
        // 移除类别列表页的超链接
        items.push({ name: 'Category', url: '#' });
        items.push({ name: categoryName, url: UrlHandler.getCategoryUrl({ name: categoryName }) });
      } else {
        // 类别列表页
        items.push({ name: 'Categories', url: '/categories' });
      }
    } else if (path.includes('source.html') || path.includes('/sources/')) {
      // 来源详情页
      const sourceName = urlParams.get('name') || UrlHandler.getSourceNameFromUrl();
      if (sourceName) {
        // 移除来源列表页的超链接
        items.push({ name: 'Source', url: '#' });
        items.push({ name: sourceName, url: UrlHandler.getSourceUrl({ name: sourceName }) });
      } else {
        // 来源列表页
        items.push({ name: 'Sources', url: '/sources' });
      }
    } else if (path.includes('quote.html') || path.includes('/quotes/')) {
      // 名言详情页
      const quoteId = urlParams.get('id') || UrlHandler.getQuoteIdFromUrl();
      if (quoteId) {
        items.push({ name: 'Quote', url: '/quotes' });
        // 这里可以添加名言的简短摘要，但需要从API获取
        items.push({ name: `Quote #${quoteId}`, url: UrlHandler.getQuoteUrl({ id: quoteId }) });
      }
    } else if (path.includes('authors.html') || path === '/authors') {
      // 作者列表页
      items.push({ name: 'Authors', url: '/authors' });
    } else if (path.includes('categories.html') || path === '/categories') {
      // 类别列表页
      items.push({ name: 'Categories', url: '/categories' });
    } else if (path.includes('sources.html') || path === '/sources') {
      // 来源列表页
      items.push({ name: 'Sources', url: '/sources' });
    } else if (path.includes('search.html') || path === '/search') {
      // 搜索页面
      const query = urlParams.get('q');
      items.push({ name: 'Search', url: '/search' });
      if (query) {
        items.push({ name: `Search results for "${query}"`, url: `/search?q=${encodeURIComponent(query)}` });
      }
    }

    return items;
  }

  /**
   * 初始化面包屑导航
   * @param {string} containerId - 容器ID
   */
  static init(containerId) {
    const items = BreadcrumbComponent.generateBreadcrumbItems();
    BreadcrumbComponent.render(containerId, items);
  }
}

// 导出组件
window.BreadcrumbComponent = BreadcrumbComponent;
/**
 * 分页组件
 * 负责处理分页逻辑和UI渲染
 */

class PaginationComponent {
    /**
     * 构造函数
     * @param {Object} options - 配置选项
     * @param {string} options.containerId - 分页容器的ID
     * @param {Function} options.onPageChange - 页码变更回调函数
     * @param {boolean} options.showInfo - 是否显示分页信息
     * @param {string} options.infoText - 分页信息文本模板，例如："Showing {start}-{end} of {total} quotes"
     */
    constructor(options = {}) {
        this.containerId = options.containerId || 'pagination-container';
        this.onPageChange = options.onPageChange || (() => {});
        this.showInfo = options.showInfo !== undefined ? options.showInfo : true;
        this.infoText = options.infoText || 'Showing {start}-{end} of {total} quotes';

        this.currentPage = 1;
        this.totalPages = 1;
        this.totalItems = 0;
        this.pageSize = 20;
        this.isLoading = false;
    }

    /**
     * 初始化分页组件
     * @param {Object} paginationData - 分页数据
     * @param {number} paginationData.currentPage - 当前页码
     * @param {number} paginationData.totalPages - 总页数
     * @param {number} paginationData.totalItems - 总条目数
     * @param {number} paginationData.pageSize - 每页条目数
     */
    init(paginationData) {
        this.update(paginationData);
    }

    /**
     * 更新分页组件
     * @param {Object} paginationData - 分页数据
     * @param {number} paginationData.currentPage - 当前页码
     * @param {number} paginationData.totalPages - 总页数
     * @param {number} paginationData.totalItems - 总条目数
     * @param {number} paginationData.pageSize - 每页条目数
     */
    update(paginationData) {
        // 更新分页状态
        this.currentPage = paginationData.currentPage || this.currentPage;
        this.totalPages = paginationData.totalPages || this.totalPages;
        this.totalItems = paginationData.totalItems || paginationData.totalCount || this.totalItems;
        this.pageSize = paginationData.pageSize || this.pageSize;

        // 渲染分页UI
        this.render();
    }

    /**
     * 渲染分页UI
     */
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        // 清空容器
        container.innerHTML = '';

        // 创建分页组件
        const pagination = document.createElement('nav');
        pagination.className = 'flex flex-col items-center mt-10 space-y-4';
        pagination.setAttribute('aria-label', 'Pagination');

        // 计算分页信息
        const startItem = (this.currentPage - 1) * this.pageSize + 1;
        const endItem = Math.min(this.currentPage * this.pageSize, this.totalItems);

        // 创建分页按钮
        const paginationButtons = document.createElement('div');
        paginationButtons.className = 'flex items-center space-x-1';
        paginationButtons.setAttribute('role', 'navigation');
        paginationButtons.setAttribute('aria-label', 'Pagination Navigation');

        // 移除首页按钮

        // 上一页按钮
        const prevPageBtn = document.createElement('button');
        prevPageBtn.className = `pagination-btn btn btn-icon btn-sm ${this.currentPage === 1 ? 'btn-gray disabled' : 'btn-gray'}`;
        prevPageBtn.setAttribute('aria-label', 'Previous page');
        prevPageBtn.innerHTML = '<i class="fas fa-angle-left" aria-hidden="true"></i>';
        if (this.currentPage === 1) {
            prevPageBtn.setAttribute('aria-disabled', 'true');
            prevPageBtn.classList.add('pagination-btn-disabled');
        } else {
            prevPageBtn.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        }
        paginationButtons.appendChild(prevPageBtn);

        // 页码按钮
        const pageNumbersContainer = document.createElement('div');
        pageNumbersContainer.className = 'flex items-center space-x-1';
        pageNumbersContainer.id = 'pagination-numbers';

        // 计算要显示的页码范围
        let startPage = Math.max(1, this.currentPage - 2);
        let endPage = Math.min(this.totalPages, startPage + 4);

        if (endPage - startPage < 4 && this.totalPages > 4) {
            startPage = Math.max(1, endPage - 4);
        }

        // 创建页码按钮
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-btn btn btn-sm ${i === this.currentPage ? 'btn-primary' : 'btn-gray'} w-10 h-10`;
            pageBtn.setAttribute('aria-label', `Page ${i}`);
            pageBtn.textContent = i.toString();

            if (i === this.currentPage) {
                pageBtn.setAttribute('aria-current', 'page');
            } else {
                pageBtn.addEventListener('click', () => this.goToPage(i));
            }

            pageNumbersContainer.appendChild(pageBtn);
        }

        // 如果有更多页码，显示省略号
        if (endPage < this.totalPages) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'px-2 text-gray-600 dark:text-gray-400';
            ellipsis.setAttribute('aria-hidden', 'true');
            ellipsis.textContent = '...';
            pageNumbersContainer.appendChild(ellipsis);

            // 显示最后一页
            const lastPageNumBtn = document.createElement('button');
            lastPageNumBtn.className = 'pagination-btn btn btn-sm btn-gray w-10 h-10';
            lastPageNumBtn.setAttribute('aria-label', `Page ${this.totalPages}`);
            lastPageNumBtn.textContent = this.totalPages.toString();
            lastPageNumBtn.addEventListener('click', () => this.goToPage(this.totalPages));
            pageNumbersContainer.appendChild(lastPageNumBtn);
        }

        paginationButtons.appendChild(pageNumbersContainer);

        // 下一页按钮
        const nextPageBtn = document.createElement('button');
        nextPageBtn.className = `pagination-btn btn btn-icon btn-sm ${this.currentPage === this.totalPages ? 'btn-gray disabled' : 'btn-gray'}`;
        nextPageBtn.setAttribute('aria-label', 'Next page');
        nextPageBtn.innerHTML = '<i class="fas fa-angle-right" aria-hidden="true"></i>';
        if (this.currentPage === this.totalPages) {
            nextPageBtn.setAttribute('aria-disabled', 'true');
            nextPageBtn.classList.add('pagination-btn-disabled');
        } else {
            nextPageBtn.addEventListener('click', () => this.goToPage(this.currentPage + 1));
        }
        paginationButtons.appendChild(nextPageBtn);

        // 移除末页按钮

        pagination.appendChild(paginationButtons);

        // 分页信息
        if (this.showInfo) {
            const paginationInfo = document.createElement('div');
            paginationInfo.className = 'text-sm text-gray-600 dark:text-gray-400';
            paginationInfo.setAttribute('aria-live', 'polite');
            paginationInfo.id = 'pagination-info';

            // 替换信息文本中的占位符
            const infoText = this.infoText
                .replace('{start}', startItem)
                .replace('{end}', endItem)
                .replace('{total}', this.totalItems);

            paginationInfo.innerHTML = infoText;
            pagination.appendChild(paginationInfo);
        }

        container.appendChild(pagination);
    }

    /**
     * 跳转到指定页码
     * @param {number} page - 页码
     */
    goToPage(page) {
        if (page === this.currentPage || this.isLoading) return;

        // 调用页码变更回调函数
        this.onPageChange(page);
    }

    /**
     * 设置加载状态
     * @param {boolean} isLoading - 是否正在加载
     */
    setLoading(isLoading) {
        this.isLoading = isLoading;

        // 禁用或启用分页按钮
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const buttons = container.querySelectorAll('.pagination-btn');
        buttons.forEach(button => {
            if (isLoading) {
                button.setAttribute('disabled', 'disabled');
                button.classList.add('disabled');
            } else {
                button.removeAttribute('disabled');
                button.classList.remove('disabled');
            }
        });
    }
}

// 导出模块
window.PaginationComponent = PaginationComponent;
/**
 * 分页组件
 * 负责处理分页逻辑和UI渲染
 */

class PaginationComponent {
    /**
     * 构造函数
     * @param {Object} options - 配置选项
     * @param {string} options.containerId - 分页容器的ID
     * @param {Function} options.onPageChange - 页码变更回调函数
     * @param {boolean} options.showInfo - 是否显示分页信息
     * @param {string} options.infoText - 分页信息文本模板，例如："Showing {start}-{end} of {total} quotes"
     */
    constructor(options = {}) {
        this.containerId = options.containerId || 'pagination-container';
        this.onPageChange = options.onPageChange || (() => {});
        this.showInfo = options.showInfo !== undefined ? options.showInfo : true;
        this.infoText = options.infoText || 'Showing {start}-{end} of {total} quotes';

        this.currentPage = 1;
        this.totalPages = 1;
        this.totalItems = 0;
        this.pageSize = 20;
        this.isLoading = false;
    }

    /**
     * 初始化分页组件
     * @param {Object} paginationData - 分页数据
     * @param {number} paginationData.currentPage - 当前页码
     * @param {number} paginationData.totalPages - 总页数
     * @param {number} paginationData.totalItems - 总条目数
     * @param {number} paginationData.pageSize - 每页条目数
     */
    init(paginationData) {
        this.update(paginationData);
    }

    /**
     * 更新分页组件
     * @param {Object} paginationData - 分页数据
     * @param {number} paginationData.currentPage - 当前页码
     * @param {number} paginationData.totalPages - 总页数
     * @param {number} paginationData.totalItems - 总条目数
     * @param {number} paginationData.pageSize - 每页条目数
     */
    update(paginationData) {
        // 更新分页状态
        this.currentPage = paginationData.currentPage || this.currentPage;
        this.totalPages = paginationData.totalPages || this.totalPages;
        this.totalItems = paginationData.totalItems || paginationData.totalCount || this.totalItems;
        this.pageSize = paginationData.pageSize || this.pageSize;

        // 渲染分页UI
        this.render();
    }

    /**
     * 渲染分页UI
     */
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        // 清空容器
        container.innerHTML = '';

        // 创建分页组件
        const pagination = document.createElement('nav');
        pagination.className = 'flex flex-col items-center mt-10 space-y-4';
        pagination.setAttribute('aria-label', 'Pagination');

        // 计算分页信息
        const startItem = (this.currentPage - 1) * this.pageSize + 1;
        const endItem = Math.min(this.currentPage * this.pageSize, this.totalItems);

        // 创建分页按钮
        const paginationButtons = document.createElement('div');
        paginationButtons.className = 'flex items-center space-x-1';
        paginationButtons.setAttribute('role', 'navigation');
        paginationButtons.setAttribute('aria-label', 'Pagination Navigation');

        // 移除首页按钮

        // 上一页按钮
        const prevPageBtn = document.createElement('button');
        prevPageBtn.className = `pagination-btn btn btn-icon btn-sm ${this.currentPage === 1 ? 'btn-gray disabled' : 'btn-gray'}`;
        prevPageBtn.setAttribute('aria-label', 'Previous page');
        prevPageBtn.innerHTML = '<i class="fas fa-angle-left" aria-hidden="true"></i>';
        if (this.currentPage === 1) {
            prevPageBtn.setAttribute('aria-disabled', 'true');
            prevPageBtn.classList.add('pagination-btn-disabled');
        } else {
            prevPageBtn.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        }
        paginationButtons.appendChild(prevPageBtn);

        // 页码按钮
        const pageNumbersContainer = document.createElement('div');
        pageNumbersContainer.className = 'flex items-center space-x-1';
        pageNumbersContainer.id = 'pagination-numbers';

        // 计算要显示的页码范围
        let startPage = Math.max(1, this.currentPage - 2);
        let endPage = Math.min(this.totalPages, startPage + 4);

        if (endPage - startPage < 4 && this.totalPages > 4) {
            startPage = Math.max(1, endPage - 4);
        }

        // 创建页码按钮
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-btn btn btn-sm ${i === this.currentPage ? 'btn-primary' : 'btn-gray'} w-10 h-10`;
            pageBtn.setAttribute('aria-label', `Page ${i}`);
            pageBtn.textContent = i.toString();

            if (i === this.currentPage) {
                pageBtn.setAttribute('aria-current', 'page');
            } else {
                pageBtn.addEventListener('click', () => this.goToPage(i));
            }

            pageNumbersContainer.appendChild(pageBtn);
        }

        // 如果有更多页码，显示省略号
        if (endPage < this.totalPages) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'px-2 text-gray-600 dark:text-gray-400';
            ellipsis.setAttribute('aria-hidden', 'true');
            ellipsis.textContent = '...';
            pageNumbersContainer.appendChild(ellipsis);

            // 显示最后一页
            const lastPageNumBtn = document.createElement('button');
            lastPageNumBtn.className = 'pagination-btn btn btn-sm btn-gray w-10 h-10';
            lastPageNumBtn.setAttribute('aria-label', `Page ${this.totalPages}`);
            lastPageNumBtn.textContent = this.totalPages.toString();
            lastPageNumBtn.addEventListener('click', () => this.goToPage(this.totalPages));
            pageNumbersContainer.appendChild(lastPageNumBtn);
        }

        paginationButtons.appendChild(pageNumbersContainer);

        // 下一页按钮
        const nextPageBtn = document.createElement('button');
        nextPageBtn.className = `pagination-btn btn btn-icon btn-sm ${this.currentPage === this.totalPages ? 'btn-gray disabled' : 'btn-gray'}`;
        nextPageBtn.setAttribute('aria-label', 'Next page');
        nextPageBtn.innerHTML = '<i class="fas fa-angle-right" aria-hidden="true"></i>';
        if (this.currentPage === this.totalPages) {
            nextPageBtn.setAttribute('aria-disabled', 'true');
            nextPageBtn.classList.add('pagination-btn-disabled');
        } else {
            nextPageBtn.addEventListener('click', () => this.goToPage(this.currentPage + 1));
        }
        paginationButtons.appendChild(nextPageBtn);

        // 移除末页按钮

        pagination.appendChild(paginationButtons);

        // 分页信息
        if (this.showInfo) {
            const paginationInfo = document.createElement('div');
            paginationInfo.className = 'text-sm text-gray-600 dark:text-gray-400';
            paginationInfo.setAttribute('aria-live', 'polite');
            paginationInfo.id = 'pagination-info';

            // 替换信息文本中的占位符
            const infoText = this.infoText
                .replace('{start}', startItem)
                .replace('{end}', endItem)
                .replace('{total}', this.totalItems);

            paginationInfo.innerHTML = infoText;
            pagination.appendChild(paginationInfo);
        }

        container.appendChild(pagination);
    }

    /**
     * 跳转到指定页码
     * @param {number} page - 页码
     */
    goToPage(page) {
        if (page === this.currentPage || this.isLoading) return;

        // 调用页码变更回调函数
        this.onPageChange(page);
    }

    /**
     * 设置加载状态
     * @param {boolean} isLoading - 是否正在加载
     */
    setLoading(isLoading) {
        this.isLoading = isLoading;

        // 禁用或启用分页按钮
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const buttons = container.querySelectorAll('.pagination-btn');
        buttons.forEach(button => {
            if (isLoading) {
                button.setAttribute('disabled', 'disabled');
                button.classList.add('disabled');
            } else {
                button.removeAttribute('disabled');
                button.classList.remove('disabled');
            }
        });
    }
}

// 导出模块
window.PaginationComponent = PaginationComponent;
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
/**
 * 导航组件
 * 负责加载和渲染网站的导航栏
 */

// 导航组件
const NavigationComponent = {
    /**
     * 加载导航组件
     * @param {string} containerId - 容器ID
     */
    load: function(containerId = 'navigation-container') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Navigation container ${containerId} not found`);
            return;
        }

        // 渲染导航栏
        this.render(container);

        // 初始化事件监听器
        this.initEventListeners();

        console.log('Navigation component loaded');
    },

    /**
     * 渲染导航栏
     * @param {HTMLElement} container - 容器元素
     */
    render: function(container) {
        // 获取当前页面路径
        const currentPath = window.location.pathname;
        
        // 导航链接
        const navLinks = [
            { text: 'Home', url: 'index.html', icon: 'fa-home' },
            { text: 'Authors', url: 'author.html', icon: 'fa-users' },
            { text: 'Categories', url: 'category.html', icon: 'fa-tags' },
            { text: 'Sources', url: 'source.html', icon: 'fa-book' }
        ];

        // 渲染导航栏
        container.innerHTML = `
            <nav class="bg-white dark:bg-gray-800 shadow-md">
                <div class="container mx-auto px-4">
                    <div class="flex justify-between items-center py-4">
                        <!-- Logo -->
                        <a href="index.html" class="flex items-center space-x-2">
                            <span class="text-2xl text-yellow-500 dark:text-yellow-400"><i class="fas fa-quote-right"></i></span>
                            <span class="font-bold text-xl">QuotesDB</span>
                        </a>

                        <!-- Desktop Navigation -->
                        <div class="hidden md:flex space-x-8">
                            ${navLinks.map(link => `
                                <a href="${link.url}" class="${currentPath.includes(link.url) ? 'text-yellow-600 dark:text-yellow-400 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400'} transition-colors duration-300">
                                    <i class="fas ${link.icon} mr-1"></i> ${link.text}
                                </a>
                            `).join('')}
                        </div>

                        <!-- Mobile Menu Button -->
                        <div class="md:hidden">
                            <button id="mobile-menu-button" class="text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 focus:outline-none">
                                <i class="fas fa-bars text-xl"></i>
                            </button>
                        </div>

                        <!-- Theme Toggle and Search -->
                        <div class="hidden md:flex items-center space-x-4">
                            <!-- Search Button -->
                            <button id="search-button" class="text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors duration-300">
                                <i class="fas fa-search text-lg"></i>
                            </button>
                            
                            <!-- Theme Toggle -->
                            <button id="theme-toggle" class="text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors duration-300">
                                <i class="fas fa-sun text-lg dark:hidden"></i>
                                <i class="fas fa-moon text-lg hidden dark:inline"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Mobile Menu (Hidden by Default) -->
            <div id="mobile-menu" class="md:hidden hidden bg-white dark:bg-gray-800 shadow-md">
                <div class="container mx-auto px-4 py-3">
                    <div class="flex flex-col space-y-3">
                        ${navLinks.map(link => `
                            <a href="${link.url}" class="${currentPath.includes(link.url) ? 'text-yellow-600 dark:text-yellow-400 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400'} transition-colors duration-300 py-2">
                                <i class="fas ${link.icon} mr-2"></i> ${link.text}
                            </a>
                        `).join('')}
                        <div class="flex items-center justify-between py-2">
                            <button id="mobile-search-button" class="text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors duration-300">
                                <i class="fas fa-search mr-2"></i> Search
                            </button>
                            <button id="mobile-theme-toggle" class="text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors duration-300">
                                <i class="fas fa-sun dark:hidden mr-2"></i>
                                <i class="fas fa-moon hidden dark:inline mr-2"></i>
                                <span class="dark:hidden">Light Mode</span>
                                <span class="hidden dark:inline">Dark Mode</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Search Overlay (Hidden by Default) -->
            <div id="search-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center">
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold">Search Quotes</h3>
                        <button id="close-search" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <div class="relative">
                        <input type="text" id="search-input" class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400" placeholder="Search for quotes, authors, categories...">
                        <button id="submit-search" class="absolute right-3 top-3 text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400">
                            <i class="fas fa-search text-lg"></i>
                        </button>
                    </div>
                    <div class="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        <p>Examples: "inspiration", "Albert Einstein", "love"</p>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * 初始化事件监听器
     */
    initEventListeners: function() {
        // 移动端菜单按钮
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', function() {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // 搜索按钮
        const searchButton = document.getElementById('search-button');
        const mobileSearchButton = document.getElementById('mobile-search-button');
        const searchOverlay = document.getElementById('search-overlay');
        const closeSearch = document.getElementById('close-search');
        const searchInput = document.getElementById('search-input');
        const submitSearch = document.getElementById('submit-search');
        
        if (searchButton && searchOverlay) {
            searchButton.addEventListener('click', function() {
                searchOverlay.classList.remove('hidden');
                searchInput.focus();
            });
        }
        
        if (mobileSearchButton && searchOverlay) {
            mobileSearchButton.addEventListener('click', function() {
                searchOverlay.classList.remove('hidden');
                mobileMenu.classList.add('hidden');
                searchInput.focus();
            });
        }
        
        if (closeSearch && searchOverlay) {
            closeSearch.addEventListener('click', function() {
                searchOverlay.classList.add('hidden');
            });
            
            // 点击遮罩层关闭搜索
            searchOverlay.addEventListener('click', function(e) {
                if (e.target === searchOverlay) {
                    searchOverlay.classList.add('hidden');
                }
            });
            
            // ESC键关闭搜索
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && !searchOverlay.classList.contains('hidden')) {
                    searchOverlay.classList.add('hidden');
                }
            });
        }
        
        if (submitSearch && searchInput) {
            // 提交搜索
            const handleSearch = function() {
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
                }
            };
            
            submitSearch.addEventListener('click', handleSearch);
            
            searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    handleSearch();
                }
            });
        }

        // 主题切换按钮
        const themeToggle = document.getElementById('theme-toggle');
        const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
        
        if (themeToggle && window.ThemeManager) {
            themeToggle.addEventListener('click', function() {
                window.ThemeManager.toggleTheme();
            });
        }
        
        if (mobileThemeToggle && window.ThemeManager) {
            mobileThemeToggle.addEventListener('click', function() {
                window.ThemeManager.toggleTheme();
            });
        }
    }
};

// 导出为全局对象
window.NavigationComponent = NavigationComponent;

// 自动加载导航组件
document.addEventListener('DOMContentLoaded', function() {
    NavigationComponent.load();
});
/**
 * 页脚组件
 * 负责加载和渲染网站的页脚
 */

// 页脚组件
const FooterComponent = {
    /**
     * 加载页脚组件
     * @param {string} containerId - 容器ID
     */
    load: function(containerId = 'footer-container') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Footer container ${containerId} not found`);
            return;
        }

        // 渲染页脚
        this.render(container);

        console.log('Footer component loaded');
    },

    /**
     * 渲染页脚
     * @param {HTMLElement} container - 容器元素
     */
    render: function(container) {
        // 获取当前年份
        const currentYear = new Date().getFullYear();
        
        // 页脚链接
        const footerLinks = [
            { text: 'Home', url: 'index.html' },
            { text: 'Authors', url: 'author.html' },
            { text: 'Categories', url: 'category.html' },
            { text: 'Sources', url: 'source.html' },
            { text: 'About', url: 'about.html' },
            { text: 'Contact', url: 'contact.html' },
            { text: 'Privacy Policy', url: 'privacy.html' },
            { text: 'Terms of Service', url: 'terms.html' }
        ];

        // 社交媒体链接
        const socialLinks = [
            { icon: 'fa-facebook', url: 'https://facebook.com', label: 'Facebook' },
            { icon: 'fa-twitter', url: 'https://twitter.com', label: 'Twitter' },
            { icon: 'fa-instagram', url: 'https://instagram.com', label: 'Instagram' },
            { icon: 'fa-pinterest', url: 'https://pinterest.com', label: 'Pinterest' }
        ];

        // 渲染页脚
        container.innerHTML = `
            <footer class="bg-gray-100 dark:bg-gray-800 pt-12 pb-8 mt-12 border-t border-gray-200 dark:border-gray-700">
                <div class="container mx-auto px-4">
                    <!-- Footer Top -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                        <!-- About -->
                        <div>
                            <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">About QuotesDB</h3>
                            <p class="text-gray-600 dark:text-gray-400 mb-4">
                                Explore our collection of inspiring quotes from great minds throughout history. Find wisdom, motivation, and insight from diverse sources.
                            </p>
                            <div class="flex space-x-4">
                                ${socialLinks.map(link => `
                                    <a href="${link.url}" class="text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors duration-300" aria-label="${link.label}">
                                        <i class="fab ${link.icon} text-lg"></i>
                                    </a>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Quick Links -->
                        <div>
                            <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Quick Links</h3>
                            <ul class="space-y-2">
                                ${footerLinks.slice(0, 4).map(link => `
                                    <li>
                                        <a href="${link.url}" class="text-gray-600 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors duration-300">
                                            ${link.text}
                                        </a>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>

                        <!-- Legal -->
                        <div>
                            <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Legal</h3>
                            <ul class="space-y-2">
                                ${footerLinks.slice(4).map(link => `
                                    <li>
                                        <a href="${link.url}" class="text-gray-600 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors duration-300">
                                            ${link.text}
                                        </a>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>

                        <!-- Newsletter -->
                        <div>
                            <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Subscribe</h3>
                            <p class="text-gray-600 dark:text-gray-400 mb-4">
                                Get daily quotes delivered to your inbox.
                            </p>
                            <form class="flex">
                                <input type="email" placeholder="Your email" class="flex-grow px-4 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400">
                                <button type="submit" class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-r-md transition-colors duration-300">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </form>
                        </div>
                    </div>

                    <!-- Footer Bottom -->
                    <div class="pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-600 dark:text-gray-400 text-sm">
                        <p>&copy; ${currentYear} QuotesDB. All rights reserved.</p>
                        <p class="mt-2">
                            Designed with <i class="fas fa-heart text-red-500"></i> by QuotesDB Team
                        </p>
                    </div>
                </div>
            </footer>
        `;
    }
};

// 导出为全局对象
window.FooterComponent = FooterComponent;

// 自动加载页脚组件
document.addEventListener('DOMContentLoaded', function() {
    FooterComponent.load();
});
/**
 * 热门主题组件
 * 负责显示热门类别、作者和来源
 */

/**
 * 初始化热门主题组件
 * @param {HTMLElement} element - 组件容器元素
 * @param {Object} params - 组件参数
 */
function initPopularTopicsComponent(element, params = {}) {
    console.log('Initializing popular-topics component...');

    // 获取容器元素
    const categoriesContainer = element.querySelector('#categories-container');
    const authorsContainer = element.querySelector('#authors-container');
    const sourcesContainer = element.querySelector('#sources-container');

    // 检查容器元素是否存在
    if (!categoriesContainer) {
        console.error('Categories container not found in popular-topics component');
    }
    if (!authorsContainer) {
        console.error('Authors container not found in popular-topics component');
    }
    if (!sourcesContainer) {
        console.error('Sources container not found in popular-topics component');
    }

    // 如果容器元素存在，则尝试加载数据
    if (categoriesContainer || authorsContainer || sourcesContainer) {
        console.log('Containers found, trying to load data from component...');

        // 如果当前页面是类别页面，则尝试调用加载函数
        if (window.location.pathname.includes('category.html') && window.loadCategories && window.loadAuthors && window.loadSources) {
            console.log('Category page detected, calling load functions directly...');
            setTimeout(() => {
                try {
                    // 强制使用真实API数据
                    if (window.ApiClient) {
                        window.ApiClient.useMockData = false;
                    }

                    // 调用加载函数
                    window.loadCategories().catch(err => console.error('Error loading categories from component:', err));
                    window.loadAuthors().catch(err => console.error('Error loading authors from component:', err));
                    window.loadSources().catch(err => console.error('Error loading sources from component:', err));
                } catch (error) {
                    console.error('Error calling load functions from component:', error);
                }
            }, 500);
        }
    }

    console.log('Popular topics component initialized');
}

// 将初始化函数暴露给全局作用域
window.initPopularTopicsComponent = initPopularTopicsComponent;
