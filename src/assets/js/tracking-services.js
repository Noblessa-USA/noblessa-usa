// Example: How to implement third-party services with cookie consent
// This file shows how to properly load analytics and marketing scripts
// based on user consent preferences

// Example 1: Google Analytics 4
// Replace 'GA_MEASUREMENT_ID' with your actual Google Analytics 4 measurement ID
function initGoogleAnalytics() {
    const measurementId = 'G-29MGD5D9V5'; // Replace with your GA4 ID
    
    // Only load if analytics consent is given
    loadWithConsent(() => {
        loadGoogleAnalytics(measurementId);
    }, 'analytics', 'Google Analytics');
}

// Example 2: Facebook Pixel
function initFacebookPixel() {
    const pixelId = 'YOUR_FACEBOOK_PIXEL_ID'; // Replace with your Pixel ID
    
    // Only load if marketing consent is given
    loadWithConsent(() => {
        loadFacebookPixel(pixelId);
    }, 'marketing', 'Facebook Pixel');
}

// Example 3: Google Tag Manager
function initGoogleTagManager() {
    const gtmId = 'GTM-XXXXXXX'; // Replace with your GTM ID
    
    loadWithConsent(() => {
        // Load GTM script
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer',gtmId);
        
        // Add GTM noscript fallback to body
        const noscript = document.createElement('noscript');
        noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
        document.body.prepend(noscript);
    }, 'analytics', 'Google Tag Manager');
}

// Example 4: HubSpot Tracking
function initHubSpot() {
    const hubspotId = 'YOUR_HUBSPOT_ID'; // Replace with your HubSpot ID
    
    loadWithConsent(() => {
        const script = document.createElement('script');
        script.src = `//js.hs-scripts.com/${hubspotId}.js`;
        script.async = true;
        script.defer = true;
        script.id = 'hs-script-loader';
        document.head.appendChild(script);
    }, 'marketing', 'HubSpot');
}

// Example 5: Hotjar
function initHotjar() {
    const hotjarId = 'YOUR_HOTJAR_ID'; // Replace with your Hotjar ID
    
    loadWithConsent(() => {
        (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:hotjarId,hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
    }, 'analytics', 'Hotjar');
}

// Example 6: Custom analytics function
function initCustomAnalytics() {
    loadWithConsent(() => {
        // Your custom analytics code here
        console.log('Custom analytics initialized');
        
        // Example: Simple page view tracking
        function trackPageView() {
            const data = {
                url: window.location.href,
                title: document.title,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            };
            
            // Send to your analytics endpoint
            fetch('/api/analytics/pageview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            }).catch(err => console.log('Analytics tracking failed:', err));
        }
        
        // Track initial page view
        trackPageView();
        
        // Track navigation changes for SPAs
        let currentUrl = window.location.href;
        setInterval(() => {
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                trackPageView();
            }
        }, 1000);
        
    }, 'analytics', 'Custom Analytics');
}

// Example 7: Chat widget (marketing)
function initChatWidget() {
    loadWithConsent(() => {
        // Example chat widget initialization
        window.chatWidgetConfig = {
            apiKey: 'YOUR_CHAT_API_KEY',
            position: 'bottom-right',
            color: '#C59852'
        };
        
        const script = document.createElement('script');
        script.src = 'https://widget.chat-service.com/widget.js';
        script.async = true;
        document.head.appendChild(script);
    }, 'marketing', 'Chat Widget');
}

// Initialize all services when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Uncomment the services you want to use:
    
    initGoogleAnalytics();
    // initFacebookPixel();
    // initGoogleTagManager();
    // initHubSpot();
    // initHotjar();
    // initCustomAnalytics();
    // initChatWidget();
});

// You can also initialize services based on specific page conditions
if (window.location.pathname === '/contact/') {
    // Load additional marketing tools on contact page
    // initChatWidget();
}

// Export functions for manual initialization if needed
window.initGoogleAnalytics = initGoogleAnalytics;
window.initFacebookPixel = initFacebookPixel;
window.initGoogleTagManager = initGoogleTagManager;
window.initHubSpot = initHubSpot;
window.initHotjar = initHotjar;
window.initCustomAnalytics = initCustomAnalytics;
window.initChatWidget = initChatWidget;
