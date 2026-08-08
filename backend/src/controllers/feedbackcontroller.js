const FeedbackAssignment = require('../models/FeedbackAssignment');
const FeedbackSubmission = require('../models/FeedbackSubmission');
const User = require('../models/User');
const PARAMETERS = require('../config/parameters');

// GET /api/feedback/team
// Everyone who reports directly to the logged-in user, if anyone does.
// Used by the frontend to decide whether to show a "give feedback" tab
// at all (e.g. an individual contributor with no reports won't see one).
const getMyTeam = async (req, res) => {
  try {
    const reports = await User.find({ managerId: req.user._id }).select(
      'name email role'
    );

    return res.status(200).json(reports);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch team' });
  }
};

// GET /api/feedback/pending
// Assignments where the logged-in user is the manager and feedback is
// still owed. Scoped implicitly to the user's own company since managerId
// already ties an assignment to one company.
const getPendingFeedbacks = async (req, res) => {
  try {
    const pending = await FeedbackAssignment.find({
      managerId: req.user._id,
      status: 'pending'
    })
      .populate('employeeId', 'name email')
      .populate('cycleId', 'month year')
      .sort({ createdAt: 1 });

    return res.status(200).json(pending);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Failed to fetch pending feedbacks' });
  }
};

// POST /api/feedback/submit
const submitFeedback = async (req, res) => {
  try {
    const { assignmentId, ratings, comment } = req.body;

    if (!Array.isArray(ratings) || ratings.length !== PARAMETERS.length) {
      return res.status(400).json({
        message: `Ratings must cover all ${PARAMETERS.length} parameters`
      });
    }

    for (const r of ratings) {
      if (!PARAMETERS.includes(r.parameterName)) {
        return res
          .status(400)
          .json({ message: `Unknown parameter: ${r.parameterName}` });
      }
      if (!r.score || r.score < 1 || r.score > 5) {
        return res
          .status(400)
          .json({ message: 'Score must be between 1 and 5' });
      }
      if (!r.reason || !r.reason.trim()) {
        return res
          .status(400)
          .json({ message: 'A reason is required for every score' });
      }
    }

    const assignment = await FeedbackAssignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        message: 'Assignment not found'
      });
    }

    // Authorization: only the manager this assignment belongs to can
    // submit it. Without this check, any logged-in user could submit
    // feedback on behalf of someone else just by guessing an assignmentId.
    if (assignment.managerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'You are not authorized to submit this feedback'
      });
    }

    if (assignment.status === 'submitted') {
      return res.status(409).json({
        message: 'Feedback has already been submitted for this assignment'
      });
    }

    await FeedbackSubmission.create({
      companyId: assignment.companyId,
      cycleId: assignment.cycleId,
      managerId: assignment.managerId,
      employeeId: assignment.employeeId,
      ratings,
      comment
    });

    assignment.status = 'submitted';
    assignment.submittedAt = new Date();

    await assignment.save();

    return res.status(201).json({
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to submit feedback'
    });
  }
};

// GET /api/feedback/history
// The logged-in user's own received feedback, across all cycles. Scoped to
// req.user._id only — nobody can pull another employee's history by
// swapping an id in the URL (that was an IDOR in the original version).
const getMyFeedbackHistory = async (req, res) => {
  try {
    const history = await FeedbackSubmission.find({
      employeeId: req.user._id
    })
      .populate('managerId', 'name email')
      .populate('cycleId', 'month year')
      .sort({ createdAt: -1 });

    return res.status(200).json(history);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to fetch feedback history'
    });
  }
};

module.exports = {
  getMyTeam,
  getPendingFeedbacks,
  submitFeedback,
  getMyFeedbackHistory
};
