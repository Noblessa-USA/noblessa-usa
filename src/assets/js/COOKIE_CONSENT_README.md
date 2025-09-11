# Cookie Consent Implementation Guide

## Overview
This cookie consent system provides GDPR-compliant cookie management with Global Privacy Control (GPC) detection and granular consent categories.

## Features
- ✅ Responsive cookie banner
- ✅ Granular consent management (Essential, Analytics, Marketing)
- ✅ Global Privacy Control (GPC) detection
- ✅ localStorage consent storage (30-day expiry)
- ✅ Script blocking until consent is given
- ✅ Accessibility compliant
- ✅ Mobile-responsive design

## Files Added
1. `/assets/js/cookie-consent.js` - Main consent management system
2. `/assets/css/cookie-consent.css` - Styles for banner and modal
3. `/assets/js/cookie-utils.js` - Utility functions for loading scripts
4. `/assets/js/tracking-services.js` - Example implementations

## Quick Start

### 1. Basic Implementation
The system is automatically initialized when the page loads. No additional code is required for basic functionality.

### 2. Loading Analytics/Marketing Scripts
```javascript
// Example: Load Google Analytics only with consent
loadWithConsent(() => {
    loadGoogleAnalytics('GA_MEASUREMENT_ID');
}, 'analytics', 'Google Analytics');

// Example: Load Facebook Pixel only with consent
loadWithConsent(() => {
    loadFacebookPixel('YOUR_PIXEL_ID');
}, 'marketing', 'Facebook Pixel');
```

### 3. Check Consent Status
```javascript
// Check if specific consent type is given
if (window.cookieConsent.isAllowed('analytics')) {
    // Load analytics code
}

if (window.cookieConsent.isAllowed('marketing')) {
    // Load marketing code
}
```

### 4. Listen for Consent Changes
```javascript
document.addEventListener('cookieConsentUpdated', (event) => {
    const consent = event.detail;
    console.log('Consent updated:', consent);
    
    if (consent.analytics) {
        // User granted analytics consent
    }
    
    if (consent.marketing) {
        // User granted marketing consent
    }
});
```

## Cookie Categories

### Essential Cookies
- Always enabled
- Required for website functionality
- Cannot be disabled by users

### Analytics Cookies
- Used for website analytics and performance monitoring
- Examples: Google Analytics, Hotjar, custom analytics
- Can be disabled by users

### Marketing Cookies
- Used for advertising and marketing purposes
- Examples: Facebook Pixel, Google Ads, retargeting pixels
- Can be disabled by users

## Global Privacy Control (GPC)
The system automatically detects GPC signals and:
- Defaults to rejecting non-essential cookies
- Shows appropriate messaging in the banner
- Respects user's privacy preferences

## Customization

### Styling
Edit `/assets/css/cookie-consent.css` to match your brand:
- Colors: Update CSS custom properties
- Fonts: Modify font-family declarations
- Layout: Adjust spacing and positioning

### Content
Edit the banner text in `/assets/js/cookie-consent.js`:
```javascript
banner.innerHTML = `
    <div class="cookie-banner-content">
        <div class="cookie-banner-text">
            <h3>Your Custom Title</h3>
            <p>Your custom message here...</p>
        </div>
        // ... rest of banner HTML
    </div>
`;
```

### Additional Cookie Categories
To add new categories:
1. Update the modal HTML in `createManageModal()`
2. Add the category to consent object in save methods
3. Create corresponding enable/disable methods

## API Reference

### Main Class: `CookieConsent`
- `isAllowed(type)` - Check if cookie type is allowed
- `showSettings()` - Show the manage cookies modal
- `acceptAllCookies()` - Accept all cookies programmatically
- `rejectAllCookies()` - Reject non-essential cookies programmatically

### Utility Functions
- `loadConsentScript(src, consentType, options)` - Load script with consent check
- `loadGoogleAnalytics(measurementId)` - Load GA4 with consent
- `loadFacebookPixel(pixelId)` - Load Facebook Pixel with consent
- `loadWithConsent(loadFunction, consentType, serviceName)` - Generic consent loader

## Browser Support
- Modern browsers (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- Mobile browsers (iOS Safari 12+, Chrome Mobile 60+)
- Graceful degradation for older browsers

## GDPR Compliance Notes
- Users can withdraw consent at any time
- Consent is granular (by category)
- No cookies are set before consent (except essential)
- Clear information about cookie purposes
- Easy access to privacy controls

## Testing
1. Clear localStorage and refresh to see banner
2. Test with GPC enabled browser/extension
3. Verify scripts only load with appropriate consent
4. Test on various screen sizes for responsiveness
5. Test keyboard navigation and screen readers

## Maintenance
- Review and update cookie categories as needed
- Update consent storage duration if required (currently 30 days)
- Monitor browser console for any consent-related logs
- Regularly audit third-party scripts for compliance
