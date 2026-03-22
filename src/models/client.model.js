const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, 'Client name is required'],
      trim:      true,
      minlength: [2,   'Name must be at least 2 characters'],
      maxlength: [50, 'Name must be at most 50 characters'],
    },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    phone: {
      type:     String,
      required: [true, 'Phone is required'],
      trim:     true,
    },
    address: {
      type:    String,
      trim:    true,
      default: null,
    },
    company: {
      type:    String,
      trim:    true,
      default: null,
    },
    notes: {
      type:    String,
      trim:    true,
      default: null,
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
    createdBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'CreatedBy is required'],
    },
  },
  { timestamps: true }
);
const Client = mongoose.model('Client', clientSchema)

module.exports = Client ;