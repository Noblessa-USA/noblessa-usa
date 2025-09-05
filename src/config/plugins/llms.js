const client = require("../../_data/client");

module.exports = {
    collections: ['sitemap'],
    excludeCollections: ['drafts'],
    siteUrl: client.domain,
    maxContentLength: 10000,
    additionalMetadata: ['title', 'description', 'permalink'],
    sortDirection: 'desc', // 'desc' for newest first, 'asc' for oldest first
    normalizeWhitespace: true,
    stripHorizontalRules: true,
};
