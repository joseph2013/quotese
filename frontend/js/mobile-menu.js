/**
 * 移动菜单模块
 * 负责处理移动设备上的菜单展开/收起
 */

const MobileMenuModule = {
    // 初始化移动菜单
    init() {
        const menuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');

        if (!menuButton || !mobileMenu) return;

        // 点击菜单按钮时切换菜单显示状态
        menuButton.addEventListener('click', () => {
            this.toggleMenu(mobileMenu);
        });

        // 点击菜单项后关闭菜单
        const menuItems = mobileMenu.querySelectorAll('a');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                this.closeMenu(mobileMenu);
            });
        });

        // 点击页面其他区域时关闭菜单
        document.addEventListener('click', (e) => {
            if (mobileMenu.classList.contains('hidden')) return;
            
            // 如果点击的不是菜单或菜单按钮，则关闭菜单
            if (!mobileMenu.contains(e.target) && !menuButton.contains(e.target)) {
                this.closeMenu(mobileMenu);
            }
        });

        // 窗口大小变化时处理菜单
        window.addEventListener('resize', () => {
            // 如果窗口宽度大于768px（md断点），关闭移动菜单
            if (window.innerWidth >= 768) {
                this.closeMenu(mobileMenu);
            }
        });
    },

    // 切换菜单显示状态
    toggleMenu(menu) {
        if (menu.classList.contains('hidden')) {
            this.openMenu(menu);
        } else {
            this.closeMenu(menu);
        }
    },

    // 打开菜单
    openMenu(menu) {
        menu.classList.remove('hidden');
        
        // 添加动画效果
        menu.style.opacity = '0';
        menu.style.transform = 'translateY(-10px)';
        menu.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        // 触发重排以应用初始样式
        menu.offsetHeight;
        
        // 应用最终样式
        menu.style.opacity = '1';
        menu.style.transform = 'translateY(0)';
        
        // 更新按钮图标
        const menuButton = document.getElementById('mobile-menu-button');
        if (menuButton) {
            const icon = menuButton.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            }
        }
        
        // 设置ARIA属性
        menu.setAttribute('aria-expanded', 'true');
    },

    // 关闭菜单
    closeMenu(menu) {
        // 添加动画效果
        menu.style.opacity = '0';
        menu.style.transform = 'translateY(-10px)';
        
        // 动画结束后隐藏菜单
        setTimeout(() => {
            menu.classList.add('hidden');
            
            // 重置样式以便下次打开
            menu.style.opacity = '';
            menu.style.transform = '';
        }, 300);
        
        // 更新按钮图标
        const menuButton = document.getElementById('mobile-menu-button');
        if (menuButton) {
            const icon = menuButton.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
        
        // 设置ARIA属性
        menu.setAttribute('aria-expanded', 'false');
    }
};

// 导出模块
window.MobileMenuModule = MobileMenuModule;

// 页面加载时初始化移动菜单
document.addEventListener('DOMContentLoaded', () => {
    MobileMenuModule.init();
});
