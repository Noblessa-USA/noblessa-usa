// Collections Gallery Script
class CollectionsGallery {
    constructor() {
        this.currentSlide = 0;
        this.slides = [];
        this.isTransitioning = false;
        this.autoplayInterval = null;
        this.autoplayDelay = 5000; // 5 seconds
        
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Get all slides
        this.slides = document.querySelectorAll('.cg-slide');
        
        if (this.slides.length === 0) return;

        // Set background images
        this.slides.forEach(slide => {
            const bgImage = slide.getAttribute('data-bg');
            if (bgImage) {
                slide.style.backgroundImage = `url('${bgImage}')`;
            }
        });

        // Get navigation buttons
        this.prevBtn = document.querySelector('.cg-prev');
        this.nextBtn = document.querySelector('.cg-next');

        // Add event listeners
        if (this.prevBtn && this.nextBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Add touch/swipe support
        this.addTouchSupport();

        // Start autoplay
        this.startAutoplay();

        // Pause autoplay when user interacts
        const gallery = document.getElementById('collections-gallery');
        if (gallery) {
            gallery.addEventListener('mouseenter', () => this.stopAutoplay());
            gallery.addEventListener('mouseleave', () => this.startAutoplay());
        }

        // Initialize first slide
        this.updateSlides();
    }

    nextSlide() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.updateSlides();
        
        // Reset autoplay
        this.stopAutoplay();
        this.startAutoplay();
    }

    prevSlide() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        this.currentSlide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
        this.updateSlides();
        
        // Reset autoplay
        this.stopAutoplay();
        this.startAutoplay();
    }

    updateSlides() {
        this.slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev', 'next');
            
            if (index === this.currentSlide) {
                slide.classList.add('active');
            } else if (index === this.getPrevIndex()) {
                slide.classList.add('prev');
            } else if (index === this.getNextIndex()) {
                slide.classList.add('next');
            }
        });

        // Reset transition lock after the fade animation completes (1s)
        setTimeout(() => {
            this.isTransitioning = false;
        }, 1000);
    }

    getPrevIndex() {
        return this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
    }

    getNextIndex() {
        return (this.currentSlide + 1) % this.slides.length;
    }

    handleKeydown(e) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.prevSlide();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            this.nextSlide();
        }
    }

    addTouchSupport() {
        const gallery = document.getElementById('collections-gallery');
        if (!gallery) return;

        let startX = 0;
        let startY = 0;
        let isDragging = false;
        let isHorizontalSwipe = false;

        gallery.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
            isHorizontalSwipe = false;
        }, { passive: true });

        gallery.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = startX - currentX;
            const diffY = startY - currentY;

            // Only prevent default if this is clearly a horizontal swipe
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
                isHorizontalSwipe = true;
                e.preventDefault();
            }
        }, { passive: false });

        gallery.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;

            // Only trigger slide change if it was a horizontal swipe and meets threshold
            if (isHorizontalSwipe && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
        }, { passive: true });
    }

    startAutoplay() {
        this.stopAutoplay();
        this.autoplayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoplayDelay);
    }

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }
}

// Initialize the gallery
new CollectionsGallery();
