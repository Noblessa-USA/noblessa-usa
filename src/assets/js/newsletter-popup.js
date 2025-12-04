// ─────────────────────────────────────────────────────────────────────────────
// NEWSLETTER POPUP FUNCTIONALITY
// Simple modal for newsletter subscription
// ─────────────────────────────────────────────────────────────────────────────

(function() {
    'use strict';

    const modal = document.getElementById('newsletter-modal');
    const openBtn = document.getElementById('newsletter-cta-btn');
    const closeBtn = modal?.querySelector('.newsletter-modal-close');
    const overlay = modal?.querySelector('.newsletter-modal-overlay');
    const form = document.getElementById('newsletter-form');

    if (!modal || !openBtn) return;

    function openModal() {
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        // Focus on first input for accessibility
        setTimeout(() => {
            const firstInput = modal.querySelector('input[type="text"]');
            firstInput?.focus();
        }, 100);
    }

    function closeModal() {
        modal.hidden = true;
        document.body.style.overflow = '';
    }

    // Event listeners
    openBtn.addEventListener('click', openModal);
    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hidden) {
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
})();
