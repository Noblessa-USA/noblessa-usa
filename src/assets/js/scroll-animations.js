// Scroll Animation - Fade In Up
// This script handles scroll-triggered animations for elements with scroll animation classes
// If the animations are not working, double check that the parent element is set to overflow: visible;

document.addEventListener('DOMContentLoaded', function() {
    // Configuration options
    const config = {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: '0px 0px -50px 0px' // Trigger 50px before the element enters the viewport
    };

    // Create intersection observer
    const observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add a small delay to prevent sudden animations on page load
                setTimeout(() => {
                    entry.target.classList.add('sl-animate');
                }, 100);
                
                // Optional: Stop observing this element after animation triggers
                // Uncomment the line below if you want animations to only happen once
                // observer.unobserve(entry.target);
            } else {
                // Optional: Remove animation class when element leaves viewport
                // Uncomment the line below if you want animations to be repeatable
                // entry.target.classList.remove('sl-animate');
            }
        });
    }, config);

    // Find all elements with scroll animation classes and observe them
    const animationClasses = [
        '.sl-fade-in-up',
        '.sl-fade-in-down',
        '.sl-fade-in-left',
        '.sl-fade-in-right'
    ];

    // Add a slight delay before starting observations to prevent immediate animations
    setTimeout(() => {
        animationClasses.forEach(className => {
            const elements = document.querySelectorAll(className);
            elements.forEach(element => {
                // Only observe elements that don't already have the animate class
                if (!element.classList.contains('sl-animate')) {
                    observer.observe(element);
                }
            });
        });
    }, 150);

    // Function to manually trigger animations (useful for dynamically added content)
    window.initScrollAnimations = function() {
        animationClasses.forEach(className => {
            const elements = document.querySelectorAll(className + ':not(.sl-animate)');
            elements.forEach(element => {
                observer.observe(element);
            });
        });
    };

    // Fallback for browsers that don't support Intersection Observer
    if (!window.IntersectionObserver) {
        console.warn('Intersection Observer not supported. Scroll animations will not work.');
        
        // Add all animation classes immediately as fallback
        animationClasses.forEach(className => {
            const elements = document.querySelectorAll(className);
            elements.forEach(element => {
                element.classList.add('sl-animate');
            });
        });
    }
});

// Optional: Function to reset all animations (useful for development/testing)
window.resetScrollAnimations = function() {
    const animatedElements = document.querySelectorAll('.sl-animate');
    animatedElements.forEach(element => {
        element.classList.remove('sl-animate');
    });
    
    // Re-initialize animations
    if (window.initScrollAnimations) {
        window.initScrollAnimations();
    }
};
