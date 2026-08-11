const express = require('express');
const router = express.Router();
const supabaseService = require('../services/supabaseService');
const requireAuth = require('../middleware/auth');

/**
 * @route   POST /api/auth/signup
 * @desc    Registers a new student and sets up profile
 */
router.post('/signup', async (req, res) => {
  const { email, password, fullName, resetHint } = req.body;

  if (!email || !password || !fullName || !resetHint) {
    return res.status(400).json({ error: 'Please enter all fields: email, password, fullName, and resetHint.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  try {
    const { user } = await supabaseService.signUpUser(email, password, fullName, resetHint);
    return res.status(201).json({
      message: 'Signup successful! Welcome to StudyBuddy.',
      userId: user.id
    });
  } catch (error) {
    console.error('[Auth Route] Signup error:', error.message);
    return res.status(400).json({ error: error.message });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticates student and returns JWT session
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter both email and password.' });
  }

  try {
    const { session, user } = await supabaseService.signInUser(email, password);
    
    // Retrieve profile to fetch student's full name (prioritize Supabase user metadata display name)
    let fullName = 'Student';
    if (user.user_metadata && user.user_metadata.display_name) {
      fullName = user.user_metadata.display_name;
    } else {
      try {
        const profile = await supabaseService.getUserProfile(user.id, session.access_token);
        if (profile && profile.full_name) {
          fullName = profile.full_name;
        }
      } catch (profileErr) {
        console.warn('[Auth Route] Profile fetch warning during login:', profileErr.message);
      }
    }

    return res.status(200).json({
      message: 'Login successful.',
      token: session.access_token,
      user: {
        id: user.id,
        email: user.email,
        fullName
      }
    });
  } catch (error) {
    console.error('[Auth Route] Login error:', error.message);
    // Determine if the username exists in our profiles DB
    const emailExists = await supabaseService.checkEmailExists(email);
    return res.status(401).json({ 
      error: emailExists ? 'Incorrect password.' : 'User not found.',
      emailExists
    });
  }
});

/**
 * @route   GET /api/auth/profile
 * @desc    Gets user profile details
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const profile = await supabaseService.getUserProfile(req.user.id, req.token);
    return res.status(200).json(profile);
  } catch (error) {
    console.error('[Auth Route] Get Profile error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Updates user profile name
 */
router.put('/profile', requireAuth, async (req, res) => {
  const { fullName } = req.body;

  if (!fullName || !fullName.trim()) {
    return res.status(400).json({ error: 'Full name is required.' });
  }

  try {
    const profile = await supabaseService.updateUserProfile(req.user.id, fullName, req.token);
    return res.status(200).json({
      message: 'Profile updated successfully.',
      profile
    });
  } catch (error) {
    console.error('[Auth Route] Update Profile error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Resets student password using reset hint verification
 */
router.post('/reset-password', async (req, res) => {
  const { email, hint, newPassword } = req.body;

  if (!email || !hint || !newPassword) {
    return res.status(400).json({ error: 'Please enter all fields: email, hint, and newPassword.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
  }

  try {
    await supabaseService.resetPasswordWithHint(email, hint, newPassword);
    return res.status(200).json({
      message: 'Password reset successful! You can now log in with your new password.'
    });
  } catch (error) {
    console.error('[Auth Route] Reset Password error:', error.message);
    return res.status(400).json({ error: error.message });
  }
});

/**
 * @route   POST /api/auth/web-push-subscription
 * @desc    Updates user web push subscription details
 */
router.post('/web-push-subscription', requireAuth, async (req, res) => {
  const { subscription } = req.body;

  try {
    await supabaseService.updatePushSubscription(req.user.id, subscription, req.token);
    return res.status(200).json({
      message: 'Web Push subscription updated successfully.'
    });
  } catch (error) {
    console.error('[Auth Route] Web Push Subscription update error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
