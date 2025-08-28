// ─────────────────────────────────────────────────────────────────────────────
// LAZY LOADING IMPLEMENTATION
// Optimizes video loading for better performance
// Images now use native loading="lazy" attribute with Sharp optimization
// ─────────────────────────────────────────────────────────────────────────────

class LazyLoader {
    constructor() {
        this.videoObserver = null;
        this.init();
    }

    init() {
        // Check if Intersection Observer is supported
        if ('IntersectionObserver' in window) {
            this.setupVideoObserver();
            this.observeElements();
        } else {
            // Fallback for older browsers
            this.loadAllVideos();
        }
    }

    setupVideoObserver() {
        this.videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadVideo(entry.target);
                    this.videoObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '100px 0px', // Start loading 100px before element enters viewport
            threshold: 0.01
        });
    }

    observeElements() {
        // Observe lazy videos
        document.querySelectorAll('video[data-src]').forEach(video => {
            this.videoObserver.observe(video);
        });
    }

    loadVideo(video) {
        if (video.dataset.src) {
            video.src = video.dataset.src;
            video.removeAttribute('data-src');
            video.load(); // Reload video with new source
            
            video.addEventListener('loadeddata', () => {
                video.classList.add('lazy-loaded');
            });
        }
    }

    loadAllVideos() {
        // Fallback for browsers without Intersection Observer
        document.querySelectorAll('video[data-src]').forEach(video => {
            this.loadVideo(video);
        });
    }
}
// Initialize lazy loading when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new LazyLoader();
    });
} else {
    new LazyLoader();
}

// CSS for smooth loading animations (simplified for video only)
const style = document.createElement('style');
style.textContent = `
    video[data-src] {
        background-color: #f0f0f0;
    }
    
    video.lazy-loaded {
        opacity: 1;
    }
`;
document.head.appendChild(style);
