/**
 * Video Carousel
 * Handles YouTube video carousel with lazy loading
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVideoCarousel);
    } else {
        initVideoCarousel();
    }

    function initVideoCarousel() {
        const carousel = document.querySelector('.cs-video-carousel');
        if (!carousel) return;

        const slides = Array.from(carousel.querySelectorAll('.cs-video-slide'));
        const prevBtn = document.querySelector('.cs-carousel-prev');
        const nextBtn = document.querySelector('.cs-carousel-next');
        
        let currentIndex = 0;
        let touchStartX = 0;
        let touchEndX = 0;

        // Initialize play buttons
        slides.forEach((slide, index) => {
            const playButton = slide.querySelector('.cs-play-button');
            const placeholder = slide.querySelector('.cs-video-placeholder');
            
            if (playButton && placeholder) {
                playButton.addEventListener('click', () => loadVideo(slide, index));
                placeholder.addEventListener('click', () => loadVideo(slide, index));
            }
        });

        // Navigation buttons
        if (prevBtn) {
            prevBtn.addEventListener('click', () => navigate(-1));
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => navigate(1));
        }

        // Touch/swipe support
        carousel.addEventListener('touchstart', handleTouchStart, { passive: true });
        carousel.addEventListener('touchend', handleTouchEnd, { passive: true });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                navigate(-1);
            } else if (e.key === 'ArrowRight') {
                navigate(1);
            }
        });

        function navigate(direction) {
            const newIndex = currentIndex + direction;
            
            if (newIndex < 0) {
                currentIndex = slides.length - 1;
            } else if (newIndex >= slides.length) {
                currentIndex = 0;
            } else {
                currentIndex = newIndex;
            }

            updateSlides();
        }

        function updateSlides() {
            // First, aggressively stop all videos by clearing src before removal
            slides.forEach((slide) => {
                const iframe = slide.querySelector('iframe');
                if (iframe) {
                    // Clear the src to stop the video immediately
                    iframe.src = 'about:blank';
                    // Small delay to ensure browser processes the src change
                    setTimeout(() => {
                        if (iframe.parentNode) {
                            iframe.remove();
                        }
                    }, 10);
                }
                
                // Restore placeholder for all non-active slides
                const container = slide.querySelector('.cs-video-container');
                const videoId = slide.dataset.videoId;
                if (container && !slide.querySelector('.cs-video-placeholder') && videoId) {
                    const placeholder = createPlaceholder(slide, videoId);
                    container.appendChild(placeholder);
                }
            });
            
            // Then update active states
            slides.forEach((slide, index) => {
                if (index === currentIndex) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });
        }

        function createPlaceholder(slide, videoId) {
            const placeholder = document.createElement('div');
            placeholder.className = 'cs-video-placeholder';
            
            const img = document.createElement('img');
            img.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            img.alt = 'Video thumbnail';
            img.loading = 'lazy';
            
            const playButton = document.createElement('button');
            playButton.className = 'cs-play-button';
            playButton.setAttribute('aria-label', 'Play video');
            playButton.innerHTML = `
                <svg width="68" height="48" viewBox="0 0 68 48" fill="none">
                    <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path>
                    <path d="M 45,24 27,14 27,34" fill="#fff"></path>
                </svg>
            `;
            
            placeholder.appendChild(img);
            placeholder.appendChild(playButton);
            
            // Add click handlers
            playButton.addEventListener('click', () => loadVideo(slide));
            placeholder.addEventListener('click', () => loadVideo(slide));
            
            return placeholder;
        }

        function loadVideo(slide) {
            const videoId = slide.dataset.videoId;
            const container = slide.querySelector('.cs-video-container');
            const placeholder = slide.querySelector('.cs-video-placeholder');
            
            if (!videoId || !container) return;

            // Create iframe with muted audio
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1&enablejsapi=1`;
            iframe.title = slide.querySelector('.cs-video-title')?.textContent || 'YouTube video';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            
            // Remove placeholder and add iframe
            if (placeholder) {
                placeholder.remove();
            }
            container.appendChild(iframe);
        }

        function handleTouchStart(e) {
            touchStartX = e.changedTouches[0].screenX;
        }

        function handleTouchEnd(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe left - next
                    navigate(1);
                } else {
                    // Swipe right - prev
                    navigate(-1);
                }
            }
        }

        // Initialize first slide
        updateSlides();
    }
})();
