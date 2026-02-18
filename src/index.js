const express = require('express');
const dotenv = require('dotenv').config();
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const { startCronJobs } = require('./jobs/dailyReminderJob');
const logger = require('./utils/logger');

const port = process.env.PORT || 3000;

connectDB().then(() => {
    // Start cron jobs after DB is connected
    startCronJobs();
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use('/api/users', userRoutes);
app.use('/api/reminders', reminderRoutes);


app.get('/', (req, res) => {
    res.send('Life Reminder API is running...');
});

app.listen(port, () => logger.info('Server', `Started on port ${port}`));
