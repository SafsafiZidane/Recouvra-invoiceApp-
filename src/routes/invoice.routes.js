const express = require("express");
const protectRoute = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const { createInvoice, getInvoices, getInvoiceById, updateInvoice, deleteInvoice } = require("../controllers/invoice.controller");
const validate = require("../middlewares/validation.middleware");
const { createInvoiceSchema } = require("../validators/invoice.validator");


const router = express.Router();



router.post("/", protectRoute,validate(createInvoiceSchema), authorizeRoles("admin","agent","manager"), createInvoice) ;

router.get("/", protectRoute, authorizeRoles("admin","agent","manager"), getInvoices) ;

router.get("/:id", protectRoute, authorizeRoles("admin","agent","manager"), getInvoiceById) ;

router.put("/:id", protectRoute, authorizeRoles("admin","manager"), updateInvoice) ;

router.delete("/:id", protectRoute, authorizeRoles("admin","manager"), deleteInvoice) ;


module.exports = router;