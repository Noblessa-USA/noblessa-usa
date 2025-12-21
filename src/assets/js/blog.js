// ─────────────────────────────────────────────────────────────────────────────
// BLOG PAGE JAVASCRIPT
// Handles search, tag filtering, and responsive interactions
// ─────────────────────────────────────────────────────────────────────────────

(function() {
    'use strict';

    let activeFilters = new Set();
    let searchTerm = '';
    let articlesPerPage = 6;
    let currentPage = 1;
    let allArticles = [];

    // Initialize all blog functionality
    function init() {
        const searchInput = document.getElementById('blog-search');
        const filterToggle = document.getElementById('filter-toggle');
        const filterTags = document.getElementById('filter-tags');
        const tagFilters = document.querySelectorAll('.cs-tag-filter');
        const clearFiltersBtn = document.getElementById('clear-filters');
        const articlesGrid = document.getElementById('articles-grid');
        const loadMoreBtn = document.getElementById('load-more-button');

        if (!searchInput || !articlesGrid) return;

        // Store all articles
        allArticles = Array.from(document.querySelectorAll('.cs-article'));

        // Search functionality
        searchInput.addEventListener('input', debounce(handleSearch, 300));

        // Filter toggle for mobile
        if (filterToggle) {
            filterToggle.addEventListener('click', toggleFilterDropdown);
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.cs-filter-wrapper')) {
                closeFilterDropdown();
            }
        });

        // Tag filter functionality
        tagFilters.forEach(button => {
            button.addEventListener('click', handleTagFilter);
        });

        // Clear filters button
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', clearAllFilters);
        }

        // Load more button
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', loadMoreArticles);
        }

        // Initialize pagination
        initializePagination();

        // Initialize scroll animations for articles
        initScrollAnimations();
    }

    // Handle search input
    function handleSearch(e) {
        searchTerm = e.target.value.toLowerCase().trim();
        currentPage = 1;
        filterArticles();
    }

    // Toggle filter dropdown
    function toggleFilterDropdown(e) {
        e.stopPropagation();
        const filterToggle = document.getElementById('filter-toggle');
        const filterTags = document.getElementById('filter-tags');
        const isExpanded = filterToggle.getAttribute('aria-expanded') === 'true';
        
        filterToggle.setAttribute('aria-expanded', !isExpanded);
        filterTags.setAttribute('aria-hidden', isExpanded);
        filterTags.classList.toggle('cs-active');
    }

    // Close filter dropdown
    function closeFilterDropdown() {
        const filterToggle = document.getElementById('filter-toggle');
        const filterTags = document.getElementById('filter-tags');
        
        if (filterToggle && filterTags) {
            filterToggle.setAttribute('aria-expanded', 'false');
            filterTags.setAttribute('aria-hidden', 'true');
            filterTags.classList.remove('cs-active');
        }
    }

    // Handle tag filter selection
    function handleTagFilter(e) {
        const button = e.currentTarget;
        const tag = button.getAttribute('data-tag');
        
        if (tag === 'all') {
            // Clear all filters
            clearAllFilters();
            return;
        }

        // Normalize tag to lowercase for comparison
        const tagLower = tag.toLowerCase();

        // Toggle the filter
        if (activeFilters.has(tagLower)) {
            activeFilters.delete(tagLower);
            button.setAttribute('aria-pressed', 'false');
        } else {
            activeFilters.add(tagLower);
            button.setAttribute('aria-pressed', 'true');
        }

        // Remove "All Posts" selection
        const allButton = document.querySelector('.cs-tag-filter[data-tag="all"]');
        if (allButton && activeFilters.size > 0) {
            allButton.setAttribute('aria-pressed', 'false');
        } else if (allButton && activeFilters.size === 0) {
            allButton.setAttribute('aria-pressed', 'true');
        }

        currentPage = 1;
        updateActiveFiltersDisplay();
        filterArticles();
    }

    // Clear all filters
    function clearAllFilters() {
        activeFilters.clear();
        currentPage = 1;
        
        // Reset all filter buttons
        document.querySelectorAll('.cs-tag-filter').forEach(button => {
            const tag = button.getAttribute('data-tag');
            button.setAttribute('aria-pressed', tag === 'all' ? 'true' : 'false');
        });

        updateActiveFiltersDisplay();
        filterArticles();
    }

    // Update active filters display
    function updateActiveFiltersDisplay() {
        const activeFiltersDiv = document.getElementById('active-filters');
        const activeTagsDiv = document.getElementById('active-tags');
        
        if (!activeFiltersDiv || !activeTagsDiv) return;

        if (activeFilters.size === 0) {
            activeFiltersDiv.style.display = 'none';
            return;
        }

        activeFiltersDiv.style.display = 'flex';
        activeTagsDiv.innerHTML = '';

        activeFilters.forEach(tagLower => {
            // Capitalize for display
            const tagDisplay = tagLower.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            const tagElement = document.createElement('span');
            tagElement.className = 'cs-active-tag';
            tagElement.innerHTML = `
                ${tagDisplay}
                <button class="cs-remove-tag" data-tag="${tagDisplay}" aria-label="Remove ${tagDisplay} filter">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            `;
            activeTagsDiv.appendChild(tagElement);

            // Add event listener to remove tag
            const removeBtn = tagElement.querySelector('.cs-remove-tag');
            removeBtn.addEventListener('click', () => {
                activeFilters.delete(tagLower);
                const filterButton = document.querySelector(`.cs-tag-filter[data-tag="${tagDisplay}"]`);
                if (filterButton) {
                    filterButton.setAttribute('aria-pressed', 'false');
                }
                updateActiveFiltersDisplay();
                filterArticles();
            });
        });
    }

    // Initialize pagination on page load
    function initializePagination() {
        currentPage = 1;
        filterArticles();
    }

    // Load more articles
    function loadMoreArticles() {
        currentPage++;
        filterArticles();
        
        // Smooth scroll to first new article
        const visibleArticles = Array.from(allArticles).filter(a => a.style.display !== 'none');
        const firstNewArticle = visibleArticles[(currentPage - 1) * articlesPerPage];
        if (firstNewArticle) {
            setTimeout(() => {
                const offset = 100;
                const elementPosition = firstNewArticle.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }, 100);
        }
    }

    // Filter articles based on search and tags
    function filterArticles() {
        const noResults = document.getElementById('no-results');
        const loadMoreWrapper = document.getElementById('load-more-wrapper');
        let matchingArticles = [];

        // First, filter articles based on search and tags
        allArticles.forEach(article => {
            const title = article.getAttribute('data-title') || '';
            const description = article.getAttribute('data-description') || '';
            const tags = article.getAttribute('data-tags') || '';
            const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);

            // Check search term
            const matchesSearch = !searchTerm || 
                title.includes(searchTerm) || 
                description.includes(searchTerm) ||
                tags.includes(searchTerm);

            // Check tag filters
            const matchesTags = activeFilters.size === 0 || 
                tagArray.some(tag => activeFilters.has(tag));

            if (matchesSearch && matchesTags) {
                matchingArticles.push(article);
            }
        });

        // Hide all articles first
        allArticles.forEach(article => {
            article.style.display = 'none';
            article.classList.remove('sl-fade-in-up');
        });

        // Show articles up to current page
        const articlesToShow = matchingArticles.slice(0, currentPage * articlesPerPage);
        articlesToShow.forEach(article => {
            article.style.display = '';
            article.classList.add('sl-fade-in-up');
        });

        // Show/hide no results message
        if (noResults) {
            noResults.style.display = matchingArticles.length === 0 ? 'flex' : 'none';
        }

        // Show/hide load more button
        if (loadMoreWrapper) {
            const hasMore = matchingArticles.length > currentPage * articlesPerPage;
            loadMoreWrapper.style.display = hasMore && matchingArticles.length > 0 ? 'flex' : 'none';
        }

        // Reinitialize scroll animations for visible articles
        initScrollAnimations();
    }

    // Initialize scroll animations
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.sl-fade-in-up, .sl-fade-in-down, .sl-fade-in-left, .sl-fade-in-right');
        
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('sl-animate');
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            animatedElements.forEach(el => {
                // Only observe elements that are visible
                if (el.style.display !== 'none') {
                    observer.observe(el);
                }
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            animatedElements.forEach(el => {
                if (el.style.display !== 'none') {
                    el.classList.add('sl-animate');
                }
            });
        }
    }

    // Debounce function for search input
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
