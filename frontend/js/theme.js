/**
 * 主题切换模块
 * 负责处理网站的深色/浅色模式切换
 */

const ThemeModule = {
    // 初始化主题
    init() {
        const themeToggleBtn = document.getElementById('theme-toggle');
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

        // 全站默认使用light主题
        const currentTheme = 'light';

        // 设置初始主题
        this.setTheme(currentTheme);

        // 当按钮被点击时切换主题
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
                this.setTheme(newTheme);
            });
        }

        // 禁用系统主题变化监听和存储变化监听
        // 确保主题始终为light
    },

    // 设置主题
    setTheme(theme) {
        // 忽略传入的主题，始终使用light主题
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');

        // 保存主题偏好
        localStorage.setItem('theme', 'light');

        // 更新导航链接样式
        this.updateActiveNavLink();

        // 触发主题变化事件
        this.dispatchThemeChangeEvent(theme);
    },

    // 更新活动导航链接
    updateActiveNavLink() {
        // 获取当前页面路径
        const currentPath = window.location.pathname;
        const pageName = currentPath.split('/').pop();

        // 设置活动链接样式
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('data-page');
            const linkHref = link.getAttribute('href');

            // 检查是否是当前页面
            const isActive = (linkHref && linkHref.includes(pageName)) ||
                            (linkPage === 'home' && (pageName === 'index.html' || pageName === ''));

            // 更新样式
            if (isActive) {
                link.classList.add('text-yellow-500', 'dark:text-yellow-400');
                link.classList.remove('text-gray-600', 'dark:text-gray-300');
            } else {
                link.classList.remove('text-yellow-500', 'dark:text-yellow-400');
                link.classList.add('text-gray-600', 'dark:text-gray-300');
            }
        });

        // 同样更新移动导航链接
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        mobileNavLinks.forEach(link => {
            const linkPage = link.getAttribute('data-page');
            const linkHref = link.getAttribute('href');

            const isActive = (linkHref && linkHref.includes(pageName)) ||
                            (linkPage === 'home' && (pageName === 'index.html' || pageName === ''));

            if (isActive) {
                link.classList.add('text-yellow-500', 'dark:text-yellow-400');
                link.classList.remove('text-gray-600', 'dark:text-gray-300');
            } else {
                link.classList.remove('text-yellow-500', 'dark:text-yellow-400');
                link.classList.add('text-gray-600', 'dark:text-gray-300');
            }
        });
    },

    // 触发主题变化事件
    dispatchThemeChangeEvent(theme) {
        const event = new CustomEvent('themeChange', { detail: { theme } });
        document.dispatchEvent(event);
    },

    // 获取当前主题
    getCurrentTheme() {
        return document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    },

    // 检查是否是深色模式
    isDarkMode() {
        return this.getCurrentTheme() === 'dark';
    }
};

// 导出模块
window.ThemeModule = ThemeModule;

// 页面加载时初始化主题
document.addEventListener('DOMContentLoaded', () => {
    ThemeModule.init();
});
