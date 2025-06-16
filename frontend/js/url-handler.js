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
