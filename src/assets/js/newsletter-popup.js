// ─────────────────────────────────────────────────────────────────────────────
// NEWSLETTER POPUP FUNCTIONALITY
// Handles opening/closing of newsletter subscription popup modal
// ─────────────────────────────────────────────────────────────────────────────

(function() {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNewsletterPopup);
    } else {
        initNewsletterPopup();
    }

    function initNewsletterPopup() {
        // Get elements
        const newsletterCtaBtn = document.getElementById('newsletter-cta-btn');
        const newsletterPopup = document.getElementById('newsletter-popup');
        const newsletterPopupOverlay = document.querySelector('.newsletter-popup-overlay');
        const newsletterPopupClose = document.querySelector('.newsletter-popup-close');
        const newsletterPopupBody = document.querySelector('.newsletter-popup-body');
        const formTemplate = document.getElementById('newsletter-form-template');
        
        let formInjected = false;

        // Check if elements exist
        if (!newsletterCtaBtn || !newsletterPopup || !newsletterPopupBody || !formTemplate) {
            console.warn('Newsletter popup elements not found');
            return;
        }

        // Inject form content (only runs once)
        function injectForm() {
            if (formInjected) return;
            
            // Insert the form template content into the popup body
            const formHTML = formTemplate.innerHTML;
            newsletterPopupBody.insertAdjacentHTML('beforeend', formHTML);
            formInjected = true;
            
            // Trigger Netlify's form detection and reCAPTCHA initialization
            // Netlify looks for forms with data-netlify attribute and injects reCAPTCHA
            if (window.netlifyIdentity) {
                // If Netlify Identity is present, trigger form reprocessing
                const event = new Event('DOMContentLoaded', { bubbles: true, cancelable: true });
                document.dispatchEvent(event);
            }
        }

        // Open popup
        function openPopup() {
            // Inject form on first open to defer reCAPTCHA loading
            injectForm();
            
            // Force a reflow to ensure visibility takes effect
            newsletterPopup.offsetHeight;
            
            // Add active class to trigger opacity and visibility transition
            newsletterPopup.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }

        // Close popup
        function closePopup() {
            newsletterPopup.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }

        // Event Listeners
        newsletterCtaBtn.addEventListener('click', openPopup);

        if (newsletterPopupClose) {
            newsletterPopupClose.addEventListener('click', closePopup);
        }

        if (newsletterPopupOverlay) {
            newsletterPopupOverlay.addEventListener('click', closePopup);
        }

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && newsletterPopup.classList.contains('active')) {
                closePopup();
            }
        });
    }
})();
