const mongoose = require('mongoose');

const recoveryActionSchema = new mongoose.Schema(
  {
    invoice: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Invoice',
      required: [true, 'Invoice is required'],
    },
    agent: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Agent is required'],
    },
    type: {
      type:     String,
      required: [true, 'Action type is required'],
      enum:     {
        values:  ['call', 'email', 'letter', 'visit'],
        message: 'Type must be call, email, letter, or visit',
      },
    },
    note: {
      type:      String,
      required:  [true, 'Note is required'],
      trim:      true,
      minlength: [5,   'Note must be at least 5 characters'],
      maxlength: [500, 'Note must be at most 500 characters'],
    },
    outcome: {
      type:    String,
      trim:    true,
      default: null,
    },
    date: {
      type:    Date,
      default: Date.now,
    },
    nextActionDate: {
      type:    Date,
      default: null,  
    },
  },
  { timestamps: true }
);

const RecoveryAction = mongoose.model('RecoveryAction', recoveryActionSchema);

module.exports = RecoveryAction;