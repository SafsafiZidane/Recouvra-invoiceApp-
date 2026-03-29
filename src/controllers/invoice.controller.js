const Invoice = require("../models/invoice.model");


const createInvoice = async (req, res) => {
  try {
    const { client, amount, amountPaid, status, description, dueDate } = req.body;

    if (!client || !amount || !status || !description || !dueDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newInvoice = new Invoice({
      client,
      amount,
      amountPaid,
      status,
      description,
      dueDate,
      createdBy: req.user._id,
    });
    await newInvoice.save();
    res.status(201).json({ message: `invoice created ` });
  } catch (error) {
    res.status(500).json({ message: "something went wrong" });
    console.log(error);
  }
};


const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find();

    if (!invoices || invoices.length === 0) return res.status(400).json({message: "no invoice found."});

    res.status(200).json({
      count: invoices.length,
      invoices
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return res.status(404).json({ message: "invoice not found" });
    }

    res.status(200).json(invoice);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true, 
        runValidators: true
      }
    );

    if (!updatedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.status(200).json({
      message: "Invoice updated",
      invoice: updatedInvoice
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = id.trim();

    const invoice = await Invoice.findByIdAndDelete(cleanId);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.status(200).json({
      message: "Invoice deleted"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {createInvoice, getInvoices, getInvoiceById, updateInvoice, deleteInvoice};
