// ─────────────────────────────────────────────────────────────────────────────
// NEWSLETTER POPUP/MODAL FUNCTIONALITY
// Handles opening and closing the newsletter subscription modal
// ─────────────────────────────────────────────────────────────────────────────

(function() {
    'use strict';

    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        
        // Get all elements
        const modal = document.getElementById('newsletter-modal');
        const ctaButton = document.getElementById('newsletter-cta-btn');
        const closeButton = document.getElementById('newsletter-close');
        const overlay = document.getElementById('newsletter-overlay');
        const form = document.getElementById('newsletter-form');
        
        // Exit if modal doesn't exist on this page
        if (!modal) {
            return;
        }

        /**
         * Open the newsletter modal
         */
        function openModal() {
            modal.style.display = 'flex';
            // Force reflow for animation
            modal.offsetHeight;
            modal.classList.add('cs-newsletter-modal-visible');
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
            
            // Set focus to the first input field for accessibility
            setTimeout(function() {
                const firstInput = modal.querySelector('input[type="text"]');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 100);
        }

        /**
         * Close the newsletter modal
         */
        function closeModal() {
            modal.classList.remove('cs-newsletter-modal-visible');
            // Wait for animation to complete before hiding
            setTimeout(function() {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        }

        /**
         * Handle form submission
         */
        function handleFormSubmit(event) {
            // The form will be handled by Netlify
            // You can add additional tracking or validation here if needed
            console.log('Newsletter form submitted');
        }

        // Event Listeners
        
        // Open modal when CTA button is clicked
        if (ctaButton) {
            ctaButton.addEventListener('click', function(e) {
                e.preventDefault();
                openModal();
            });
        }

        // Close modal when close button is clicked
        if (closeButton) {
            closeButton.addEventListener('click', function(e) {
                e.preventDefault();
                closeModal();
            });
        }

        // Close modal when clicking on overlay
        if (overlay) {
            overlay.addEventListener('click', function() {
                closeModal();
            });
        }

        // Close modal when pressing Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('cs-newsletter-modal-visible')) {
                closeModal();
            }
        });

        // Handle form submission
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }

        // Optional: Show modal after a delay (auto-popup)
        // Uncomment the following code if you want the modal to appear automatically
        /*
        setTimeout(function() {
            // Check if user hasn't already dismissed it in this session
            if (!sessionStorage.getItem('newsletterModalShown')) {
                openModal();
                sessionStorage.setItem('newsletterModalShown', 'true');
            }
        }, 5000); // Show after 5 seconds
        */
    });
})();
