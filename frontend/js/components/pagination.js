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
