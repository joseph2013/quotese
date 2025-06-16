/**
 * 名言列表组件
 * 负责显示名言列表
 */

/**
 * 初始化名言列表组件
 * @param {HTMLElement} element - 组件容器元素
 * @param {Object} params - 组件参数
 */
function initQuotesListComponent(element, params = {}) {
    console.log('Initializing quotes-list component...');

    // 获取标题元素
    const titleElement = element.querySelector('h2 span');
    if (titleElement && params.title) {
        titleElement.textContent = params.title;
    }

    console.log('Quotes list component initialized');
}

// 将初始化函数暴露给全局作用域
window.initQuotesListComponent = initQuotesListComponent;
