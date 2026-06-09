const express = require('express');
const router = express.Router();
const { chatWithAI, clearChatHistory } = require('../controllers/chatController');

// @route   POST /api/ai/chat
// @desc    Chat with AI Mentor
// @access  Public
router.post('/chat', chatWithAI);

// @route   POST /api/ai/clear
// @desc    Clear chat history
// @access  Public
router.post('/clear', clearChatHistory);

module.exports = router;
