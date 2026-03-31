// routes/paymentRoutes.js

const express = require("express");
const router = express.Router();

const {
  createPayment,
  getPayments,
  getPaymentById,
  deletePayment,
} = require("../controllers/payment.controller");

const protectRoute = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const validate = require("../middlewares/validation.middleware");
const { createPaymentSchema } = require("../validators/payment.validator");

// CREATE PAYMENT
router.post(
  "/",
  protectRoute,
  validate(createPaymentSchema),
  authorizeRoles("admin", "manager", "agent"),
  createPayment,
);

// GET ALL PAYMENTS
router.get(
  "/",
  protectRoute,
  authorizeRoles("admin", "manager", "agent"),
  getPayments,
);

// GET PAYMENT BY ID
router.get(
  "/:id",
  protectRoute,
  authorizeRoles("admin", "manager", "agent"),
  getPaymentById,
);

// DELETE PAYMENT
router.delete(
  "/:id",
  protectRoute,
  authorizeRoles("admin", "manager"),
  deletePayment,
);

module.exports = router;
