const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    invoice: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Invoice',
      required: [true, 'Invoice is required'],
    },
    amount: {
      type:     Number,
      required: [true, 'Amount is required'],
      min:      [0.01, 'Payment amount must be greater than 0'],
    },
    method: {
      type:     String,
      required: [true, 'Payment method is required'],
      enum:     {
        values:  ['cash', 'transfer', 'check'],
        message: 'Method must be cash, transfer, or check',
      },
    },
    date: {
      type:    Date,
      default: Date.now,
    },
    note: {
      type:    String,
      trim:    true,
      default: null,
    },
    recordedBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'RecordedBy is required'],
    },
  },
  { timestamps: true }
);




const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;