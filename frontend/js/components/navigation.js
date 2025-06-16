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
