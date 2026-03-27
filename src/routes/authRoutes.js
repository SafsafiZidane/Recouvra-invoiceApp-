const express = require("express");
const protectRoute = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

const { register, login } = require("../controllers/authController");

const router = express.Router();

router.post("/register", protectRoute, authorizeRoles("admin"), register);
router.post("/login", login);

module.exports = router;