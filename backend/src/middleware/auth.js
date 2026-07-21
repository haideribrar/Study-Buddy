const { getSupabaseUserClient } = require('../services/supabaseService');

/**
 * Express middleware to enforce auth using Supabase user JWT.
 * It verifies the user session and mounts the user and token context onto the request object.
 */
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No Bearer token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Create client in user context to verify token
    const userClient = getSupabaseUserClient(token);
    const { data: { user }, error } = await userClient.auth.getUser();

    if (error || !user) {
      return res.status(401).json({ error: 'Session expired or token is invalid.' });
    }

    // Attach user and token context to request
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    console.error('[Auth Middleware] Error verifying token:', err.message);
    return res.status(401).json({ error: 'Authentication failed.' });
  }
};

module.exports = requireAuth;
