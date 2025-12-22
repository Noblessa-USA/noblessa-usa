// ─────────────────────────────────────────────────────────────────────────────
// CATALOG ACCESS MANAGEMENT
// Handles form submission, validation, and catalog download access
// ─────────────────────────────────────────────────────────────────────────────

(function() {
    'use strict';

    // Configuration
    const STORAGE_KEY = 'noblessa_catalog_access';
    const CATALOG_URLS = {
        'new-features': '/assets/pdf/catalogs2026/New Features 2026.pdf',
        'bathrooms': '/assets/pdf/catalogs2026/Noblessa Bathroom 2026.pdf',
        'living-rooms': '/assets/pdf/catalogs2026/Noblessa Living 2026.pdf',
        'kitchen-ranges': '/assets/pdf/catalogs2026/Noblessa Kitchens 2026.pdf'
    };

    // DOM Elements
    let modal = null;
    let modalOverlay = null;
    let closeButton = null;
    let catalogForm = null;
    let catalogCards = null;
    let catalogButtons = null;

    /**
     * Initialize the catalog access system
     */
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupElements);
        } else {
            setupElements();
        }
    }

    /**
     * Setup DOM elements and event listeners
     */
    function setupElements() {
        // Get DOM elements
        modal = document.getElementById('catalog-modal');
        modalOverlay = modal?.querySelector('.cs-catalog-modal-overlay');
        closeButton = modal?.querySelector('.cs-catalog-modal-close');
        catalogForm = document.getElementById('catalog-access-form');
        catalogCards = document.querySelectorAll('.cs-catalog-card');
        catalogButtons = document.querySelectorAll('.cs-catalog-btn');

        if (!modal || !catalogForm) {
            console.warn('Catalog elements not found on this page');
            return;
        }

        // Check if user already has access
        checkAccessStatus();

        // Setup event listeners
        setupEventListeners();
    }

    /**
     * Setup all event listeners
     */
    function setupEventListeners() {
        // Catalog button clicks
        catalogButtons.forEach(button => {
            button.addEventListener('click', handleCatalogButtonClick);
        });

        // Modal close events
        if (closeButton) {
            closeButton.addEventListener('click', closeModal);
        }

        if (modalOverlay) {
            modalOverlay.addEventListener('click', closeModal);
        }

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal?.classList.contains('cs-catalog-modal-visible')) {
                closeModal();
            }
        });

        // Form submission
        if (catalogForm) {
            catalogForm.addEventListener('submit', handleFormSubmit);
        }
    }

    /**
     * Check if user has already submitted the form
     */
    function checkAccessStatus() {
        const hasAccess = localStorage.getItem(STORAGE_KEY);
        
        if (hasAccess === 'true') {
            unlockCatalogs();
        }
    }

    /**
     * Handle catalog button clicks
     */
    function handleCatalogButtonClick(e) {
        e.preventDefault();
        const button = e.currentTarget;
        const catalogCard = button.closest('.cs-catalog-card');
        const catalogType = catalogCard?.dataset.catalog;

        // Check if button is unlocked (has access)
        if (button.classList.contains('cs-catalog-btn-unlocked')) {
            downloadCatalog(catalogType);
        } else {
            // Show modal to request access
            openModal();
        }
    }

    /**
     * Open the catalog access modal
     */
    function openModal() {
        if (!modal) return;

        modal.style.display = 'flex';
        // Trigger reflow to enable transition
        modal.offsetHeight;
        modal.classList.add('cs-catalog-modal-visible');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Focus first input
        const firstInput = catalogForm?.querySelector('input[type="text"]');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    /**
     * Close the catalog access modal
     */
    function closeModal() {
        if (!modal) return;

        modal.classList.remove('cs-catalog-modal-visible');
        
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }

    /**
     * Handle form submission
     */
    async function handleFormSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const submitButton = form.querySelector('.cs-catalog-submit-btn');
        const formData = new FormData(form);

        // Disable submit button
        submitButton.disabled = true;
        submitButton.innerHTML = '<span>Processing...</span>';

        try {
            // Submit to Netlify
            const response = await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            });

            if (response.ok) {
                // Store access in localStorage
                localStorage.setItem(STORAGE_KEY, 'true');
                
                // Store user info for potential future use
                const userData = {
                    firstName: formData.get('first-name'),
                    lastName: formData.get('last-name'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem(STORAGE_KEY + '_user', JSON.stringify(userData));

                // Unlock catalogs
                unlockCatalogs();

                // Close modal
                closeModal();

                // Show success message
                showNotification('Success! You now have instant viewing of all catalogs.', 'success');

                // Reset form
                form.reset();
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showNotification('An error occurred. Please try again.', 'error');
        } finally {
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.innerHTML = `
                <span class="cs-hover-underline">Get Access Now</span>
                <img src="/assets/svgs/horizontal-arrow.svg" alt="arrow" width="30" height="10" loading="lazy" decoding="async">
            `;
        }
    }

    /**
     * Unlock all catalog downloads
     */
    function unlockCatalogs() {
        catalogButtons.forEach(button => {
            button.classList.remove('cs-catalog-btn-locked');
            button.classList.add('cs-catalog-btn-unlocked');
            
            // Button text remains the same
            button.textContent = 'View Catalog';
        });
    }

    /**
     * Download a specific catalog
     */
    function downloadCatalog(catalogType) {
        const catalogUrl = CATALOG_URLS[catalogType];
        
        if (!catalogUrl) {
            console.error('Invalid catalog type:', catalogType);
            showNotification('Catalog not found.', 'error');
            return;
        }

        // Open PDF in new tab
        window.open(catalogUrl, '_blank');

        // Track download (optional - could send to analytics)
        trackCatalogDownload(catalogType);
    }

    /**
     * Track catalog downloads
     */
    function trackCatalogDownload(catalogType) {
        // Get or initialize download history
        let downloadHistory = JSON.parse(localStorage.getItem(STORAGE_KEY + '_downloads') || '[]');
        
        downloadHistory.push({
            catalog: catalogType,
            timestamp: new Date().toISOString()
        });

        localStorage.setItem(STORAGE_KEY + '_downloads', JSON.stringify(downloadHistory));

        // Send to Google Analytics and Google Ads conversion tracking
        if (typeof gtag !== 'undefined') {
            // Google Analytics event
            gtag('event', 'catalog_download', {
                'catalog_type': catalogType,
                'event_category': 'engagement',
                'event_label': catalogType
            });
            
            // Google Ads conversion event for catalogue download
            gtag('event', 'conversion', {
                'send_to': 'AW-431163172/KQLKCNSNlsYCEKSOzM0B'
            });
        }
    }

    /**
     * Show notification message
     */
    function showNotification(message, type = 'info') {
        // Remove any existing notifications
        const existingNotification = document.querySelector('.cs-catalog-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `cs-catalog-notification cs-catalog-notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            padding: 16px 24px;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10002;
            font-size: 14px;
            font-weight: 600;
            font-family: var(--bodyFont, 'Open Sans', sans-serif);
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Initialize when script loads
    init();

    // Expose public API for debugging
    window.CatalogAccess = {
        unlock: unlockCatalogs,
        lock: function() {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        },
        checkStatus: checkAccessStatus,
        clearHistory: function() {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(STORAGE_KEY + '_user');
            localStorage.removeItem(STORAGE_KEY + '_downloads');
            location.reload();
        }
    };

})();

// Add animation keyframes to document
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
