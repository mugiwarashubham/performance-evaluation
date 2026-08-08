const mongoose = require('mongoose');

// One row per (manager, employee, cycle). Generated when a cycle opens,
// based on the reporting hierarchy (managerId) at that moment — so a later
// change in reporting lines doesn't rewrite history for past cycles.
const feedbackAssignmentSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },

    cycleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeedbackCycle',
      required: true
    },

    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    status: {
      type: String,
      enum: ['pending', 'submitted'],
      default: 'pending'
    },

    submittedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

feedbackAssignmentSchema.index(
  { cycleId: 1, managerId: 1, employeeId: 1 },
  { unique: true }
);
feedbackAssignmentSchema.index({ managerId: 1, status: 1 });
feedbackAssignmentSchema.index({ companyId: 1, cycleId: 1, status: 1 });

const FeedbackAssignment =
  mongoose.models.FeedbackAssignment ||
  mongoose.model('FeedbackAssignment', feedbackAssignmentSchema);

module.exports = FeedbackAssignment;
