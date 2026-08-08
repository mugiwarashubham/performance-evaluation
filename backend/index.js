require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const connectDB = require('./src/config/db');
const redisClient = require('./src/config/redis');

const authRouter = require('./src/routes/authroutes');
const feedbackRoutes = require('./src/routes/feedbackroutes');
const hrRouter = require('./src/routes/hrroutes');

const app = express();

// Database + Redis connect
connectDB();
redisClient
  .connect()
  .then(() => console.log('Redis connected'))
  .catch((err) => console.error('Redis connection failed:', err.message));

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());

// Test route
app.get('/', (req, res) => {
  res.send('Performance Evaluation API running');
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/hr', hrRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
