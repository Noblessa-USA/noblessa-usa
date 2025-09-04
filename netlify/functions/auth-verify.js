const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {

  console.log('1 Hello');
  const authHeader = event.headers.authorization || event.headers.cookie;
  
  if (!authHeader) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'No authentication token provided' }),
    };
  }

  console.log('2');

  try {
    let token;
    console.log('2.1');

    // Extract token from cookie
    if (authHeader.includes('auth-token=')) {
      console.log('2.2');
      token = authHeader.split('auth-token=')[1].split(';')[0];
      console.log('2.3');
    } else {
      console.log('2.4');
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'No valid authentication token found' }),
      };
    }

    console.log('3');

    // Verify the token
    const decoded = jwt.verify(token, process.env.AUTH0_CLIENT_SECRET);

    console.log('4');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authenticated: true,
        user: {
          sub: decoded.sub,
          email: decoded.email,
          name: decoded.name,
          organization: decoded.organization,
        },
      }),
    };
  } catch (error) {
    console.log('5');
    return {
      statusCode: 401,
      body: JSON.stringify({ 
        authenticated: false,
        error: 'Invalid or expired token' 
      }),
    };
  }
};
