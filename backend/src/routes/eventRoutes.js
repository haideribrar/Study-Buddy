const express = require('express');
const router = express.Router();
const supabaseService = require('../services/supabaseService');
const requireAuth = require('../middleware/auth');
const pushService = require('../services/pushService');

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

// Protect all event routes with auth middleware
router.use(requireAuth);

/**
 * @route   GET /api/events
 * @desc    Fetch all events for the logged-in student
 */
router.get('/', async (req, res) => {
  try {
    const events = await supabaseService.getUserEvents(req.user.id, req.token);
    return res.status(200).json(events);
  } catch (error) {
    console.error('[Event Route] Fetch events error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/events
 * @desc    Create a new study event for the student
 */
router.post('/', async (req, res) => {
  const { title, date, category } = req.body;
  
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Event title is required.' });
  }
  if (!date || !date.trim()) {
    return res.status(400).json({ error: 'Event date is required.' });
  }
  if (!category || !category.trim()) {
    return res.status(400).json({ error: 'Event category is required.' });
  }

  try {
    const newEvent = await supabaseService.createUserEvent(req.user.id, req.body, req.token);
    
    // Instantly check if reminder is due for Today or Tomorrow (5s delay as requested)
    const eventDate = parseEventDate(newEvent.date);
    if (eventDate) {
      const now = new Date();
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const eventMidnight = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      const diffDays = Math.round((eventMidnight - todayMidnight) / (1000 * 60 * 60 * 24));

      if (diffDays === 0 || diffDays === 1) {
        try {
          const profile = await supabaseService.getUserProfile(req.user.id, req.token);
          if (profile && profile.web_push_subscription) {
            const isExam = newEvent.category?.toLowerCase() === 'exam' || newEvent.title?.toLowerCase().includes('exam');
            const categoryName = isExam ? 'Exam 📚' : `${newEvent.category || 'Event'} 📅`;
            const dayName = diffDays === 0 ? 'today' : 'tomorrow';

            const payload = {
              title: `Upcoming ${categoryName} ${dayName === 'today' ? 'Today' : 'Tomorrow'}!`,
              body: `Reminder: You have "${newEvent.title}" scheduled for ${dayName}. Time to study!`,
              data: { eventId: newEvent.id }
            };

            await pushService.sendNotification(profile.web_push_subscription, payload);
            await supabaseService.markReminderSent(newEvent.id);
            console.log(`[Event Route] Instant push reminder sent synchronously for event: "${newEvent.title}"`);
          }
        } catch (pushErr) {
          console.error('[Event Route] Failed to send instant push:', pushErr.message);
        }
      }
    }

    return res.status(201).json(newEvent);
  } catch (error) {
    console.error('[Event Route] Create event error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/events/:id
 * @desc    Update progress or subtasks of a study event
 */
router.put('/:id', async (req, res) => {
  try {
    const updatedEvent = await supabaseService.updateUserEvent(req.user.id, req.params.id, req.body, req.token);
    return res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('[Event Route] Update event error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete a study event
 */
router.delete('/:id', async (req, res) => {
  try {
    await supabaseService.deleteUserEvent(req.user.id, req.params.id, req.token);
    return res.status(200).json({ message: 'Event deleted successfully.' });
  } catch (error) {
    console.error('[Event Route] Delete event error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
