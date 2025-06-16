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
