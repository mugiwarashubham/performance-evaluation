const mongoose = require('mongoose');

// A monthly feedback cycle, scoped to one company.
const feedbackCycleSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },

    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },

    year: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open'
    }
  },
  {
    timestamps: true
  }
);

feedbackCycleSchema.index(
  { companyId: 1, month: 1, year: 1 },
  { unique: true }
);

const FeedbackCycle =
  mongoose.models.FeedbackCycle ||
  mongoose.model('FeedbackCycle', feedbackCycleSchema);

module.exports = FeedbackCycle;
