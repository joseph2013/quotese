/**
 * 调试工具
 * 用于捕获和显示JavaScript错误
 */

// 捕获全局错误
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global Error:', message);
    console.error('Source:', source);
    console.error('Line:', lineno);
    console.error('Column:', colno);
    console.error('Error Object:', error);
    
    // 在页面上显示错误信息
    const errorContainer = document.createElement('div');
    errorContainer.style.position = 'fixed';
    errorContainer.style.top = '10px';
    errorContainer.style.right = '10px';
    errorContainer.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
    errorContainer.style.color = 'white';
    errorContainer.style.padding = '10px';
    errorContainer.style.borderRadius = '5px';
    errorContainer.style.zIndex = '9999';
    errorContainer.style.maxWidth = '80%';
    errorContainer.style.maxHeight = '80%';
    errorContainer.style.overflow = 'auto';
    
    errorContainer.innerHTML = `
        <h3>JavaScript Error:</h3>
        <p>${message}</p>
        <p>Source: ${source}</p>
        <p>Line: ${lineno}, Column: ${colno}</p>
        <pre>${error ? error.stack : 'No stack trace available'}</pre>
        <button id="close-error" style="background: white; color: red; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Close</button>
    `;
    
    document.body.appendChild(errorContainer);
    
    document.getElementById('close-error').addEventListener('click', function() {
        document.body.removeChild(errorContainer);
    });
    
    return true; // 阻止默认错误处理
};

// 捕获未处理的Promise拒绝
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled Promise Rejection:', event.reason);
    
    // 在页面上显示错误信息
    const errorContainer = document.createElement('div');
    errorContainer.style.position = 'fixed';
    errorContainer.style.top = '10px';
    errorContainer.style.right = '10px';
    errorContainer.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
    errorContainer.style.color = 'white';
    errorContainer.style.padding = '10px';
    errorContainer.style.borderRadius = '5px';
    errorContainer.style.zIndex = '9999';
    errorContainer.style.maxWidth = '80%';
    errorContainer.style.maxHeight = '80%';
    errorContainer.style.overflow = 'auto';
    
    errorContainer.innerHTML = `
        <h3>Unhandled Promise Rejection:</h3>
        <p>${event.reason}</p>
        <pre>${event.reason.stack || 'No stack trace available'}</pre>
        <button id="close-error" style="background: white; color: red; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Close</button>
    `;
    
    document.body.appendChild(errorContainer);
    
    document.getElementById('close-error').addEventListener('click', function() {
        document.body.removeChild(errorContainer);
    });
});

// 记录所有API调用
const originalFetch = window.fetch;
window.fetch = function() {
    console.log('Fetch API Call:', arguments);
    return originalFetch.apply(this, arguments);
};

// 记录所有XMLHttpRequest调用
const originalXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function() {
    console.log('XMLHttpRequest Call:', arguments);
    return originalXHROpen.apply(this, arguments);
};

// 记录所有控制台日志
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

console.log = function() {
    const args = Array.from(arguments);
    originalConsoleLog.apply(console, ['[LOG]', ...args]);
    return originalConsoleLog.apply(this, arguments);
};

console.error = function() {
    const args = Array.from(arguments);
    originalConsoleError.apply(console, ['[ERROR]', ...args]);
    return originalConsoleError.apply(this, arguments);
};

console.warn = function() {
    const args = Array.from(arguments);
    originalConsoleWarn.apply(console, ['[WARN]', ...args]);
    return originalConsoleWarn.apply(this, arguments);
};

console.info = function() {
    const args = Array.from(arguments);
    originalConsoleInfo.apply(console, ['[INFO]', ...args]);
    return originalConsoleInfo.apply(this, arguments);
};

// 记录所有URL变化
window.addEventListener('popstate', function(event) {
    console.log('URL Changed:', window.location.href);
});

// 记录所有点击事件
document.addEventListener('click', function(event) {
    console.log('Click Event:', event.target);
});

// 记录所有表单提交
document.addEventListener('submit', function(event) {
    console.log('Form Submit:', event.target);
});

// 记录所有AJAX请求
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url) {
    console.log('AJAX Request:', method, url);
    return originalOpen.apply(this, arguments);
};

// 记录页面加载时间
window.addEventListener('load', function() {
    const loadTime = performance.now();
    console.log('Page Load Time:', loadTime, 'ms');
});

console.log('Debug script loaded');
