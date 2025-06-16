/**
 * 全局修复脚本
 * 用于修复页面加载问题
 */

// 确保全局对象存在
window.onload = function() {
    console.log('Global fix script loaded');
    
    // 检查并修复URL处理器
    if (!window.UrlHandler) {
        console.log('UrlHandler not found in window, fixing...');
        window.UrlHandler = UrlHandler;
    }
    
    // 检查并修复API客户端
    if (!window.ApiClient) {
        console.log('ApiClient not found in window, fixing...');
        window.ApiClient = ApiClient;
    }
    
    // 检查并修复组件加载器
    if (!window.ComponentLoader) {
        console.log('ComponentLoader not found in window, fixing...');
        window.ComponentLoader = ComponentLoader;
    }
    
    // 检查并修复模拟数据
    if (!window.MockData) {
        console.log('MockData not found in window, fixing...');
        window.MockData = MockData;
    }
    
    console.log('Global fix complete');
};
