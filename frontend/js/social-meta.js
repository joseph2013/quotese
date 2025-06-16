/**
 * Social Media Metadata Utility
 * Provides functions to dynamically update Open Graph and Twitter Card metadata
 */

const SocialMetaUtil = {
    /**
     * Update Open Graph and Twitter Card meta tags
     * @param {Object} options - Configuration options
     * @param {string} options.title - Page title
     * @param {string} options.description - Page description
     * @param {string} options.url - Page URL
     * @param {string} options.image - Image URL
     * @param {string} options.type - Content type (website, article, etc.)
     * @param {string} options.twitterCard - Twitter card type (summary, summary_large_image)
     */
    updateMetaTags: function(options) {
        const defaults = {
            title: document.title,
            description: document.querySelector('meta[name="description"]')?.content || '',
            url: window.location.href,
            image: 'https://quotese.com/images/og-image-default.jpg',
            type: 'website',
            twitterCard: 'summary_large_image'
        };

        const settings = { ...defaults, ...options };

        // Update Open Graph meta tags
        this.updateMetaTag('property', 'og:title', settings.title);
        this.updateMetaTag('property', 'og:description', settings.description);
        this.updateMetaTag('property', 'og:url', settings.url);
        this.updateMetaTag('property', 'og:image', settings.image);
        this.updateMetaTag('property', 'og:type', settings.type);

        // Update Twitter Card meta tags
        this.updateMetaTag('name', 'twitter:card', settings.twitterCard);
        this.updateMetaTag('name', 'twitter:title', settings.title.replace(' - quotese.com', ''));
        this.updateMetaTag('name', 'twitter:description', settings.description);
        this.updateMetaTag('name', 'twitter:image', settings.image);

        // Update canonical link
        const canonicalLink = document.querySelector('link[rel="canonical"]');
        if (canonicalLink) {
            canonicalLink.href = settings.url;
        }
    },

    /**
     * Update a specific meta tag
     * @param {string} attributeName - Attribute name (property or name)
     * @param {string} attributeValue - Attribute value (og:title, twitter:card, etc.)
     * @param {string} content - Content value
     */
    updateMetaTag: function(attributeName, attributeValue, content) {
        let metaTag = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
        
        if (!metaTag) {
            // Create meta tag if it doesn't exist
            metaTag = document.createElement('meta');
            metaTag.setAttribute(attributeName, attributeValue);
            document.head.appendChild(metaTag);
        }
        
        metaTag.content = content;
    },

    /**
     * Generate a quote card image URL
     * @param {Object} quote - Quote object
     * @returns {string} - Image URL
     */
    generateQuoteImageUrl: function(quote) {
        // In a real implementation, this would generate a dynamic image URL
        // For now, we'll return a static image
        return 'https://quotese.com/images/og-image-quote.jpg';
    },

    /**
     * Update meta tags for a quote page
     * @param {Object} quote - Quote object
     */
    updateQuoteMetaTags: function(quote) {
        if (!quote) return;

        const shortQuote = quote.content.length > 100
            ? quote.content.substring(0, 100) + '...'
            : quote.content;

        const title = `"${shortQuote}" - ${quote.author.name} | quotese.com`;
        const description = `"${shortQuote}" - ${quote.author.name}. Explore this inspiring quote and more wisdom from ${quote.author.name}.`;
        const url = `https://quotese.com${UrlHandler.getQuoteUrl(quote)}`;
        const image = this.generateQuoteImageUrl(quote);

        this.updateMetaTags({
            title: title,
            description: description,
            url: url,
            image: image,
            type: 'article'
        });
    },

    /**
     * Update meta tags for an author page
     * @param {Object} author - Author object
     * @param {number} quoteCount - Number of quotes by this author
     */
    updateAuthorMetaTags: function(author, quoteCount) {
        if (!author) return;

        const title = `${author.name} Quotes | Wisdom Collection - quotese.com`;
        const description = `Discover ${quoteCount || 'many'} inspiring quotes by ${author.name}. Find wisdom, insights, and profound thoughts from one of history's most influential minds.`;
        const url = `https://quotese.com${UrlHandler.getAuthorUrl(author)}`;
        const image = 'https://quotese.com/images/og-image-author.jpg';

        this.updateMetaTags({
            title: title,
            description: description,
            url: url,
            image: image
        });
    },

    /**
     * Update meta tags for a category page
     * @param {Object} category - Category object
     * @param {number} quoteCount - Number of quotes in this category
     */
    updateCategoryMetaTags: function(category, quoteCount) {
        if (!category) return;

        const title = `${category.name} Quotes | Wisdom Sharing - quotese.com`;
        const description = `Explore ${quoteCount || 'our collection of'} quotes about ${category.name}. Find inspiration, wisdom, and insights on this topic from great minds throughout history.`;
        const url = `https://quotese.com${UrlHandler.getCategoryUrl(category)}`;
        const image = 'https://quotese.com/images/og-image-category.jpg';

        this.updateMetaTags({
            title: title,
            description: description,
            url: url,
            image: image
        });
    },

    /**
     * Update meta tags for a source page
     * @param {Object} source - Source object
     * @param {number} quoteCount - Number of quotes from this source
     */
    updateSourceMetaTags: function(source, quoteCount) {
        if (!source) return;

        const title = `${source.name} Quotes | Wisdom Sharing - quotese.com`;
        const description = `Discover ${quoteCount || 'a collection of'} quotes from ${source.name}. Explore wisdom and inspiration from this influential work.`;
        const url = `https://quotese.com${UrlHandler.getSourceUrl(source)}`;
        const image = 'https://quotese.com/images/og-image-source.jpg';

        this.updateMetaTags({
            title: title,
            description: description,
            url: url,
            image: image
        });
    }
};

// Export to global scope
window.SocialMetaUtil = SocialMetaUtil;
