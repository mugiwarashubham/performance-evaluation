const mongoose = require('mongoose');

// Design note: role only distinguishes HR (admin) from everyone else.
// Whether someone is "a manager" is NOT a role — it's derived from the
// hierarchy: a user is a manager for any cycle where at least one other
// user's managerId points at them. This is what lets Priya be both a
// feedback-giver (to her 6 reports) and a feedback-receiver (from Rohan)
// without needing two accounts or a rigid manager/employee split, and it
// lets Bright Path's founder report to nobody while Ashoka's chain goes
// COO -> Rohan -> Priya -> employees.
const userSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ['employee', 'hr'],
      default: 'employee'
    },

    // Self-reference. Null means "top of the hierarchy" (e.g. a founder or
    // COO with nobody above them in this system).
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

userSchema.index({ companyId: 1, managerId: 1 });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
