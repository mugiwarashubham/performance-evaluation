const express = require('express');
const { authenticate, authorize } = require('../middleware/authmiddleware');
const {
  getCycles,
  getPendingSubmissions,
  getSubmissionSummary
} = require('../controllers/hrcontroller');

const hrRouter = express.Router();

hrRouter.use(authenticate, authorize('hr'));

hrRouter.get('/cycles', getCycles);
hrRouter.get('/pending/:cycleId', getPendingSubmissions);
hrRouter.get('/summary/:cycleId', getSubmissionSummary);

module.exports = hrRouter;
