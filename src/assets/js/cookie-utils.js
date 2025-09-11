// Cookie Consent Utilities
// Helper functions for checking consent before loading external scripts

/**
 * Load a script only if the user has consented to the specified cookie type
 * @param {string} src - Script source URL
 * @param {string} consentType - Type of consent required ('analytics', 'marketing', 'essential')
 * @param {object} options - Additional script options
 */
function loadConsentScript(src, consentType, options = {}) {
    // Check if consent system is loaded
    if (!window.cookieConsent) {
        console.warn('Cookie consent system not loaded');
        return;
    }

    // Essential cookies are always allowed
    if (consentType === 'essential' || window.cookieConsent.isAllowed(consentType)) {
        const script = document.createElement('script');
        script.src = src;
        
        // Apply any additional options
        Object.keys(options).forEach(key => {
            script[key] = options[key];
        });
        
        document.head.appendChild(script);
        console.log(`Loaded ${consentType} script: ${src}`);
    } else {
        console.log(`Blocked ${consentType} script: ${src} (no consent)`);
    }
}

/**
 * Load Google Analytics only if analytics consent is given
 * @param {string} measurementId - GA4 Measurement ID
 */
function loadGoogleAnalytics(measurementId) {
    if (!window.cookieConsent || !window.cookieConsent.isAllowed('analytics')) {
        console.log('Google Analytics blocked - no analytics consent');
        return;
    }

    // Load gtag script
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(gtagScript);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', measurementId, {
        anonymize_ip: true,
        cookie_flags: 'SameSite=Strict;Secure'
    });

    window.gtag = gtag;
    console.log('Google Analytics loaded with consent');
}

/**
 * Load Facebook Pixel only if marketing consent is given
 * @param {string} pixelId - Facebook Pixel ID
 */
function loadFacebookPixel(pixelId) {
    if (!window.cookieConsent || !window.cookieConsent.isAllowed('marketing')) {
        console.log('Facebook Pixel blocked - no marketing consent');
        return;
    }

    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');

    fbq('init', pixelId);
    fbq('track', 'PageView');
    console.log('Facebook Pixel loaded with consent');
}

/**
 * Load any third-party service based on consent
 * @param {function} loadFunction - Function that loads the service
 * @param {string} consentType - Type of consent required
 * @param {string} serviceName - Name of the service for logging
 */
function loadWithConsent(loadFunction, consentType, serviceName) {
    if (!window.cookieConsent) {
        // Listen for consent system to load
        document.addEventListener('cookieConsentUpdated', () => {
            if (window.cookieConsent.isAllowed(consentType)) {
                loadFunction();
                console.log(`${serviceName} loaded with consent`);
            }
        });
        return;
    }

    if (window.cookieConsent.isAllowed(consentType)) {
        loadFunction();
        console.log(`${serviceName} loaded with consent`);
    } else {
        console.log(`${serviceName} blocked - no ${consentType} consent`);
    }
}

// Listen for consent changes and apply them
document.addEventListener('cookieConsentUpdated', (event) => {
    const consent = event.detail;
    console.log('Cookie consent updated:', consent);
    
    // You can reload scripts here if consent is granted
    // For example, if analytics consent is newly granted:
    if (consent.analytics && !window.gtag) {
        // Load Google Analytics if not already loaded
        // loadGoogleAnalytics('YOUR_GA_MEASUREMENT_ID');
    }
});

// Make functions globally available
window.loadConsentScript = loadConsentScript;
window.loadGoogleAnalytics = loadGoogleAnalytics;
window.loadFacebookPixel = loadFacebookPixel;
window.loadWithConsent = loadWithConsent;
