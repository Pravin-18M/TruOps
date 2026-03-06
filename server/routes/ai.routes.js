'use strict';
const express    = require('express');
const router     = express.Router();
const ai         = require('../controllers/ai.controller');
const { authenticate } = require('../middleware/auth.middleware');

// GET /api/ai/greeting  – no Gemini call, instant greeting text
router.get('/greeting', authenticate, ai.getGreeting);

// POST /api/ai/chat  –  full Gemini conversation
router.post('/chat', authenticate, ai.chatDispatch);

module.exports = router;
