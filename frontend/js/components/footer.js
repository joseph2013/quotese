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
