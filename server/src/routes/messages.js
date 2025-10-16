const express = require('express');
const auth = require('../middleware/auth');
const messageController = require('../controllers/messageController');

const router = express.Router();

router.get('/:sessionId', auth, messageController.getConversation);
router.get('/', auth, messageController.searchMessages);

module.exports = router;
