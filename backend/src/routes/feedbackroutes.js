const express = require('express');
const { authenticate } = require('../middleware/authmiddleware');

const {
  getMyTeam,
  getPendingFeedbacks,
  submitFeedback,
  getMyFeedbackHistory
} = require('../controllers/feedbackcontroller');

const router = express.Router();

// Every feedback route requires a logged-in user. The old version left
// these completely unauthenticated.
router.use(authenticate);

router.get('/team', getMyTeam);
router.get('/pending', getPendingFeedbacks);
router.post('/submit', submitFeedback);
router.get('/history', getMyFeedbackHistory);

module.exports = router;
