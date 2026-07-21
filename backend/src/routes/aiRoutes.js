const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const supabaseService = require('../services/supabaseService');
const requireAuth = require('../middleware/auth');

/**
 * @route   GET /api/ai/history
 * @desc    Retrieves the last 50 chat messages for the authenticated user
 */
router.get('/history', requireAuth, async (req, res) => {
  try {
    const history = await supabaseService.getChatHistory(req.user.id, req.token);
    return res.status(200).json(history);
  } catch (error) {
    console.error('[AI Route] History fetch failed:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/ai/chat
 * @desc    Accepts user prompts/conversation state and returns AI-generated content
 *          with automatic failover handling.
 */
router.post('/chat', requireAuth, async (req, res) => {
  const { messages, systemInstruction } = req.body;

  if (!messages || (Array.isArray(messages) && messages.length === 0)) {
    return res.status(400).json({ error: 'Please provide messages or prompt in body' });
  }

  try {
    // 1. Extract the latest user message text
    let userText = '';
    if (typeof messages === 'string') {
      userText = messages;
    } else if (Array.isArray(messages)) {
      userText = messages[messages.length - 1].content;
    }

    // 2. Save the user's message to the database
    if (userText) {
      await supabaseService.saveChatMessage(req.user.id, 'user', userText, req.token);
    }

    // 3. Generate response using AI Service (with automatic failover)
    const result = await aiService.generateResponse(messages, systemInstruction);
    
    // 4. Save the bot's response to the database
    if (result.text) {
      await supabaseService.saveChatMessage(req.user.id, 'bot', result.text, req.token);
    }

    // Result contains { text, provider }
    return res.status(200).json({
      success: true,
      text: result.text,
      provider: result.provider
    });
  } catch (error) {
    console.error('[AI Route] Generation failed:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'AI Generation failed. All providers unavailable.'
    });
  }
});

module.exports = router;

