const { Handler } = require('@netlify/functions');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Parse query parameters to check for invitation token
  const urlParams = new URLSearchParams(event.rawQuery || '');
  const invitation = urlParams.get('invitation');
  const organizationId = urlParams.get('organization');
  const organizationName = urlParams.get('organization_name');
  const loginHint = urlParams.get('login_hint');

  // Build the Auth0 authorization URL
  let authUrl = `https://${process.env.AUTH0_DOMAIN}/authorize` +
    `?response_type=code` +
    `&client_id=${process.env.AUTH0_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.URL || 'http://localhost:8080')}/.netlify/functions/auth-callback` +
    `&scope=openid%20profile%20email` +
    `&organization=${process.env.AUTH0_ORGANIZATION_ID}` +
    `&state=${Math.random().toString(36).substring(7)}`;

  // Handle invitation flow
  if (invitation) {
    authUrl += `&invitation=${encodeURIComponent(invitation)}`;
    
    // Add organization info if provided
    if (organizationId) {
      authUrl += `&organization=${encodeURIComponent(organizationId)}`;
    }
    
    // Add login hint (email) if provided
    if (loginHint) {
      authUrl += `&login_hint=${encodeURIComponent(loginHint)}`;
    }
    
    // Force signup screen for invitations
    authUrl += `&screen_hint=signup`;
  }

  return {
    statusCode: 302,
    headers: {
      Location: authUrl,
      'Cache-Control': 'no-store',
    },
  };
};
