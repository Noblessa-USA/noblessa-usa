// ─────────────────────────────────────────────────────────────────────────────
// NEWSLETTER POPUP FUNCTIONALITY
// Simple modal for newsletter subscription
// ─────────────────────────────────────────────────────────────────────────────

(function() {
    'use strict';

    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        const modal = document.getElementById('newsletter-modal');
        const openBtn = document.getElementById('newsletter-cta-btn');
        const closeBtn = modal?.querySelector('.newsletter-modal-close');
        const overlay = modal?.querySelector('.newsletter-modal-overlay');
        const form = document.getElementById('newsletter-form');

        if (!modal || !openBtn) {
            console.warn('Newsletter modal elements not found');
            return;
        }

        function openModal(e) {
            e.preventDefault();
            e.stopPropagation();
            modal.classList.remove('newsletter-modal-hidden');
            document.body.style.overflow = 'hidden';
            // Focus on first input for accessibility
            setTimeout(() => {
                const firstInput = modal.querySelector('input[type="text"]');
                if (firstInput) firstInput.focus();
            }, 100);
        }

        function closeModal(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            modal.classList.add('newsletter-modal-hidden');
            document.body.style.overflow = '';
        }

        // Event listeners
        openBtn.addEventListener('click', openModal, false);
        if (closeBtn) closeBtn.addEventListener('click', closeModal, false);
        if (overlay) overlay.addEventListener('click', closeModal, false);

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('newsletter-modal-hidden')) {
                closeModal();
            }
        });

        // Form submission
        if (form) {
            form.addEventListener('submit', (e) => {
                // Netlify handles the form submission
                // Show success message after a delay
                setTimeout(() => {
                    alert('Thank you for subscribing!');
                    closeModal();
                    form.reset();
                }, 100);
            });
        }
    }
})();
