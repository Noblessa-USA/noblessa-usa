// Authentication management
class AuthManager {
    constructor() {
        console.log('AuthManager constructor called');
        this.init();
    }

    init() {
        console.log('AuthManager init() called');
        
        // Check for invitation parameters and auto-redirect if present
        // Do this BEFORE checking auth status to avoid conflicts
        if (this.handleInvitationFlow()) {
            console.log('Invitation flow handled, stopping init');
            return; // Stop here if we're handling an invitation
        }
        
        console.log('No invitation found, continuing with normal init');
        
        // Check if user is already logged in
        this.checkAuthStatus();
        
        // Set up login button if it exists
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            console.log('Login button found, attaching event listener');
            loginBtn.addEventListener('click', () => this.login());
        } else {
            console.log('No login button found');
        }

        // Set up logout button if it exists
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Check for URL parameters indicating auth errors
        this.handleUrlErrors();
    }

    handleInvitationFlow() {
        // Check if we're on the login page with invitation parameters
        console.log('Checking invitation flow, current path:', window.location.pathname);
        console.log('Current search params:', window.location.search);
        
        if (window.location.pathname === '/login/') {
            const urlParams = new URLSearchParams(window.location.search);
            const invitation = urlParams.get('invitation');
            
            console.log('Invitation token found:', invitation);
            
            if (invitation) {
                console.log('Auto-triggering login with invitation parameters');
                // Auto-trigger login with invitation parameters
                this.login();
                return true; // Indicate that we handled an invitation
            }
        }
        return false; // No invitation to handle
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('/.netlify/functions/auth-verify', {
                method: 'GET',
                credentials: 'include',
            });

            const data = await response.json();
            
            if (data.authenticated) {
                this.handleAuthenticatedUser(data.user);
            } else {
                this.handleUnauthenticatedUser();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.handleUnauthenticatedUser();
        }
    }

    handleAuthenticatedUser(user) {
        // Update UI for authenticated user
        const userInfo = document.getElementById('user-info');
        if (userInfo) {
            userInfo.innerHTML = `
                <span>Hello, ${user.name}</span>
                <button id="logout-btn" class="cs-button-solid">Logout</button>
            `;
            
            // Re-attach logout event listener
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => this.logout());
            }
        }

        // Redirect if on login page
        if (window.location.pathname === '/login/') {
            window.location.href = '/partner-resources/';
        }

        // Show protected content
        const protectedContent = document.querySelectorAll('.protected-content');
        protectedContent.forEach(element => {
            element.style.display = 'block';
        });

        // Hide login prompts
        const loginPrompts = document.querySelectorAll('.login-prompt');
        loginPrompts.forEach(element => {
            element.style.display = 'none';
        });
    }

    handleUnauthenticatedUser() {
        // Check if we're on a protected page
        const protectedPages = ['/partner-resources/', '/partner-directory/'];
        const currentPath = window.location.pathname;
        
        if (protectedPages.includes(currentPath)) {
            // Redirect to login
            window.location.href = '/login/';
            return;
        }

        // Hide protected content
        const protectedContent = document.querySelectorAll('.protected-content');
        protectedContent.forEach(element => {
            element.style.display = 'none';
        });

        // Show login prompts
        const loginPrompts = document.querySelectorAll('.login-prompt');
        loginPrompts.forEach(element => {
            element.style.display = 'block';
        });

        // Update user info area
        const userInfo = document.getElementById('user-info');
        if (userInfo) {
            userInfo.innerHTML = `
                <a href="/login/" class="cs-hidden cs-button-solid">Login</a>
            `;
        }
    }

    async login() {
        console.log('Login function called');
        const loadingEl = document.getElementById('loading');
        const errorEl = document.getElementById('error');
        
        if (loadingEl) loadingEl.style.display = 'block';
        if (errorEl) errorEl.style.display = 'none';

        try {
            // Check for invitation parameters in the current URL
            const urlParams = new URLSearchParams(window.location.search);
            const invitation = urlParams.get('invitation');
            const organization = urlParams.get('organization');
            const organizationName = urlParams.get('organization_name');
            const loginHint = urlParams.get('login_hint');
            
            console.log('Login parameters:', { invitation, organization, organizationName, loginHint });
            
            // Build the auth-login URL with invitation parameters if present
            let authUrl = '/.netlify/functions/auth-login';
            const authParams = new URLSearchParams();
            
            if (invitation) {
                authParams.append('invitation', invitation);
            }
            if (organization) {
                authParams.append('organization', organization);
            }
            if (organizationName) {
                authParams.append('organization_name', organizationName);
            }
            if (loginHint) {
                authParams.append('login_hint', loginHint);
            }
            
            if (authParams.toString()) {
                authUrl += '?' + authParams.toString();
            }
            
            console.log('Redirecting to:', authUrl);
            
            // Redirect to Auth0 login
            window.location.href = authUrl;
        } catch (error) {
            console.error('Login failed:', error);
            if (loadingEl) loadingEl.style.display = 'none';
            if (errorEl) {
                errorEl.style.display = 'block';
                errorEl.querySelector('.cs-error-text').textContent = 'Login failed. Please try again.';
            }
        }
    }

    async logout() {
        try {
            const response = await fetch('/.netlify/functions/auth-logout', {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                // Redirect to home page
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Logout failed:', error);
            // Force redirect anyway
            window.location.href = '/';
        }
    }

    handleUrlErrors() {
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        
        if (error && window.location.pathname === '/login/') {
            const errorEl = document.getElementById('error');
            if (errorEl) {
                let errorMessage = 'An error occurred during login.';
                
                switch (error) {
                    case 'auth_failed':
                        errorMessage = 'Authentication failed. Please try again.';
                        break;
                    case 'no_code':
                        errorMessage = 'Authorization code not received. Please try again.';
                        break;
                    default:
                        errorMessage = 'An error occurred during login. Please try again.';
                }
                
                errorEl.style.display = 'block';
                errorEl.querySelector('.cs-error-text').textContent = errorMessage;
            }
        }
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing AuthManager');
    try {
        new AuthManager();
    } catch (error) {
        console.error('Error initializing AuthManager:', error);
    }
});

// Also try immediate initialization in case DOM is already loaded
if (document.readyState === 'loading') {
    console.log('Document still loading, waiting for DOMContentLoaded');
} else {
    console.log('Document already loaded, initializing AuthManager immediately');
    try {
        new AuthManager();
    } catch (error) {
        console.error('Error initializing AuthManager immediately:', error);
    }
}
