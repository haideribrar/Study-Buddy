const webpush = require('web-push');
const config = require('../config/config');

// Initialize Web Push with VAPID details
if (config.vapidPublicKey && config.vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:support@studybuddy.com',
    config.vapidPublicKey,
    config.vapidPrivateKey
  );
  console.log('[PushService] Web Push VAPID details configured successfully.');
} else {
  console.warn('[PushService Warning] VAPID keys not configured in config.js. Web push notifications will be disabled.');
}

/**
 * Send a push notification to a user subscription
 * @param {Object} subscription - Web Push subscription object from client
 * @param {Object} payload - Notification payload (title, body, etc.)
 */
const sendNotification = async (subscription, payload) => {
  if (!config.vapidPublicKey || !config.vapidPrivateKey) {
    throw new Error('VAPID keys not configured');
  }

  try {
    const payloadStr = JSON.stringify(payload);
    const result = await webpush.sendNotification(subscription, payloadStr);
    return result;
  } catch (error) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.log('[PushService] Subscription expired or unsubscribed (status 410/404).');
      return { expired: true };
    }
    console.error('[PushService] Failed to send push notification:', error.message);
    throw error;
  }
};

module.exports = {
  sendNotification
};
