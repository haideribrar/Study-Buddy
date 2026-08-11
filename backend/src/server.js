const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const supabaseService = require('./services/supabaseService');
const pushService = require('./services/pushService');

// Import routers
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();

// Middlewares
app.use(cors()); // Allow requests from React Native apps
app.use(express.json()); // Body parser

// Basic Health Check & Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'StudyBuddy API Server is running!',
    status: 'ok',
    health: '/health'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    configured: config.isConfigured()
  });
});


// Register API Routers
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/events', eventRoutes);


// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`=========================================`);
    console.log(` StudyBuddy Backend Service Started      `);
    console.log(` Port: ${config.port}                     `);
    console.log(` Health Check: http://localhost:${config.port}/health `);
    console.log(` Configuration Loaded: ${config.isConfigured() ? 'SUCCESS' : 'WARNING (Using templates)'} `);
    console.log(`=========================================`);
  });
}

function parseEventDate(dateStr) {
  if (!dateStr) return null;
  if (typeof dateStr === 'string' && dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
  } else if (typeof dateStr === 'string' && dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

const checkAndSendPushReminders = async () => {
  try {
    const dueEvents = await supabaseService.getDueReminders();
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (const event of dueEvents) {
      const eventDate = parseEventDate(event.date);
      if (!eventDate) {
        await supabaseService.markReminderSent(event.id);
        continue;
      }

      const eventMidnight = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      const diffDays = Math.round((eventMidnight - todayMidnight) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        await supabaseService.markReminderSent(event.id);
        continue;
      }

      // Check if event is today (0) or tomorrow (1)
      if (diffDays === 0 || diffDays === 1) {
        if (event.subscription) {
          const isExam = event.category?.toLowerCase() === 'exam' || event.title?.toLowerCase().includes('exam');
          const categoryName = isExam ? 'Exam 📚' : `${event.category || 'Event'} 📅`;
          const dayName = diffDays === 0 ? 'today' : 'tomorrow';

          const payload = {
            title: `Upcoming ${categoryName} ${dayName === 'today' ? 'Today' : 'Tomorrow'}!`,
            body: `Reminder: You have "${event.title}" scheduled for ${dayName}. Time to study!`,
            data: { eventId: event.id }
          };

          const res = await pushService.sendNotification(event.subscription, payload);
          if (res && res.expired) {
            await supabaseService.supabaseAdmin
              .from('profiles')
              .update({ web_push_subscription: null })
              .eq('id', event.userId);
            console.log(`[Scheduler] Cleared expired web push subscription for user ${event.userId}`);
          }
        }
        await supabaseService.markReminderSent(event.id);
        console.log(`[Scheduler] Sent web push reminder for event: "${event.title}"`);
      }
    }
  } catch (err) {
    console.error('[Scheduler Error] checkAndSendPushReminders failed:', err.message);
  }
};

// Run check scheduler every 10 minutes
setInterval(checkAndSendPushReminders, 10 * 60 * 1000);
// Trigger check on startup after a small delay
setTimeout(checkAndSendPushReminders, 10 * 1000);

module.exports = app;

