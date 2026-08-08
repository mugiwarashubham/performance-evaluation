const mongoose = require('mongoose');

// The actual submitted feedback. Ratings snapshot the parameter name at
// submission time (rather than just referencing a parameter id) so that
// history stays readable even if the fixed parameter list ever changes.
const feedbackSubmissionSchema = new mongoose.Schema(
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
    ratings: [
      {
        parameterName: { type: String, required: true },
        score: {
          type: Number,
          min: 1,
          max: 5,
          required: true
        },
        reason: {
          type: String,
          required: true
        }
      }
    ],
    comment: String
  },
  { timestamps: true }
);

feedbackSubmissionSchema.index({ employeeId: 1, createdAt: -1 });

module.exports =
  mongoose.models.FeedbackSubmission ||
  mongoose.model('FeedbackSubmission', feedbackSubmissionSchema);
