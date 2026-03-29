const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    client: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Client',
      required: [true, 'Client is required'],
    },
    amount: {
      type:     Number,
      required: [true, 'Amount is required'],
      min:      [0.01, 'Amount must be greater than 0'],
    },
    amountPaid: {
      type:    Number,
      default: 0,
      min:     [0, 'Amount paid cannot be negative'],
    },
    dueDate: {
      type:     Date,
      required: [true, 'Due date is required'],
    },
    status: {
      type:    String,
      enum:    {
        values:  ['pending', 'partial', 'paid', 'overdue'],
        message: 'Invalid status',
      },
      default: 'pending',
    },
    description: {
      type:    String,
      trim:    true,
      default: null,
    },
    createdBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'CreatedBy is required'],
    },
  },
  { timestamps: true }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;