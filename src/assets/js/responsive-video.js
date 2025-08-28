/**
 * Responsive Video Loader
 * Dynamically preloads and optimizes video sources based on screen size and connection speed
 */

class ResponsiveVideoLoader {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupResponsiveVideo());
        } else {
            this.setupResponsiveVideo();
        }
    }

    setupResponsiveVideo() {
        const video = document.querySelector('#hero-143 .cs-video');
        if (!video) return;

        // Get optimal video source based on screen size and connection
        const optimalSource = this.getOptimalVideoSource();
        
        // Update preload link if it exists
        this.updatePreloadLink(optimalSource);
        
        // Set up responsive loading on window resize
        this.setupResizeHandler(video);
        
        // Handle connection change if Network Information API is available
        this.handleConnectionChange(video);
    }

    getOptimalVideoSource() {
        const screenWidth = window.innerWidth;
        const pixelRatio = window.devicePixelRatio || 1;
        const effectiveWidth = screenWidth * pixelRatio;
        
        // Check connection speed if available (Network Information API)
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const isSlowConnection = connection && (
            connection.effectiveType === 'slow-2g' || 
            connection.effectiveType === '2g' ||
            connection.saveData === true
        );

        // Define video sources with breakpoints
        const videoSources = {
            mobile: {
                webm: '/assets/videos/youngers720x1280.webm',
                mp4: '/assets/videos/youngers720x1280.mp4',
                maxWidth: 768,
                description: 'Mobile optimized (720x1280)'
            },
            tablet: {
                webm: '/assets/videos/youngers1080x1920.webm',
                mp4: '/assets/videos/youngers1080x1920.mp4',
                maxWidth: 1200,
                description: 'Tablet/Small desktop (1080x1920)'
            },
            desktop: {
                webm: '/assets/videos/youngers1440x2560.webm',
                mp4: '/assets/videos/youngers1440x2560.mp4',
                maxWidth: Infinity,
                description: 'Large desktop (1440x2560)'
            }
        };

        // If slow connection, always use mobile version
        if (isSlowConnection) {
            console.log('Slow connection detected, using mobile video');
            return videoSources.mobile;
        }

        // Choose appropriate video based on screen size
        if (effectiveWidth <= videoSources.mobile.maxWidth) {
            return videoSources.mobile;
        } else if (effectiveWidth <= videoSources.tablet.maxWidth) {
            return videoSources.tablet;
        } else {
            return videoSources.desktop;
        }
    }

    updatePreloadLink(videoSource) {
        // Find existing preload link for video and update to preferred format (WebM)
        const existingPreload = document.querySelector('link[rel="preload"][as="video"]');
        const preferredSrc = videoSource.webm || videoSource.mp4;
        
        if (existingPreload && existingPreload.href !== preferredSrc) {
            existingPreload.href = preferredSrc;
            console.log(`Updated video preload to: ${videoSource.description}`);
        }
    }

    setupResizeHandler(video) {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newOptimalSource = this.getOptimalVideoSource();
                this.updateVideoIfNeeded(video, newOptimalSource);
            }, 250);
        });
    }

    updateVideoIfNeeded(video, newSource) {
        const currentSrc = video.currentSrc || video.src;
        const preferredSrc = newSource.webm || newSource.mp4;
        
        if (currentSrc && !currentSrc.includes(preferredSrc.split('/').pop().split('.')[0])) {
            console.log(`Switching to more appropriate video: ${newSource.description}`);
            const currentTime = video.currentTime;
            const wasPaused = video.paused;
            
            // Try WebM first, fallback to MP4
            video.src = preferredSrc;
            video.load();
            
            video.addEventListener('loadedmetadata', function onLoaded() {
                video.currentTime = currentTime;
                if (!wasPaused) {
                    video.play().catch(console.error);
                }
                video.removeEventListener('loadedmetadata', onLoaded);
            });
        }
    }

    handleConnectionChange(video) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            connection.addEventListener('change', () => {
                const newOptimalSource = this.getOptimalVideoSource();
                this.updateVideoIfNeeded(video, newOptimalSource);
            });
        }
    }
}

// Initialize the responsive video loader
new ResponsiveVideoLoader();

// Also provide a way to manually trigger recalculation
window.recalculateVideoSource = function() {
    const loader = new ResponsiveVideoLoader();
    loader.setupResponsiveVideo();
};
