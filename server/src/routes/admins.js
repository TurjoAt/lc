const express = require('express');
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.get('/', auth, adminController.listAdmins);
router.post('/', auth, adminController.createAdmin);
router.patch('/theme', auth, adminController.updateTheme);

module.exports = router;
