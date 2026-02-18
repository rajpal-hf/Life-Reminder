
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
    createReminder,
    getReminder,
    updateReminder,
    deleteReminder,
    getAllReminders,
} = require('../controllers/reminderController');

// All routes require authentication
router.use(protect);

router.post('/', createReminder);
router.get('/', getAllReminders);
router.get('/:id', getReminder);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);

module.exports = router;
