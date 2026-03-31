
const RecoveryAction = require("../models/recoveryAction.model");
const Invoice = require("../models/invoice.model");

const createRecoveryAction = async (req, res) => {
  try {
    const {
      invoice,
      type,
      note,
      outcome,
      date,
      nextActionDate,
    } = req.body;

    if (!invoice || !type || !note) {
      return res.status(400).json({
        message: "Invoice, type and note are required",
      });
    }

    const existingInvoice = await Invoice.findById(invoice);

    if (!existingInvoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    const recoveryAction = await RecoveryAction.create({
      invoice,
      agent: req.user._id,
      type,
      note,
      outcome,
      date,
      nextActionDate,
    });

    await recoveryAction.populate([
      {
        path: "invoice",
        populate: {
          path: "client",
          select: "name email phone",
        },
      },
      {
        path: "agent",
        select: "name email role",
      },
    ]);

    res.status(201).json({
      success: true,
      message: "Recovery action created successfully",
      recoveryAction,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const getRecoveryActions = async (req, res) => {
  try {
    const actions = await RecoveryAction.find()
      .populate({
        path: "invoice",
        populate: {
          path: "client",
          select: "name email",
        },
      })
      .populate("agent", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: actions.length,
      recoveryActions: actions,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const getRecoveryActionById = async (req, res) => {
  try {
    const recoveryAction = await RecoveryAction.findById(req.params.id)
      .populate({
        path: "invoice",
        populate: {
          path: "client",
          select: "name email phone",
        },
      })
      .populate("agent", "name email role");

    if (!recoveryAction) {
      return res.status(404).json({
        message: "Recovery action not found",
      });
    }

    res.status(200).json(recoveryAction);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const updateRecoveryAction = async (req, res) => {
  try {
    const updatedRecoveryAction = await RecoveryAction.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate({
        path: "invoice",
        populate: {
          path: "client",
          select: "name email phone",
        },
      })
      .populate("agent", "name email role");

    if (!updatedRecoveryAction) {
      return res.status(404).json({
        message: "Recovery action not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Recovery action updated successfully",
      recoveryAction: updatedRecoveryAction,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const deleteRecoveryAction = async (req, res) => {
  try {
    const recoveryAction = await RecoveryAction.findByIdAndDelete(req.params.id);

    if (!recoveryAction) {
      return res.status(404).json({
        message: "Recovery action not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Recovery action deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

module.exports = {
  createRecoveryAction,
  getRecoveryActions,
  getRecoveryActionById,
  updateRecoveryAction,
  deleteRecoveryAction,
};