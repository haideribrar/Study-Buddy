import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

// Configure default notification handler for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request permission to send push/local notifications
 */
export async function requestNotificationPermissions() {
  if (Platform.OS === 'web') return false;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[NotificationService] Permission not granted for notifications');
      return false;
    }
    return true;
  } catch (error) {
    console.warn('[NotificationService] Error requesting permissions:', error);
    return false;
  }
}

/**
 * Parses DD/MM/YYYY or YYYY-MM-DD date string into a Date object
 */
function parseEventDate(dateStr) {
  if (!dateStr) return null;
  
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day, 9, 0, 0); // Default to 9:00 AM on event day
    }
  } else if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day, 9, 0, 0);
    }
  }
  
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Schedule a local notification 1 day prior to the event at 9:00 AM
 */
export async function scheduleEventReminder(event) {
  if (Platform.OS === 'web') return null;

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    const eventDate = parseEventDate(event.date);
    if (!eventDate) return null;

    // Calculate 1 day prior (24 hours before event time)
    const reminderDate = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);
    const now = new Date();

    // If 1 day prior has already passed, schedule 1 hour from now for testing/immediate reminder
    const triggerDate = reminderDate > now ? reminderDate : new Date(now.getTime() + 60 * 1000);

    const isExam = event.category?.toLowerCase() === 'exam' || event.title?.toLowerCase().includes('exam');
    const categoryName = isExam ? 'Exam 📚' : `${event.category || 'Event'} 📅`;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Upcoming ${categoryName} Tomorrow!`,
        body: `Reminder: You have "${event.title}" scheduled for tomorrow. Time to review your notes!`,
        sound: true,
        data: { eventId: event.id, title: event.title },
      },
      trigger: {
        seconds: Math.max(1, Math.round((triggerDate.getTime() - Date.now()) / 1000)),
      },
    });

    console.log(`[NotificationService] Scheduled reminder for "${event.title}" at ${triggerDate.toLocaleString()} (ID: ${notificationId})`);
    return notificationId;
  } catch (error) {
    console.warn('[NotificationService] Failed to schedule notification:', error);
    return null;
  }
}

/**
 * Cancel a previously scheduled notification by ID
 */
export async function cancelEventReminder(notificationId) {
  if (!notificationId || Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`[NotificationService] Cancelled notification ID: ${notificationId}`);
  } catch (error) {
    console.warn('[NotificationService] Failed to cancel notification:', error);
  }
}
