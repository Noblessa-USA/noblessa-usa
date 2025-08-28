// ─────────────────────────────────────────────────────────────────────────────
// LAZY LOADING IMPLEMENTATION
// Optimizes image and video loading for better performance
// ─────────────────────────────────────────────────────────────────────────────

class LazyLoader {
    constructor() {
        this.imageObserver = null;
        this.videoObserver = null;
        this.init();
    }

    init() {
        // Check if Intersection Observer is supported
        if ('IntersectionObserver' in window) {
            this.setupImageObserver();
            this.setupVideoObserver();
            this.observeElements();
        } else {
            // Fallback for older browsers
            this.loadAllImages();
            this.loadAllVideos();
        }
    }

    setupImageObserver() {
        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.imageObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px 0px', // Start loading 50px before element enters viewport
            threshold: 0.01
        });
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
        // Observe lazy images
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.imageObserver.observe(img);
        });

        // Observe lazy videos
        document.querySelectorAll('video[data-src]').forEach(video => {
            this.videoObserver.observe(video);
        });

        // Observe background images
        document.querySelectorAll('[data-bg]').forEach(element => {
            this.imageObserver.observe(element);
        });
    }

    loadImage(img) {
        if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            
            // Handle srcset if present
            if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
                img.removeAttribute('data-srcset');
            }
            
            // Add loaded class for animations
            img.addEventListener('load', () => {
                img.classList.add('lazy-loaded');
            });
        }

        // Handle background images
        if (img.dataset.bg) {
            const imageUrl = img.dataset.bg;
            const image = new Image();
            
            image.onload = () => {
                img.style.backgroundImage = `url(${imageUrl})`;
                img.classList.add('lazy-loaded');
                img.removeAttribute('data-bg');
            };
            
            image.src = imageUrl;
        }
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

    loadAllImages() {
        // Fallback for browsers without Intersection Observer
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.loadImage(img);
        });
        
        document.querySelectorAll('[data-bg]').forEach(element => {
            this.loadImage(element);
        });
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

// CSS for smooth loading animations
const style = document.createElement('style');
style.textContent = `
    img[data-src], [data-bg] {
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
    }
    
    img.lazy-loaded, .lazy-loaded {
        opacity: 1;
    }
    
    video[data-src] {
        background-color: #f0f0f0;
    }
`;
document.head.appendChild(style);
