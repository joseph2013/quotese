/**
 * Google Analytics 跟踪代码
 * 用于收集网站访问数据
 */

// Google Analytics 4 (GA4) 跟踪代码
(function() {
  // 创建 script 元素
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YE93LG6M7S';
  
  // 将 script 元素添加到文档头部
  document.head.appendChild(script);
  
  // 初始化 Google Analytics
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', 'G-YE93LG6M7S');
  
  // 页面加载完成后记录页面浏览
  window.addEventListener('load', function() {
    // 记录当前页面 URL
    var currentPath = window.location.pathname;
    var currentTitle = document.title;
    
    // 发送页面浏览事件
    gtag('event', 'page_view', {
      page_path: currentPath,
      page_title: currentTitle,
      page_location: window.location.href
    });
    
    console.log('Google Analytics: 页面浏览事件已发送', {
      page_path: currentPath,
      page_title: currentTitle
    });
  });
  
  // 监听链接点击
  document.addEventListener('click', function(event) {
    var target = event.target;
    
    // 检查是否点击了链接
    while (target && target.tagName !== 'A') {
      target = target.parentNode;
      if (!target) return;
    }
    
    // 获取链接信息
    var href = target.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
    
    // 发送链接点击事件
    gtag('event', 'link_click', {
      link_url: href,
      link_text: target.textContent.trim() || '未知链接'
    });
  });
})();
