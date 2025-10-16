const express = require('express');
const auth = require('../middleware/auth');
const sessionController = require('../controllers/sessionController');

const router = express.Router();

router.get('/', auth, sessionController.listSessions);
router.patch('/:sessionId/close', auth, sessionController.closeSession);

module.exports = router;
