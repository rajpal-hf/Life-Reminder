const express = require('express');
const router = express.Router();
const { verifyPhone, getUsers } = require('../controllers/userController');

router.post('/verify-phone', verifyPhone);

module.exports = router;
