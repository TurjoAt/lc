const express = require('express');
const rateLimit = require('express-rate-limit');
const messageController = require('../controllers/messageController');

const router = express.Router();

const widgetLimiter = rateLimit({
  windowMs: 30 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

router.get('/messages/:sessionId', widgetLimiter, messageController.getConversationPublic);

module.exports = router;
