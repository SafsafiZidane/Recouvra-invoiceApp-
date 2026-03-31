// controllers/paymentController.js

const Payment = require("../models/payment.model");
const Invoice = require("../models/invoice.model");

const createPayment = async (req, res) => {
  try {
    const { invoice, amount, method, date, note } = req.body;

    if (!invoice || !amount || !method) {
      return res.status(400).json({
        message: "Invoice, amount and method are required",
      });
    }

    const existingInvoice = await Invoice.findById(invoice);

    if (!existingInvoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    const remainingAmount =
      existingInvoice.amount - existingInvoice.amountPaid;

    if (amount > remainingAmount) {
      return res.status(400).json({
        message: `Payment exceeds remaining balance (${remainingAmount})`,
      });
    }

    const payment = await Payment.create({
      invoice,
      amount,
      method,
      date,
      note,
      recordedBy: req.user._id,
    });

    existingInvoice.amountPaid += amount;

    // update invoice status automatically
    if (existingInvoice.amountPaid === 0) {
      existingInvoice.status = "pending";
    } else if (existingInvoice.amountPaid < existingInvoice.amount) {
      existingInvoice.status = "partial";
    } else if (existingInvoice.amountPaid >= existingInvoice.amount) {
      existingInvoice.status = "paid";
    }

    await existingInvoice.save();

    await payment.populate({
      path: "invoice",
      populate: {   
        path: "client",
        select: "name email phone",
      },
    });

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      payment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: "invoice",
        populate: {
          path: "client",
          select: "name email",
        },
      })
      .populate("recordedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: "invoice",
        populate: {
          path: "client",
          select: "name email phone",
        },
      })
      .populate("recordedBy", "name email");

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    const invoice = await Invoice.findById(payment.invoice);

    if (invoice) {
      invoice.amountPaid -= payment.amount;

      if (invoice.amountPaid <= 0) {
        invoice.amountPaid = 0;
        invoice.status = "pending";
      } else if (invoice.amountPaid < invoice.amount) {
        invoice.status = "partial";
      } else {
        invoice.status = "paid";
      }

      await invoice.save();
    }

    await payment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
  deletePayment,
};