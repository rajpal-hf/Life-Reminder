const express = require('express');
const router = express.Router();
const { verifyPhone } = require('../controllers/userController');

router.post('/', verifyPhone);

module.exports = router;
