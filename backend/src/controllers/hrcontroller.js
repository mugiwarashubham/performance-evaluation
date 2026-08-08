const FeedbackAssignment = require('../models/FeedbackAssignment');
const FeedbackCycle = require('../models/feedback');

// GET /api/hr/cycles
// Lets the HR app populate a cycle picker instead of hardcoding one.
const getCycles = async (req, res) => {
  try {
    const cycles = await FeedbackCycle.find({
      companyId: req.user.companyId
    }).sort({ year: -1, month: -1 });

    return res.status(200).json(cycles);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/hr/pending/:cycleId
// Who still hasn't submitted feedback for their team this cycle.
// Scoped to req.user.companyId so HR at one company can never see another
// company's data even if they know/guess a cycleId.
const getPendingSubmissions = async (req, res) => {
  try {
    const { cycleId } = req.params;

    const pending = await FeedbackAssignment.find({
      companyId: req.user.companyId,
      cycleId,
      status: 'pending'
    })
      .populate('managerId', 'name email')
      .populate('employeeId', 'name email')
      .sort({ createdAt: 1 });

    return res.status(200).json(pending);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/hr/summary/:cycleId
const getSubmissionSummary = async (req, res) => {
  try {
    const { cycleId } = req.params;

    const assignments = await FeedbackAssignment.find({
      companyId: req.user.companyId,
      cycleId
    }).populate('managerId', 'name email');

    const totalAssignments = assignments.length;
    const submitted = assignments.filter(
      (a) => a.status === 'submitted'
    ).length;
    const pending = totalAssignments - submitted;

    const byManager = {};
    for (const a of assignments) {
      if (a.status !== 'pending') continue;
      const key = a.managerId._id.toString();
      if (!byManager[key]) {
        byManager[key] = {
          _id: key,
          name: a.managerId.name,
          email: a.managerId.email,
          pendingCount: 0
        };
      }
      byManager[key].pendingCount += 1;
    }

    return res.status(200).json({
      totalAssignments,
      submitted,
      pending,
      byManager: Object.values(byManager)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCycles,
  getPendingSubmissions,
  getSubmissionSummary
};
