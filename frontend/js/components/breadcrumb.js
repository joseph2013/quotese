/**
 * 面包屑导航组件
 */
class BreadcrumbComponent {
  /**
   * 初始化面包屑导航
   * @param {string} containerId - 容器ID
   * @param {Array} items - 面包屑项目数组，每项包含name和url
   */
  static render(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 清空容器
    container.innerHTML = '';

    // 添加首页
    const homeItem = document.createElement('li');
    homeItem.innerHTML = `
      <a href="/" class="hover:text-yellow-600 dark:hover:text-yellow-400">Home</a>
    `;

    // 如果不只有首页，添加分隔符
    if (items.length > 0) {
      homeItem.innerHTML += `<span class="mx-2">/</span>`;
    }

    container.appendChild(homeItem);

    // 添加其他项目
    items.forEach((item, index) => {
      const listItem = document.createElement('li');

      // 最后一项不是链接
      if (index === items.length - 1) {
        listItem.innerHTML = `
          <span class="text-gray-700 dark:text-gray-300 font-medium">${item.name}</span>
        `;
      } else {
        listItem.innerHTML = `
          <a href="${item.url}" class="hover:text-yellow-600 dark:hover:text-yellow-400">${item.name}</a>
          <span class="mx-2">/</span>
        `;
      }

      container.appendChild(listItem);
    });

    // 添加结构化数据
    BreadcrumbComponent.addStructuredData([{name: 'Home', url: '/'}].concat(items));
  }

  /**
   * 添加结构化数据
   * @param {Array} items - 面包屑项目数组
   */
  static addStructuredData(items) {
    // 移除旧的结构化数据
    const oldScript = document.getElementById('breadcrumb-structured-data');
    if (oldScript) {
      oldScript.remove();
    }

    // 创建结构化数据
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": `https://quotese.com${item.url}`
      }))
    };

    // 添加到页面
    const script = document.createElement('script');
    script.id = 'breadcrumb-structured-data';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }

  /**
   * 根据当前页面类型和URL参数生成面包屑
   * @returns {Array} 面包屑项目数组
   */
  static generateBreadcrumbItems() {
    const path = window.location.pathname;
    const search = window.location.search;
    const urlParams = new URLSearchParams(search);
    const items = [];

    // 解析当前页面类型
    if (path.includes('author.html') || path.includes('/authors/')) {
      // 作者详情页
      const authorName = urlParams.get('name') || UrlHandler.getAuthorNameFromUrl();
      if (authorName) {
        // 移除作者列表页的超链接
        items.push({ name: 'Author', url: '#' });
        items.push({ name: authorName, url: UrlHandler.getAuthorUrl({ name: authorName }) });
      } else {
        // 作者列表页
        items.push({ name: 'Authors', url: '/authors' });
      }
    } else if (path.includes('category.html') || path.includes('/categories/')) {
      // 类别详情页
      const categoryName = urlParams.get('name') || UrlHandler.getCategoryNameFromUrl();
      if (categoryName) {
        // 移除类别列表页的超链接
        items.push({ name: 'Category', url: '#' });
        items.push({ name: categoryName, url: UrlHandler.getCategoryUrl({ name: categoryName }) });
      } else {
        // 类别列表页
        items.push({ name: 'Categories', url: '/categories' });
      }
    } else if (path.includes('source.html') || path.includes('/sources/')) {
      // 来源详情页
      const sourceName = urlParams.get('name') || UrlHandler.getSourceNameFromUrl();
      if (sourceName) {
        // 移除来源列表页的超链接
        items.push({ name: 'Source', url: '#' });
        items.push({ name: sourceName, url: UrlHandler.getSourceUrl({ name: sourceName }) });
      } else {
        // 来源列表页
        items.push({ name: 'Sources', url: '/sources' });
      }
    } else if (path.includes('quote.html') || path.includes('/quotes/')) {
      // 名言详情页
      const quoteId = urlParams.get('id') || UrlHandler.getQuoteIdFromUrl();
      if (quoteId) {
        items.push({ name: 'Quote', url: '/quotes' });
        // 这里可以添加名言的简短摘要，但需要从API获取
        items.push({ name: `Quote #${quoteId}`, url: UrlHandler.getQuoteUrl({ id: quoteId }) });
      }
    } else if (path.includes('authors.html') || path === '/authors') {
      // 作者列表页
      items.push({ name: 'Authors', url: '/authors' });
    } else if (path.includes('categories.html') || path === '/categories') {
      // 类别列表页
      items.push({ name: 'Categories', url: '/categories' });
    } else if (path.includes('sources.html') || path === '/sources') {
      // 来源列表页
      items.push({ name: 'Sources', url: '/sources' });
    } else if (path.includes('search.html') || path === '/search') {
      // 搜索页面
      const query = urlParams.get('q');
      items.push({ name: 'Search', url: '/search' });
      if (query) {
        items.push({ name: `Search results for "${query}"`, url: `/search?q=${encodeURIComponent(query)}` });
      }
    }

    return items;
  }

  /**
   * 初始化面包屑导航
   * @param {string} containerId - 容器ID
   */
  static init(containerId) {
    const items = BreadcrumbComponent.generateBreadcrumbItems();
    BreadcrumbComponent.render(containerId, items);
  }
}

// 导出组件
window.BreadcrumbComponent = BreadcrumbComponent;
