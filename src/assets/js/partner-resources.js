// Partner Resources Accordion Functionality
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize accordion functionality
    const accordionHeaders = document.querySelectorAll('.cs-accordion-header');
    const accordionItems = document.querySelectorAll('.cs-accordion-item');
    const accordionContents = document.querySelectorAll('.cs-accordion-content');
    
    accordionHeaders.forEach((header, index) => {
        header.addEventListener('click', function() {
            const item = this.closest('.cs-accordion-item');
            const content = item.querySelector('.cs-accordion-content');
            const isActive = item.classList.contains('active');
            
            // Close all accordion items
            accordionItems.forEach(accordionItem => {
                accordionItem.classList.remove('active');
            });
            
            accordionContents.forEach(accordionContent => {
                accordionContent.classList.remove('active');
            });
            
            // If the clicked item wasn't active, open it
            if (!isActive) {
                item.classList.add('active');
                content.classList.add('active');
                
                // Update aria-expanded
                this.setAttribute('aria-expanded', 'true');
            } else {
                // Update aria-expanded
                this.setAttribute('aria-expanded', 'false');
            }
            
            // Update all other headers' aria-expanded
            accordionHeaders.forEach(otherHeader => {
                if (otherHeader !== this) {
                    otherHeader.setAttribute('aria-expanded', 'false');
                }
            });
        });
    });
    
    // Keyboard navigation support
    accordionHeaders.forEach(header => {
        header.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Smooth scrolling when accordion opens
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('cs-accordion-content') && target.classList.contains('active')) {
                    // Small delay to allow CSS transition to start
                    setTimeout(() => {
                        const rect = target.getBoundingClientRect();
                        const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight;
                        
                        if (!isInView) {
                            target.scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'nearest' 
                            });
                        }
                    }, 150);
                }
            }
        });
    });
    
    // Observe accordion content elements for class changes
    accordionContents.forEach(content => {
        observer.observe(content, { attributes: true });
    });
    
    // Accessibility improvements
    accordionHeaders.forEach((header, index) => {
        // Add unique IDs for ARIA
        const contentId = `accordion-content-${index}`;
        const headerId = `accordion-header-${index}`;
        
        header.setAttribute('id', headerId);
        header.setAttribute('aria-controls', contentId);
        
        const content = header.closest('.cs-accordion-item').querySelector('.cs-accordion-content');
        content.setAttribute('id', contentId);
        content.setAttribute('aria-labelledby', headerId);
        content.setAttribute('role', 'region');
    });
    
    // Optional: Track resource link clicks for analytics
    const resourceLinks = document.querySelectorAll('.cs-resource-link');
    resourceLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Optional: Track analytics if Google Analytics is available
            if (typeof gtag !== 'undefined') {
                const resourceTitle = this.querySelector('.cs-resource-title')?.textContent || 'Unknown Resource';
                gtag('event', 'resource_download', {
                    'event_category': 'Partner Resources',
                    'event_label': resourceTitle,
                    'value': 1
                });
            }
        });
    });
});