const express = require("express");
const protectRoute = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");

const { register, login } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", protectRoute, authorizeRoles("admin"), register);
router.post("/login", login);

module.exports = router;