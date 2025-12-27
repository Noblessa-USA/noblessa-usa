/**
 * Flipbook Carousel
 * Displays PDF pages converted to WebP images with navigation controls
 * 
 * NOTE: PDF pages must be pre-converted to WebP format and placed in:
 * /assets/images/catalog/page-1.webp, page-2.webp, etc.
 * 
 * To convert PDF to WebP images, you can use tools like:
 * - ImageMagick: convert -density 150 input.pdf -quality 85 page-%d.webp
 * - Online converters like CloudConvert
 * - Adobe Acrobat: Export to images
 */

class Flipbook {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 0;
        this.imageBasePath = '/assets/images/catalog/';
        this.imagePrefix = 'page-';
        this.imageExtension = '.webp';
        
        // Cache DOM elements
        this.pageImage = document.querySelector('.cs-flipbook-page');
        this.prevButton = document.querySelector('.cs-flipbook-prev');
        this.nextButton = document.querySelector('.cs-flipbook-next');
        this.currentPageSpan = document.querySelector('.cs-current-page');
        this.totalPagesSpan = document.querySelector('.cs-total-pages');
        
        if (!this.pageImage || !this.prevButton || !this.nextButton) {
            console.error('Flipbook: Required elements not found');
            return;
        }
        
        this.init();
    }
    
    /**
     * Initialize the flipbook
     */
    init() {
        this.detectTotalPages().then(() => {
            this.loadPage(1);
            this.bindEvents();
            this.updateControls();
        });
    }
    
    /**
     * Detect total number of pages by checking which images exist
     * This attempts to load images until one fails
     */
    async detectTotalPages() {
        let pageNum = 1;
        let found = true;
        
        while (found && pageNum <= 200) { // Max 200 pages to prevent infinite loop
            const imagePath = this.getImagePath(pageNum);
            found = await this.imageExists(imagePath);
            
            if (found) {
                pageNum++;
            }
        }
        
        this.totalPages = pageNum - 1;
        
        if (this.totalPages === 0) {
            console.warn('Flipbook: No pages found. Please add images to ' + this.imageBasePath);
            this.showPlaceholder();
        } else {
            console.log(`Flipbook: Found ${this.totalPages} pages`);
        }
        
        this.totalPagesSpan.textContent = this.totalPages;
    }
    
    /**
     * Check if an image exists
     */
    imageExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }
    
    /**
     * Get the full path for a page image
     */
    getImagePath(pageNum) {
        return `${this.imageBasePath}${this.imagePrefix}${pageNum}${this.imageExtension}`;
    }
    
    /**
     * Show placeholder when no images are found
     */
    showPlaceholder() {
        this.pageImage.alt = 'No catalog pages available';
        this.pageImage.style.display = 'none';
        
        const wrapper = document.querySelector('.cs-flipbook-viewer');
        const placeholder = document.createElement('div');
        placeholder.className = 'cs-flipbook-placeholder';
        placeholder.innerHTML = `
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9M13 2L20 9M13 2V9H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>Catalog pages will appear here</p>
            <p class="cs-placeholder-hint">Add WebP images to: ${this.imageBasePath}</p>
        `;
        wrapper.appendChild(placeholder);
        
        this.prevButton.disabled = true;
        this.nextButton.disabled = true;
    }
    
    /**
     * Load and display a specific page
     */
    loadPage(pageNum, direction = 'none') {
        if (pageNum < 1 || pageNum > this.totalPages) {
            return;
        }
        
        this.currentPage = pageNum;
        const imagePath = this.getImagePath(pageNum);
        
        // Remove any existing flip animations
        this.pageImage.parentElement.classList.remove('flip-next', 'flip-prev');
        
        // Preload the image
        const img = new Image();
        img.onload = () => {
            if (direction === 'next' || direction === 'prev') {
                // Start flip animation immediately
                this.pageImage.parentElement.classList.add(direction === 'next' ? 'flip-next' : 'flip-prev');
                
                // Change the image at the midpoint of the animation (when it's rotated 90deg and not visible)
                setTimeout(() => {
                    this.pageImage.src = imagePath;
                    this.pageImage.alt = `Catalog page ${pageNum}`;
                }, 300); // Halfway through 600ms animation
                
                // Remove animation class after animation completes
                setTimeout(() => {
                    this.pageImage.parentElement.classList.remove('flip-next', 'flip-prev');
                }, 600);
            } else {
                // No animation, just change the image
                this.pageImage.src = imagePath;
                this.pageImage.alt = `Catalog page ${pageNum}`;
            }
            
            this.updateControls();
        };
        img.onerror = () => {
            console.error(`Failed to load page ${pageNum}`);
        };
        img.src = imagePath;
    }
    
    /**
     * Update navigation controls and page counter
     */
    updateControls() {
        this.currentPageSpan.textContent = this.currentPage;
        
        // Disable/enable navigation buttons
        this.prevButton.disabled = this.currentPage <= 1;
        this.nextButton.disabled = this.currentPage >= this.totalPages;
        
        // Update button states
        if (this.currentPage <= 1) {
            this.prevButton.classList.add('disabled');
        } else {
            this.prevButton.classList.remove('disabled');
        }
        
        if (this.currentPage >= this.totalPages) {
            this.nextButton.classList.add('disabled');
        } else {
            this.nextButton.classList.remove('disabled');
        }
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        this.prevButton.addEventListener('click', () => this.previousPage());
        this.nextButton.addEventListener('click', () => this.nextPage());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const flipbookSection = document.querySelector('#about-flipbook');
            if (!flipbookSection) return;
            
            const rect = flipbookSection.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom >= 0;
            
            if (inView) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.previousPage();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.nextPage();
                }
            }
        });
        
        // Touch swipe support
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.pageImage.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        this.pageImage.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });
        
        const handleSwipe = () => {
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                this.nextPage();
            }
            if (touchEndX > touchStartX + swipeThreshold) {
                this.previousPage();
            }
        };
        
        this.handleSwipe = handleSwipe;
    }
    
    /**
     * Navigate to previous page
     */
    previousPage() {
        if (this.currentPage > 1) {
            this.loadPage(this.currentPage - 1, 'prev');
        }
    }
    
    /**
     * Navigate to next page
     */
    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.loadPage(this.currentPage + 1, 'next');
        }
    }
    
    /**
     * Jump to a specific page
     */
    goToPage(pageNum) {
        if (pageNum >= 1 && pageNum <= this.totalPages) {
            this.loadPage(pageNum);
        }
    }
}

// Initialize flipbook when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new Flipbook();
    });
} else {
    new Flipbook();
}
