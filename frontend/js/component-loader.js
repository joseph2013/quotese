/**
 * 组件加载器
 * 负责加载HTML组件并处理组件初始化
 */

// 组件加载器对象
const ComponentLoader = {
    // 已加载的组件缓存
    componentCache: {},

    // 加载组件
    async loadComponent(containerId, componentName, params = {}, forceReload = false) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with ID "${containerId}" not found.`);
            return false;
        }

        // 如果强制重新加载，则清除缓存
        if (forceReload && this.componentCache[componentName]) {
            console.log(`Force reloading component: ${componentName}`);
            delete this.componentCache[componentName];
        }

        try {
            // 尝试从服务器加载组件
            let html;
            try {
                const response = await fetch(`components/${componentName}.html`);
                if (response.ok) {
                    html = await response.text();
                    this.componentCache[componentName] = html;
                } else {
                    throw new Error(`Failed to load component: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.warn(`Could not load component ${componentName} from server:`, error);

                // 如果服务器加载失败，使用备用组件
                html = this.getFallbackComponent(componentName);
                this.componentCache[componentName] = html;
            }

            // 替换模板变量
            Object.entries(params).forEach(([key, value]) => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                html = html.replace(regex, value || '');
            });

            // 插入HTML
            container.innerHTML = html;

            // 初始化组件
            this.initComponent(componentName, container, params);

            return true;
        } catch (error) {
            console.error(`Error loading component ${componentName}:`, error);
            container.innerHTML = `<div class="p-4 bg-red-100 text-red-800 rounded-md">Failed to load component: ${componentName}</div>`;
            return false;
        }
    },

    // 初始化组件
    initComponent(componentName, element, params) {
        // 检查是否有对应的初始化函数
        const initFunctionName = `init${this.capitalize(componentName)}Component`;

        // 如果全局范围内存在初始化函数，则调用它
        if (typeof window[initFunctionName] === 'function') {
            window[initFunctionName](element, params);
        } else {
            // 尝试加载组件的JavaScript文件
            this.loadComponentScript(componentName);
        }
    },

    // 加载组件的JavaScript文件
    loadComponentScript(componentName) {
        const scriptPath = `js/components/${componentName}.js`;

        // 检查脚本是否已加载
        if (document.querySelector(`script[src="${scriptPath}"]`)) {
            return;
        }

        // 创建脚本元素
        const script = document.createElement('script');
        script.src = scriptPath;
        script.onerror = () => console.warn(`Could not load component script: ${scriptPath}`);

        // 添加到文档
        document.body.appendChild(script);
    },

    // 将字符串首字母大写
    capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    // 获取备用组件内容
    getFallbackComponent(componentName) {
        // 为常用组件提供备用内容
        switch(componentName) {
            case 'navigation':
                return `
                <nav class="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
                    <div class="container mx-auto px-4 py-3">
                        <div class="flex justify-between items-center">
                            <!-- Logo -->
                            <div class="flex items-center space-x-2">
                                <i class="fas fa-quote-left text-yellow-500 text-2xl"></i>
                                <h1 class="text-xl font-bold">QuotesCollection</h1>
                            </div>

                            <!-- Navigation -->
                            <div class="hidden md:flex space-x-6">
                                <a href="index.html" class="nav-link font-medium text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300" data-page="home">Home</a>
                                <a href="authors.html" class="nav-link font-medium text-gray-600 hover:text-yellow-500 dark:text-gray-300 dark:hover:text-yellow-400" data-page="authors">Authors</a>
                                <a href="categories.html" class="nav-link font-medium text-gray-600 hover:text-yellow-500 dark:text-gray-300 dark:hover:text-yellow-400" data-page="categories">Categories</a>
                                <a href="sources.html" class="nav-link font-medium text-gray-600 hover:text-yellow-500 dark:text-gray-300 dark:hover:text-yellow-400" data-page="sources">Sources</a>
                            </div>

                            <!-- Search and Theme Toggle -->
                            <div class="flex items-center space-x-4">
                                <div class="relative hidden md:block">
                                    <input type="text" placeholder="Search quotes..." class="pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800 dark:text-gray-100">
                                    <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                                </div>
                                <button id="theme-toggle" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <i class="fas fa-moon text-gray-600 dark:hidden"></i>
                                    <i class="fas fa-sun text-yellow-300 hidden dark:block"></i>
                                </button>
                                <button class="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" id="mobile-menu-button">
                                    <i class="fas fa-bars text-gray-600 dark:text-gray-300"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Mobile Menu (Hidden by default) -->
                        <div id="mobile-menu" class="hidden md:hidden mt-4 pb-2">
                            <div class="relative mb-4">
                                <input type="text" placeholder="Search quotes..." class="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800 dark:text-gray-100">
                                <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                            </div>
                            <div class="flex flex-col space-y-3">
                                <a href="index.html" class="mobile-nav-link font-medium text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300" data-page="home">Home</a>
                                <a href="authors.html" class="mobile-nav-link font-medium text-gray-600 hover:text-yellow-500 dark:text-gray-300 dark:hover:text-yellow-400" data-page="authors">Authors</a>
                                <a href="categories.html" class="mobile-nav-link font-medium text-gray-600 hover:text-yellow-500 dark:text-gray-300 dark:hover:text-yellow-400" data-page="categories">Categories</a>
                                <a href="sources.html" class="mobile-nav-link font-medium text-gray-600 hover:text-yellow-500 dark:text-gray-300 dark:hover:text-yellow-400" data-page="sources">Sources</a>
                            </div>
                        </div>
                    </div>
                </nav>
                `;

            case 'footer':
                return `
                <footer class="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12">
                    <div class="container mx-auto px-4 py-8">
                        <div class="flex flex-col md:flex-row justify-between items-center">
                            <div class="mb-4 md:mb-0">
                                <div class="flex items-center space-x-2">
                                    <i class="fas fa-quote-left text-yellow-500 text-xl"></i>
                                    <span class="text-lg font-bold">QuotesCollection</span>
                                </div>
                                <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Wisdom from the ages, at your fingertips.</p>
                            </div>
                            <div class="flex flex-wrap justify-center gap-8">
                                <div>
                                    <h3 class="font-semibold mb-3 text-gray-800 dark:text-gray-200">Explore</h3>
                                    <ul class="space-y-2 text-sm">
                                        <li><a href="index.html" class="text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400">Home</a></li>
                                        <li><a href="authors.html" class="text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400">Authors</a></li>
                                        <li><a href="categories.html" class="text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400">Categories</a></li>
                                        <li><a href="sources.html" class="text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400">Sources</a></li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 class="font-semibold mb-3 text-gray-800 dark:text-gray-200">About</h3>
                                    <ul class="space-y-2 text-sm">
                                        <li><a href="#" class="text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400">About Us</a></li>
                                        <li><a href="#" class="text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400">Privacy Policy</a></li>
                                        <li><a href="#" class="text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400">Terms of Service</a></li>
                                        <li><a href="#" class="text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400">Contact</a></li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 class="font-semibold mb-3 text-gray-800 dark:text-gray-200">Connect</h3>
                                    <div class="flex space-x-4">
                                        <a href="#" class="text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400">
                                            <i class="fab fa-twitter text-lg"></i>
                                        </a>
                                        <a href="#" class="text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400">
                                            <i class="fab fa-facebook text-lg"></i>
                                        </a>
                                        <a href="#" class="text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400">
                                            <i class="fab fa-instagram text-lg"></i>
                                        </a>
                                        <a href="#" class="text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400">
                                            <i class="fab fa-github text-lg"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="border-t border-gray-200 dark:border-gray-800 mt-6 pt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                            <p>&copy; 2023 QuotesCollection. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
                `;

            case 'quotes-list':
                return `
                <div class="quotes-list-component">
                    <h2 class="text-2xl font-bold mb-6 flex items-center">
                        <i class="fas fa-quote-right text-yellow-500 mr-2" aria-hidden="true"></i>
                        Famous Quotes
                    </h2>

                    <div class="space-y-6" id="quotes-list" role="feed" aria-busy="true" aria-label="Quotes list">
                        <div class="quote-card-component p-6">
                            <p class="text-lg font-serif leading-relaxed mb-4">"The greatest glory in living lies not in never falling, but in rising every time we fall."</p>
                            <div class="flex items-center mt-4">
                                <div class="flex-shrink-0 mr-4">
                                    <div class="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-600 dark:text-yellow-300 border-2 border-yellow-400 dark:border-yellow-600">
                                        <span class="text-sm font-bold">N</span>
                                    </div>
                                </div>
                                <div>
                                    <a href="#" class="font-semibold text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors duration-300">Nelson Mandela</a>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Autobiography</p>
                                </div>
                            </div>
                            <div class="mt-4 flex flex-wrap gap-2">
                                <a href="#" class="tag px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-300">inspiration</a>
                                <a href="#" class="tag px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-300">life</a>
                            </div>
                        </div>
                        <div class="quote-card-component p-6">
                            <p class="text-lg font-serif leading-relaxed mb-4">"Two things are infinite: the universe and human stupidity; and I'm not sure about the universe."</p>
                            <div class="flex items-center mt-4">
                                <div class="flex-shrink-0 mr-4">
                                    <div class="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-600 dark:text-yellow-300 border-2 border-yellow-400 dark:border-yellow-600">
                                        <span class="text-sm font-bold">A</span>
                                    </div>
                                </div>
                                <div>
                                    <a href="#" class="font-semibold text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors duration-300">Albert Einstein</a>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Letters</p>
                                </div>
                            </div>
                            <div class="mt-4 flex flex-wrap gap-2">
                                <a href="#" class="tag px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-300">humor</a>
                                <a href="#" class="tag px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-300">science</a>
                            </div>
                        </div>
                    </div>
                </div>
                `;

            case 'pagination':
                return `
                <nav class="flex flex-col items-center mt-10 space-y-4" aria-label="Quotes pagination">
                    <div class="flex items-center space-x-1" role="navigation" aria-label="Pagination Navigation">
                        <button class="pagination-btn pagination-btn-disabled btn btn-icon btn-sm btn-gray disabled" aria-label="First page" aria-disabled="true">
                            <i class="fas fa-angle-double-left" aria-hidden="true"></i>
                        </button>
                        <button class="pagination-btn pagination-btn-disabled btn btn-icon btn-sm btn-gray disabled" aria-label="Previous page" aria-disabled="true">
                            <i class="fas fa-angle-left" aria-hidden="true"></i>
                        </button>
                        <button class="pagination-btn btn btn-sm btn-primary w-10 h-10" aria-label="Page 1" aria-current="page">1</button>
                        <button class="pagination-btn btn btn-sm btn-gray w-10 h-10" aria-label="Page 2">2</button>
                        <button class="pagination-btn btn btn-sm btn-gray w-10 h-10" aria-label="Page 3">3</button>
                        <span class="px-2 text-gray-600 dark:text-gray-400" aria-hidden="true">...</span>
                        <button class="pagination-btn btn btn-sm btn-gray w-10 h-10" aria-label="Page 10">10</button>
                        <button class="pagination-btn btn btn-icon btn-sm btn-gray" aria-label="Next page">
                            <i class="fas fa-angle-right" aria-hidden="true"></i>
                        </button>
                        <button class="pagination-btn btn btn-icon btn-sm btn-gray" aria-label="Last page">
                            <i class="fas fa-angle-double-right" aria-hidden="true"></i>
                        </button>
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400" aria-live="polite">
                        Showing <span class="font-medium">1-20</span> of <span class="font-medium">100</span> quotes
                    </div>
                </nav>
                `;

            case 'popular-topics':
                return `
                <!-- Popular Categories -->
                <section class="card-container mb-8 p-6" aria-labelledby="popular-categories-heading">
                    <h3 id="popular-categories-heading" class="text-xl font-bold mb-4 flex items-center">
                        <i class="fas fa-tags text-yellow-500 mr-2" aria-hidden="true"></i>
                        Popular Categories
                    </h3>
                    <div class="flex flex-wrap gap-2" role="list" aria-label="Popular categories list">
                        <a href="#" class="tag px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-300">love (42)</a>
                        <a href="#" class="tag px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-300">inspiration (36)</a>
                        <a href="#" class="tag px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-300">philosophy (28)</a>
                        <a href="#" class="tag px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-300">life (25)</a>
                        <a href="#" class="tag px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-300">truth (19)</a>
                    </div>
                </section>

                <!-- Popular Authors -->
                <section class="card-container mb-8 p-6" aria-labelledby="popular-authors-heading">
                    <h3 id="popular-authors-heading" class="text-xl font-bold mb-4 flex items-center">
                        <i class="fas fa-user-pen text-yellow-500 mr-2" aria-hidden="true"></i>
                        Popular Authors
                    </h3>
                    <ul class="space-y-3" role="list" aria-label="Popular authors list">
                        <li class="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300">
                            <div class="flex items-center space-x-2 w-full">
                                <div class="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-600 dark:text-yellow-300 flex-shrink-0 border-2 border-yellow-400 dark:border-yellow-600">
                                    <span class="text-xs font-bold">W</span>
                                </div>
                                <div class="flex-grow ml-2">
                                    <a href="#" class="hover:text-yellow-600 dark:hover:text-yellow-400 font-medium transition-colors duration-300">William Shakespeare</a>
                                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                                        <div class="bg-yellow-500 dark:bg-yellow-400 h-1.5 rounded-full" style="width: 100%"></div>
                                    </div>
                                </div>
                                <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">15</span>
                            </div>
                        </li>
                        <li class="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300">
                            <div class="flex items-center space-x-2 w-full">
                                <div class="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-600 dark:text-yellow-300 flex-shrink-0 border-2 border-yellow-400 dark:border-yellow-600">
                                    <span class="text-xs font-bold">H</span>
                                </div>
                                <div class="flex-grow ml-2">
                                    <a href="#" class="hover:text-yellow-600 dark:hover:text-yellow-400 font-medium transition-colors duration-300">Haruki Murakami</a>
                                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                                        <div class="bg-yellow-500 dark:bg-yellow-400 h-1.5 rounded-full" style="width: 80%"></div>
                                    </div>
                                </div>
                                <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">12</span>
                            </div>
                        </li>
                    </ul>
                </section>

                <!-- Popular Sources -->
                <section class="card-container p-6" aria-labelledby="popular-sources-heading">
                    <h3 id="popular-sources-heading" class="text-xl font-bold mb-4 flex items-center">
                        <i class="fas fa-book text-yellow-500 mr-2" aria-hidden="true"></i>
                        Popular Sources
                    </h3>
                    <ul class="space-y-3" role="list" aria-label="Popular sources list">
                        <li class="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300">
                            <div class="flex items-center space-x-2 w-full">
                                <div class="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-600 dark:text-yellow-300 flex-shrink-0">
                                    <i class="fas fa-book text-xs"></i>
                                </div>
                                <div class="flex-grow">
                                    <a href="#" class="hover:text-yellow-600 dark:hover:text-yellow-400 font-medium transition-colors duration-300">Holy Bible</a>
                                </div>
                                <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">8</span>
                            </div>
                        </li>
                        <li class="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300">
                            <div class="flex items-center space-x-2 w-full">
                                <div class="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-600 dark:text-yellow-300 flex-shrink-0">
                                    <i class="fas fa-book text-xs"></i>
                                </div>
                                <div class="flex-grow">
                                    <a href="#" class="hover:text-yellow-600 dark:hover:text-yellow-400 font-medium transition-colors duration-300">Cosmos</a>
                                </div>
                                <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">7</span>
                            </div>
                        </li>
                    </ul>
                </section>
                `;

            default:
                return `<div class="p-4 bg-yellow-100 text-yellow-800 rounded-md">Component '${componentName}' could not be loaded.</div>`;
        }
    },

    // 加载所有页面通用组件
    async loadCommonComponents() {
        await this.loadComponent('navigation-container', 'navigation');
        await this.loadComponent('footer-container', 'footer');
    }
};

// 页面加载时初始化通用组件
document.addEventListener('DOMContentLoaded', () => {
    ComponentLoader.loadCommonComponents();
});
