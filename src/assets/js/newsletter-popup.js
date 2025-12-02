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
        const newsletterForm = document.getElementById('newsletter-form');

        // Check if elements exist
        if (!newsletterCtaBtn || !newsletterPopup) {
            console.warn('Newsletter popup elements not found');
            return;
        }

        // Open popup
        function openPopup() {
            newsletterPopup.style.display = 'flex';
            // Slight delay to allow display change to take effect before adding active class
            setTimeout(() => {
                newsletterPopup.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            }, 10);
        }

        // Close popup
        function closePopup() {
            newsletterPopup.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
            // Wait for transition to complete before hiding
            setTimeout(() => {
                newsletterPopup.style.display = 'none';
            }, 300);
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
