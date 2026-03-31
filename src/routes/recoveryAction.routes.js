// routes/recoveryActionRoutes.js

const express = require("express");
const router = express.Router();

const {
  createRecoveryAction,
  getRecoveryActions,
  getRecoveryActionById,
  updateRecoveryAction,
  deleteRecoveryAction,
} = require("../controllers/recoveryAction.controller");

const protectRoute = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const validate = require("../middlewares/validation.middleware");
const { createActionSchema } = require("../validators/recoveryAction.validator");

// CREATE
router.post(
  "/",
  protectRoute,
  validate(createActionSchema),
  authorizeRoles("admin", "manager", "agent"),
  createRecoveryAction
);

// GET ALL
router.get(
  "/",
  protectRoute,
  authorizeRoles("admin", "manager", "agent"),
  getRecoveryActions
);

// GET BY ID
router.get(
  "/:id",
  protectRoute,
  authorizeRoles("admin", "manager", "agent"),
  getRecoveryActionById
);

// UPDATE
router.put(
  "/:id",
  protectRoute,
  authorizeRoles("admin", "manager"),
  updateRecoveryAction
);

// DELETE
router.delete(
  "/:id",
  protectRoute,
  authorizeRoles("admin"),
  deleteRecoveryAction
);

module.exports = router;