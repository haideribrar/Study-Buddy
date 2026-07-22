const express = require('express');
const router = express.Router();
const supabaseService = require('../services/supabaseService');
const requireAuth = require('../middleware/auth');

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
