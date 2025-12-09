// ─────────────────────────────────────────────────────────────────────────────
// EXPLORE PAGE JAVASCRIPT
// Handles smooth scrolling, form validation, and analytics tracking
// ─────────────────────────────────────────────────────────────────────────────

(function() {
    'use strict';

    // Smooth scroll to consultation form
    function initSmoothScroll() {
        const ctaButtons = document.querySelectorAll('a[href="#consultation-form"]');
        
        ctaButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector('#consultation-form');
                
                if (target) {
                    const headerOffset = 100; // Account for fixed header
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Track CTA click
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'cta_click', {
                            'event_category': 'engagement',
                            'event_label': 'Schedule Consultation CTA',
                            'value': 1
                        });
                    }
                }
            });
        });
    }

    // Form validation and submission tracking
    function initFormTracking() {
        const form = document.querySelector('#consultation-form-element');
        
        if (form) {
            form.addEventListener('submit', function(e) {
                // Track form submission
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'generate_lead', {
                        'event_category': 'conversion',
                        'event_label': 'Consultation Form Submission',
                        'value': 1
                    });
                }
            });

            // Track form field focus
            const formFields = form.querySelectorAll('input, textarea');
            formFields.forEach(field => {
                field.addEventListener('focus', function() {
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'form_start', {
                            'event_category': 'engagement',
                            'event_label': 'Consultation Form Started',
                            'value': 1
                        });
                    }
                }, { once: true }); // Only track first interaction
            });
        }
    }

    // Track time on page
    function trackTimeOnPage() {
        let startTime = Date.now();
        
        window.addEventListener('beforeunload', function() {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'time_on_page', {
                    'event_category': 'engagement',
                    'event_label': 'Explore Page',
                    'value': timeSpent
                });
            }
        });
    }

    // Track scroll depth
    function trackScrollDepth() {
        let maxScroll = 0;
        const milestones = [25, 50, 75, 90];
        const tracked = new Set();

        window.addEventListener('scroll', function() {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollPercent = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);

            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;

                milestones.forEach(milestone => {
                    if (scrollPercent >= milestone && !tracked.has(milestone)) {
                        tracked.add(milestone);
                        
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'scroll', {
                                'event_category': 'engagement',
                                'event_label': `Scroll Depth ${milestone}%`,
                                'value': milestone
                            });
                        }
                    }
                });
            }
        }, { passive: true });
    }

    // Observe gallery images for lazy load tracking
    function trackImageViews() {
        const images = document.querySelectorAll('#explore-gallery .cs-picture img');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'view_item', {
                                'event_category': 'engagement',
                                'event_label': 'Gallery Image Viewed'
                            });
                        }
                        imageObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.5
            });

            images.forEach(img => imageObserver.observe(img));
        }
    }

    // Add phone number formatting
    function initPhoneFormatting() {
        const phoneInput = document.querySelector('#phone');
        
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length > 10) {
                    value = value.substring(0, 10);
                }
                
                if (value.length >= 6) {
                    value = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6)}`;
                } else if (value.length >= 3) {
                    value = `(${value.substring(0, 3)}) ${value.substring(3)}`;
                }
                
                e.target.value = value;
            });
        }
    }

    // Add zip code validation
    function initZipValidation() {
        const zipInput = document.querySelector('#zip');
        
        if (zipInput) {
            zipInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length > 5) {
                    value = value.substring(0, 5);
                }
                
                e.target.value = value;
            });
        }
    }

    // Track video engagement
    function trackVideoEngagement() {
        const video = document.querySelector('#video-showcase video');
        
        if (video) {
            const videoObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'video_view', {
                                'event_category': 'engagement',
                                'event_label': 'Showcase Video Viewed'
                            });
                        }
                        videoObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.5
            });

            videoObserver.observe(video);
        }
    }

    // Initialize all functions when DOM is ready
    function init() {
        initSmoothScroll();
        initFormTracking();
        trackTimeOnPage();
        trackScrollDepth();
        trackImageViews();
        initPhoneFormatting();
        initZipValidation();
        trackVideoEngagement();
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
